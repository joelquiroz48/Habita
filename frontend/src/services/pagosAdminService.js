/* Servicio de Pagos (administrador). Usa admin_pagos() de sql/16. Solo lectura. */
import { supabase } from "../supabase";
import { formatearFechaPago, formatearMoneda, nombrePeriodo } from "../utils/formatos";

const ZONA = "America/Argentina/Buenos_Aires";
const sinTildes = (t) => `${t} ${t.normalize("NFD").replace(/[̀-ͯ]/g, "")}`;

const ESTADOS = { CONFIRMADO: "Confirmado", PENDIENTE: "Pendiente", RECHAZADO: "Rechazado", "PARA CONFIRMAR": "Para confirmar" };

function hora(ts) {
    if (!ts) return "--";
    return new Intl.DateTimeFormat("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: ZONA }).format(new Date(ts));
}

function mensajeError(error) {
    if (error?.code === "PGRST202") return "Falta instalar sql/16_pagos_admin.sql en Supabase.";
    if (["28000", "42501"].includes(error?.code)) return error.message;
    return "No pudimos cargar los pagos.";
}

function convertir(p) {
    const estado = ESTADOS[String(p.estado ?? "").toUpperCase()] ?? "Pendiente";
    const residentes = p.residentes || "Sin residente";
    const metodo = p.metodo_pago || "--";
    return {
        id: p.id,
        referencia: p.referencia_externa || `HAB-PAGO-${p.id}`,
        referenciaExterna: Boolean(p.referencia_externa),
        fechaTs: p.fecha_pago,
        fecha: formatearFechaPago(p.fecha_pago),
        hora: `${hora(p.fecha_pago)} hs`,
        mesPago: p.fecha_pago
            ? new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", timeZone: ZONA }).format(new Date(p.fecha_pago))
            : "",
        residente: residentes,
        unidad: p.unidad_numero,
        piso: p.unidad_piso,
        periodoClave: p.periodo,
        periodo: nombrePeriodo(p.periodo),
        importeNumero: Number(p.monto) || 0,
        importe: formatearMoneda(p.monto),
        metodo,
        estado,
        expensaId: p.expensa_id,
        edificio: p.edificio_nombre,
        direccion: p.edificio_direccion ?? "",
        busqueda: sinTildes(`${residentes} ${p.unidad_numero} ${p.referencia_externa ?? ""}`),
    };
}

export async function obtenerPagosAdmin() {
    const { data, error } = await supabase.rpc("admin_pagos");
    if (error) throw new Error(mensajeError(error));
    const pagos = (data?.pagos ?? []).map(convertir);

    // Resumen del mes en curso (hora argentina)
    const mes = data?.periodo_actual;
    const delMes = pagos.filter((p) => p.mesPago === mes);
    const confirmados = delMes.filter((p) => p.estado === "Confirmado");
    return {
        edificios: data?.edificios ?? [],
        pagos,
        resumen: {
            mes,
            mesNombre: nombrePeriodo(mes),
            recaudado: confirmados.reduce((s, p) => s + p.importeNumero, 0),
            realizados: confirmados.length,
            porCobrar: data?.por_cobrar_mes ?? 0,
            intentos: delMes.length,
            tasa: delMes.length ? Math.round((confirmados.length / delMes.length) * 100) : 0,
        },
    };
}
