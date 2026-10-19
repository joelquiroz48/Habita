/* Servicio de Reclamos (administrador). Usa admin_reclamos() y admin_actualizar_reclamo() de sql/17. */
import { supabase } from "../supabase";
import { obtenerPeriodoFecha } from "../utils/periodos";

const ZONA = "America/Argentina/Buenos_Aires";
const sinTildes = (t) => `${t} ${t.normalize("NFD").replace(/[̀-ͯ]/g, "")}`;

/** Estado visible <-> estado en la base */
export const ESTADOS = [
    { visible: "Pendiente", base: "ABIERTO", ayuda: "Todavía no se empezó a atender." },
    { visible: "En proceso", base: "EN_PROCESO", ayuda: "Se está trabajando en el reclamo." },
    { visible: "Resuelto", base: "RESUELTO", ayuda: "El problema quedó solucionado." },
];

export function estadoVisible(base) {
    switch (String(base ?? "").toUpperCase()) {
        case "EN_PROCESO": return "En proceso";
        case "RESUELTO":
        case "CERRADO": return "Resuelto";
        default: return "Pendiente";
    }
}
const estadoBase = (visible) => ESTADOS.find((e) => e.visible === visible)?.base ?? "ABIERTO";

function partes(ts, opciones) {
    return new Intl.DateTimeFormat("es-AR", { ...opciones, timeZone: ZONA }).format(new Date(ts));
}
const fechaCorta = (ts) => partes(ts, { day: "2-digit", month: "2-digit", year: "numeric" });
const fechaHora = (ts) => `${fechaCorta(ts)} - ${partes(ts, { hour: "2-digit", minute: "2-digit", hour12: false })} hs`;

function tamano(bytes) {
    if (!bytes && bytes !== 0) return "";
    return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1048576).toFixed(1).replace(".", ",")} MB`;
}

function mensajeError(error) {
    if (error?.code === "PGRST202") return "Falta instalar sql/17_reclamos_admin.sql en Supabase.";
    if (["28000", "42501", "22023"].includes(error?.code)) return error.message;
    return "No pudimos completar la operación. Probá de nuevo.";
}

function convertir(r) {
    const seguimiento = [
        // El primer hito siempre es la creación del reclamo
        { id: "alta", titulo: "Reclamo creado", detalle: `Lo envió ${r.residente}.`, fecha: fechaHora(r.fecha_creacion), tipo: "alta" },
        ...(r.seguimiento ?? []).map((s) => {
            const nuevo = estadoVisible(s.estado_nuevo);
            const cambio = estadoVisible(s.estado_anterior) !== nuevo;
            return {
                id: s.id,
                titulo: cambio ? `Estado: ${nuevo}` : "Nota de la administración",
                detalle: s.comentario ?? "",
                autor: s.autor,
                fecha: fechaHora(s.fecha),
                tipo: cambio ? nuevo : "nota",
            };
        }),
    ];
    const f = fechaCorta(r.fecha_creacion);
    return {
        id: r.id,
        asunto: r.titulo || r.categoria,
        categoria: r.categoria,
        descripcion: r.descripcion || "Sin descripción.",
        estado: estadoVisible(r.estado),
        estadoBase: r.estado,
        residente: r.residente,
        telefono: r.telefono ?? "",
        unidad: r.unidad_numero,
        piso: r.unidad_piso,
        edificioId: r.edificio_id,
        edificio: r.edificio_nombre,
        fecha: f,
        fechaHora: fechaHora(r.fecha_creacion),
        periodoFecha: obtenerPeriodoFecha(f),
        mesClave: partes(r.fecha_creacion, { year: "numeric", month: "2-digit" }).split("/").reverse().join("-"),
        adjunto: r.adjunto_nombre ? { nombre: r.adjunto_nombre, tamano: tamano(r.adjunto_tamano), ruta: r.adjunto_ruta } : null,
        seguimiento,
        busqueda: sinTildes(`${r.titulo ?? ""} ${r.categoria ?? ""} ${r.residente} ${r.unidad_numero}`),
    };
}

export async function obtenerReclamosAdmin() {
    const { data, error } = await supabase.rpc("admin_reclamos");
    if (error) throw new Error(mensajeError(error));
    return { edificios: data?.edificios ?? [], reclamos: (data?.reclamos ?? []).map(convertir), periodoActual: data?.periodo_actual };
}

/** Cambia el estado y/o agrega una nota al seguimiento. */
export async function actualizarReclamo({ id, estado, comentario }) {
    const { error } = await supabase.rpc("admin_actualizar_reclamo", {
        p_id: id, p_estado: estadoBase(estado), p_comentario: comentario?.trim() || null,
    });
    if (error) throw new Error(mensajeError(error));
}

/** URL temporal (60 s) para abrir el adjunto del reclamo. */
export async function urlAdjunto(ruta) {
    const { data, error } = await supabase.storage.from("reclamos").createSignedUrl(ruta, 60);
    if (error || !data?.signedUrl) throw new Error("No pudimos abrir el archivo adjunto.");
    return data.signedUrl;
}
