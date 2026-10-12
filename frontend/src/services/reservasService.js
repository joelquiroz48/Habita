/* =========================================================
   Servicio de Reservas
   Todas las consultas a Supabase de esta pantalla están acá,
   así los componentes quedan limpios.
========================================================= */

import { supabase } from "../supabase";
import { limitesDeMes } from "../pages/Residente/Reservas/reservasUtils";

/* Datos del espacio que se traen junto con cada reserva */
const CAMPOS_RESERVA = `
    id, numero, asunto, fecha, hora_inicio, hora_fin, estado, motivo_cancelacion,
    espacio:espacios_comunes (
        id, nombre, descripcion, ambientes, lugar, permisos, reglas,
        capacidad, duracion_turno_min, hora_apertura, hora_cierre,
        fotos:espacio_fotos ( url, orden )
    )
`;

/* Convierte los errores de Supabase en mensajes para el residente */
function aError(error, mensajePorDefecto) {
    if (!error) return null;

    // Mensajes que escribimos en la base (reglas de negocio)
    if (error.code === "P0001") return new Error(error.message);
    if (error.code === "42501") {
        return new Error("No tenés permiso para realizar esta acción. Verificá que hayas iniciado sesión.");
    }
    if (error.code === "23P01") {
        return new Error("Ese horario ya fue confirmado para otra reserva.");
    }

    console.error("Error de Supabase:", error);
    return new Error(mensajePorDefecto);
}

/* ---------------------------------------------------------
   USUARIO
   Devuelve el usuario con sesión iniciada. Mientras el login
   no esté conectado, usa VITE_USUARIO_PRUEBA_ID de .env.local
   (solo sirve para LEER los datos de ejemplo).
--------------------------------------------------------- */
export async function obtenerUsuarioId() {
    const { data } = await supabase.auth.getSession();
    return data?.session?.user?.id ?? import.meta.env.VITE_USUARIO_PRUEBA_ID ?? null;
}

async function exigirSesion() {
    const { data } = await supabase.auth.getSession();
    const usuario = data?.session?.user;
    if (!usuario) {
        throw new Error("Tenés que iniciar sesión para realizar esta acción.");
    }
    return usuario.id;
}

/* ---------------------------------------------------------
   ESPACIOS
--------------------------------------------------------- */

/** Espacios disponibles según filtros (todos opcionales). */
export async function listarEspaciosDisponibles({ fecha, desde, hasta, capacidad } = {}) {
    const { data, error } = await supabase.rpc("espacios_disponibles", {
        p_fecha: fecha || null,
        p_desde: desde || null,
        p_hasta: hasta || null,
        p_capacidad: capacidad ? Number(capacidad) : null,
    });
    if (error) throw aError(error, "No pudimos cargar los espacios.");

    if (data.length === 0) return [];

    // Fotos de todos los espacios en una sola consulta
    const { data: fotos, error: errorFotos } = await supabase
        .from("espacio_fotos")
        .select("espacio_id, url, orden")
        .in("espacio_id", data.map((e) => e.id))
        .order("orden");
    if (errorFotos) throw aError(errorFotos, "No pudimos cargar las fotos de los espacios.");

    return data.map((espacio) => ({
        ...espacio,
        fotos: fotos.filter((f) => f.espacio_id === espacio.id),
    }));
}

/** Un espacio con todas sus fotos. */
export async function obtenerEspacio(id) {
    const { data, error } = await supabase
        .from("espacios_comunes")
        .select("*, fotos:espacio_fotos ( url, orden )")
        .eq("id", id)
        .maybeSingle();
    if (error) throw aError(error, "No pudimos cargar el espacio.");
    return data;
}

/** Reservas ya confirmadas de un espacio (solo fecha y horario). */
export async function listarReservasRegistradas(espacioId) {
    const { data, error } = await supabase.rpc("reservas_registradas", {
        p_espacio_id: espacioId,
    });
    if (error) throw aError(error, "No pudimos cargar las reservas registradas.");
    return data;
}

/* ---------------------------------------------------------
   RESERVAS DEL RESIDENTE
--------------------------------------------------------- */

/** Reservas activas: confirmadas y pendientes de hoy en adelante. */
export async function listarReservasActivas(usuarioId, hoy) {
    const { data, error } = await supabase
        .from("reservas")
        .select(CAMPOS_RESERVA)
        .eq("usuario_id", usuarioId)
        .in("estado", ["confirmada", "pendiente"])
        .gte("fecha", hoy)
        .order("fecha")
        .order("hora_inicio");
    if (error) throw aError(error, "No pudimos cargar tus reservas.");
    return data;
}

/** Cantidad de reservas confirmadas del mes en curso que ya se realizaron. */
export async function contarHistorialDelMes(usuarioId, hoy) {
    const [anio, mes] = hoy.split("-").map(Number);
    const { desde } = limitesDeMes(anio, mes - 1);

    const { count, error } = await supabase
        .from("reservas")
        .select("id", { count: "exact", head: true })
        .eq("usuario_id", usuarioId)
        .eq("estado", "confirmada")
        .gte("fecha", desde)
        .lte("fecha", hoy);
    if (error) throw aError(error, "No pudimos calcular tu historial.");
    return count ?? 0;
}

/** Todas las reservas de un mes (menos las canceladas). */
export async function listarReservasDelMes(usuarioId, anio, mes) {
    const { desde, hasta } = limitesDeMes(anio, mes);
    const { data, error } = await supabase
        .from("reservas")
        .select(CAMPOS_RESERVA)
        .eq("usuario_id", usuarioId)
        .neq("estado", "cancelada")
        .gte("fecha", desde)
        .lte("fecha", hasta)
        .order("fecha")
        .order("hora_inicio");
    if (error) throw aError(error, "No pudimos cargar el calendario.");
    return data;
}

/* ---------------------------------------------------------
   ACCIONES (requieren sesión iniciada)
--------------------------------------------------------- */

export async function crearSolicitud({ espacioId, asunto, fecha, horaInicio, horaFin }) {
    const usuarioId = await exigirSesion();
    const { error } = await supabase.from("reservas").insert({
        espacio_id: espacioId,
        usuario_id: usuarioId,
        asunto: asunto?.trim() || null,
        fecha,
        hora_inicio: horaInicio,
        hora_fin: horaFin,
    });
    if (error) throw aError(error, "No pudimos enviar tu solicitud. Probá de nuevo.");
}

export async function modificarSolicitud(id, { asunto, fecha, horaInicio, horaFin }) {
    await exigirSesion();
    const { data, error } = await supabase
        .from("reservas")
        .update({
            asunto: asunto?.trim() || null,
            fecha,
            hora_inicio: horaInicio,
            hora_fin: horaFin,
        })
        .eq("id", id)
        .select("id");
    if (error) throw aError(error, "No pudimos guardar los cambios. Probá de nuevo.");
    if (!data || data.length === 0) {
        throw new Error("La solicitud ya no se puede modificar.");
    }
}

/** Cancela una solicitud pendiente o una reserva confirmada. */
export async function cancelarReserva(id, motivo) {
    await exigirSesion();
    const { data, error } = await supabase
        .from("reservas")
        .update({
            estado: "cancelada",
            motivo_cancelacion: motivo?.trim() || null,
        })
        .eq("id", id)
        .select("id");
    if (error) throw aError(error, "No pudimos cancelar la reserva. Probá de nuevo.");
    if (!data || data.length === 0) {
        throw new Error("Esta reserva ya no se puede cancelar.");
    }
}
