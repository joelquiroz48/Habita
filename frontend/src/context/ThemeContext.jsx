import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

const CLAVE_ALMACENAMIENTO = "habita-tema";

function obtenerTemaInicial() {
    const guardado = localStorage.getItem(CLAVE_ALMACENAMIENTO);
    if (guardado === "claro" || guardado === "oscuro") return guardado;

    const prefiereOscuro = window.matchMedia(
        "(prefers-color-scheme: dark)"
    ).matches;

    return prefiereOscuro ? "oscuro" : "claro";
}

export function ThemeProvider({ children }) {
    const [tema, setTema] = useState(obtenerTemaInicial);

    useEffect(() => {
        document.documentElement.setAttribute("data-tema", tema);
        localStorage.setItem(CLAVE_ALMACENAMIENTO, tema);
    }, [tema]);

    function alternarTema() {
        setTema((actual) => (actual === "claro" ? "oscuro" : "claro"));
    }

    return (
        <ThemeContext.Provider value={{ tema, alternarTema }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const contexto = useContext(ThemeContext);

    if (!contexto) {
        throw new Error("useTheme debe usarse dentro de un ThemeProvider");
    }

    return contexto;
}
