/* Servicio de Expensas (administrador). Usa las funciones de sql/15. */
import { supabase } from "../supabase";
import { formatearFechaISO, formatearFechaPago, formatearMoneda, nombrePeriodo, diasHasta } from "../utils/formatos";

const num = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
};
const sinTildes = (t) => `${t} ${t.normalize("NFD").replace(/[̀-ͯ]/g, "")}`;

function mensajeError(error, porDefecto) {
    if (!error) return porDefecto;
    if (error.code === "PGRST202") return "Falta instalar sql/15_expensas_admin.sql en Supabase.";
    if (["22023", "23505", "28000", "42501"].includes(error.code)) return error.message;
    return porDefecto;
}

function convertirExpensa(x) {
    const pagada = String(x.estado ?? "").toUpperCase() === "PAGADA";
    const vencida = !pagada && (diasHasta(x.fecha_vencimiento) ?? 0) < 0;
    const estado = pagada ? "Pagado" : vencida ? "Sin pagar" : "Pendiente";
    const conceptos = (x.conceptos ?? []).map((c) => ({ concepto: c.concepto, monto: num(c.monto), montoTexto: formatearMoneda(c.monto) }));
    const residentes = x.residentes ?? "";
    return {
        id: x.id,
        periodoClave: x.periodo,
        periodo: nombrePeriodo(x.periodo),
        edificioId: x.edificio_id,
        edificio: x.edificio_nombre,
        direccion: x.edificio_direccion,
        unidadId: x.unidad_id,
        unidad: x.unidad_numero,
        piso: x.unidad_piso,
        nombre: residentes || "Sin residente",
        residentes,
        importe: num(x.importe_total),
        vencimientoISO: String(x.fecha_vencimiento ?? "").slice(0, 10),
        vencimiento: formatearFechaISO(x.fecha_vencimiento),
        estado,
        pagada,
        fechaPago: x.fecha_pago ? formatearFechaPago(x.fecha_pago) : "--",
        metodoPago: x.metodo_pago ?? null,
        conceptos,
        busqueda: sinTildes(`${residentes} ${x.unidad_numero} ${nombrePeriodo(x.periodo)}`),
    };
}

function armarPeriodos(expensas) {
    const mapa = new Map();
    expensas.forEach((e) => {
        const clave = `${e.edificioId}|${e.periodoClave}`;
        if (!mapa.has(clave)) {
            mapa.set(clave, { id: clave, edificioId: e.edificioId, edificio: e.edificio, periodoClave: e.periodoClave, periodo: e.periodo, filas: [] });
        }
        mapa.get(clave).filas.push(e);
    });
    return [...mapa.values()]
        .map((p) => {
            const importe = p.filas.reduce((s, f) => s + f.importe, 0);
            const recaudado = p.filas.filter((f) => f.pagada).reduce((s, f) => s + f.importe, 0);
            const pagadas = p.filas.filter((f) => f.pagada).length;
            const conceptosMapa = new Map();
            p.filas.forEach((f) => f.conceptos.forEach((c) => conceptosMapa.set(c.concepto, (conceptosMapa.get(c.concepto) ?? 0) + c.monto)));
            const vencimientos = [...new Set(p.filas.map((f) => f.vencimientoISO))].sort();
            return {
                ...p,
                importeTotal: importe,
                recaudado,
                porcentaje: importe ? Math.round((recaudado / importe) * 100) : 0,
                unidades: p.filas.length,
                pagadas,
                estado: pagadas === p.filas.length ? "Cerrada" : "En curso",
                vencimientoISO: vencimientos[vencimientos.length - 1] ?? "",
                vencimiento: formatearFechaISO(vencimientos[vencimientos.length - 1]),
                variosVencimientos: vencimientos.length > 1,
                conceptos: [...conceptosMapa.entries()].map(([concepto, monto]) => ({ concepto, monto, montoTexto: formatearMoneda(monto) })),
                busqueda: sinTildes(p.periodo),
            };
        })
        .sort((a, b) => b.periodoClave.localeCompare(a.periodoClave) || a.edificio.localeCompare(b.edificio));
}

export async function obtenerExpensasAdmin() {
    const { data, error } = await supabase.rpc("admin_expensas");
    if (error) throw new Error(mensajeError(error, "No pudimos cargar las expensas."));
    const expensas = (data?.expensas ?? []).map(convertirExpensa);
    return {
        edificios: (data?.edificios ?? []).map((e) => ({ id: e.id, nombre: e.nombre, direccion: e.direccion, tienePlantilla: e.tiene_plantilla })),
        expensas,
        periodos: armarPeriodos(expensas),
    };
}

/** Forma que espera utils/boletaPdf.js */
export function expensaParaBoleta(e, { agregada = false } = {}) {
    const estado = e.estado === "Pagado" ? "Pagada" : e.estado === "Sin pagar" ? "Vencida" : "Pendiente";
    return {
        id: e.id,
        periodoClave: e.periodoClave,
        periodo: e.periodo,
        importe: formatearMoneda(agregada ? e.importeTotal : e.importe),
        vencimiento: e.vencimiento,
        fecha: e.fechaPago ?? "--",
        metodoPago: e.metodoPago ?? null,
        estado: agregada ? (e.estado === "Cerrada" ? "Pagada" : "Pendiente") : estado,
        conceptos: e.conceptos,
        unidad: agregada ? null : { numero: e.unidad, piso: e.piso },
        edificio: { nombre: e.edificio, direccion: e.direccion ?? "" },
    };
}

export async function editarExpensa({ id, conceptos, vencimiento }) {
    const { error } = await supabase.rpc("admin_editar_expensa", {
        p_id: id,
        p_conceptos: conceptos.map((c) => ({ concepto: c.concepto.trim(), monto: Number(String(c.monto).replace(",", ".")) })),
        p_vencimiento: vencimiento,
    });
    if (error) throw new Error(mensajeError(error, "No pudimos guardar la boleta."));
}

export async function editarVencimientoPeriodo({ edificioId, periodo, vencimiento }) {
    const { data, error } = await supabase.rpc("admin_editar_vencimiento_periodo", {
        p_edificio: edificioId, p_periodo: periodo, p_vencimiento: vencimiento,
    });
    if (error) throw new Error(mensajeError(error, "No pudimos cambiar el vencimiento."));
    return data;
}

export async function generarExpensas(periodo) {
    const { data, error } = await supabase.rpc("admin_generar_expensas", { p_periodo: periodo });
    if (error) throw new Error(mensajeError(error, "No pudimos generar las expensas."));
    return data;
}
