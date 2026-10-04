
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./Tabla.css";

const Tabla = ({
    columnas,
    datos,
    filasPorPagina = 5,
    etiqueta = "registros",
    className = "",
    onFilaClick,
    claseFila = () => ""
}) => {
    const [paginaActiva, setPaginaActiva] = useState(1);

    const totalPaginas = Math.ceil(datos.length / filasPorPagina);

    const inicio = (paginaActiva - 1) * filasPorPagina;
    const fin = Math.min(inicio + filasPorPagina, datos.length);

    const datosPagina = datos.slice(inicio, fin);

    const cambiarPagina = (pagina) => {
        if (pagina >= 1 && pagina <= totalPaginas) {
            setPaginaActiva(pagina);
        }
    };

    const paginas = Array.from(
        { length: totalPaginas },
        (_, index) => index + 1
    );

    const distribucionColumnas = columnas
        .map((columna) => {
            const ancho = columna.ancho || "1fr";
            return /^\d*\.?\d+fr$/.test(ancho)
                ? `minmax(0, ${ancho})`
                : ancho;
        })
        .join(" ");

    return (
        <section className={`tabla-card ${className}`}>
            <div
                className="tabla-header"
                style={{ gridTemplateColumns: distribucionColumnas }}
            >
                {columnas.map((columna) => (
                    <span key={columna.clave}>
                        {columna.titulo}
                    </span>
                ))}
            </div>

            <div className="tabla-body">
                {datosPagina.map((dato, index) => (
                    <div
                        className={`tabla-fila ${claseFila(dato)} ${onFilaClick ? "clickeable" : ""}`}
                        key={dato.id ?? inicio + index}
                        style={{ gridTemplateColumns: distribucionColumnas }}
                        onClick={onFilaClick ? () => onFilaClick(dato) : undefined}
                        onKeyDown={onFilaClick ? (event) => {
                            if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                onFilaClick(dato);
                            }
                        } : undefined}
                        role={onFilaClick ? "button" : undefined}
                        tabIndex={onFilaClick ? 0 : undefined}
                    >
                        {columnas.map((columna) => (
                            <span
                                className={columna.clase || ""}
                                key={columna.clave}
                            >
                                {columna.render
                                    ? columna.render(dato)
                                    : dato[columna.clave]}
                            </span>
                        ))}
                    </div>
                ))}

                {datos.length === 0 && (
                    <div className="tabla-vacia">
                        No hay {etiqueta} para mostrar.
                    </div>
                )}
            </div>

            {totalPaginas > 1 && (
                <section className="tabla-paginacion">
                    <button
                        className="tabla-pagina-flecha"
                        aria-label="Página anterior"
                        onClick={() => cambiarPagina(paginaActiva - 1)}
                        disabled={paginaActiva === 1}
                    >
                        <ChevronLeft size={16} />
                    </button>

                    {paginas.map((pagina) => (
                        <button
                            key={pagina}
                            className={`tabla-pagina ${
                                pagina === paginaActiva ? "activa" : ""
                            }`}
                            aria-current={
                                pagina === paginaActiva ? "page" : undefined
                            }
                            onClick={() => cambiarPagina(pagina)}
                        >
                            {pagina}
                        </button>
                    ))}

                    <button
                        className="tabla-pagina-flecha"
                        aria-label="Página siguiente"
                        onClick={() => cambiarPagina(paginaActiva + 1)}
                        disabled={paginaActiva === totalPaginas}
                    >
                        <ChevronRight size={16} />
                    </button>

                    <span className="tabla-paginacion-info">
                        Mostrando {inicio + 1} a {fin} de {datos.length}{" "}
                        {etiqueta}
                    </span>
                </section>
            )}
        </section>
    );
};

export default Tabla;