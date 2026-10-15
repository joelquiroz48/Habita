/* =========================================================
   Formatos compartidos (plata y fechas) en estilo argentino.
   Las fechas "YYYY-MM-DD" de la base se leen a mano (sin pasar
   por Date) para que la zona horaria no las corra un dia.
========================================================= */

const ZONA = "America/Argentina/Buenos_Aires";

/** 45230 -> "$ 45.230"   |   45230.5 -> "$ 45.230,50" */
export function formatearMoneda(valor) {
    const numero = Number(valor);
    if (!Number.isFinite(numero)) return "--";
    const entero = Number.isInteger(numero);
    const texto = new Intl.NumberFormat("es-AR", {
        minimumFractionDigits: entero ? 0 : 2,
        maximumFractionDigits: 2,
    }).format(numero);
    return `$ ${texto}`;
}

/** "2026-10" -> "Octubre 2026" */
export function nombrePeriodo(clave) {
    const [anio, mes] = String(clave ?? "").split("-").map(Number);
    if (!anio || !mes || mes > 12) return String(clave ?? "");
    const nombre = new Intl.DateTimeFormat("es-AR", { month: "long" }).format(new Date(anio, mes - 1, 1));
    return `${nombre.charAt(0).toLocaleUpperCase("es-AR")}${nombre.slice(1)} ${anio}`;
}

/** "2026-10-10" -> "10/10/2026"  (devuelve "--" si no hay fecha) */
export function formatearFechaISO(iso) {
    const [anio, mes, dia] = String(iso ?? "").slice(0, 10).split("-");
    if (!anio || !mes || !dia) return "--";
    return `${dia}/${mes}/${anio}`;
}

/** Timestamp con hora ("2026-09-08T13:30:00Z") -> "08/09/2026" en hora argentina */
export function formatearFechaPago(timestamp) {
    if (!timestamp) return "--";
    const fecha = new Date(timestamp);
    if (Number.isNaN(fecha.getTime())) return "--";
    return new Intl.DateTimeFormat("es-AR", {
        day: "2-digit", month: "2-digit", year: "numeric", timeZone: ZONA,
    }).format(fecha);
}

/** "dd/mm/aaaa hh:mm" del momento actual (para el pie del PDF) */
export function ahoraFormateado() {
    return new Intl.DateTimeFormat("es-AR", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit", hour12: false, timeZone: ZONA,
    }).format(new Date()).replace(",", "");
}

/** Dias que faltan hasta una fecha "YYYY-MM-DD" (negativo si ya paso). */
export function diasHasta(iso) {
    const [anio, mes, dia] = String(iso ?? "").slice(0, 10).split("-").map(Number);
    if (!anio || !mes || !dia) return null;
    const hoyTexto = new Intl.DateTimeFormat("en-CA", { timeZone: ZONA }).format(new Date()); // YYYY-MM-DD
    const [ha, hm, hd] = hoyTexto.split("-").map(Number);
    const MS_DIA = 24 * 60 * 60 * 1000;
    return Math.round((Date.UTC(anio, mes - 1, dia) - Date.UTC(ha, hm - 1, hd)) / MS_DIA);
}
