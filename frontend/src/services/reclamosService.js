/* =========================================================
   Servicio de Reclamos (residente)

   Tabla:    reclamo  (unidad_id, usuario_id, titulo, categoria,
                       descripcion, estado, fecha_creacion,
                       adjunto_nombre / adjunto_tamano / adjunto_ruta)
   Archivos: Supabase Storage, bucket privado "reclamos"
             (carpeta propia: reclamos/<id del usuario>/...)

   La seguridad (RLS) hace que el residente solo vea y cree
   SUS reclamos.
========================================================= */

import { supabase } from "../supabase";
import { obtenerPeriodoFecha } from "../utils/periodos";

const BUCKET = "reclamos";

export const CATEGORIAS_RECLAMO = [
    "Mantenimiento",
    "Limpieza",
    "Ascensores",
    "Iluminación",
    "Seguridad",
    "Espacios comunes",
    "Otros",
];

/** Estados que ve el residente (en la base: ABIERTO / EN_PROCESO / RESUELTO / CERRADO). */
export const ESTADOS_RECLAMO = ["Pendiente", "En proceso", "Resuelto"];

export const TAMANO_MAXIMO_ADJUNTO = 5 * 1024 * 1024; // 5 MB
const TIPOS_ADJUNTO = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

/** Devuelve un mensaje de error si el archivo no sirve, o "" si está bien. */
export function validarAdjunto(archivo) {
    if (!archivo) return "";
    if (!TIPOS_ADJUNTO.includes(archivo.type)) {
        return "El archivo tiene que ser PDF, imagen (JPG o PNG) o documento de Word.";
    }
    if (archivo.size > TAMANO_MAXIMO_ADJUNTO) {
        return "El archivo supera el máximo de 5 MB.";
    }
    return "";
}

/* ---------------------------------------------------------
   Conversión de datos
--------------------------------------------------------- */

function estadoVisible(estadoBase) {
    switch (String(estadoBase ?? "").toUpperCase()) {
        case "EN_PROCESO": return "En proceso";
        case "RESUELTO":
        case "CERRADO": return "Resuelto";
        default: return "Pendiente";
    }
}

function formatearTamano(bytes) {
    if (!bytes && bytes !== 0) return "";
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
}

function partesDeFecha(timestamp) {
    const fecha = new Date(timestamp);
    const formato = new Intl.DateTimeFormat("es-AR", {
        day: "2-digit", month: "2-digit", year: "numeric", timeZone: "America/Argentina/Buenos_Aires",
    }).formatToParts(fecha);
    const dato = (tipo) => formato.find((p) => p.type === tipo)?.value ?? "";
    return { dia: dato("day"), mes: dato("month"), anio: dato("year") };
}

function convertirReclamo(fila) {
    const { dia, mes, anio } = partesDeFecha(fila.fecha_creacion);

    return {
        id: fila.id,
        titulo: fila.titulo || fila.categoria,
        categoria: fila.categoria,
        descripcion: fila.descripcion,
        estado: estadoVisible(fila.estado),
        fecha: `${dia}/${mes}/${anio.slice(-2)}`,
        periodoFecha: obtenerPeriodoFecha(`${dia}/${mes}/${anio}`),
        adjunto: fila.adjunto_nombre
            ? { nombre: fila.adjunto_nombre, tamano: formatearTamano(fila.adjunto_tamano) }
            : null,
    };
}

const CAMPOS = "id, titulo, categoria, descripcion, estado, fecha_creacion, adjunto_nombre, adjunto_tamano";

async function exigirSesion() {
    const { data } = await supabase.auth.getSession();
    const usuario = data?.session?.user;
    if (!usuario) throw new Error("Tu sesión venció. Volvé a iniciar sesión.");
    return usuario;
}

/* ---------------------------------------------------------
   LECTURA
--------------------------------------------------------- */

/** Reclamos del residente, del más nuevo al más viejo. */
export async function listarReclamosResidente() {
    const usuario = await exigirSesion();
    const { data, error } = await supabase
        .from("reclamo")
        .select(CAMPOS)
        .eq("usuario_id", usuario.id)
        .order("fecha_creacion", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(convertirReclamo);
}

/* ---------------------------------------------------------
   ESCRITURA
--------------------------------------------------------- */

function nombreSeguro(nombre) {
    return nombre
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-zA-Z0-9._-]+/g, "_")
        .slice(-80);
}

/**
 * Crea un reclamo (con archivo opcional).
 * Primero sube el archivo y después guarda el reclamo; si el guardado
 * falla, borra el archivo para no dejar basura.
 */
export async function crearReclamo({ unidadId, titulo, categoria, descripcion, archivo }) {
    const usuario = await exigirSesion();
    if (!unidadId) throw new Error("No encontramos tu unidad. Contactá a la administración.");

    const errorArchivo = validarAdjunto(archivo);
    if (errorArchivo) throw new Error(errorArchivo);

    let ruta = null;
    if (archivo) {
        ruta = `${usuario.id}/${Date.now()}-${nombreSeguro(archivo.name)}`;
        const { error: errorSubida } = await supabase.storage
            .from(BUCKET)
            .upload(ruta, archivo, { contentType: archivo.type });
        if (errorSubida) throw new Error("No pudimos subir el archivo. Probá de nuevo.");
    }

    const { data, error } = await supabase
        .from("reclamo")
        .insert({
            unidad_id: unidadId,
            usuario_id: usuario.id,
            titulo: titulo.trim(),
            categoria,
            descripcion: descripcion.trim(),
            adjunto_nombre: archivo?.name ?? null,
            adjunto_tamano: archivo?.size ?? null,
            adjunto_ruta: ruta,
        })
        .select(CAMPOS)
        .single();

    if (error) {
        if (ruta) await supabase.storage.from(BUCKET).remove([ruta]);
        console.error("No se pudo crear el reclamo", error);
        throw new Error("No pudimos enviar tu reclamo. Probá de nuevo en unos minutos.");
    }

    return convertirReclamo(data);
}
