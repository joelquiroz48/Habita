import { useEffect } from "react";
import "./Reservas.css";

function Reservas() {

    useEffect(() => {
        document.title = "Habita | Mis reservas";
    }, []);

    return (
        <>
            <section className="bienvenida">
                <h2>¡Hola, usuario!</h2>
                <p>Este es el apartado de reservas.</p>
            </section>
        </>
    );
}

export default Reservas;