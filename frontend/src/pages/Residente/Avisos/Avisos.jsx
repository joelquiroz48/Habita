import { useEffect, useMemo, useState } from "react";
import { Eye, Paperclip } from "lucide-react";

import "./Avisos.css";
import Modal from "../../../components/Modal/Modal";
import Tabla from "../../../components/Tabla/Tabla";
import Navegador from "../../../components/Navegador/Navegador";
import { obtenerOpcionesPeriodo } from "../../../utils/periodos";
import { listarAvisos, marcarAvisoLeido, obtenerUrlAdjunto } from "../../../services/avisosService";

const columnasAvisos = [
    { clave: "titulo", titulo: "Asunto", ancho: "1.5fr" },
    {
        clave: "importancia",
        titulo: "Importante",
        ancho: "1fr",
        render: (aviso) => (
            <small className={`aviso-tabla-importancia ${aviso.importancia === "Importante" ? "importante" : "normal"}`}>
                {aviso.importancia}
            </small>
        ),
    },
    { clave: "categoria", titulo: "Categoría", ancho: "1fr" },
    {
        clave: "leido",
        titulo: "Estado",
        ancho: "0.9fr",
        render: (aviso) => (
            <small className={`aviso-tabla-estado ${aviso.leido ? "leido" : "sin-leer"}`}>
                {aviso.estadoLectura}
            </small>
        ),
    },
    { clave: "fecha", titulo: "Fecha de publicación", ancho: "1.2fr" },
];

function Avisos() {
    const [avisos, setAvisos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [errorCarga, setErrorCarga] = useState("");
    const [detalle, setDetalle] = useState(null);
    const [abriendoAdjunto, setAbriendoAdjunto] = useState(false);
    const [errorAdjunto, setErrorAdjunto] = useState("");

    useEffect(() => {
        document.title = "Habita | Avisos";
    }, []);

    useEffect(() => {
        let cancelado = false;
        listarAvisos()
            .then((lista) => { if (!cancelado) setAvisos(lista); })
            .catch((err) => {
                console.error("No se pudieron cargar los avisos", err);
                if (!cancelado) setErrorCarga("No pudimos cargar los avisos. Probá de nuevo en unos minutos.");
            })
            .finally(() => { if (!cancelado) setCargando(false); });
        return () => { cancelado = true; };
    }, []);

    const filtros = useMemo(() => [
        {
            key: "categoria",
            label: "Todas las categorías",
            options: [...new Set(avisos.map((aviso) => aviso.categoria))],
        },
        { key: "importancia", label: "Cualquier importancia", options: ["Importante", "Normal"] },
        { key: "estadoLectura", label: "Todos los estados", options: ["Sin leer", "Leído"] },
        { key: "periodoFecha", label: "Todos los períodos", options: obtenerOpcionesPeriodo(avisos) },
    ], [avisos]);

    function abrirDetalle(aviso) {
        setErrorAdjunto("");
        setDetalle({ ...aviso, leido: true, estadoLectura: "Leído" });

        if (aviso.leido) return;

        // Se muestra como leído enseguida; si falla el guardado, vuelve a "Sin leer".
        const actualizar = (leido) => setAvisos((actuales) => actuales.map((item) => (
            item.id === aviso.id ? { ...item, leido, estadoLectura: leido ? "Leído" : "Sin leer" } : item
        )));
        actualizar(true);
        marcarAvisoLeido(aviso.id).catch((err) => {
            console.error("No se pudo registrar la lectura", err);
            actualizar(false);
        });
    }

    async function verAdjunto() {
        if (!detalle?.adjunto?.ruta) return;
        setAbriendoAdjunto(true);
        setErrorAdjunto("");
        try {
            const url = await obtenerUrlAdjunto(detalle.adjunto.ruta);
            window.open(url, "_blank", "noopener,noreferrer");
        } catch (err) {
            setErrorAdjunto(err.message);
        } finally {
            setAbriendoAdjunto(false);
        }
    }

    return (
        <main className="avisos">
            {cargando && <p className="avisos-estado" role="status">Cargando avisos...</p>}
            {errorCarga && <p className="avisos-estado avisos-estado-error" role="alert">{errorCarga}</p>}

            {!cargando && !errorCarga && (
                <Navegador
                    data={avisos}
                    searchKey="titulo"
                    searchPlaceholder="Buscar aviso..."
                    filters={filtros}
                >
                    {(avisosFiltrados) => (
                        <Tabla
                            columnas={columnasAvisos}
                            datos={avisosFiltrados}
                            etiqueta="avisos"
                            onFilaClick={abrirDetalle}
                            seleccionable
                            filaSeleccionada={detalle}
                        />
                    )}
                </Navegador>
            )}

            {!cargando && !errorCarga && avisos.length === 0 && (
                <p className="avisos-estado">Todavía no hay avisos publicados en tu edificio.</p>
            )}

            {detalle && (
                <Modal
                    titulo="Detalle del aviso"
                    onClose={() => setDetalle(null)}
                    ancho={560}
                    pie={
                        <button type="button" className="modal-boton principal" onClick={() => setDetalle(null)}>
                            Cerrar
                        </button>
                    }
                >
                    <div className="aviso-detalle">
                        <div className="aviso-detalle-cabecera">
                            <h3>{detalle.titulo}</h3>
                            <small className={`aviso-tabla-importancia ${detalle.importancia === "Importante" ? "importante" : "normal"}`}>
                                {detalle.importancia}
                            </small>
                        </div>

                        <dl className="aviso-detalle-datos">
                            <div>
                                <dt>Categoría</dt>
                                <dd>{detalle.categoria}</dd>
                            </div>
                            <div>
                                <dt>Fecha de publicación</dt>
                                <dd>{detalle.fecha}</dd>
                            </div>
                        </dl>

                        <h4>Descripción</h4>
                        <p className="aviso-detalle-texto">{detalle.descripcion}</p>

                        <h4>Adjunto</h4>
                        {detalle.adjunto ? (
                            <div className="avisos-adjunto">
                                <Paperclip size={16} aria-hidden="true" />
                                <div className="avisos-adjunto-info">
                                    <strong>{detalle.adjunto.nombre}</strong>
                                    {detalle.adjunto.tamano && <span>Tamaño - {detalle.adjunto.tamano}</span>}
                                </div>
                                {detalle.adjunto.ruta && (
                                    <button
                                        type="button"
                                        onClick={verAdjunto}
                                        disabled={abriendoAdjunto}
                                        aria-label="Ver adjunto"
                                    >
                                        <Eye size={16} />
                                    </button>
                                )}
                            </div>
                        ) : (
                            <p className="avisos-sin-adjunto">Sin archivos adjuntos.</p>
                        )}
                        {errorAdjunto && <p className="avisos-estado avisos-estado-error" role="alert">{errorAdjunto}</p>}
                    </div>
                </Modal>
            )}
        </main>
    );
}

export default Avisos;
