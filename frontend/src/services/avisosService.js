/* =========================================================
   Servicio de Avisos (residente)

   Tablas:   comunicado          (los avisos que publica la administración)
             comunicado_lectura  (quién ya leyó cada aviso)
   Archivos: Supabase Storage, bucket privado "avisos"

   La seguridad (RLS) hace que el residente solo reciba los avisos
   de SU edificio y solo vea sus propias lecturas.
========================================================= */

import { supabase } from "../supabase";
import { obtenerPeriodoFecha } from "../utils/periodos";

const BUCKET = "avisos";

async function exigirSesion() {
    const { data } = await supabase.auth.getSession();
    const usuario = data?.session?.user;
    if (!usuario) throw new Error("Tu sesión venció. Volvé a iniciar sesión.");
    return usuario;
}

function formatearTamano(bytes) {
    if (!bytes && bytes !== 0) return "";
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
}

/** Fecha "dd/mm/aaaa" en hora argentina. */
function formatearFecha(timestamp) {
    const partes = new Intl.DateTimeFormat("es-AR", {
        day: "2-digit", month: "2-digit", year: "numeric", timeZone: "America/Argentina/Buenos_Aires",
    }).formatToParts(new Date(timestamp));
    const dato = (tipo) => partes.find((p) => p.type === tipo)?.value ?? "";
    return `${dato("day")}/${dato("month")}/${dato("year")}`;
}

function convertirAviso(fila, usuarioId) {
    const leido = (fila.lecturas ?? []).some((l) => l.usuario_id === usuarioId);
    const fecha = formatearFecha(fila.fecha_publicacion);

    return {
        id: fila.id,
        titulo: fila.titulo,
        descripcion: fila.contenido,
        categoria: fila.categoria || "General",
        importancia: fila.importante ? "Importante" : "Normal",
        fecha,
        periodoFecha: obtenerPeriodoFecha(fecha),
        leido,
        estadoLectura: leido ? "Leído" : "Sin leer",
        adjunto: fila.adjunto_nombre
            ? { nombre: fila.adjunto_nombre, tamano: formatearTamano(fila.adjunto_tamano), ruta: fila.adjunto_ruta }
            : null,
    };
}

/** Avisos del edificio del residente, del más nuevo al más viejo. */
export async function listarAvisos() {
    const usuario = await exigirSesion();
    const { data, error } = await supabase
        .from("comunicado")
        .select(`
            id, titulo, contenido, categoria, importante, fecha_publicacion,
            adjunto_nombre, adjunto_tamano, adjunto_ruta,
            lecturas:comunicado_lectura ( usuario_id )
        `)
        .order("fecha_publicacion", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((fila) => convertirAviso(fila, usuario.id));
}

/** Registra que el residente leyó el aviso (si ya estaba registrado, no hace nada). */
export async function marcarAvisoLeido(comunicadoId) {
    const usuario = await exigirSesion();
    const { error } = await supabase
        .from("comunicado_lectura")
        .upsert(
            { comunicado_id: comunicadoId, usuario_id: usuario.id },
            { onConflict: "comunicado_id,usuario_id", ignoreDuplicates: true }
        );
    if (error) throw error;
}

/** Enlace temporal (60 s) para abrir el adjunto de un aviso. */
export async function obtenerUrlAdjunto(ruta) {
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(ruta, 60);
    if (error || !data?.signedUrl) throw new Error("No pudimos abrir el archivo. Probá de nuevo.");
    return data.signedUrl;
}
