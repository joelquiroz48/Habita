/* =========================================================
   Servicio de Perfil
   Datos del residente logueado: nombre, unidad y edificio.
   La cadena en la base es:
   usuario -> vinculacion -> unidad -> edificio
========================================================= */

import { supabase } from "../supabase";

/**
 * Devuelve { id, nombre, tipo, unidad: { id, numero, piso }, edificio: { id, nombre, direccion } }
 * o null si no hay sesión iniciada.
 */
export async function obtenerPerfilResidente() {
    const { data: sesion } = await supabase.auth.getSession();
    const usuarioId = sesion?.session?.user?.id;
    if (!usuarioId) return null;

    const { data: usuario, error: errorUsuario } = await supabase
        .from("usuario")
        .select("id, nombre, tipo")
        .eq("id", usuarioId)
        .maybeSingle();
    if (errorUsuario) throw errorUsuario;
    if (!usuario) return null;

    // Unidad vigente del residente (la más reciente si tiene más de una)
    const { data: vinculos, error: errorVinculo } = await supabase
        .from("vinculacion")
        .select(`
            unidad:unidad (
                id, numero, piso,
                edificio:edificio ( id, nombre, direccion )
            )
        `)
        .eq("usuario_id", usuarioId)
        .eq("estado", "ACTIVA")
        .order("fecha_inicio", { ascending: false })
        .limit(1);
    if (errorVinculo) throw errorVinculo;

    const unidad = vinculos?.[0]?.unidad ?? null;

    return {
        id: usuario.id,
        nombre: usuario.nombre,
        tipo: usuario.tipo,
        unidad: unidad ? { id: unidad.id, numero: unidad.numero, piso: unidad.piso } : null,
        edificio: unidad?.edificio ?? null,
    };
}
