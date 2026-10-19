/* =========================================================
   Servicio de Residentes (administrador)

   Todo pasa por funciones de la base (sql/13): ellas verifican que
   quien llama administre el edificio. Aca solo convertimos los datos
   para que la pantalla los muestre.
========================================================= */

import { supabase } from "../supabase";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");

export const ROLES = [
    { valor: "PROPIETARIO", texto: "Propietario" },
    { valor: "INQUILINO", texto: "Inquilino" },
];

export function textoRol(rol) {
    return ROLES.find((r) => r.valor === rol)?.texto ?? "—";
}

const numero = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
};

/** Mensaje legible a partir de un error de Supabase */
function mensajeError(error, porDefecto) {
    if (!error) return porDefecto;
    if (error.code === "42501" && /administr/i.test(error.message ?? "")) {
        return error.message;
    }
    if (error.code === "PGRST202") {
        return "Falta instalar sql/13_residentes_admin.sql en Supabase.";
    }
    // Los mensajes que escribimos en SQL ya vienen en espanol
    if (["22023", "23505", "28000", "42501"].includes(error.code)) return error.message;
    return porDefecto;
}

// Busca "gomez" aunque el nombre sea "Gómez"
const sinTildes = (t) => `${t} ${t.normalize("NFD").replace(/[\u0300-\u036f]/g, "")}`;

function convertirResidente(r) {
    const esInvitacion = r.origen === "invitacion";
    const nombre = r.nombre?.trim() || "";
    return {
        id: r.id,
        origen: r.origen,
        refId: r.ref_id,
        estado: r.estado, // Activo | Pendiente | Inactivo
        nombre: nombre || "--",
        tieneNombre: Boolean(nombre),
        email: r.email ?? "",
        telefono: r.telefono?.trim() || "--",
        dni: r.dni ?? "",
        rol: r.rol,
        unidadId: r.unidad_id,
        unidad: r.unidad_numero ?? "",
        piso: r.unidad_piso ?? "",
        edificioId: r.edificio_id,
        edificio: r.edificio_nombre ?? "",
        desde: r.desde,
        fechaBaja: r.fecha_baja,
        ultimoIngreso: r.ultimo_ingreso,
        nota: r.nota ?? "",
        reclamosAbiertos: numero(r.reclamos_abiertos),
        reclamosTotal: numero(r.reclamos_total),
        expensasPendientes: numero(r.expensas_pendientes),
        expensasVencidas: numero(r.expensas_vencidas),
        expensasMonto: numero(r.expensas_monto),
        reservasProximas: numero(r.reservas_proximas),
        codigo: r.codigo,
        venceEn: r.vence_en,
        enviadaEn: r.enviada_en,
        reenvios: numero(r.reenvios),
        creadaEn: r.creada_en,
        esInvitacion,
        // Texto que usa el buscador (nombre + email + unidad)
        busqueda: sinTildes(`${nombre} ${r.email ?? ""} ${r.unidad_numero ?? ""}`.trim()),
    };
}

const ORDEN_ESTADO = { Activo: 0, Pendiente: 1, Inactivo: 2 };

/** Activos primero, despues pendientes e inactivos; alfabetico dentro de cada grupo */
export function ordenarResidentes(lista) {
    return [...lista].sort((a, b) => {
        const porEstado = ORDEN_ESTADO[a.estado] - ORDEN_ESTADO[b.estado];
        if (porEstado !== 0) return porEstado;
        const na = a.tieneNombre ? a.nombre : a.email;
        const nb = b.tieneNombre ? b.nombre : b.email;
        return na.localeCompare(nb, "es", { sensitivity: "base" });
    });
}

export async function obtenerResidentesAdmin() {
    const { data, error } = await supabase.rpc("admin_residentes");
    if (error) {
        const sinEdificio = error.code === "42501" && /ningún edificio/i.test(error.message ?? "");
        const e = new Error(mensajeError(error, "No pudimos cargar los residentes."));
        e.sinEdificio = sinEdificio;
        throw e;
    }
    return {
        edificios: (data?.edificios ?? []).map((e) => ({ id: e.id, nombre: e.nombre, direccion: e.direccion })),
        unidades: (data?.unidades ?? []).map((u) => ({
            id: u.id,
            edificioId: u.edificio_id,
            numero: String(u.numero),
            piso: u.piso == null ? "" : String(u.piso),
            residentes: numero(u.residentes),
            invitaciones: numero(u.invitaciones),
        })),
        residentes: ordenarResidentes((data?.residentes ?? []).map(convertirResidente)),
    };
}

/**
 * Pide al backend que mande el mail con el codigo.
 * Devuelve { enviado: true } o { enviado: false, motivo } si no se pudo
 * (por ejemplo, si el servidor de correo todavia no esta configurado).
 */
export async function enviarCodigoPorMail(invitacionId) {
    try {
        const { data: sesion } = await supabase.auth.getSession();
        const token = sesion?.session?.access_token;
        const res = await fetch(`${API_URL}/api/invitaciones/enviar`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token ?? ""}`,
            },
            body: JSON.stringify({ invitacion_id: invitacionId }),
        });
        const cuerpo = await res.json().catch(() => ({}));
        if (!res.ok) {
            return { enviado: false, motivo: cuerpo.detail || "El servidor no pudo enviar el mail." };
        }
        return { enviado: Boolean(cuerpo.enviado), motivo: cuerpo.motivo ?? "" };
    } catch {
        return { enviado: false, motivo: "No pudimos conectar con el servidor (¿está encendido el backend?)." };
    }
}

/** Crea la invitacion y trata de mandar el mail. */
export async function invitarResidente({ unidadId, email, rol }) {
    const { data, error } = await supabase.rpc("admin_invitar_residente", {
        p_unidad: unidadId,
        p_email: email,
        p_rol: rol,
    });
    if (error) throw new Error(mensajeError(error, "No pudimos crear la invitación."));
    const envio = await enviarCodigoPorMail(data.id);
    return { id: data.id, codigo: data.codigo, email: data.email, venceEn: data.vence_en, ...envio };
}

/** Genera un codigo nuevo (el anterior deja de servir) y reenvia el mail. */
export async function reenviarCodigo(invitacionId) {
    const { data, error } = await supabase.rpc("admin_reenviar_invitacion", { p_id: invitacionId });
    if (error) throw new Error(mensajeError(error, "No pudimos reenviar el código."));
    const envio = await enviarCodigoPorMail(invitacionId);
    return { id: data.id, codigo: data.codigo, email: data.email, venceEn: data.vence_en, ...envio };
}

export async function cancelarInvitacion(invitacionId) {
    const { error } = await supabase.rpc("admin_cancelar_invitacion", { p_id: invitacionId });
    if (error) throw new Error(mensajeError(error, "No pudimos cancelar la invitación."));
}

export async function actualizarResidente({ vinculacionId, rol, nota }) {
    const { error } = await supabase.rpc("admin_actualizar_residente", {
        p_vinculacion: vinculacionId,
        p_rol: rol,
        p_nota: nota ?? "",
    });
    if (error) throw new Error(mensajeError(error, "No pudimos guardar los cambios."));
}

export async function darDeBaja(vinculacionId) {
    const { data, error } = await supabase.rpc("admin_dar_de_baja", { p_vinculacion: vinculacionId });
    if (error) throw new Error(mensajeError(error, "No pudimos dar de baja al residente."));
    return data; // fecha de baja (YYYY-MM-DD)
}
