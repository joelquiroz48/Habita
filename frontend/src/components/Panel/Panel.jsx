import "./Panel.css";

const Panel = ({
    icono,
    titulo,
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

            <div>
                {titulo && (
                    <h2>{titulo}</h2>
                )}

                {descripcion && (
                    <span>{descripcion}</span>
                )}
            </div>
        </>
    );

    return (
        <article className={`panel ${className}`}>
            {(icono || titulo || descripcion || accion) && (
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