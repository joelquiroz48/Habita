/* =========================================================
   Funciones de ayuda para la pantalla de Reservas
   (formatos de fecha/hora, estados, opciones de horario)
========================================================= */

export const ESTADOS = {
    pendiente: { etiqueta: "Pendiente", clase: "estado-pendiente" },
    confirmada: { etiqueta: "Confirmada", clase: "estado-confirmada" },
    rechazada: { etiqueta: "Rechazada", clase: "estado-rechazada" },
    cancelada: { etiqueta: "Cancelada", clase: "estado-rechazada" },
};

const MESES = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const DIAS_CORTOS = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];

const dosDigitos = (n) => String(n).padStart(2, "0");

/** Fecha de hoy en formato AAAA-MM-DD (hora local del navegador). */
export function hoyISO() {
    const d = new Date();
    return `${d.getFullYear()}-${dosDigitos(d.getMonth() + 1)}-${dosDigitos(d.getDate())}`;
}

/** "2026-09-18" -> "18/09/2026" */
export function formatearFecha(iso) {
    if (!iso) return "";
    const [anio, mes, dia] = iso.split("-");
    return `${dia}/${mes}/${anio}`;
}

/** "2026-09-18" -> "18/09/26" */
export function formatearFechaCorta(iso) {
    if (!iso) return "";
    const [anio, mes, dia] = iso.split("-");
    return `${dia}/${mes}/${anio.slice(2)}`;
}

/** "18:00:00" -> "18:00" */
export function formatearHora(hora) {
    return hora ? hora.slice(0, 5) : "";
}

/** ("18:00:00", "22:00:00") -> "18:00 a 22:00" */
export function formatearRango(inicio, fin) {
    return `${formatearHora(inicio)} a ${formatearHora(fin)}`;
}

/** "2026-09-05" -> { dia: "SÁB", numero: "5" } */
export function partesDeFecha(iso) {
    const [anio, mes, dia] = iso.split("-").map(Number);
    const fecha = new Date(anio, mes - 1, dia);
    return { dia: DIAS_CORTOS[fecha.getDay()], numero: String(dia) };
}

/** (2026, 8) -> "Septiembre 2026"   (mes de 0 a 11) */
export function nombreDeMes(anio, mes) {
    return `${MESES[mes]} ${anio}`;
}

/** Primer y último día de un mes en formato AAAA-MM-DD. */
export function limitesDeMes(anio, mes) {
    const ultimo = new Date(anio, mes + 1, 0).getDate();
    const mm = dosDigitos(mes + 1);
    return {
        desde: `${anio}-${mm}-01`,
        hasta: `${anio}-${mm}-${dosDigitos(ultimo)}`,
    };
}

/** Suma (o resta) meses a un { anio, mes }. */
export function moverMes({ anio, mes }, cantidad) {
    const fecha = new Date(anio, mes + cantidad, 1);
    return { anio: fecha.getFullYear(), mes: fecha.getMonth() };
}

/** Pasa de "18:30" a minutos desde las 00:00 (1110). */
export function aMinutos(hora) {
    const [h, m] = hora.slice(0, 5).split(":").map(Number);
    return h * 60 + m;
}

/** Pasa de minutos a "HH:MM". */
export function deMinutos(total) {
    return `${dosDigitos(Math.floor(total / 60))}:${dosDigitos(total % 60)}`;
}

/**
 * Lista de horarios seleccionables cada `paso` minutos.
 * Ej: opcionesDeHorario("09:00:00", "23:00:00") -> ["09:00", "09:30", ... "23:00"]
 */
export function opcionesDeHorario(desde = "00:00", hasta = "23:30", paso = 30) {
    const opciones = [];
    for (let m = aMinutos(desde); m <= aMinutos(hasta); m += paso) {
        opciones.push(deMinutos(m));
    }
    return opciones;
}

/** ¿Se pisan dos franjas horarias? (comparan "HH:MM" o "HH:MM:SS") */
export function seSuperponen(inicioA, finA, inicioB, finB) {
    return aMinutos(inicioA) < aMinutos(finB) && aMinutos(finA) > aMinutos(inicioB);
}

/** Horas que faltan para que empiece una reserva (puede ser negativo). */
export function horasHastaInicio(fecha, horaInicio) {
    const [anio, mes, dia] = fecha.split("-").map(Number);
    const [h, m] = horaInicio.slice(0, 5).split(":").map(Number);
    const inicio = new Date(anio, mes - 1, dia, h, m);
    return (inicio.getTime() - Date.now()) / 3600000;
}

/** Foto principal de un espacio (o la imagen predeterminada). */
export function fotoPrincipal(espacio, predeterminada) {
    const fotos = [...(espacio?.fotos ?? [])].sort((a, b) => a.orden - b.orden);
    return fotos[0]?.url ?? predeterminada;
}

/** Todas las fotos de un espacio ordenadas (o la imagen predeterminada). */
export function todasLasFotos(espacio, predeterminada) {
    const fotos = [...(espacio?.fotos ?? [])]
        .sort((a, b) => a.orden - b.orden)
        .map((f) => f.url);
    return fotos.length > 0 ? fotos : [predeterminada];
}

/* ---------------------------------------------------------
   Opciones de horario según el espacio elegido
   (respetan apertura, cierre y los turnos fijos, como Laundry)
--------------------------------------------------------- */

/** Horarios de inicio posibles para un espacio. */
export function opcionesDesde(espacio) {
    if (!espacio) return [];
    const turno = espacio.duracion_turno_min;
    const paso = turno || 30;
    const ultimo = aMinutos(espacio.hora_cierre) - (turno || 30);

    const opciones = [];
    for (let m = aMinutos(espacio.hora_apertura); m <= ultimo; m += paso) {
        opciones.push(deMinutos(m));
    }
    return opciones;
}

/** Horarios de fin posibles para un espacio, dado el horario de inicio. */
export function opcionesHasta(espacio, desde) {
    if (!espacio || !desde) return [];
    const inicio = aMinutos(desde);
    const cierre = aMinutos(espacio.hora_cierre);

    if (espacio.duracion_turno_min) {
        const fin = inicio + espacio.duracion_turno_min;
        return fin <= cierre ? [deMinutos(fin)] : [];
    }

    const opciones = [];
    for (let m = inicio + 30; m <= cierre; m += 30) {
        opciones.push(deMinutos(m));
    }
    return opciones;
}
