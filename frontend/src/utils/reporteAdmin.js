/* =========================================================
   Reporte del consorcio (administrador)

   Dos formatos, los dos con los mismos datos del Dashboard:
     - PDF   : resumen de una pagina A4 para imprimir o enviar.
     - Excel : archivo CSV (se abre directo en Excel) con todas las tablas.

   Uso:  descargarReportePdf(datos)   |   descargarReporteCsv(datos)
   "datos" es lo que devuelve obtenerDashboardAdmin().
========================================================= */

import { Pagina, anchoTexto, construirPdf, ANCHO_PAGINA, ALTO_PAGINA } from "./boletaPdf";
import { formatearMoneda, ahoraFormateado } from "./formatos";

const VERDE = "#279B97";
const VERDE_OSCURO = "#0D5F59";
const TEXTO = "#08363C";
const TEXTO_SUAVE = "#4D545F";
const LINEA = "#D9E2E8";
const FONDO_SUAVE = "#EAF5F4";

/** Achica un texto hasta que entre en "maximo" puntos de ancho. */
function ajustar(texto, tamano, maximo, negrita = false) {
    let salida = String(texto ?? "");
    if (anchoTexto(salida, tamano, negrita) <= maximo) return salida;
    while (salida.length > 1 && anchoTexto(`${salida}...`, tamano, negrita) > maximo) salida = salida.slice(0, -1);
    return `${salida}...`;
}

/* ---------------------------------------------------------
   PDF
--------------------------------------------------------- */

export function generarReportePdfBytes(d) {
    const p = new Pagina();
    const MARGEN = 48;
    const DERECHA = ANCHO_PAGINA - MARGEN;
    const ANCHO_UTIL = DERECHA - MARGEN;
    const k = d.kpis;
    const a = d.atencion;

    // Banda superior
    p.rect(0, 0, ANCHO_PAGINA, 96, VERDE);
    p.texto("Habita", MARGEN, 52, { tamano: 26, negrita: true, tono: "#FFFFFF" });
    p.texto("Reporte del consorcio", MARGEN, 74, { tamano: 12, tono: "#E1F5F1" });
    p.texto(ajustar(d.edificio?.nombre ?? "", 16, 280, true), DERECHA, 48, { tamano: 16, negrita: true, tono: "#FFFFFF", alinear: "der" });
    p.texto(ajustar(d.edificio?.direccion ?? "", 9, 280), DERECHA, 64, { tamano: 9, tono: "#E1F5F1", alinear: "der" });
    p.texto(`Período: ${d.periodoNombre}`, DERECHA, 80, { tamano: 9, tono: "#E1F5F1", alinear: "der" });

    // Resumen (4 recuadros)
    let y = 126;
    p.texto("Resumen", MARGEN, y, { tamano: 12, negrita: true });
    const hueco = 10;
    const anchoCaja = (ANCHO_UTIL - hueco * 3) / 4;
    const cajas = [
        ["Residentes activos", String(k.residentesActivos), k.residentesNuevosMes > 0 ? `+${k.residentesNuevosMes} este mes` : "Sin altas este mes"],
        ["Unidades ocupadas", `${k.unidadesOcupadas} de ${k.unidadesTotal}`, "Unidades registradas"],
        [`Expensas ${d.periodoNombre}`, formatearMoneda(k.importeCobrado), `${k.porcentajeCobrado}% de ${formatearMoneda(k.importeEmitido)}`],
        ["Reclamos abiertos", String(k.reclamosAbiertos), `${k.reclamosNuevosMes} nuevos este mes`],
    ];
    cajas.forEach(([titulo, valor, sub], i) => {
        const x = MARGEN + i * (anchoCaja + hueco);
        p.rect(x, y + 12, anchoCaja, 62, FONDO_SUAVE);
        p.texto(ajustar(titulo, 8, anchoCaja - 16), x + 8, y + 28, { tamano: 8, tono: TEXTO_SUAVE });
        p.texto(ajustar(valor, 14, anchoCaja - 16, true), x + 8, y + 49, { tamano: 14, negrita: true, tono: VERDE_OSCURO });
        p.texto(ajustar(sub, 8, anchoCaja - 16), x + 8, y + 65, { tamano: 8, tono: TEXTO_SUAVE });
    });

    // Atencion
    y = 232;
    p.texto("Pendientes de atención", MARGEN, y, { tamano: 12, negrita: true });
    p.linea(MARGEN, y + 8, DERECHA, y + 8);
    const filasAtencion = [
        ["Reclamos sin atender", String(a.reclamosSinAtender), a.reclamosSinAtender > 0 ? `El más antiguo hace ${a.reclamosSinAtenderDias} días` : "Al día"],
        ["Reclamos en proceso", String(a.reclamosEnProceso), ""],
        ["Expensas vencidas sin pagar", String(a.expensasVencidas), a.expensasVencidas > 0 ? `${formatearMoneda(a.expensasVencidasMonto)} sin cobrar` : "Al día"],
        ["Reservas por aprobar", String(a.reservasPendientes), ""],
    ];
    filasAtencion.forEach(([titulo, valor, nota], i) => {
        const fy = y + 28 + i * 20;
        p.texto(titulo, MARGEN, fy, { tamano: 10, tono: TEXTO_SUAVE });
        p.texto(valor, MARGEN + 190, fy, { tamano: 10, negrita: true });
        if (nota) p.texto(nota, MARGEN + 225, fy, { tamano: 9, tono: TEXTO_SUAVE });
    });

    // Tabla de los ultimos 12 meses
    y = 346;
    p.texto("Evolución de los últimos 12 meses", MARGEN, y, { tamano: 12, negrita: true });
    const columnas = [
        { titulo: "Mes", x: MARGEN + 10, alinear: "izq" },
        { titulo: "Cobranza", x: MARGEN + 190, alinear: "der" },
        { titulo: "Pagos", x: MARGEN + 255, alinear: "der" },
        { titulo: "Reclamos", x: MARGEN + 325, alinear: "der" },
        { titulo: "Resueltos", x: MARGEN + 395, alinear: "der" },
        { titulo: "Reservas", x: DERECHA - 10, alinear: "der" },
    ];
    p.rect(MARGEN, y + 12, ANCHO_UTIL, 22, FONDO_SUAVE);
    columnas.forEach((c) => p.texto(c.titulo, c.x, y + 27, { tamano: 9, negrita: true, tono: VERDE_OSCURO, alinear: c.alinear }));
    let fy = y + 50;
    d.serie.forEach((mes) => {
        const valores = [mes.mesLargo, formatearMoneda(mes.recaudacion), String(mes.pagos), String(mes.reclamos), String(mes.resueltos), String(mes.reservas)];
        columnas.forEach((c, i) => p.texto(valores[i], c.x, fy, { tamano: 9, alinear: c.alinear }));
        p.linea(MARGEN, fy + 6, DERECHA, fy + 6, "#EEF2F5");
        fy += 18;
    });

    // Reclamos por estado y por categoria (dos columnas)
    y = fy + 22;
    const mitad = MARGEN + ANCHO_UTIL / 2 + 10;
    p.texto("Reclamos por estado", MARGEN, y, { tamano: 12, negrita: true });
    p.texto("Reclamos por categoría", mitad, y, { tamano: 12, negrita: true });
    p.linea(MARGEN, y + 8, MARGEN + ANCHO_UTIL / 2 - 10, y + 8);
    p.linea(mitad, y + 8, DERECHA, y + 8);
    const estados = d.reclamosPorEstado.length ? d.reclamosPorEstado : [{ nombre: "Sin reclamos", cantidad: 0 }];
    estados.forEach((e, i) => {
        p.texto(e.nombre, MARGEN, y + 28 + i * 17, { tamano: 10, tono: TEXTO_SUAVE });
        p.texto(String(e.cantidad), MARGEN + ANCHO_UTIL / 2 - 10, y + 28 + i * 17, { tamano: 10, negrita: true, alinear: "der" });
    });
    const categorias = d.reclamosPorCategoria.length ? d.reclamosPorCategoria : [{ nombre: "Sin reclamos", cantidad: 0 }];
    categorias.slice(0, 7).forEach((c, i) => {
        p.texto(ajustar(c.nombre, 10, 180), mitad, y + 28 + i * 17, { tamano: 10, tono: TEXTO_SUAVE });
        p.texto(String(c.cantidad), DERECHA, y + 28 + i * 17, { tamano: 10, negrita: true, alinear: "der" });
    });

    // Pie
    p.linea(MARGEN, ALTO_PAGINA - 52, DERECHA, ALTO_PAGINA - 52, LINEA);
    p.texto("Cobranza = pagos confirmados en el mes. Reclamos y reservas por mes de creación y de uso.", MARGEN, ALTO_PAGINA - 36, { tamano: 8, tono: TEXTO_SUAVE });
    p.texto(`Generado el ${ahoraFormateado()} desde Habita`, DERECHA, ALTO_PAGINA - 22, { tamano: 8, tono: TEXTO_SUAVE, alinear: "der" });

    return construirPdf(p, `Reporte del consorcio ${d.periodoNombre}`);
}

/* ---------------------------------------------------------
   Excel (CSV)
--------------------------------------------------------- */

function celda(valor) {
    const texto = String(valor ?? "");
    return /[;"\n\r]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
}

/** Arma el texto del CSV (separador ";" y coma decimal: Excel en español lo abre en columnas). */
export function generarReporteCsvTexto(d) {
    const k = d.kpis;
    const a = d.atencion;
    const filas = [];
    const agregar = (...celdas) => filas.push(celdas.map(celda).join(";"));
    const vacia = () => filas.push("");
    const pesos = (n) => String(Number(n)).replace(".", ",");

    agregar("Reporte del consorcio");
    agregar("Edificio", d.edificio?.nombre ?? "");
    agregar("Dirección", d.edificio?.direccion ?? "");
    agregar("Período", d.periodoNombre);
    agregar("Generado", ahoraFormateado());
    vacia();

    agregar("Resumen");
    agregar("Residentes activos", k.residentesActivos);
    agregar("Unidades ocupadas", k.unidadesOcupadas);
    agregar("Unidades registradas", k.unidadesTotal);
    agregar(`Expensas emitidas ${d.periodoNombre} (cantidad)`, k.expensasEmitidas);
    agregar(`Expensas pagadas ${d.periodoNombre} (cantidad)`, k.expensasPagadas);
    agregar(`Importe emitido ${d.periodoNombre} ($)`, pesos(k.importeEmitido));
    agregar(`Importe cobrado ${d.periodoNombre} ($)`, pesos(k.importeCobrado));
    agregar("Reclamos abiertos", k.reclamosAbiertos);
    agregar("Reclamos nuevos este mes", k.reclamosNuevosMes);
    vacia();

    agregar("Pendientes de atención");
    agregar("Reclamos sin atender", a.reclamosSinAtender);
    agregar("Reclamos en proceso", a.reclamosEnProceso);
    agregar("Expensas vencidas sin pagar", a.expensasVencidas);
    agregar("Importe vencido sin cobrar ($)", pesos(a.expensasVencidasMonto));
    agregar("Reservas por aprobar", a.reservasPendientes);
    vacia();

    agregar("Evolución mensual");
    agregar("Mes", "Cobranza ($)", "Pagos", "Reclamos recibidos", "Reclamos resueltos", "Reservas confirmadas");
    d.serie.forEach((m) => agregar(m.mesLargo, pesos(m.recaudacion), m.pagos, m.reclamos, m.resueltos, m.reservas));
    vacia();

    agregar("Reclamos por estado (últimos 12 meses)");
    agregar("Estado", "Cantidad");
    d.reclamosPorEstado.forEach((e) => agregar(e.nombre, e.cantidad));
    vacia();

    agregar("Reclamos por categoría (últimos 12 meses)");
    agregar("Categoría", "Cantidad");
    d.reclamosPorCategoria.forEach((c) => agregar(c.nombre, c.cantidad));

    return filas.join("\r\n");
}

/* ---------------------------------------------------------
   Descargas
--------------------------------------------------------- */

function descargar(contenido, tipo, nombre) {
    const blob = new Blob([contenido], { type: tipo });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = nombre;
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function nombreArchivoReporte(d, extension) {
    return `reporte-consorcio-${d.periodo}.${extension}`;
}

export function descargarReportePdf(d) {
    descargar(generarReportePdfBytes(d), "application/pdf", nombreArchivoReporte(d, "pdf"));
}

export function descargarReporteCsv(d) {
    // El "﻿" del principio hace que Excel respete las tildes y la ñ
    descargar(`﻿${generarReporteCsvTexto(d)}`, "text/csv;charset=utf-8", nombreArchivoReporte(d, "csv"));
}
