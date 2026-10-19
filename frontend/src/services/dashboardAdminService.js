/* =========================================================
   Servicio del Dashboard del administrador

   Llama a la funcion dashboard_admin() de la base (sql/12), que
   devuelve en una sola consulta todo lo que muestra el Inicio del
   administrador, SOLO del edificio que administra quien la llama.

   Esta funcion convierte esa respuesta en datos listos para mostrar.
========================================================= */

import { supabase } from "../supabase";
import { formatearMoneda, nombrePeriodo } from "../utils/formatos";

export const CODIGO_SIN_EDIFICIO = "42501";

const MESES_CORTOS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

function numero(valor) {
    const n = Number(valor);
    return Number.isFinite(n) ? n : 0;
}

/** "2026-10" -> "Oct" */
export function mesCorto(clave) {
    const mes = Number(String(clave).split("-")[1]);
    return MESES_CORTOS[mes - 1] ?? clave;
}

function convertirSerie(serie) {
    return (serie ?? []).map((fila) => ({
        periodo: fila.periodo,
        mes: mesCorto(fila.periodo),
        mesLargo: nombrePeriodo(fila.periodo),
        recaudacion: numero(fila.recaudacion),
        pagos: numero(fila.pagos),
        reclamos: numero(fila.reclamos),
        resueltos: numero(fila.resueltos),
        reservas: numero(fila.reservas),
    }));
}

/** Textos de la actividad reciente, listos para mostrar. */
function convertirActividad(lista) {
    const quien = (item) => item.persona || "un residente";
    const unidad = (item) => (item.unidad ? ` · Unidad ${item.unidad}` : "");

    return (lista ?? []).map((item, indice) => {
        const base = { id: `${item.tipo}-${item.fecha}-${indice}`, tipo: item.tipo, fecha: item.fecha };

        switch (item.tipo) {
            case "pago":
                return {
                    ...base,
                    titulo: `Pago recibido de ${quien(item)}${unidad(item)}`,
                    detalle: `Expensa ${nombrePeriodo(item.detalle)} · ${formatearMoneda(item.monto)}`,
                    seccion: "Pagos",
                    ruta: "/administrador/pagos",
                };
            case "reclamo":
                return {
                    ...base,
                    titulo: `Nuevo reclamo de ${quien(item)}${unidad(item)}`,
                    detalle: item.detalle ?? "",
                    seccion: "Reclamos",
                    ruta: "/administrador/reclamos",
                };
            case "comunicado":
                return {
                    ...base,
                    titulo: `Comunicado publicado: ${item.detalle ?? ""}`,
                    detalle: `Publicado por ${item.persona || "la administración"}`,
                    seccion: "Comunicados",
                    ruta: "/administrador/comunicados",
                };
            default:
                return {
                    ...base,
                    titulo: `Nueva reserva en ${item.detalle ?? "un espacio común"}`,
                    detalle: `Reservada por ${quien(item)}${unidad(item)}`,
                    seccion: "Reservas",
                    ruta: "/administrador/reservas",
                };
        }
    });
}

export async function obtenerDashboardAdmin() {
    const { data, error } = await supabase.rpc("dashboard_admin");
    if (error) throw error;

    const k = data.kpis ?? {};
    const a = data.atencion ?? {};
    const emitido = numero(k.expensas_importe_emitido);
    const cobrado = numero(k.expensas_importe_cobrado);

    return {
        generado: data.generado,
        periodo: data.periodo,
        periodoNombre: nombrePeriodo(data.periodo),
        edificio: data.edificio ?? null,
        kpis: {
            residentesActivos: numero(k.residentes_activos),
            residentesNuevosMes: numero(k.residentes_nuevos_mes),
            unidadesTotal: numero(k.unidades_total),
            unidadesOcupadas: numero(k.unidades_ocupadas),
            expensasEmitidas: numero(k.expensas_emitidas),
            expensasPagadas: numero(k.expensas_pagadas),
            importeEmitido: emitido,
            importeCobrado: cobrado,
            porcentajeCobrado: emitido > 0 ? Math.round((cobrado / emitido) * 100) : 0,
            reclamosAbiertos: numero(k.reclamos_abiertos),
            reclamosNuevosMes: numero(k.reclamos_nuevos_mes),
            reclamosNuevosMesAnterior: numero(k.reclamos_nuevos_mes_anterior),
        },
        atencion: {
            reclamosSinAtender: numero(a.reclamos_sin_atender),
            reclamosSinAtenderDias: numero(a.reclamos_sin_atender_dias),
            reclamosEnProceso: numero(a.reclamos_en_proceso),
            expensasVencidas: numero(a.expensas_vencidas),
            expensasVencidasMonto: numero(a.expensas_vencidas_monto),
            reservasPendientes: numero(a.reservas_pendientes),
        },
        serie: convertirSerie(data.serie),
        reclamosPorEstado: (data.reclamos_por_estado ?? []).map((f) => ({ nombre: f.estado, cantidad: numero(f.cantidad) })),
        reclamosPorCategoria: (data.reclamos_por_categoria ?? []).map((f) => ({ nombre: f.categoria, cantidad: numero(f.cantidad) })),
        actividad: convertirActividad(data.actividad),
    };
}
