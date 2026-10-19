/* Servicio de Comunicados (administrador). Usa las funciones de sql/18 y el bucket privado "avisos". */
import { supabase } from "../supabase";
import { obtenerPeriodoFecha } from "../utils/periodos";

const BUCKET = "avisos";
const ZONA = "America/Argentina/Buenos_Aires";
const sinTildes = (t) => `${t} ${t.normalize("NFD").replace(/[̀-ͯ]/g, "")}`;

export const CATEGORIAS = ["Aviso", "Mantenimiento", "Reunión", "Obra", "Recordatorio", "Novedad", "Servicios", "General"];
export const AUDIENCIAS = [
    { valor: "TODOS", texto: "Todos los residentes" },
    { valor: "PROPIETARIOS", texto: "Propietarios" },
    { valor: "INQUILINOS", texto: "Inquilinos" },
];
const textoAudiencia = (v) => AUDIENCIAS.find((a) => a.valor === v)?.texto ?? "Todos los residentes";

export const TAMANO_MAXIMO_ADJUNTO = 5 * 1024 * 1024;
const TIPOS = ["application/pdf", "image/jpeg", "image/png", "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

export function validarAdjunto(archivo) {
    if (!archivo) return "";
    if (!TIPOS.includes(archivo.type)) return "El archivo tiene que ser PDF, imagen (JPG o PNG) o documento de Word.";
    if (archivo.size > TAMANO_MAXIMO_ADJUNTO) return "El archivo supera el máximo de 5 MB.";
    return "";
}

const partes = (ts, op) => new Intl.DateTimeFormat("es-AR", { ...op, timeZone: ZONA }).format(new Date(ts));
const fechaCorta = (ts) => partes(ts, { day: "2-digit", month: "2-digit", year: "numeric" });
const fechaHora = (ts) => `${fechaCorta(ts)} ${partes(ts, { hour: "2-digit", minute: "2-digit", hour12: false })}`;

/** ISO -> valor para <input type="datetime-local"> en hora argentina */
export function aInputFecha(ts) {
    const p = Object.fromEntries(new Intl.DateTimeFormat("en-CA", {
        year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false, timeZone: ZONA,
    }).formatToParts(new Date(ts)).map((x) => [x.type, x.value]));
    return `${p.year}-${p.month}-${p.day}T${p.hour === "24" ? "00" : p.hour}:${p.minute}`;
}
/** valor de datetime-local (hora argentina, UTC-3 todo el año) -> ISO */
const aIso = (valor) => new Date(`${valor}:00-03:00`).toISOString();

function tamano(b) {
    if (!b && b !== 0) return "";
    return b < 1048576 ? `${Math.max(1, Math.round(b / 1024))} KB` : `${(b / 1048576).toFixed(1).replace(".", ",")} MB`;
}

function mensajeError(error) {
    if (error?.code === "PGRST202") return "Falta instalar sql/18_comunicados_admin.sql en Supabase.";
    if (["28000", "42501", "22023"].includes(error?.code)) return error.message;
    return "No pudimos completar la operación. Probá de nuevo.";
}

function convertir(c) {
    const futuro = new Date(c.fecha_publicacion).getTime() > Date.now();
    const estado = c.borrador ? "Borrador" : futuro ? "Programado" : "Publicado";
    const fecha = fechaCorta(c.fecha_publicacion);
    return {
        id: c.id,
        asunto: c.titulo,
        contenido: c.contenido,
        categoria: c.categoria,
        importante: c.importante,
        audienciaClave: c.audiencia,
        audiencia: textoAudiencia(c.audiencia),
        estado,
        borrador: c.borrador,
        edificioId: c.edificio_id,
        edificio: c.edificio_nombre,
        fecha: estado === "Borrador" ? "--" : fechaHora(c.fecha_publicacion),
        fechaInput: aInputFecha(c.fecha_publicacion),
        periodoFecha: estado === "Borrador" ? "" : obtenerPeriodoFecha(fecha),
        destinatarios: c.destinatarios,
        lecturas: c.lecturas,
        porcentajeLectura: c.destinatarios ? Math.round((c.lecturas / c.destinatarios) * 100) : 0,
        adjunto: c.adjunto_nombre ? { nombre: c.adjunto_nombre, tamano: tamano(c.adjunto_tamano), ruta: c.adjunto_ruta } : null,
        busqueda: sinTildes(`${c.titulo} ${c.categoria}`),
    };
}

export async function obtenerComunicadosAdmin() {
    const { data, error } = await supabase.rpc("admin_comunicados");
    if (error) throw new Error(mensajeError(error));
    return { edificios: data?.edificios ?? [], comunicados: (data?.comunicados ?? []).map(convertir) };
}

function nombreSeguro(n) {
    return n.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zA-Z0-9._-]+/g, "_").slice(-80);
}

/**
 * Crea o edita un comunicado.
 *  modo: "BORRADOR" | "PUBLICAR" | "PROGRAMAR"   (PROGRAMAR usa fechaInput)
 *  archivo: archivo nuevo | null      quitarAdjunto: true para dejarlo sin adjunto
 *  actual: comunicado que se edita (o null)
 */
export async function guardarComunicado({ actual, edificioId, asunto, contenido, categoria, importante, audiencia, modo, fechaInput, archivo, quitarAdjunto }) {
    const errorArchivo = validarAdjunto(archivo);
    if (errorArchivo) throw new Error(errorArchivo);
    if (modo === "PROGRAMAR" && !fechaInput) throw new Error("Elegí la fecha y hora de publicación.");

    const edificio = actual?.edificioId ?? edificioId;
    let ruta = null;
    if (archivo) {
        ruta = `${edificio}/${Date.now()}-${nombreSeguro(archivo.name)}`;
        const { error: e } = await supabase.storage.from(BUCKET).upload(ruta, archivo, { contentType: archivo.type });
        if (e) throw new Error("No pudimos subir el archivo. Probá de nuevo.");
    }
    const cambiaAdjunto = Boolean(archivo) || Boolean(quitarAdjunto);

    const { data, error } = await supabase.rpc("admin_guardar_comunicado", {
        p_id: actual?.id ?? null,
        p_edificio_id: edificio,
        p_titulo: asunto,
        p_contenido: contenido,
        p_categoria: categoria,
        p_importante: Boolean(importante),
        p_audiencia: audiencia,
        p_modo: modo,
        p_fecha: modo === "PROGRAMAR" ? aIso(fechaInput) : null,
        p_adjunto_nombre: archivo ? archivo.name : null,
        p_adjunto_tamano: archivo ? archivo.size : null,
        p_adjunto_ruta: ruta,
        p_conservar_adjunto: !cambiaAdjunto,
    });
    if (error) {
        if (ruta) await supabase.storage.from(BUCKET).remove([ruta]);
        throw new Error(mensajeError(error));
    }
    if (data?.adjunto_anterior) await supabase.storage.from(BUCKET).remove([data.adjunto_anterior]);
    return data?.id;
}

export async function eliminarComunicado(id) {
    const { data, error } = await supabase.rpc("admin_eliminar_comunicado", { p_id: id });
    if (error) throw new Error(mensajeError(error));
    if (data) await supabase.storage.from(BUCKET).remove([data]);
}

export async function urlAdjunto(ruta) {
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(ruta, 60);
    if (error || !data?.signedUrl) throw new Error("No pudimos abrir el archivo.");
    return data.signedUrl;
}
