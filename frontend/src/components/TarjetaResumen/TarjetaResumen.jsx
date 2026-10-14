import { Link } from "react-router-dom";
import "./TarjetaResumen.css";

/**
 * Tarjeta de resumen.
 * - enlace (opcional): { texto: "Ver expensas", to: "/expensas" }
 *   Se muestra abajo de todo, como en la tarjeta de avisos.
 */
function TarjetaResumen({
    icono,
    titulo,
    valor,
    contenido,
    enlace,
}) {
    return (
        <article className="resumen-tarjeta">
            <div className="resumen-icon">
                {icono}
            </div>

            <div className="resumen-contenido">
                <span className="resumen-etiqueta">
                    {titulo}
                </span>

                <strong>{valor}</strong>
                {contenido}

                {enlace && (
                    <Link to={enlace.to} className="resumen-enlace">
                        {enlace.texto}
                    </Link>
                )}
            </div>
        </article>
    );
}

export default TarjetaResumen;
