/* =========================================================
   PDF de un documento del consorcio (sin librerias externas)

   Reutiliza el armador de PDF de la boleta de expensas.
   Uso:  descargarDocumento(documento, { residente, edificio })
========================================================= */

import { Pagina, anchoTexto, construirPdf, ANCHO_PAGINA, ALTO_PAGINA } from "./boletaPdf";
import { ahoraFormateado } from "./formatos";

const VERDE = "#279B97";
const TEXTO = "#08363C";
const TEXTO_SUAVE = "#4D545F";
const FONDO_SUAVE = "#EAF5F4";

/** Parte un texto en renglones que entren en el ancho indicado. */
function partirEnRenglones(texto, ancho, tamano) {
    const renglones = [];
    let actual = "";
    for (const palabra of String(texto).split(/\s+/)) {
        const prueba = actual ? `${actual} ${palabra}` : palabra;
        if (actual && anchoTexto(prueba, tamano, false) > ancho) {
            renglones.push(actual);
            actual = palabra;
        } else {
            actual = prueba;
        }
    }
    if (actual) renglones.push(actual);
    return renglones;
}

/** Arma los bytes del PDF (sirve tambien para pruebas). */
export function generarDocumentoBytes(documento, { residente = "", edificio = "" } = {}) {
    const p = new Pagina();
    const MARGEN = 48;
    const DERECHA = ANCHO_PAGINA - MARGEN;

    // Banda superior
    p.rect(0, 0, ANCHO_PAGINA, 112, VERDE);
    p.texto("Habita", MARGEN, 58, { tamano: 28, negrita: true, tono: "#FFFFFF" });
    p.texto("Documento del consorcio", MARGEN, 80, { tamano: 12, tono: "#E1F5F1" });
    p.texto("Categoría", DERECHA, 50, { tamano: 9, tono: "#E1F5F1", alinear: "der" });
    p.texto(documento.categoria, DERECHA, 72, { tamano: 14, negrita: true, tono: "#FFFFFF", alinear: "der" });

    // Titulo (puede ocupar varios renglones)
    let y = 160;
    partirEnRenglones(documento.nombre, DERECHA - MARGEN, 20).forEach((renglon) => {
        p.texto(renglon, MARGEN, y, { tamano: 20, negrita: true, tono: TEXTO });
        y += 26;
    });

    // Datos
    y += 14;
    const datos = [
        ["Fecha del documento", documento.fecha],
        ["Categoría", documento.categoria],
        ["Edificio", edificio || "--"],
        ["Solicitado por", residente || "--"],
    ];
    datos.forEach(([titulo, valor]) => {
        p.texto(titulo, MARGEN, y, { tamano: 10, tono: TEXTO_SUAVE });
        p.texto(valor, DERECHA, y, { tamano: 10, negrita: true, alinear: "der" });
        p.linea(MARGEN, y + 8, DERECHA, y + 8, "#EEF2F5");
        y += 24;
    });

    // Resumen
    y += 22;
    p.texto("Resumen", MARGEN, y, { tamano: 12, negrita: true });
    p.rect(MARGEN, y + 14, DERECHA - MARGEN, 4, FONDO_SUAVE);
    y += 42;
    partirEnRenglones(documento.descripcion ?? "", DERECHA - MARGEN, 11).forEach((renglon) => {
        p.texto(renglon, MARGEN, y, { tamano: 11, tono: TEXTO_SUAVE });
        y += 18;
    });

    // Pie
    p.linea(MARGEN, ALTO_PAGINA - 64, DERECHA, ALTO_PAGINA - 64);
    p.texto(`Generado el ${ahoraFormateado()} desde Habita`, MARGEN, ALTO_PAGINA - 44, { tamano: 8, tono: TEXTO_SUAVE });

    return construirPdf(p, documento.nombre);
}

/** Nombre de archivo: "Plan de Obras 2026" -> plan-de-obras-2026.pdf */
export function nombreArchivoDocumento(documento) {
    const base = String(documento.nombre)
        .normalize("NFD").replace(/[̀-ͯ]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    return `${base || "documento"}.pdf`;
}

/** Genera el PDF y lo descarga en el navegador. */
export function descargarDocumento(documento, opciones) {
    const bytes = generarDocumentoBytes(documento, opciones);
    const blob = new Blob([bytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = nombreArchivoDocumento(documento);
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}
