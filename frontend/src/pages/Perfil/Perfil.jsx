import { useEffect } from "react";
import "./Perfil.css";

function Perfil() {

    useEffect(() => {
        document.title = "Habita | Mi perfil";
    }, []);

    return (
        <>
            <section className="bienvenida">
                <h2>¡Hola, usuario!</h2>
                <p>Este es tu perfil.</p>
            </section>
        </>
    );
}

export default Perfil;