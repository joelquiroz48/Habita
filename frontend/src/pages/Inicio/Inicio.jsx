import { useEffect } from "react";
import "./Inicio.css";

function Inicio() {

    useEffect(() => {
        document.title = "Habita | Inicio";
    }, []);

    return (
        <>
            <section className="bienvenida">
                <h2>¡Hola, usuario!</h2>
                <p>Este es el resumen de tu comunidad.</p>
            </section>
        </>
    );
}

export default Inicio;