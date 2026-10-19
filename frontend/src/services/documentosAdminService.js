/* Servicio de Documentos (administrador). Usa las funciones de sql/20 y el bucket privado "documentos". */
import { supabase } from "../supabase";
import { obtenerPeriodoFecha } from "../utils/periodos";

const BUCKET = "documentos";
const ZONA = "America/Argentina/Buenos_Aires";
const sinTildes = (t) => `${t} ${t.normalize("NFD").replace(/[̀-ͯ]/g, "")}`;

export const CATEGORIAS = ["Reglamentos", "Asambleas", "Actas", "Obras y mejoras", "Estados contables", "Finanzas", "Contratos", "Seguros", "Otros"];
export const AUDIENCIAS = [
    { valor: "TODOS", texto: "Todos los residentes" },
    { valor: "PROPIETARIOS", texto: "Propietarios" },
    { valor: "INQUILINOS", texto: "Inquilinos" },
];
const textoAudiencia = (v) => AUDIENCIAS.find((a) => a.valor === v)?.texto ?? "Todos los residentes";

export const TAMANO_MAXIMO = 10 * 1024 * 1024;
const TIPOS = {
    "application/pdf": "PDF",
    "image/jpeg": "Imagen",
    "image/png": "Imagen",
    "application/msword": "Word",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "Word",
    "application/vnd.ms-excel": "Excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "Excel",
};
export const EXTENSIONES_ACEPTADAS = ".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx";

export function validarArchivo(archivo) {
    if (!archivo) return "";
    if (!TIPOS[archivo.type]) return "El archivo tiene que ser PDF, imagen (JPG o PNG), Word o Excel.";
    if (archivo.size > TAMANO_MAXIMO) return "El archivo supera el máximo de 10 MB.";
    return "";
}

export function formatearTamano(bytes) {
    if (!bytes && bytes !== 0) return "";
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
}

const fechaCorta = (ts) => new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: ZONA }).format(new Date(ts));
const mesClave = (ts) => new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", timeZone: ZONA }).format(new Date(ts));

function mensajeError(error) {
    if (error?.code === "PGRST202") return "Falta instalar sql/20_documentos.sql en Supabase.";
    if (["28000", "42501", "22023"].includes(error?.code)) return error.message;
    return "No pudimos completar la operación. Probá de nuevo.";
}

function convertir(d) {
    const fecha = fechaCorta(d.fecha_publicacion);
    return {
        id: d.id,
        nombre: d.nombre,
        descripcion: d.descripcion ?? "",
        categoria: d.categoria,
        audienciaClave: d.audiencia,
        audiencia: textoAudiencia(d.audiencia),
        edificioId: d.edificio_id,
        edificio: d.edificio_nombre,
        fecha,
        periodo: obtenerPeriodoFecha(fecha),
        mesClave: mesClave(d.fecha_publicacion),
        actualizado: d.actualizado_en && d.actualizado_en !== d.fecha_publicacion ? fechaCorta(d.actualizado_en) : "",
        autor: d.autor,
        archivo: { nombre: d.archivo_nombre, tamano: d.archivo_tamano ?? 0, tamanoTexto: formatearTamano(d.archivo_tamano), tipo: d.archivo_tipo, ruta: d.archivo_ruta,
            formato: TIPOS[d.archivo_tipo] ?? "Archivo", previsualizable: d.archivo_tipo === "application/pdf" || (d.archivo_tipo ?? "").startsWith("image/") },
        busqueda: sinTildes(`${d.nombre} ${d.descripcion ?? ""} ${d.archivo_nombre}`),
    };
}

export async function obtenerDocumentosAdmin() {
    const { data, error } = await supabase.rpc("admin_documentos");
    if (error) throw new Error(mensajeError(error));
    return { edificios: data?.edificios ?? [], documentos: (data?.documentos ?? []).map(convertir), mesActual: mesClave(new Date().toISOString()) };
}

function nombreSeguro(n) {
    return n.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zA-Z0-9._-]+/g, "_").slice(-80);
}

/** Sube un documento nuevo o edita uno (con archivo nuevo opcional al editar). */
export async function guardarDocumento({ actual, edificioId, nombre, descripcion, categoria, audiencia, archivo }) {
    const mensaje = validarArchivo(archivo);
    if (mensaje) throw new Error(mensaje);
    if (!actual && !archivo) throw new Error("Elegí el archivo que querés subir.");

    const edificio = actual?.edificioId ?? edificioId;
    let ruta = null;
    if (archivo) {
        ruta = `${edificio}/${Date.now()}-${nombreSeguro(archivo.name)}`;
        const { error: e } = await supabase.storage.from(BUCKET).upload(ruta, archivo, { contentType: archivo.type });
        if (e) throw new Error("No pudimos subir el archivo. Probá de nuevo.");
    }

    const { data, error } = await supabase.rpc("admin_guardar_documento", {
        p_id: actual?.id ?? null,
        p_edificio_id: edificio,
        p_nombre: nombre,
        p_descripcion: descripcion,
        p_categoria: categoria,
        p_audiencia: audiencia,
        p_archivo_nombre: archivo ? archivo.name : null,
        p_archivo_tamano: archivo ? archivo.size : null,
        p_archivo_tipo: archivo ? archivo.type : null,
        p_archivo_ruta: ruta,
        p_conservar_archivo: !archivo,
    });
    if (error) {
        if (ruta) await supabase.storage.from(BUCKET).remove([ruta]);
        throw new Error(mensajeError(error));
    }
    if (data?.archivo_anterior) await supabase.storage.from(BUCKET).remove([data.archivo_anterior]);
}

export async function eliminarDocumento(id) {
    const { data, error } = await supabase.rpc("admin_eliminar_documento", { p_id: id });
    if (error) throw new Error(mensajeError(error));
    if (data) await supabase.storage.from(BUCKET).remove([data]);
}

/** Enlace temporal (5 min). Con descargar = true el navegador lo baja con el nombre original. */
export async function urlArchivo(documento, { descargar = false } = {}) {
    const opciones = descargar ? { download: documento.archivo.nombre } : undefined;
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(documento.archivo.ruta, 300, opciones);
    if (error || !data?.signedUrl) throw new Error("No pudimos abrir el archivo. Probá de nuevo.");
    return data.signedUrl;
}

export async function descargarArchivo(documento) {
    const url = await urlArchivo(documento, { descargar: true });
    const a = document.createElement("a");
    a.href = url; a.download = documento.archivo.nombre; a.rel = "noopener";
    document.body.appendChild(a); a.click(); a.remove();
}
