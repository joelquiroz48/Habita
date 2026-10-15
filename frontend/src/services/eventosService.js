/* =========================================================
   Servicio de Eventos del edificio (calendario comunitario)

   Tabla: evento  (la carga la administración; el residente solo lee)
   La seguridad (RLS) hace que cada residente reciba solo los
   eventos de SU edificio.
========================================================= */

import { supabase } from "../supabase";
import { limitesDeMes } from "../pages/Residente/Reservas/reservasUtils";

export const TIPOS_EVENTO = {
    REUNION: { etiqueta: "Reunión", clase: "cal-tipo-reunion" },
    MANTENIMIENTO: { etiqueta: "Mantenimiento", clase: "cal-tipo-mantenimiento" },
    SOCIAL: { etiqueta: "Encuentro", clase: "cal-tipo-social" },
    OTRO: { etiqueta: "Otro", clase: "cal-tipo-otro" },
};

const CAMPOS = "id, titulo, descripcion, tipo, fecha, hora_inicio, hora_fin, lugar";

function convertirEvento(fila) {
    const tipo = TIPOS_EVENTO[fila.tipo] ? fila.tipo : "OTRO";
    return {
        id: fila.id,
        titulo: fila.titulo,
        descripcion: fila.descripcion ?? "",
        tipo,
        tipoEtiqueta: TIPOS_EVENTO[tipo].etiqueta,
        clase: TIPOS_EVENTO[tipo].clase,
        fecha: fila.fecha,                 // "2026-10-25"
        horaInicio: fila.hora_inicio,      // "20:00:00" o null
        horaFin: fila.hora_fin,
        lugar: fila.lugar ?? "",
    };
}

/** Eventos de un mes (mes de 0 a 11), ordenados por fecha y hora. */
export async function listarEventosDelMes(anio, mes) {
    const { desde, hasta } = limitesDeMes(anio, mes);
    const { data, error } = await supabase
        .from("evento")
        .select(CAMPOS)
        .gte("fecha", desde)
        .lte("fecha", hasta)
        .order("fecha")
        .order("hora_inicio");
    if (error) throw error;
    return (data ?? []).map(convertirEvento);
}

/** Próximos eventos desde hoy (formato AAAA-MM-DD), como máximo `limite`. */
export async function listarProximosEventos(hoy, limite = 20) {
    const { data, error } = await supabase
        .from("evento")
        .select(CAMPOS)
        .gte("fecha", hoy)
        .order("fecha")
        .order("hora_inicio")
        .limit(limite);
    if (error) throw error;
    return (data ?? []).map(convertirEvento);
}
