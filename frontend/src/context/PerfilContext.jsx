/* =========================================================
   Contexto del perfil del residente.
   Lo usan el Layout (cabecera y barra lateral) y la pantalla
   "Mi perfil". Cuando algo se guarda se llama a recargarPerfil()
   y todas las pantallas se actualizan al instante.
========================================================= */

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { obtenerPerfilResidente } from "../services/perfilService";
import { supabase } from "../supabase";

const PerfilContext = createContext({
    perfil: null,
    cargando: true,
    error: null,
    recargarPerfil: async () => {},
});

export function PerfilProvider({ children }) {
    const [perfil, setPerfil] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    const recargarPerfil = useCallback(async () => {
        try {
            setError(null);
            const datos = await obtenerPerfilResidente();
            if (datos?.dadoDeBaja) {
                // El administrador lo dio de baja: cerramos la sesión y lo mandamos al login
                localStorage.removeItem("access_token");
                await supabase.auth.signOut();
                window.location.replace("/login?baja=1");
                return;
            }
            setPerfil(datos);
        } catch (e) {
            console.error("No pudimos cargar tu perfil:", e);
            setError(e);
        } finally {
            setCargando(false);
        }
    }, []);

    useEffect(() => {
        recargarPerfil();
    }, [recargarPerfil]);

    // Si dan de baja al residente con la app abierta, lo detectamos cuando vuelve a esta pestaña
    useEffect(() => {
        const alVolver = () => {
            if (document.visibilityState === "visible") recargarPerfil();
        };
        document.addEventListener("visibilitychange", alVolver);
        return () => document.removeEventListener("visibilitychange", alVolver);
    }, [recargarPerfil]);

    return (
        <PerfilContext.Provider value={{ perfil, cargando, error, recargarPerfil }}>
            {children}
        </PerfilContext.Provider>
    );
}

export function usePerfil() {
    return useContext(PerfilContext);
}
