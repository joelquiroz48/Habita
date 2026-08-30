import { useEffect } from "react";
import "./Configuracion.css";

function Configuracion() {

    useEffect(() => {
        document.title = "Habita | Configuracion";
    }, []);

    return (
        <>
            <section className="bienvenida">
                <h2>¡Hola, usuario!</h2>
                <p>Este es el apartado de configuración.</p>
            </section>
        </>
    );
}

export default Configuracion;