/* =========================================================
   Boleta de expensa en PDF (sin librerias externas)

   Arma un PDF A4 de una pagina a mano: rectangulos, lineas y
   texto con las tipografias estandar Helvetica / Helvetica-Bold
   (vienen incluidas en cualquier lector de PDF).

   Uso:  descargarBoleta(expensa, { residente: "Nombre" })
========================================================= */

import { formatearMoneda, ahoraFormateado } from "./formatos";

/* ---------- Medidas de letra (Helvetica, 1000 = tamano de fuente) ---------- */
// Caracteres ASCII 32 a 126, en orden.
const ANCHO_NORMAL = [278,278,355,556,556,889,667,191,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,278,278,584,584,584,556,1015,667,667,722,722,667,611,778,722,278,500,667,556,833,722,778,667,778,722,667,611,722,667,944,667,667,611,278,278,278,469,556,333,556,556,500,556,556,278,556,556,222,222,500,222,833,556,556,556,556,333,500,278,556,500,722,500,500,500,334,260,334,584];
const ANCHO_NEGRITA = [278,333,474,556,556,889,722,238,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,333,333,584,584,584,611,975,722,722,722,722,667,611,778,722,278,556,722,611,833,722,778,667,778,722,667,611,722,667,944,667,667,611,333,278,333,584,556,333,556,611,556,611,556,333,611,611,278,278,556,278,889,611,611,611,611,389,556,333,611,556,778,556,556,500,389,280,389,584];

const SIN_ACENTO = { á:"a", é:"e", í:"i", ó:"o", ú:"u", ñ:"n", ü:"u", Á:"A", É:"E", Í:"I", Ó:"O", Ú:"U", Ñ:"N", Ü:"U" };

export function anchoTexto(texto, tamano, negrita) {
    const tabla = negrita ? ANCHO_NEGRITA : ANCHO_NORMAL;
    let total = 0;
    for (const letra of String(texto)) {
        const base = SIN_ACENTO[letra] ?? letra;
        const codigo = base.charCodeAt(0);
        total += codigo >= 32 && codigo <= 126 ? tabla[codigo - 32] : 556;
    }
    return (total * tamano) / 1000;
}

/* ---------- Texto -> bytes de PDF (WinAnsi) ---------- */
const ESPECIALES = { "–": 0x96, "—": 0x97, "‘": 0x91, "’": 0x92, "“": 0x93, "”": 0x94, "•": 0x95, "€": 0x80 };

function aCadenaPdf(texto) {
    let salida = "";
    for (const letra of String(texto)) {
        let codigo = ESPECIALES[letra] ?? letra.charCodeAt(0);
        if (codigo > 255) codigo = 0x3f; // "?"
        if (letra === "(" || letra === ")" || letra === "\\") salida += "\\" + letra;
        else if (codigo < 32) salida += " ";
        else salida += String.fromCharCode(codigo);
    }
    return salida;
}

function color(hex) {
    const n = hex.replace("#", "");
    const r = parseInt(n.slice(0, 2), 16) / 255;
    const g = parseInt(n.slice(2, 4), 16) / 255;
    const b = parseInt(n.slice(4, 6), 16) / 255;
    return `${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)}`;
}

/* ---------- Mini constructor de paginas ---------- */
export const ANCHO_PAGINA = 595.28;
export const ALTO_PAGINA = 841.89;

export class Pagina {
    constructor() { this.comandos = []; }

    // y se mide desde ARRIBA de la hoja (mas natural que el PDF, que cuenta desde abajo)
    rect(x, y, ancho, alto, relleno) {
        this.comandos.push(`${color(relleno)} rg ${x.toFixed(2)} ${(ALTO_PAGINA - y - alto).toFixed(2)} ${ancho.toFixed(2)} ${alto.toFixed(2)} re f`);
    }

    linea(x1, y1, x2, y2, tono = "#D9E2E8", grosor = 0.7) {
        this.comandos.push(`${color(tono)} RG ${grosor} w ${x1.toFixed(2)} ${(ALTO_PAGINA - y1).toFixed(2)} m ${x2.toFixed(2)} ${(ALTO_PAGINA - y2).toFixed(2)} l S`);
    }

    // alinear: "izq" (x = borde izquierdo) | "der" (x = borde derecho)
    texto(texto, x, y, { tamano = 10, negrita = false, tono = "#08363C", alinear = "izq" } = {}) {
        const ancho = anchoTexto(texto, tamano, negrita);
        const xFinal = alinear === "der" ? x - ancho : x;
        this.comandos.push(
            `BT ${color(tono)} rg /${negrita ? "F2" : "F1"} ${tamano} Tf ${xFinal.toFixed(2)} ${(ALTO_PAGINA - y).toFixed(2)} Td (${aCadenaPdf(texto)}) Tj ET`
        );
        return ancho;
    }
}

export function construirPdf(pagina, titulo) {
    const contenido = pagina.comandos.join("\n");
    const objetos = [
        "<< /Type /Catalog /Pages 2 0 R >>",
        "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${ANCHO_PAGINA} ${ALTO_PAGINA}] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>`,
        "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
        "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>",
        `<< /Length ${contenido.length} >>\nstream\n${contenido}\nendstream`,
        `<< /Title (${aCadenaPdf(titulo)}) /Producer (Habita) >>`,
    ];

    let pdf = "%PDF-1.4\n";
    const posiciones = [];
    objetos.forEach((cuerpo, i) => {
        posiciones.push(pdf.length);
        pdf += `${i + 1} 0 obj\n${cuerpo}\nendobj\n`;
    });
    const inicioXref = pdf.length;
    pdf += `xref\n0 ${objetos.length + 1}\n0000000000 65535 f \n`;
    posiciones.forEach((pos) => { pdf += `${String(pos).padStart(10, "0")} 00000 n \n`; });
    pdf += `trailer\n<< /Size ${objetos.length + 1} /Root 1 0 R /Info 7 0 R >>\nstartxref\n${inicioXref}\n%%EOF`;

    // Cada caracter es un byte (todo quedo en el rango 0-255)
    const bytes = new Uint8Array(pdf.length);
    for (let i = 0; i < pdf.length; i++) bytes[i] = pdf.charCodeAt(i) & 0xff;
    return bytes;
}

/* ---------- Diseno de la boleta ---------- */
const VERDE = "#279B97";
const VERDE_OSCURO = "#0D5F59";
const TEXTO = "#08363C";
const TEXTO_SUAVE = "#4D545F";
const LINEA = "#D9E2E8";
const FONDO_SUAVE = "#EAF5F4";

const ESTILO_ESTADO = {
    Pagada:    { fondo: "#E9F5EF", texto: "#399665" },
    Pendiente: { fondo: "#FFF5E6", texto: "#E87524" },
    Vencida:   { fondo: "#FDECEC", texto: "#DD2A2A" },
};

/** Arma los bytes del PDF de una expensa (sirve tambien para pruebas). */
export function generarBoletaBytes(expensa, { residente = "" } = {}) {
    const p = new Pagina();
    const MARGEN = 48;
    const DERECHA = ANCHO_PAGINA - MARGEN;

    // Banda superior
    p.rect(0, 0, ANCHO_PAGINA, 112, VERDE);
    p.texto("Habita", MARGEN, 58, { tamano: 28, negrita: true, tono: "#FFFFFF" });
    p.texto("Boleta de expensa", MARGEN, 80, { tamano: 12, tono: "#E1F5F1" });
    p.texto("Período", DERECHA, 50, { tamano: 9, tono: "#E1F5F1", alinear: "der" });
    p.texto(expensa.periodo, DERECHA, 72, { tamano: 18, negrita: true, tono: "#FFFFFF", alinear: "der" });

    // Estado
    const estilo = ESTILO_ESTADO[expensa.estado] ?? ESTILO_ESTADO.Pendiente;
    let y = 150;
    p.texto("Estado", MARGEN, y, { tamano: 9, tono: TEXTO_SUAVE });
    const anchoEstado = anchoTexto(expensa.estado, 10, true) + 20;
    p.rect(MARGEN, y + 6, anchoEstado, 20, estilo.fondo);
    p.texto(expensa.estado, MARGEN + 10, y + 20, { tamano: 10, negrita: true, tono: estilo.texto });

    // Importe destacado (derecha)
    p.texto("Importe total", DERECHA, y, { tamano: 9, tono: TEXTO_SUAVE, alinear: "der" });
    p.texto(expensa.importe, DERECHA, y + 26, { tamano: 22, negrita: true, tono: VERDE_OSCURO, alinear: "der" });

    // Datos
    y = 215;
    p.texto("Datos de la expensa", MARGEN, y, { tamano: 12, negrita: true });
    p.linea(MARGEN, y + 8, DERECHA, y + 8);

    const unidadTexto = expensa.unidad
        ? `${expensa.unidad.numero}${expensa.unidad.piso ? ` (piso ${expensa.unidad.piso})` : ""}`
        : "--";
    const datos = [
        ["Edificio", expensa.edificio?.nombre ?? "--"],
        ["Dirección", expensa.edificio?.direccion ?? "--"],
        ["Unidad", unidadTexto],
        ["Residente", residente || "--"],
        ["Período", expensa.periodo],
        ["Vencimiento", expensa.vencimiento],
    ];
    if (expensa.fecha && expensa.fecha !== "--") datos.push(["Pagada el", expensa.fecha]);
    if (expensa.metodoPago) datos.push(["Medio de pago", expensa.metodoPago]);

    let filaY = y + 30;
    datos.forEach(([titulo, valor]) => {
        p.texto(titulo, MARGEN, filaY, { tamano: 10, tono: TEXTO_SUAVE });
        p.texto(valor, DERECHA, filaY, { tamano: 10, negrita: true, alinear: "der" });
        p.linea(MARGEN, filaY + 8, DERECHA, filaY + 8, "#EEF2F5");
        filaY += 24;
    });

    // Detalle
    y = filaY + 22;
    p.texto("Detalle de la expensa", MARGEN, y, { tamano: 12, negrita: true });
    p.rect(MARGEN, y + 14, DERECHA - MARGEN, 24, FONDO_SUAVE);
    p.texto("Concepto", MARGEN + 10, y + 30, { tamano: 9, negrita: true, tono: VERDE_OSCURO });
    p.texto("Importe", DERECHA - 10, y + 30, { tamano: 9, negrita: true, tono: VERDE_OSCURO, alinear: "der" });

    let detalleY = y + 58;
    if (expensa.conceptos.length === 0) {
        p.texto("Esta expensa no tiene detalle por concepto cargado.", MARGEN + 10, detalleY, { tamano: 10, tono: TEXTO_SUAVE });
        detalleY += 24;
    } else {
        expensa.conceptos.forEach((c) => {
            p.texto(c.concepto, MARGEN + 10, detalleY, { tamano: 10 });
            p.texto(c.montoTexto, DERECHA - 10, detalleY, { tamano: 10, alinear: "der" });
            p.linea(MARGEN, detalleY + 8, DERECHA, detalleY + 8, "#EEF2F5");
            detalleY += 24;
        });
    }

    // Total
    p.rect(MARGEN, detalleY - 6, DERECHA - MARGEN, 30, FONDO_SUAVE);
    p.texto("Total", MARGEN + 10, detalleY + 14, { tamano: 12, negrita: true });
    p.texto(expensa.importe, DERECHA - 10, detalleY + 14, { tamano: 12, negrita: true, tono: VERDE_OSCURO, alinear: "der" });

    // Nota segun estado
    const nota = expensa.estado === "Pagada"
        ? "Pago registrado. Esta boleta es un comprobante informativo del período."
        : "Podés pagar esta expensa desde la sección Mis expensas con Mercado Pago, hasta la fecha de vencimiento.";
    p.texto(nota, MARGEN, detalleY + 56, { tamano: 9, tono: TEXTO_SUAVE });

    // Pie
    p.linea(MARGEN, ALTO_PAGINA - 64, DERECHA, ALTO_PAGINA - 64);
    p.texto(`Referencia: HAB-${expensa.periodoClave}-${expensa.id}`, MARGEN, ALTO_PAGINA - 44, { tamano: 8, tono: TEXTO_SUAVE });
    p.texto(`Generado el ${ahoraFormateado()} desde Habita`, DERECHA, ALTO_PAGINA - 44, { tamano: 8, tono: TEXTO_SUAVE, alinear: "der" });

    return construirPdf(p, `Boleta de expensa ${expensa.periodo}`);
}

/** Nombre de archivo: boleta-expensa-2026-10.pdf */
export function nombreArchivoBoleta(expensa) {
    return `boleta-expensa-${expensa.periodoClave}.pdf`;
}

/** Genera la boleta y la descarga en el navegador. */
export function descargarBoleta(expensa, opciones) {
    const bytes = generarBoletaBytes(expensa, opciones);
    const blob = new Blob([bytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = nombreArchivoBoleta(expensa);
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}
