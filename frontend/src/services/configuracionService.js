/* =========================================================
   Servicio de Configuracion (residente)

   Tablas: preferencia_usuario  (preferencias de notificacion)
           reporte_problema     (reportes enviados a la administracion)
   La seguridad (RLS) hace que cada persona solo vea y cambie lo suyo.
========================================================= */

import { supabase } from "../supabase";

export const PREFERENCIAS_POR_DEFECTO = {
    notif_avisos: true,
    notif_expensas: true,
    notif_reservas: true,
    notif_reclamos: true,
    notif_documentos: false,
    dias_aviso_vencimiento: 3,
};

export const TIPOS_REPORTE = [
    { valor: "ERROR", etiqueta: "Algo no funciona" },
    { valor: "SUGERENCIA", etiqueta: "Sugerencia de mejora" },
    { valor: "CUENTA", etiqueta: "Problema con mi cuenta" },
    { valor: "OTRO", etiqueta: "Otro" },
];

async function exigirSesion() {
    const { data } = await supabase.auth.getSession();
    const usuario = data?.session?.user;
    if (!usuario) throw new Error("Tu sesión venció. Volvé a iniciar sesión.");
    return usuario;
}

/** Preferencias guardadas (o las de por defecto si todavía no eligió nada). */
export async function obtenerPreferencias() {
    const usuario = await exigirSesion();
    const { data, error } = await supabase
        .from("preferencia_usuario")
        .select("notif_avisos, notif_expensas, notif_reservas, notif_reclamos, notif_documentos, dias_aviso_vencimiento")
        .eq("usuario_id", usuario.id)
        .maybeSingle();
    if (error) throw error;
    return { ...PREFERENCIAS_POR_DEFECTO, ...(data ?? {}) };
}

/** Guarda solo los campos que cambiaron, por ejemplo { notif_avisos: false }. */
export async function guardarPreferencias(cambios) {
    const usuario = await exigirSesion();
    const { error } = await supabase
        .from("preferencia_usuario")
        .upsert(
            { usuario_id: usuario.id, ...cambios, actualizado_en: new Date().toISOString() },
            { onConflict: "usuario_id" }
        );
    if (error) throw error;
}

/** Valida el formulario de "Reportar un problema". Devuelve el texto del error o "". */
export function validarReporte({ asunto, tipo, descripcion }) {
    if (asunto.trim().length < 3) return "Escribí un asunto de al menos 3 caracteres.";
    if (!tipo) return "Elegí el tipo de reporte.";
    if (descripcion.trim().length < 10) return "Contanos un poco más: la descripción necesita al menos 10 caracteres.";
    return "";
}

export async function enviarReporte({ asunto, tipo, descripcion }) {
    const usuario = await exigirSesion();
    const { error } = await supabase.from("reporte_problema").insert({
        usuario_id: usuario.id,
        asunto: asunto.trim(),
        tipo,
        descripcion: descripcion.trim(),
    });
    if (error) throw error;
}

/** Cierra la sesión en este y en todos los demás dispositivos. */
export async function cerrarSesionEnTodosLosDispositivos() {
    const { error } = await supabase.auth.signOut({ scope: "global" });
    if (error) throw error;
}
