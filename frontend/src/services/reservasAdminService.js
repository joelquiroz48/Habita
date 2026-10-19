/* Servicio de Reservas (administrador). Usa admin_reservas() y admin_resolver_reserva() de sql/19. */
import { supabase } from "../supabase";
import { obtenerPeriodoFecha } from "../utils/periodos";

const ZONA = "America/Argentina/Buenos_Aires";
const sinTildes = (t) => `${t} ${t.normalize("NFD").replace(/[̀-ͯ]/g, "")}`;

export const ESTADOS = ["Pendiente", "Confirmada", "Finalizada", "Rechazada", "Cancelada", "Vencida"];
const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const fechaLarga = (f) => {
    const [a, m, d] = f.split("-");
    return `${d}/${m}/${a}`;
};
const mesClave = (f) => f.slice(0, 7);
const nombreMes = (clave) => {
    const [a, m] = clave.split("-").map(Number);
    const n = new Intl.DateTimeFormat("es-AR", { month: "long", timeZone: "UTC" }).format(new Date(Date.UTC(a, m - 1, 1)));
    return `${n.charAt(0).toLocaleUpperCase("es-AR")}${n.slice(1)} ${a}`;
};
const diaSemana = (f) => (new Date(`${f}T12:00:00Z`).getUTCDay() + 6) % 7; // 0 = lunes
const minutos = (h) => Number(h.slice(0, 2)) * 60 + Number(h.slice(3, 5));
const nombreDia = (f) => new Intl.DateTimeFormat("es-AR", { weekday: "long", timeZone: "UTC" }).format(new Date(`${f}T12:00:00Z`));

function creadaEl(ts) {
    const p = Object.fromEntries(new Intl.DateTimeFormat("es-AR", {
        day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false, timeZone: ZONA,
    }).formatToParts(new Date(ts)).map((x) => [x.type, x.value]));
    return `${p.day}/${p.month}/${p.year} ${p.hour}:${p.minute}`;
}

function mensajeError(error) {
    if (error?.code === "PGRST202") return "Falta instalar sql/19_reservas_admin.sql en Supabase.";
    if (["28000", "42501", "22023"].includes(error?.code)) return error.message;
    return "No pudimos completar la operación. Probá de nuevo.";
}

function convertir(r, hoy, ahoraMin) {
    const termino = r.fecha < hoy || (r.fecha === hoy && minutos(r.hora_fin) <= ahoraMin);
    let estado = { pendiente: "Pendiente", confirmada: "Confirmada", rechazada: "Rechazada", cancelada: "Cancelada" }[r.estado] ?? "Pendiente";
    if (estado === "Confirmada" && termino) estado = "Finalizada";
    if (estado === "Pendiente" && termino) estado = "Vencida";
    return {
        id: r.id,
        numero: r.numero,
        estado,
        estadoBase: r.estado,
        accionable: estado === "Pendiente",
        cancelable: estado === "Confirmada",
        asunto: r.asunto ?? "",
        fechaClave: r.fecha,
        fecha: fechaLarga(r.fecha),
        diaSemana: nombreDia(r.fecha),
        mesClave: mesClave(r.fecha),
        periodoFecha: obtenerPeriodoFecha(fechaLarga(r.fecha)),
        horaInicio: r.hora_inicio,
        horaFin: r.hora_fin,
        horario: `${r.hora_inicio} - ${r.hora_fin}`,
        horas: (minutos(r.hora_fin) - minutos(r.hora_inicio)) / 60,
        creada: creadaEl(r.created_at),
        creadaTs: r.created_at,
        motivo: r.motivo_cancelacion ?? "",
        espacioId: r.espacio_id,
        espacio: r.espacio_nombre,
        ubicacion: r.espacio_lugar ?? "",
        residente: r.residente,
        telefono: r.telefono ?? "",
        unidad: r.unidad_numero,
        piso: r.unidad_piso,
        edificio: r.edificio_nombre,
        busqueda: sinTildes(`${r.espacio_nombre} ${r.residente} ${r.unidad_numero} ${r.asunto ?? ""}`),
    };
}

export async function obtenerReservasAdmin() {
    const { data, error } = await supabase.rpc("admin_reservas");
    if (error) throw new Error(mensajeError(error));
    const hoy = data.hoy;
    const ahoraMin = Number(new Intl.DateTimeFormat("en-GB", { hour: "2-digit", hour12: false, timeZone: ZONA }).format(new Date())) * 60
        + Number(new Intl.DateTimeFormat("en-GB", { minute: "2-digit", timeZone: ZONA }).format(new Date()));
    const todas = (data.reservas ?? []).map((r) => convertir(r, hoy, ahoraMin));
    // Primero lo que espera respuesta (la fecha más cercana arriba); después el resto, de la más nueva a la más vieja
    const pendientes = todas.filter((r) => r.accionable).sort((a, b) => a.fechaClave.localeCompare(b.fechaClave) || a.horaInicio.localeCompare(b.horaInicio));
    const resto = todas.filter((r) => !r.accionable);
    return {
        edificios: data.edificios ?? [],
        espacios: data.espacios ?? [],
        reservas: [...pendientes, ...resto],
        periodoActual: data.periodo_actual,
        hoy,
    };
}

/** accion: "CONFIRMAR" | "RECHAZAR" | "CANCELAR" */
export async function resolverReserva({ id, accion, motivo }) {
    const { error } = await supabase.rpc("admin_resolver_reserva", { p_id: id, p_accion: accion, p_motivo: motivo?.trim() || null });
    if (error) throw new Error(mensajeError(error));
}

/** Reservas que se pisan con una dada (mismo espacio, mismo día, horarios cruzados). */
export function reservasQueSePisan(reserva, todas) {
    return todas.filter((o) => o.id !== reserva.id && o.espacioId === reserva.espacioId && o.fechaClave === reserva.fechaClave
        && ["Pendiente", "Confirmada", "Finalizada"].includes(o.estado)
        && o.horaInicio < reserva.horaFin && o.horaFin > reserva.horaInicio);
}

export function mesesDisponibles(reservas, periodoActual) {
    return [...new Set([periodoActual, ...reservas.map((r) => r.mesClave)])].sort().reverse().map((c) => ({ clave: c, nombre: nombreMes(c) }));
}

export const nombreDeMes = nombreMes;

/** Estadísticas del mes (para las tarjetas y el reporte). */
export function estadisticasDelMes(reservas, espacios, clave) {
    const delMes = reservas.filter((r) => r.mesClave === clave);
    const cuenta = (...est) => delMes.filter((r) => est.includes(r.estado)).length;
    const aprobadas = cuenta("Confirmada", "Finalizada");
    const rechazadas = cuenta("Rechazada");
    const [a, m] = clave.split("-").map(Number);
    const diasMes = new Date(Date.UTC(a, m, 0)).getUTCDate();

    const porEspacio = espacios.map((e) => {
        const suyas = delMes.filter((r) => r.espacioId === e.id);
        const horas = suyas.filter((r) => ["Confirmada", "Finalizada"].includes(r.estado)).reduce((s, r) => s + r.horas, 0);
        const disponibles = diasMes * ((minutos(e.hora_cierre) - minutos(e.hora_apertura)) / 60);
        return { id: e.id, nombre: e.nombre, solicitudes: suyas.length, aprobadas: suyas.filter((r) => ["Confirmada", "Finalizada"].includes(r.estado)).length,
            horas, ocupacion: disponibles ? Math.round((horas / disponibles) * 100) : 0 };
    }).sort((x, y) => y.solicitudes - x.solicitudes || x.nombre.localeCompare(y.nombre));

    const porDia = DIAS.map((d, i) => ({ dia: d, cantidad: delMes.filter((r) => ["Confirmada", "Finalizada", "Pendiente"].includes(r.estado) && diaSemana(r.fechaClave) === i).length }));

    const unidades = {};
    delMes.forEach((r) => { const k = `${r.unidad}|${r.residente}`; unidades[k] = unidades[k] ?? { unidad: r.unidad, residente: r.residente, cantidad: 0 }; unidades[k].cantidad++; });
    const topUnidades = Object.values(unidades).sort((x, y) => y.cantidad - x.cantidad).slice(0, 5);

    return {
        clave, nombre: nombreMes(clave), total: delMes.length,
        pendientes: cuenta("Pendiente"), confirmadas: aprobadas, canceladas: cuenta("Cancelada"), rechazadas, vencidas: cuenta("Vencida"),
        aprobacion: aprobadas + rechazadas ? Math.round((aprobadas / (aprobadas + rechazadas)) * 100) : null,
        horasReservadas: porEspacio.reduce((s, e) => s + e.horas, 0),
        porEspacio, porDia, topUnidades, delMes,
    };
}

/** CSV del mes (separador ; y BOM para que Excel en español lo abra bien). */
export function reservasACsv(lista) {
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const filas = [["N°", "Fecha", "Horario", "Espacio", "Residente", "Unidad", "Estado", "Asunto", "Solicitada el", "Motivo"]];
    [...lista].sort((a, b) => a.fechaClave.localeCompare(b.fechaClave) || a.horaInicio.localeCompare(b.horaInicio)).forEach((r) =>
        filas.push([r.numero, r.fecha, r.horario, r.espacio, r.residente, r.unidad, r.estado, r.asunto, r.creada, r.motivo]));
    return `﻿${filas.map((f) => f.map(esc).join(";")).join("\r\n")}`;
}

export function descargarCsv(nombre, contenido) {
    const url = URL.createObjectURL(new Blob([contenido], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url; a.download = nombre;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}
