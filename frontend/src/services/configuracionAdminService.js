/* =========================================================
   Servicio de Configuración (administrador).
   Usa las funciones de sql/21_configuracion_admin.sql y el bucket
   privado "edificios" (la foto que ven los residentes en su menú).
========================================================= */

import { supabase } from "../supabase";
import { formatearFechaISO, formatearMoneda } from "../utils/formatos";
import { cambiarContrasena, guardarPerfilBasico, guardarTelefono } from "./perfilService";

const BUCKET = "edificios";
const ZONA = "America/Argentina/Buenos_Aires";

export const TAMANO_MAXIMO_FOTO = 5 * 1024 * 1024;
const EXTENSIONES = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

export const PREFERENCIAS_POR_DEFECTO = {
    notif_mensajes: true,
    notif_vencimientos: true,
    notif_vencidas: true,
    notif_reclamos: true,
    notif_reservas: true,
    resumen_semanal: false,
};

/** Textos de cada interruptor (el orden es el de la pantalla). */
export const NOTIFICACIONES = [
    { clave: "notif_mensajes", titulo: "Mensajes de residentes", texto: "Aviso cuando un residente envía una nueva consulta o mensaje." },
    { clave: "notif_reclamos", titulo: "Reclamos nuevos", texto: "Aviso cuando un residente carga un reclamo." },
    { clave: "notif_reservas", titulo: "Solicitudes de reserva", texto: "Aviso cuando hay una reserva pendiente de aprobar." },
    { clave: "notif_vencimientos", titulo: "Vencimientos próximos", texto: "Recordatorio de expensas que están por vencer." },
    { clave: "notif_vencidas", titulo: "Expensas vencidas", texto: "Aviso de expensas que ya superaron su fecha de vencimiento." },
    { clave: "resumen_semanal", titulo: "Resumen semanal", texto: "Un resumen de la actividad del consorcio una vez por semana." },
];

function mensajeError(error) {
    if (error?.code === "PGRST202") return "Falta instalar sql/21_configuracion_admin.sql en Supabase.";
    if (["28000", "42501", "22023", "23505"].includes(error?.code)) return error.message;
    return "No pudimos completar la operación. Probá de nuevo.";
}

async function exigirSesion() {
    const { data } = await supabase.auth.getSession();
    const usuario = data?.session?.user;
    if (!usuario) throw new Error("Tu sesión venció. Volvé a iniciar sesión.");
    return usuario;
}

/* ---------------- validaciones (las mismas que hace la base) ---------------- */

export function validarConsorcio({ nombre, direccion, telefono, email, fechaInicio }) {
    const errores = {};
    const n = (nombre ?? "").trim();
    const d = (direccion ?? "").trim();
    const t = (telefono ?? "").trim();
    const m = (email ?? "").trim();
    if (n.length < 3 || n.length > 80) errores.nombre = "El nombre tiene que tener entre 3 y 80 caracteres.";
    if (d.length < 3 || d.length > 150) errores.direccion = "La dirección tiene que tener entre 3 y 150 caracteres.";
    if (t && !/^[0-9 +()-]{6,25}$/.test(t)) errores.telefono = "Usá solo números, espacios y + - ( ). Mínimo 6 dígitos.";
    if (m && (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(m) || m.length > 120)) errores.email = "Escribí un email válido, por ejemplo nombre@dominio.com.";
    if (fechaInicio && fechaInicio > hoyISO()) errores.fechaInicio = "La fecha de inicio no puede ser futura.";
    return errores;
}

export function validarCategoria({ concepto, monto }) {
    const c = (concepto ?? "").trim();
    if (c.length < 2 || c.length > 80) return "El nombre del concepto tiene que tener entre 2 y 80 caracteres.";
    const numero = convertirMonto(monto);
    if (numero === null) return "Escribí un monto válido (por ejemplo 12500 o 12.500,50).";
    if (numero < 0 || numero > 99999999) return "El monto tiene que estar entre 0 y 99.999.999.";
    return "";
}

export function validarFoto(archivo) {
    if (!archivo) return "";
    if (!EXTENSIONES[archivo.type]) return "La foto tiene que ser JPG, PNG o WebP.";
    if (archivo.size > TAMANO_MAXIMO_FOTO) return "La foto pesa más de 5 MB. Elegí una más liviana.";
    return "";
}

/** "12.500,50" -> 12500.5   |   "12500.5" -> 12500.5   |   "abc" -> null */
export function convertirMonto(texto) {
    let t = String(texto ?? "").trim().replace(/[$\s]/g, "");
    if (!t) return null;
    if (t.includes(",")) t = t.replace(/\./g, "").replace(",", ".");
    else if (/^\d{1,3}(\.\d{3})+$/.test(t)) t = t.replace(/\./g, "");
    const numero = Number(t);
    return Number.isFinite(numero) ? numero : null;
}

export function hoyISO() {
    return new Intl.DateTimeFormat("en-CA", { timeZone: ZONA }).format(new Date());
}

/** "2026-10" del mes actual en Argentina. */
export function periodoActualClave() {
    return hoyISO().slice(0, 7);
}

/** Día 1 del mes que viene, "dd/mm/aaaa". */
export function proximaGeneracion() {
    const [anio, mes] = hoyISO().split("-").map(Number);
    const siguiente = mes === 12 ? { a: anio + 1, m: 1 } : { a: anio, m: mes + 1 };
    return `01/${String(siguiente.m).padStart(2, "0")}/${siguiente.a}`;
}

/* ---------------- lectura ---------------- */

async function urlFoto(ruta) {
    if (!ruta) return null;
    const { data } = await supabase.storage.from(BUCKET).createSignedUrl(ruta, 3600);
    return data?.signedUrl ?? null;
}

export async function obtenerConfiguracion() {
    const usuarioAuth = await exigirSesion();

    const { data, error } = await supabase.rpc("admin_configuracion");
    if (error) throw new Error(mensajeError(error));

    const edificios = await Promise.all(
        (data?.edificios ?? []).map(async (e) => ({
            id: e.id,
            nombre: e.nombre ?? "",
            direccion: e.direccion ?? "",
            telefono: e.telefono ?? "",
            email: e.email ?? "",
            fechaInicio: e.fecha_inicio ?? "",
            fechaInicioTexto: e.fecha_inicio ? formatearFechaISO(e.fecha_inicio) : "Sin definir",
            fotoRuta: e.foto_ruta ?? null,
            fotoUrl: await urlFoto(e.foto_ruta),
            diaVencimiento: e.dia_vencimiento,
            unidades: Number(e.unidades),
            ocupadas: Number(e.unidades_ocupadas),
            residentes: Number(e.residentes),
        }))
    );

    const categorias = [...(data?.categorias ?? [])].sort((a, b) => a.orden - b.orden || a.id - b.id).map((c) => ({
        id: c.id,
        edificioId: c.edificio_id,
        concepto: c.concepto,
        monto: Number(c.monto),
        montoTexto: formatearMoneda(c.monto),
        activo: c.activo,
        actualizado: c.actualizado_en,
        actualizadoTexto: new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: ZONA }).format(new Date(c.actualizado_en)),
    }));

    // Preferencias y datos de la cuenta (cada uno con su propia protección)
    const { data: pref } = await supabase.from("preferencia_admin").select("*").eq("usuario_id", usuarioAuth.id).maybeSingle();
    const { data: usuario } = await supabase.from("usuario").select("nombre, telefono, foto_url").eq("id", usuarioAuth.id).maybeSingle();

    return {
        edificios,
        categorias,
        preferencias: { ...PREFERENCIAS_POR_DEFECTO, ...(pref ?? {}) },
        cuenta: {
            email: usuarioAuth.email ?? "",
            nombre: usuario?.nombre ?? "",
            telefono: usuario?.telefono ?? "",
            fotoUrl: usuario?.foto_url ?? null,
        },
    };
}

/* ---------------- escritura ---------------- */

export async function guardarConsorcio(edificioId, { nombre, direccion, telefono, email, fechaInicio }) {
    const { error } = await supabase.rpc("admin_guardar_consorcio", {
        p_id: edificioId,
        p_nombre: nombre,
        p_direccion: direccion,
        p_telefono: telefono,
        p_email: email,
        p_fecha_inicio: fechaInicio || null,
    });
    if (error) throw new Error(mensajeError(error));
}

/** Sube la foto nueva, la guarda en el edificio y borra la anterior. */
export async function cambiarFotoEdificio(edificioId, archivo) {
    const mensaje = validarFoto(archivo);
    if (mensaje) throw new Error(mensaje);

    const ruta = `${edificioId}/foto-${Date.now()}.${EXTENSIONES[archivo.type]}`;
    const { error: errorSubida } = await supabase.storage.from(BUCKET).upload(ruta, archivo, { contentType: archivo.type, cacheControl: "3600" });
    if (errorSubida) throw new Error("No pudimos subir la foto. Probá de nuevo.");

    const { data: anterior, error } = await supabase.rpc("admin_guardar_foto_edificio", { p_id: edificioId, p_ruta: ruta });
    if (error) {
        await supabase.storage.from(BUCKET).remove([ruta]);
        throw new Error(mensajeError(error));
    }
    if (anterior) await supabase.storage.from(BUCKET).remove([anterior]);
}

export async function quitarFotoEdificio(edificioId) {
    const { data: anterior, error } = await supabase.rpc("admin_guardar_foto_edificio", { p_id: edificioId, p_ruta: null });
    if (error) throw new Error(mensajeError(error));
    if (anterior) await supabase.storage.from(BUCKET).remove([anterior]);
}

export async function guardarVencimiento(edificioId, dia) {
    const { error } = await supabase.rpc("admin_guardar_vencimiento", { p_edificio: edificioId, p_dia: dia });
    if (error) throw new Error(mensajeError(error));
}

export async function guardarCategoria({ id = null, edificioId, concepto, monto, activo = true }) {
    const { error } = await supabase.rpc("admin_guardar_categoria", {
        p_id: id,
        p_edificio: edificioId,
        p_concepto: concepto,
        p_monto: convertirMonto(monto),
        p_activo: activo,
    });
    if (error) throw new Error(mensajeError(error));
}

export async function eliminarCategoria(id) {
    const { error } = await supabase.rpc("admin_eliminar_categoria", { p_id: id });
    if (error) throw new Error(mensajeError(error));
}

export async function moverCategoria(id, direccion) {
    const { error } = await supabase.rpc("admin_mover_categoria", { p_id: id, p_direccion: direccion });
    if (error) throw new Error(mensajeError(error));
}

/** Guarda solo lo que cambió, por ejemplo { notif_mensajes: false }. */
export async function guardarPreferenciasAdmin(cambios) {
    const usuario = await exigirSesion();
    const { error } = await supabase
        .from("preferencia_admin")
        .upsert({ usuario_id: usuario.id, ...cambios, actualizado_en: new Date().toISOString() }, { onConflict: "usuario_id" });
    if (error) throw new Error("No pudimos guardar el cambio. Probá de nuevo.");
}

export async function guardarCuenta({ nombre, telefono }) {
    const n = nombre.trim();
    if (n.length < 2) throw new Error("Escribí tu nombre (mínimo 2 caracteres).");
    const t = telefono.trim();
    if (t && !/^[0-9 +()-]{6,25}$/.test(t)) throw new Error("El teléfono solo puede tener números, espacios y + - ( ).");
    await guardarPerfilBasico({ nombre: n });
    await guardarTelefono(t);
    // Avisa al encabezado para que muestre el nombre nuevo sin recargar
    window.dispatchEvent(new CustomEvent("habita:cuenta-actualizada", { detail: { nombre: n } }));
}

export function validarContrasenaNueva(actual, nueva, repetida) {
    if (!actual) return "Escribí tu contraseña actual.";
    if (nueva.length < 8) return "La nueva contraseña tiene que tener al menos 8 caracteres.";
    if (nueva === actual) return "La nueva contraseña tiene que ser distinta de la actual.";
    if (nueva !== repetida) return "Las contraseñas nuevas no coinciden.";
    return "";
}

export { cambiarContrasena };

export async function cerrarSesionEnTodos() {
    const { error } = await supabase.auth.signOut({ scope: "global" });
    if (error) throw new Error("No pudimos cerrar las sesiones. Probá de nuevo.");
}
