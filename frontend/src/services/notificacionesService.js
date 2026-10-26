/* =========================================================
   Notificaciones dentro de la app (la campanita).
   Las crea la base de datos sola cuando pasa algo
   (aviso nuevo, expensa, pago, reclamo, reserva).
   Funciones SQL: mis_notificaciones, marcar_notificacion_leida,
   marcar_todas_notificaciones_leidas  (ver 23_notificaciones.sql)
========================================================= */

import { supabase } from "../supabase";

/** Cuando la base todavía no tiene el SQL instalado. */
export class NotificacionesNoDisponibles extends Error {}

function convertirError(error, mensajeBase) {
    // PGRST202 / 42883: la función no existe (falta correr el SQL)
    if (error?.code === "PGRST202" || error?.code === "42883") {
        return new NotificacionesNoDisponibles("Las notificaciones todavía no están disponibles.");
    }
    if (error?.code === "28000") return new Error(error.message);
    return new Error(mensajeBase);
}

/** Devuelve { noLeidas, items: [{ id, tipo, titulo, cuerpo, enlace, leida, creadaEn }] } */
export async function obtenerNotificaciones(limite = 30) {
    const { data, error } = await supabase.rpc("mis_notificaciones", { p_limite: limite });
    if (error) throw convertirError(error, "No pudimos cargar tus notificaciones.");
    return {
        noLeidas: Number(data?.no_leidas ?? 0),
        items: (data?.items ?? []).map((n) => ({
            id: n.id,
            tipo: n.tipo,
            titulo: n.titulo,
            cuerpo: n.cuerpo ?? "",
            enlace: n.enlace ?? null,
            leida: !!n.leida,
            creadaEn: n.creada_en,
        })),
    };
}

export async function marcarLeida(id) {
    const { error } = await supabase.rpc("marcar_notificacion_leida", { p_id: id });
    if (error) throw convertirError(error, "No pudimos marcarla como leída.");
}

export async function marcarTodasLeidas() {
    const { error } = await supabase.rpc("marcar_todas_notificaciones_leidas");
    if (error) throw convertirError(error, "No pudimos marcarlas como leídas.");
}

/** "Ahora", "hace 5 min", "hace 3 h", "hace 2 d" o la fecha. */
export function tiempoRelativo(fechaIso, ahora = Date.now()) {
    const t = new Date(fechaIso).getTime();
    if (Number.isNaN(t)) return "";
    const min = Math.floor((ahora - t) / 60000);
    if (min < 1) return "Ahora";
    if (min < 60) return `hace ${min} min`;
    const h = Math.floor(min / 60);
    if (h < 24) return `hace ${h} h`;
    const d = Math.floor(h / 24);
    if (d < 7) return `hace ${d} d`;
    return new Date(t).toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        timeZone: "America/Argentina/Buenos_Aires",
    });
}
