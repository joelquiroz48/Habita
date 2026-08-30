import { useEffect } from "react";
import "./Avisos.css";

function Avisos() {

    useEffect(() => {
        document.title = "Habita | Avisos";
    }, []);

    return (
        <>
            <section className="bienvenida">
                <h2>¡Hola, usuario!</h2>
                <p>Este es el apartado de avisos.</p>
            </section>
        </>
    );
}

export default Avisos;