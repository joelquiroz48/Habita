import "./TarjetaResumen.css";

function TarjetaResumen({
    icono,
    titulo,
    valor,
    contenido,
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
            </div>
        </article>
    );
}

export default TarjetaResumen;