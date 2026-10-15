import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Search, ChevronDown, Check, Plus } from "lucide-react";
import "./Navegador.css";

/* ---------------------------------------------------------
   Lista desplegable propia (en lugar del <select> nativo, cuya
   lista abierta no se puede redondear ni estilizar).
   Accesible: teclado (flechas, Enter, Esc, Inicio/Fin) y lector
   de pantalla (role listbox / option).
--------------------------------------------------------- */
function FiltroDesplegable({ etiqueta, opciones, valor, onChange }) {
    const [abierto, setAbierto] = useState(false);
    const [activo, setActivo] = useState(0);
    const [posicion, setPosicion] = useState(null);
    const contenedorRef = useRef(null);
    const botonRef = useRef(null);
    const listaRef = useRef(null);

    // La primera opcion es "todos" (valor vacio)
    const items = useMemo(
        () => [{ valor: "", texto: etiqueta }, ...opciones.map((o) => ({ valor: o, texto: o }))],
        [etiqueta, opciones]
    );
    const indiceSeleccionado = Math.max(0, items.findIndex((i) => i.valor === valor));
    const textoActual = items[indiceSeleccionado].texto;

    // La lista se dibuja fuera del contenedor de la pantalla (portal) y se
    // posiciona sobre el boton: asi nunca la recorta el borde de la tabla ni
    // el area con scroll, aunque haya pocos reclamos/filas debajo.
    useLayoutEffect(() => {
        if (!abierto || !botonRef.current) return;

        const caja = botonRef.current.getBoundingClientRect();
        const MARGEN = 8;
        const espacioAbajo = window.innerHeight - caja.bottom - MARGEN;
        const espacioArriba = caja.top - MARGEN;
        const abrirHaciaArriba = espacioAbajo < 200 && espacioArriba > espacioAbajo;

        setPosicion({
            right: Math.max(MARGEN, window.innerWidth - caja.right),
            minWidth: caja.width,
            maxHeight: Math.max(120, Math.min(320, abrirHaciaArriba ? espacioArriba : espacioAbajo)),
            ...(abrirHaciaArriba
                ? { bottom: window.innerHeight - caja.top + 6 }
                : { top: caja.bottom + 6 }),
        });
    }, [abierto]);

    useEffect(() => {
        if (!abierto) return undefined;

        const cerrar = () => setAbierto(false);
        const cerrarAlHacerClickAfuera = (event) => {
            const dentro = contenedorRef.current?.contains(event.target)
                || listaRef.current?.contains(event.target);
            if (!dentro) cerrar();
        };
        // Si la pantalla se mueve (scroll o cambio de tamano), la lista ya no
        // quedaria pegada al boton: se cierra.
        const cerrarAlMoverse = (event) => {
            if (listaRef.current?.contains(event.target)) return;
            cerrar();
        };

        document.addEventListener("pointerdown", cerrarAlHacerClickAfuera);
        window.addEventListener("scroll", cerrarAlMoverse, true);
        window.addEventListener("resize", cerrar);
        return () => {
            document.removeEventListener("pointerdown", cerrarAlHacerClickAfuera);
            window.removeEventListener("scroll", cerrarAlMoverse, true);
            window.removeEventListener("resize", cerrar);
        };
    }, [abierto]);

    function abrir() {
        setActivo(indiceSeleccionado);
        setAbierto(true);
    }

    function elegir(indice) {
        onChange(items[indice].valor);
        setAbierto(false);
        botonRef.current?.focus();
    }

    function manejarTeclado(event) {
        if (!abierto) {
            if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
                event.preventDefault();
                abrir();
            }
            return;
        }
        switch (event.key) {
            case "ArrowDown":
                event.preventDefault();
                setActivo((i) => Math.min(i + 1, items.length - 1));
                break;
            case "ArrowUp":
                event.preventDefault();
                setActivo((i) => Math.max(i - 1, 0));
                break;
            case "Home":
                event.preventDefault();
                setActivo(0);
                break;
            case "End":
                event.preventDefault();
                setActivo(items.length - 1);
                break;
            case "Enter":
            case " ":
                event.preventDefault();
                elegir(activo);
                break;
            case "Escape":
                event.preventDefault();
                setAbierto(false);
                break;
            case "Tab":
                setAbierto(false);
                break;
            default:
        }
    }

    return (
        <div
            className={`navegador-filtro ${abierto ? "abierto" : ""}`}
            ref={contenedorRef}
            onKeyDown={manejarTeclado}
        >
            <button
                ref={botonRef}
                type="button"
                className="navegador-filtro-boton"
                aria-haspopup="listbox"
                aria-expanded={abierto}
                aria-label={etiqueta}
                onClick={() => (abierto ? setAbierto(false) : abrir())}
            >
                <span>{textoActual}</span>
                <ChevronDown size={15} aria-hidden="true" />
            </button>

            {abierto && posicion && createPortal(
                <ul
                    ref={listaRef}
                    className="navegador-filtro-lista"
                    role="listbox"
                    aria-label={etiqueta}
                    style={posicion}
                >
                    {items.map((item, indice) => (
                        <li
                            key={item.valor || "todos"}
                            role="option"
                            aria-selected={indice === indiceSeleccionado}
                            className={[
                                "navegador-filtro-opcion",
                                indice === indiceSeleccionado ? "seleccionada" : "",
                                indice === activo ? "activa" : "",
                            ].join(" ").trim()}
                            onMouseEnter={() => setActivo(indice)}
                            onClick={() => elegir(indice)}
                        >
                            <span>{item.texto}</span>
                            {indice === indiceSeleccionado && <Check size={15} aria-hidden="true" />}
                        </li>
                    ))}
                </ul>,
                document.body
            )}
        </div>
    );
}

/**
 * Barra de busqueda + filtros + boton "Nuevo" sobre una tabla.
 *
 * alinear="derecha" lleva la busqueda y los filtros al borde derecho
 * (por defecto quedan a la izquierda, como siempre).
 */
function Navegador({
    data = [],
    searchKey,
    searchPlaceholder = "Buscar...",
    filters = [],
    onNew,
    newButtonText = "Nuevo",
    alinear = "izquierda",
    children,
}) {
    const [searchValue, setSearchValue] = useState("");
    const [filterValues, setFilterValues] = useState({});

    const filteredData = useMemo(() => {
        const normalizedSearch = searchValue
            .trim()
            .toLocaleLowerCase();

        return data.filter((item) => {
            const matchesSearch = !normalizedSearch || String(item[searchKey] ?? "")
                .toLocaleLowerCase()
                .includes(normalizedSearch);
            const matchesFilters = filters.every((filter) => {
                const selectedValue = filterValues[filter.key];
                return !selectedValue || item[filter.key] === selectedValue;
            });

            return matchesSearch && matchesFilters;
        });
    }, [data, searchValue, searchKey, filters, filterValues]);

    return (
        <>
            <section className={`navegador ${alinear === "derecha" ? "navegador--derecha" : ""}`.trim()}>
                <div className="navegador-buscador">
                    <Search size={17} aria-hidden="true" />
                    <input
                        type="search"
                        aria-label={searchPlaceholder}
                        placeholder={searchPlaceholder}
                        value={searchValue}
                        onChange={(event) => setSearchValue(event.target.value)}
                    />
                </div>

                {filters.map((filter) => (
                    <FiltroDesplegable
                        key={filter.key}
                        etiqueta={filter.label}
                        opciones={Array.isArray(filter.options) ? filter.options : []}
                        valor={filterValues[filter.key] ?? ""}
                        onChange={(nuevoValor) => {
                            setFilterValues((current) => ({
                                ...current,
                                [filter.key]: nuevoValor,
                            }));
                        }}
                    />
                ))}

                {onNew && (
                    <button
                        type="button"
                        className="navegador-btn-nuevo"
                        onClick={onNew}
                    >
                        <Plus size={16} />
                        {newButtonText}
                    </button>
                )}
            </section>
            {typeof children === "function" ? children(filteredData) : children}
        </>
    );
}

export default Navegador;
