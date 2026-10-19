/* =========================================================
   Servicio de Perfil
   Todo lo que lee o guarda el perfil del residente.

   Cadena en la base:  usuario -> vinculacion -> unidad -> edificio
   Fotos:              Supabase Storage, bucket "avatares"
   Contrasena y email: Supabase Auth (no estan en la tabla usuario)
========================================================= */

import { supabase } from "../supabase";

const BUCKET_FOTOS = "avatares";
export const TAMANO_MAXIMO_FOTO = 2 * 1024 * 1024; // 2 MB
export const TIPOS_FOTO = ["image/jpeg", "image/png", "image/webp"];
const EXTENSIONES = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

async function exigirSesion() {
    const { data } = await supabase.auth.getSession();
    const usuario = data?.session?.user;
    if (!usuario) throw new Error("Tu sesión venció. Volvé a iniciar sesión.");
    return usuario;
}

/** Enlace temporal (24 h) a la foto del edificio que sube el administrador. Si no hay, null. */
async function urlFotoEdificio(edificioId) {
    try {
        const { data } = await supabase.from("edificio").select("foto_ruta").eq("id", edificioId).maybeSingle();
        if (!data?.foto_ruta) return null;
        const { data: firmada } = await supabase.storage.from("edificios").createSignedUrl(data.foto_ruta, 86400);
        return firmada?.signedUrl ?? null;
    } catch {
        return null;
    }
}

/* ---------------------------------------------------------
   LECTURA
--------------------------------------------------------- */

/**
 * Devuelve:
 * { id, email, nombre, tipo, telefono, fotoUrl, rol,
 *   unidad: { id, numero, piso } | null,
 *   edificio: { id, nombre, direccion, fotoUrl } | null }
 * o null si no hay sesión iniciada.
 */
export async function obtenerPerfilResidente() {
    const { data: sesion } = await supabase.auth.getSession();
    const usuarioAuth = sesion?.session?.user;
    if (!usuarioAuth) return null;

    const { data: usuario, error: errorUsuario } = await supabase
        .from("usuario")
        .select("id, nombre, tipo, telefono, foto_url")
        .eq("id", usuarioAuth.id)
        .maybeSingle();
    if (errorUsuario) throw errorUsuario;
    if (!usuario) return null;

    // Unidad vigente del residente (la más reciente si tiene más de una)
    const { data: vinculos, error: errorVinculo } = await supabase
        .from("vinculacion")
        .select(`
            rol,
            unidad:unidad (
                id, numero, piso,
                edificio:edificio ( id, nombre, direccion )
            )
        `)
        .eq("usuario_id", usuarioAuth.id)
        .eq("estado", "ACTIVA")
        .order("fecha_inicio", { ascending: false })
        .limit(1);
    if (errorVinculo) throw errorVinculo;

    const vinculo = vinculos?.[0] ?? null;
    const unidad = vinculo?.unidad ?? null;
    const edificio = unidad?.edificio
        ? { ...unidad.edificio, fotoUrl: await urlFotoEdificio(unidad.edificio.id) }
        : null;

    return {
        id: usuario.id,
        email: usuarioAuth.email ?? "",
        nombre: usuario.nombre,
        tipo: usuario.tipo,
        telefono: usuario.telefono ?? "",
        fotoUrl: usuario.foto_url ?? null,
        rol: vinculo?.rol ?? null,
        unidad: unidad ? { id: unidad.id, numero: unidad.numero, piso: unidad.piso } : null,
        edificio,
    };
}

/* ---------------------------------------------------------
   ESCRITURA
--------------------------------------------------------- */

/** Actualiza columnas de la fila del propio usuario. */
async function actualizarUsuario(campos) {
    const usuario = await exigirSesion();
    const { data, error } = await supabase
        .from("usuario")
        .update(campos)
        .eq("id", usuario.id)
        .select("id");

    if (error) {
        console.error("Error al actualizar el usuario:", error);
        if (error.code === "42501") {
            throw new Error("No tenés permiso para guardar estos cambios.");
        }
        throw new Error("No pudimos guardar los cambios. Probá de nuevo.");
    }
    // Si las reglas de la base no dejan modificar la fila, no hay error pero tampoco filas.
    if (!data || data.length === 0) {
        throw new Error("No pudimos guardar los cambios. Probá de nuevo.");
    }
}

/** "https://.../avatares/<id>/avatar-123.png" -> "<id>/avatar-123.png" */
function rutaDesdeUrl(url) {
    if (!url) return null;
    const marca = `/${BUCKET_FOTOS}/`;
    const posicion = url.indexOf(marca);
    return posicion === -1 ? null : url.slice(posicion + marca.length).split("?")[0];
}

/** Valida una foto antes de subirla. Devuelve un mensaje de error o "". */
export function validarFoto(archivo) {
    if (!archivo) return "";
    if (!TIPOS_FOTO.includes(archivo.type)) {
        return "La foto debe ser JPG, PNG o WebP.";
    }
    if (archivo.size > TAMANO_MAXIMO_FOTO) {
        return "La foto pesa más de 2 MB. Elegí una más liviana.";
    }
    return "";
}

/**
 * Guarda nombre y foto de perfil.
 *  - archivo:       File nuevo (opcional)
 *  - quitarFoto:    true para borrar la foto actual
 *  - fotoActualUrl: URL vigente (para borrar el archivo viejo)
 */
export async function guardarPerfilBasico({ nombre, archivo, quitarFoto, fotoActualUrl }) {
    const usuario = await exigirSesion();
    const campos = { nombre: nombre.trim() };
    let fotoNuevaSubida = null;

    if (archivo) {
        const errorFoto = validarFoto(archivo);
        if (errorFoto) throw new Error(errorFoto);

        const extension = EXTENSIONES[archivo.type];
        const ruta = `${usuario.id}/avatar-${Date.now()}.${extension}`;

        const { error: errorSubida } = await supabase.storage
            .from(BUCKET_FOTOS)
            .upload(ruta, archivo, { contentType: archivo.type, cacheControl: "3600" });
        if (errorSubida) {
            console.error("Error al subir la foto:", errorSubida);
            throw new Error("No pudimos subir la foto. Probá de nuevo.");
        }

        fotoNuevaSubida = ruta;
        campos.foto_url = supabase.storage.from(BUCKET_FOTOS).getPublicUrl(ruta).data.publicUrl;
    } else if (quitarFoto) {
        campos.foto_url = null;
    }

    try {
        await actualizarUsuario(campos);
    } catch (error) {
        // Si falló guardar, no dejamos la foto nueva huérfana en Storage
        if (fotoNuevaSubida) {
            await supabase.storage.from(BUCKET_FOTOS).remove([fotoNuevaSubida]);
        }
        throw error;
    }

    // Se guardó bien: borramos la foto anterior (si la cambió o la quitó)
    if (archivo || quitarFoto) {
        const rutaVieja = rutaDesdeUrl(fotoActualUrl);
        if (rutaVieja) {
            const { error } = await supabase.storage.from(BUCKET_FOTOS).remove([rutaVieja]);
            if (error) console.warn("No se pudo borrar la foto anterior:", error);
        }
    }
}

export async function guardarTelefono(telefono) {
    await actualizarUsuario({ telefono: telefono.trim() });
}

/**
 * Cambia la contraseña. Primero verifica la actual (inicia sesión de nuevo
 * en segundo plano) y después guarda la nueva.
 */
export async function cambiarContrasena(contrasenaActual, contrasenaNueva) {
    const usuario = await exigirSesion();

    const { data: verificacion, error: errorVerificacion } = await supabase.auth.signInWithPassword({
        email: usuario.email,
        password: contrasenaActual,
    });
    if (errorVerificacion) {
        throw new Error("La contraseña actual no es correcta.");
    }
    if (verificacion?.session?.access_token) {
        localStorage.setItem("access_token", verificacion.session.access_token);
    }

    const { error } = await supabase.auth.updateUser({ password: contrasenaNueva });
    if (error) {
        console.error("Error al cambiar la contraseña:", error);
        const mensaje = String(error.message || "").toLowerCase();
        if (mensaje.includes("different from the old")) {
            throw new Error("La nueva contraseña tiene que ser distinta de la actual.");
        }
        if (mensaje.includes("at least") || mensaje.includes("weak")) {
            throw new Error("La nueva contraseña es demasiado débil. Probá con una más larga.");
        }
        throw new Error("No pudimos cambiar la contraseña. Probá de nuevo.");
    }
}
