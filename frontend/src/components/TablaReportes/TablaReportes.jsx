
import "./TablaReportes.css";

const TablaReportes = ({
    columnas = [],
    datos = [],
    obtenerClave,
    mostrarEncabezado = false,
    mensajeVacio = "No hay datos para mostrar.",
    className = "",
}) => {
    const columnasGrid = columnas
        .map((columna) => columna.ancho || "minmax(0, 1fr)")
        .join(" ");

    return (
        <div className={`tabla-reportes-contenedor ${className}`}>
            <div className="tabla-reportes">
                {mostrarEncabezado && (
                    <div
                        className="tabla-reportes-encabezado"
                        style={{ gridTemplateColumns: columnasGrid }}
                    >
                        {columnas.map((columna) => (
                            <span key={columna.clave}>
                                {columna.titulo}
                            </span>
                        ))}
                    </div>
                )}

                {datos.length > 0 ? (
                    datos.map((fila, indice) => (
                        <div
                            className="tabla-reportes-fila"
                            key={
                                obtenerClave
                                    ? obtenerClave(fila)
                                    : indice
                            }
                            style={{ gridTemplateColumns: columnasGrid }}
                        >
                            {columnas.map((columna) => (
                                <div
                                    className={`tabla-reportes-celda ${
                                        columna.className || ""
                                    }`}
                                    key={columna.clave}
                                >
                                    {columna.render
                                        ? columna.render(
                                              fila[columna.clave],
                                              fila
                                          )
                                        : fila[columna.clave]}
                                </div>
                            ))}
                        </div>
                    ))
                ) : (
                    <div className="tabla-reportes-vacia">
                        {mensajeVacio}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TablaReportes;