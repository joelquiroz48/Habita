import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import "./ThemeToggle.css";

function ThemeToggle() {
    const { tema, alternarTema } = useTheme();

    return (
        <button
            className="boton-tema"
            onClick={alternarTema}
            aria-label={
                tema === "claro"
                    ? "Activar modo noche"
                    : "Activar modo día"
            }
            title={
                tema === "claro"
                    ? "Activar modo noche"
                    : "Activar modo día"
            }
        >
            {tema === "claro" ? <Moon /> : <Sun />}
        </button>
    );
}

export default ThemeToggle;
