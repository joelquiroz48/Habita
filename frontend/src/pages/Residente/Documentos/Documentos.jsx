import { useEffect } from "react";
import "./Documentos.css";

function Documentos() {

    useEffect(() => {
        document.title = "Habita | Documentos";
    }, []);

    return (
        <>
            <section className="bienvenida">
                <h2>¡Hola, usuario!</h2>
                <p>Este es el apartado de documentos.</p>
            </section>
        </>
    );
}

export default Documentos;