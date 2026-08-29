import { useEffect } from "react";
import "./Expensas.css";

function Expensas() {

    useEffect(() => {
        document.title = "Habita | Mis expensas";
    }, []);

    return (
        <>
            <section className="bienvenida">
                <h2>¡Hola, usuario!</h2>
                <p>Este es el apartado de tus expensas.</p>
            </section>
        </>
    );
}

export default Expensas;