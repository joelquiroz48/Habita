/* =========================================================
   Servicio de Expensas (residente)

   Tablas:  expensa  (una por unidad y periodo, la crea el dia 1
                      generar_expensas_del_mes() a partir de la
                      plantilla que edita el administrador)
            expensa_concepto (detalle de cada expensa)
            pago     (pagos confirmados de cada expensa)

   La seguridad (RLS) hace que el residente solo reciba las
   expensas de SU unidad: no hace falta filtrar aca.
========================================================= */

import { supabase } from "../supabase";
import {
    formatearFechaISO,
    formatearFechaPago,
    formatearMoneda,
    nombrePeriodo,
    diasHasta,
} from "../utils/formatos";

/** Estados que muestra la pantalla (y opciones del filtro). */
export const ESTADOS_EXPENSA = ["Pagada", "Pendiente", "Vencida"];

function estadoVisible(estadoBase, vencimientoISO) {
    const estado = String(estadoBase ?? "").toUpperCase();
    if (estado === "PAGADA") return "Pagada";
    const dias = diasHasta(vencimientoISO);
    if (dias !== null && dias < 0) return "Vencida";
    return "Pendiente";
}

function convertirExpensa(fila) {
    const importe = Number(fila.importe_total);
    const estado = estadoVisible(fila.estado, fila.fecha_vencimiento);

    const conceptos = [...(fila.conceptos ?? [])]
        .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
        .map((c) => ({ concepto: c.concepto, monto: Number(c.monto), montoTexto: formatearMoneda(c.monto) }));

    const pagoConfirmado = [...(fila.pagos ?? [])]
        .filter((p) => String(p.estado ?? "").toUpperCase() === "CONFIRMADO")
        .sort((a, b) => String(b.fecha_pago).localeCompare(String(a.fecha_pago)))[0] ?? null;

    return {
        id: fila.id,
        periodoClave: fila.periodo,
        periodo: nombrePeriodo(fila.periodo),
        importeNumero: importe,
        importe: formatearMoneda(importe),
        vencimientoISO: fila.fecha_vencimiento,
        vencimiento: formatearFechaISO(fila.fecha_vencimiento),
        fecha: pagoConfirmado ? formatearFechaPago(pagoConfirmado.fecha_pago) : "--",
        metodoPago: pagoConfirmado?.metodo_pago ?? null,
        estado,
        conceptos,
        unidad: fila.unidad ? { numero: fila.unidad.numero, piso: fila.unidad.piso } : null,
        edificio: fila.unidad?.edificio ?? null,
    };
}

/**
 * Devuelve las expensas del residente, de la mas nueva a la mas vieja,
 * ya con textos listos para mostrar.
 */
export async function obtenerExpensasResidente() {
    const { data, error } = await supabase
        .from("expensa")
        .select(`
            id, periodo, importe_total, fecha_vencimiento, estado,
            unidad:unidad ( numero, piso, edificio:edificio ( nombre, direccion ) ),
            conceptos:expensa_concepto ( concepto, monto, orden ),
            pagos:pago ( monto, fecha_pago, metodo_pago, estado )
        `)
        .order("periodo", { ascending: false });

    if (error) throw error;
    return (data ?? []).map(convertirExpensa);
}
