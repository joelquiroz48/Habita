import "./Panel.css";

const Panel = ({
    icono,
    titulo,
    tituloComplemento,
    descripcion,
    accion,
    children,
    className = ""
}) => {

    const contenidoHeader = (
        <>
            {icono && (
                <div className="panel-icono">
                    {icono}
                </div>
            )}

            <div className="panel-titulo-contenido">
                {titulo && (
                    <div className="panel-titulo-linea">
                        <h2>{titulo}</h2>
                        {tituloComplemento}
                    </div>
                )}

                {descripcion && (
                    <span>{descripcion}</span>
                )}
            </div>
        </>
    );

    return (
        <article className={`panel ${className}`}>
            {(icono || titulo || tituloComplemento || descripcion || accion) && (
                <div
                    className={`panel-header ${
                        icono && !accion ? "panel-header-junto" : ""
                    }`}
                >
                    {accion ? (
                        <>
                            <div className="panel-header-icono">
                                {contenidoHeader}
                            </div>

                            <div className="panel-accion">
                                {accion}
                            </div>
                        </>
                    ) : (
                        contenidoHeader
                    )}
                </div>
            )}

            <div className="panel-contenido">
                {children}
            </div>
        </article>
    );
};

export default Panel;