/* =========================================================
   Comprobante de pago en PDF (mismo estilo que la boleta).
   Reutiliza el constructor de PDF de boletaPdf.js.
========================================================= */
import { Pagina, construirPdf, anchoTexto, ANCHO_PAGINA, ALTO_PAGINA } from "./boletaPdf";
import { ahoraFormateado } from "./formatos";

const VERDE = "#279B97";
const VERDE_OSCURO = "#0D5F59";
const TEXTO = "#08363C";
const TEXTO_SUAVE = "#4D545F";
const FONDO_SUAVE = "#EAF5F4";

const ESTILO = {
    Confirmado: { fondo: "#E9F5EF", texto: "#399665" },
    Pendiente: { fondo: "#FFF5E6", texto: "#E87524" },
    Rechazado: { fondo: "#FFF0F0", texto: "#DD2A2A" },
};

export function generarComprobanteBytes(pago) {
    const p = new Pagina();
    const MARGEN = 48;
    const DERECHA = ANCHO_PAGINA - MARGEN;

    p.rect(0, 0, ANCHO_PAGINA, 112, VERDE);
    p.texto("Habita", MARGEN, 58, { tamano: 28, negrita: true, tono: "#FFFFFF" });
    p.texto("Comprobante de pago", MARGEN, 80, { tamano: 12, tono: "#E1F5F1" });
    p.texto("Referencia", DERECHA, 50, { tamano: 9, tono: "#E1F5F1", alinear: "der" });
    p.texto(pago.referencia, DERECHA, 72, { tamano: 14, negrita: true, tono: "#FFFFFF", alinear: "der" });

    const estilo = ESTILO[pago.estado] ?? ESTILO.Pendiente;
    let y = 150;
    p.texto("Estado", MARGEN, y, { tamano: 9, tono: TEXTO_SUAVE });
    p.rect(MARGEN, y + 6, anchoTexto(pago.estado, 10, true) + 20, 20, estilo.fondo);
    p.texto(pago.estado, MARGEN + 10, y + 20, { tamano: 10, negrita: true, tono: estilo.texto });
    p.texto("Importe", DERECHA, y, { tamano: 9, tono: TEXTO_SUAVE, alinear: "der" });
    p.texto(pago.importe, DERECHA, y + 26, { tamano: 22, negrita: true, tono: VERDE_OSCURO, alinear: "der" });

    y = 215;
    p.texto("Datos del pago", MARGEN, y, { tamano: 12, negrita: true });
    p.linea(MARGEN, y + 8, DERECHA, y + 8);

    const filas = [
        ["Edificio", pago.edificio || "--"],
        ["Dirección", pago.direccion || "--"],
        ["Unidad", `${pago.unidad}${pago.piso ? ` (piso ${pago.piso})` : ""}`],
        ["Residente", pago.residente],
        ["Período abonado", pago.periodo],
        ["Fecha de pago", `${pago.fecha} - ${pago.hora}`],
        ["Medio de pago", pago.metodo],
        ["N° de transacción", pago.referencia],
    ];
    let fy = y + 30;
    filas.forEach(([t, v]) => {
        p.texto(t, MARGEN, fy, { tamano: 10, tono: TEXTO_SUAVE });
        p.texto(v, DERECHA, fy, { tamano: 10, negrita: true, alinear: "der" });
        p.linea(MARGEN, fy + 8, DERECHA, fy + 8, "#EEF2F5");
        fy += 24;
    });

    p.rect(MARGEN, fy + 8, DERECHA - MARGEN, 34, FONDO_SUAVE);
    p.texto("Total abonado", MARGEN + 10, fy + 30, { tamano: 12, negrita: true, tono: TEXTO });
    p.texto(pago.importe, DERECHA - 10, fy + 30, { tamano: 14, negrita: true, tono: VERDE_OSCURO, alinear: "der" });

    p.texto("Este comprobante es informativo y certifica el pago registrado en Habita.", MARGEN, fy + 70, { tamano: 9, tono: TEXTO_SUAVE });

    p.linea(MARGEN, ALTO_PAGINA - 64, DERECHA, ALTO_PAGINA - 64);
    p.texto(`Generado el ${ahoraFormateado()} desde Habita`, MARGEN, ALTO_PAGINA - 44, { tamano: 8, tono: TEXTO_SUAVE });

    return construirPdf(p, `Comprobante de pago ${pago.referencia}`);
}

export function descargarComprobante(pago) {
    const bytes = generarComprobanteBytes(pago);
    const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `comprobante-${pago.referencia}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}
