import { useEffect } from "react";
import "./MiPerfil.css";

function MiPerfil() {

    useEffect(() => {
        document.title = "Habita | Mi perfil";
    }, []);

    return (
        <>
            <section className="bienvenida">
                <h2>¡Hola, usuario!!!</h2>
                <p>Este es tu perfil.</p>
            </section>
        </>
    );
}

export default MiPerfil;