
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, MoreVertical } from "lucide-react";
import "./Tabla.css";

function MenuAcciones({ dato, opciones }) {
    const [abierto, setAbierto] = useState(false);
    const contenedorRef = useRef(null);
    const botonRef = useRef(null);
    const identificador = dato.nombre ?? dato.unidad ?? dato.id ?? "registro";

    useEffect(() => {
        if (!abierto) return undefined;

        const cerrarAlHacerClickAfuera = (event) => {
            if (!contenedorRef.current?.contains(event.target)) {
                setAbierto(false);
            }
        };
        const cerrarConEscape = (event) => {
            if (event.key === "Escape") {
                setAbierto(false);
                botonRef.current?.focus();
            }
        };

        document.addEventListener("pointerdown", cerrarAlHacerClickAfuera);
        document.addEventListener("keydown", cerrarConEscape);

        return () => {
            document.removeEventListener("pointerdown", cerrarAlHacerClickAfuera);
            document.removeEventListener("keydown", cerrarConEscape);
        };
    }, [abierto]);

    return (
        <div className="tabla-acciones" ref={contenedorRef}>
            <button
                ref={botonRef}
                type="button"
                className="tabla-acciones-boton"
                aria-label={`Acciones para ${identificador}`}
                aria-haspopup="menu"
                aria-expanded={abierto}
                disabled={opciones.length === 0}
                onClick={(event) => {
                    event.stopPropagation();
                    setAbierto((valor) => !valor);
                }}
            >
                <MoreVertical size={18} />
            </button>

            {abierto && (
                <div className="tabla-acciones-menu" role="menu">
                    {opciones.map((opcion) => (
                        <button
                            type="button"
                            className="tabla-acciones-opcion"
                            role="menuitem"
                            key={opcion.label}
                            disabled={opcion.disabled}
                            onClick={(event) => {
                                event.stopPropagation();
                                opcion.onClick?.(dato);
                                setAbierto(false);
                            }}
                        >
                            {opcion.icon && <opcion.icon size={15} />}
                            <span>{opcion.label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

const Tabla = ({
    columnas,
    datos,
    etiqueta = "registros",
    className = "",
    onFilaClick,
    claseFila = () => "",
    mostrarAcciones = false,
    opcionesAcciones = [],
    seleccionable = false,
    filaSeleccionada,
}) => {
    const filasPorPagina = 5;

    const [paginaActiva, setPaginaActiva] = useState(1);
    const [seleccionInterna, setSeleccionInterna] = useState(null);
    const seleccionControlada = filaSeleccionada !== undefined;

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

    const inicioPaginas = Math.min(
        paginaActiva - 1,
        Math.max(0, totalPaginas - 4)
    );

    const paginasVisibles = paginas.slice(
        inicioPaginas,
        inicioPaginas + 4
    );

    const distribucionDatos = columnas
        .map((columna) => {
            const ancho = columna.ancho || "1fr";
            return /^\d*\.?\d+fr$/.test(ancho)
                ? `minmax(0, ${ancho})`
                : ancho;
        })
        .join(" ");
    const distribucionColumnas = [
        ...(seleccionable ? ["25px"] : []),
        distribucionDatos,
        ...(mostrarAcciones ? ["100px"] : []),
    ].join(" ");

    return (
        <section className={`tabla-card ${className}`}>
            <div className="tabla-header" style={{ gridTemplateColumns: distribucionColumnas }}>
                {seleccionable && <span className="tabla-indicador-encabezado" />}
                {columnas.map((columna) => (
                    <span key={columna.clave}>
                        {columna.titulo}
                    </span>
                ))}
                {mostrarAcciones && <span className="tabla-acciones-encabezado">Acciones</span>}
            </div>

            <div className="tabla-body">
                {datosPagina.map((dato, index) => {
                    const clave = dato.id ?? inicio + index;
                    const seleccionado = seleccionControlada
                        ? dato === filaSeleccionada
                        : dato === seleccionInterna;
                    const manejarClickFila = () => {
                        if (seleccionable && !seleccionControlada) {
                            setSeleccionInterna(dato);
                        }
                        onFilaClick?.(dato);
                    };

                    return (
                        <div
                            className={`tabla-fila ${claseFila(dato)} ${
                                seleccionable && seleccionado ? "seleccionada" : ""
                            } ${onFilaClick || seleccionable ? "clickeable" : ""}`}
                            key={clave}
                            style={{ gridTemplateColumns: distribucionColumnas }}
                            onClick={onFilaClick || seleccionable ? manejarClickFila : undefined}
                            onKeyDown={onFilaClick || seleccionable ? (event) => {
                                if (
                                    event.target === event.currentTarget
                                    && (event.key === "Enter" || event.key === " ")
                                ) {
                                    event.preventDefault();
                                    manejarClickFila();
                                }
                            } : undefined}
                            role={onFilaClick || seleccionable ? "button" : undefined}
                            tabIndex={onFilaClick || seleccionable ? 0 : undefined}
                        >
                            {seleccionable && (
                                <span className="tabla-indicador-celda">
                                    {seleccionado && <ChevronRight size={15} />}
                                </span>
                            )}
                            {columnas.map((columna) => (
                                <span className={columna.clase || ""} key={columna.clave}>
                                    {columna.render
                                        ? columna.render(dato)
                                        : dato[columna.clave]}
                                </span>
                            ))}
                            {mostrarAcciones && (
                                <span className="tabla-acciones-celda">
                                    <MenuAcciones dato={dato} opciones={opcionesAcciones} />
                                </span>
                            )}
                        </div>
                    );
                })}

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

                    {paginasVisibles.map((pagina) => (
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