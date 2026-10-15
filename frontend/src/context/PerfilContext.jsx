/* =========================================================
   Contexto del perfil del residente.
   Lo usan el Layout (cabecera y barra lateral) y la pantalla
   "Mi perfil". Cuando algo se guarda se llama a recargarPerfil()
   y todas las pantallas se actualizan al instante.
========================================================= */

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { obtenerPerfilResidente } from "../services/perfilService";

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
            setPerfil(await obtenerPerfilResidente());
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

    return (
        <PerfilContext.Provider value={{ perfil, cargando, error, recargarPerfil }}>
            {children}
        </PerfilContext.Provider>
    );
}

export function usePerfil() {
    return useContext(PerfilContext);
}
