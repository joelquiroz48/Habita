import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Info, MousePointer2, Paperclip, Plus, X } from "lucide-react";

import "./Reclamos.css";
import Tabla from "../../../components/Tabla/Tabla";
import Navegador from "../../../components/Navegador/Navegador";
import Modal from "../../../components/Modal/Modal";
import { usePerfil } from "../../../context/PerfilContext";
import { obtenerOpcionesPeriodo } from "../../../utils/periodos";
import {
    CATEGORIAS_RECLAMO,
    ESTADOS_RECLAMO,
    crearReclamo,
    listarReclamosResidente,
    validarAdjunto,
} from "../../../services/reclamosService";

const consejos = [
    "Elegí un asunto breve que describa el problema.",
    "Indicá el lugar exacto donde ocurre.",
    "Agregá cuándo comenzó y si sucede con frecuencia.",
    "Adjuntá una foto si ayuda a entender el inconveniente.",
];

function claseEstado(estado) {
    if (estado === "Pendiente") return "pendiente";
    if (estado === "En proceso") return "en-proceso";
    return "resuelto";
}

const columnasReclamos = [
    { clave: "titulo", titulo: "Reclamo", ancho: "1.5fr" },
    { clave: "categoria", titulo: "Categoría", ancho: "1fr" },
    {
        clave: "estado",
        titulo: "Estado",
        ancho: "1fr",
        render: (reclamo) => (
            <small className={`reclamos-badge ${claseEstado(reclamo.estado)}`}>
                {reclamo.estado}
            </small>
        ),
    },
    { clave: "fecha", titulo: "Fecha de publicación", ancho: "1fr" },
];

const FORMULARIO_VACIO = { titulo: "", categoria: "", descripcion: "" };

function Reclamos() {
    const { perfil } = usePerfil();
    const unidadId = perfil?.unidad?.id ?? null;

    const [reclamos, setReclamos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [errorCarga, setErrorCarga] = useState("");
    const [aviso, setAviso] = useState("");

    const [detalle, setDetalle] = useState(null);        // reclamo abierto en el modal de detalle
    const [nuevoAbierto, setNuevoAbierto] = useState(false);

    /* ---------- Formulario de nuevo reclamo ---------- */
    const [formulario, setFormulario] = useState(FORMULARIO_VACIO);
    const [archivo, setArchivo] = useState(null);
    const [errorFormulario, setErrorFormulario] = useState("");
    const [enviando, setEnviando] = useState(false);
    const inputArchivoRef = useRef(null);

    useEffect(() => {
        document.title = "Habita | Reclamos";
    }, []);

    useEffect(() => {
        let cancelado = false;

        listarReclamosResidente()
            .then((lista) => { if (!cancelado) setReclamos(lista); })
            .catch((err) => {
                console.error("No se pudieron cargar los reclamos", err);
                if (!cancelado) setErrorCarga("No pudimos cargar tus reclamos. Probá de nuevo en unos minutos.");
            })
            .finally(() => { if (!cancelado) setCargando(false); });

        return () => { cancelado = true; };
    }, []);

    // El aviso de "reclamo enviado" se va solo
    useEffect(() => {
        if (!aviso) return undefined;
        const temporizador = setTimeout(() => setAviso(""), 6000);
        return () => clearTimeout(temporizador);
    }, [aviso]);

    const filtros = useMemo(() => [
        { key: "categoria", label: "Todas las categorías", options: [...CATEGORIAS_RECLAMO].sort((a, b) => a.localeCompare(b, "es")) },
        { key: "estado", label: "Todos los estados", options: ESTADOS_RECLAMO },
        { key: "periodoFecha", label: "Todos los períodos", options: obtenerOpcionesPeriodo(reclamos) },
    ], [reclamos]);

    /* =========================
          NUEVO RECLAMO
    ========================= */

    const cerrarNuevo = useCallback(() => {
        setNuevoAbierto(false);
    }, []);

    function abrirNuevo() {
        setFormulario(FORMULARIO_VACIO);
        setArchivo(null);
        setErrorFormulario("");
        setEnviando(false);
        setNuevoAbierto(true);
    }

    function cambiarCampo(campo, valor) {
        setFormulario((actual) => ({ ...actual, [campo]: valor }));
    }

    function elegirArchivo(evento) {
        const elegido = evento.target.files[0] ?? null;
        const problema = validarAdjunto(elegido);
        if (problema) {
            setErrorFormulario(problema);
            setArchivo(null);
            evento.target.value = "";
            return;
        }
        setErrorFormulario("");
        setArchivo(elegido);
    }

    function quitarArchivo() {
        setArchivo(null);
        if (inputArchivoRef.current) inputArchivoRef.current.value = "";
    }

    async function enviarReclamo(evento) {
        evento.preventDefault();
        setErrorFormulario("");

        if (!formulario.titulo.trim() || !formulario.categoria || !formulario.descripcion.trim()) {
            setErrorFormulario("Completá el asunto, la categoría y la descripción.");
            return;
        }

        setEnviando(true);
        try {
            const nuevo = await crearReclamo({
                unidadId,
                titulo: formulario.titulo,
                categoria: formulario.categoria,
                descripcion: formulario.descripcion,
                archivo,
            });
            setReclamos((actuales) => [nuevo, ...actuales]);
            setNuevoAbierto(false);
            setAviso("Tu reclamo fue enviado. Lo vas a ver en la lista con estado Pendiente.");
        } catch (err) {
            setErrorFormulario(err.message);
            setEnviando(false);
        }
    }

    return (
        <main className="reclamos-residente">

            {aviso && <p className="reclamos-aviso reclamos-aviso-exito" role="status">{aviso}</p>}

            {/* =========================
                    CONSEJOS
            ========================= */}

            <section className="reclamos-consejos" aria-labelledby="titulo-consejos">
                <div className="reclamos-consejos-encabezado">
                    <span className="reclamos-consejos-icono"><Info aria-hidden="true" /></span>
                    <div>
                        <h2 id="titulo-consejos">Consejos para reportar</h2>
                        <p>Un reclamo bien explicado se resuelve más rápido.</p>
                    </div>
                </div>

                <ol className="reclamos-consejos-lista">
                    {consejos.map((consejo, i) => (
                        <li key={consejo}>
                            <span className="reclamos-consejo-numero">{i + 1}</span>
                            <span>{consejo}</span>
                        </li>
                    ))}
                </ol>
            </section>

            {/* =========================
                    LISTADO
            ========================= */}

            {cargando && <p className="reclamos-aviso" role="status">Cargando tus reclamos...</p>}
            {errorCarga && <p className="reclamos-aviso reclamos-aviso-error" role="alert">{errorCarga}</p>}

            {!cargando && !errorCarga && (
                <Navegador
                    data={reclamos}
                    searchKey="titulo"
                    searchPlaceholder="Buscar reclamo..."
                    filters={filtros}
                    onNew={abrirNuevo}
                    newButtonText="Nuevo reclamo"
                >
                    {(reclamosFiltrados) => (
                        <Tabla
                            columnas={columnasReclamos}
                            datos={reclamosFiltrados}
                            etiqueta="reclamos"
                            onFilaClick={setDetalle}
                            seleccionable
                            filaSeleccionada={detalle}
                        />
                    )}
                </Navegador>
            )}

            {!cargando && !errorCarga && reclamos.length === 0 && (
                <p className="reclamos-aviso">
                    Todavía no hiciste ningún reclamo. Tocá <strong>Nuevo reclamo</strong> para crear el primero.
                </p>
            )}

            {/* =========================
                 MODAL: DETALLE
            ========================= */}

            {detalle && (
                <Modal
                    titulo="Detalle del reclamo"
                    onClose={() => setDetalle(null)}
                    ancho={560}
                    pie={
                        <button type="button" className="modal-boton principal" onClick={() => setDetalle(null)}>
                            Cerrar
                        </button>
                    }
                >
                    <div className="reclamo-detalle">
                        <div className="reclamo-detalle-cabecera">
                            <h3>{detalle.titulo}</h3>
                            <small className={`reclamos-badge ${claseEstado(detalle.estado)}`}>{detalle.estado}</small>
                        </div>

                        <dl className="reclamo-detalle-datos">
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
                        <p className="reclamo-detalle-texto">{detalle.descripcion}</p>

                        <h4>Adjunto</h4>
                        {detalle.adjunto ? (
                            <p className="reclamo-adjunto-aviso">
                                <Paperclip aria-hidden="true" />
                                <span>
                                    Adjuntaste un archivo
                                    <small>{detalle.adjunto.nombre}{detalle.adjunto.tamano ? ` · ${detalle.adjunto.tamano}` : ""}</small>
                                </span>
                            </p>
                        ) : (
                            <p className="reclamo-sin-adjunto">No adjuntaste archivos.</p>
                        )}
                    </div>
                </Modal>
            )}

            {/* =========================
               MODAL: NUEVO RECLAMO
            ========================= */}

            {nuevoAbierto && (
                <Modal
                    titulo="Nuevo reclamo"
                    onClose={cerrarNuevo}
                    ancho={560}
                    pie={
                        <>
                            <button type="button" className="modal-boton" onClick={cerrarNuevo} disabled={enviando}>
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                form="form-nuevo-reclamo"
                                className="modal-boton principal reclamos-btn-enviar"
                                disabled={enviando || !unidadId}
                            >
                                <MousePointer2 aria-hidden="true" />
                                {enviando ? "Enviando..." : "Enviar reclamo"}
                            </button>
                        </>
                    }
                >
                    <form id="form-nuevo-reclamo" className="form-reclamo" onSubmit={enviarReclamo}>
                        {!unidadId && (
                            <p className="reclamos-aviso reclamos-aviso-error" role="alert">
                                No encontramos una unidad vinculada a tu cuenta, por eso no podés enviar reclamos todavía.
                            </p>
                        )}

                        <div className="campo-reclamo">
                            <label htmlFor="reclamo-asunto">Asunto</label>
                            <input
                                id="reclamo-asunto"
                                type="text"
                                placeholder="Escribí un asunto breve"
                                maxLength={100}
                                value={formulario.titulo}
                                onChange={(e) => cambiarCampo("titulo", e.target.value)}
                                autoFocus
                            />
                        </div>

                        <div className="campo-reclamo">
                            <label htmlFor="reclamo-categoria">Categoría</label>
                            <span className="select-reclamo-wrap">
                                <select
                                    id="reclamo-categoria"
                                    value={formulario.categoria}
                                    onChange={(e) => cambiarCampo("categoria", e.target.value)}
                                >
                                    <option value="" disabled>Seleccioná una categoría</option>
                                    {CATEGORIAS_RECLAMO.map((categoria) => (
                                        <option key={categoria} value={categoria}>{categoria}</option>
                                    ))}
                                </select>
                                <ChevronDown aria-hidden="true" />
                            </span>
                        </div>

                        <div className="campo-reclamo">
                            <label htmlFor="reclamo-descripcion">Descripción</label>
                            <textarea
                                id="reclamo-descripcion"
                                placeholder="Contanos con detalle cuál es el inconveniente"
                                rows={5}
                                maxLength={1000}
                                value={formulario.descripcion}
                                onChange={(e) => cambiarCampo("descripcion", e.target.value)}
                            />
                        </div>

                        <div className="campo-reclamo">
                            <span className="campo-reclamo-etiqueta">Archivo adjunto (opcional)</span>

                            {archivo ? (
                                <div className="reclamo-archivo-elegido">
                                    <Paperclip aria-hidden="true" />
                                    <span>{archivo.name}</span>
                                    <button type="button" onClick={quitarArchivo} aria-label="Quitar archivo">
                                        <X aria-hidden="true" />
                                    </button>
                                </div>
                            ) : (
                                <label className="adjuntar-archivo" htmlFor="archivo-reclamo">
                                    <Plus aria-hidden="true" />
                                    <span>Adjuntar archivo</span>
                                    <input
                                        ref={inputArchivoRef}
                                        id="archivo-reclamo"
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                        onChange={elegirArchivo}
                                    />
                                </label>
                            )}
                            <small className="reclamo-ayuda-archivo">PDF, imagen o Word. Hasta 5 MB.</small>
                        </div>

                        {errorFormulario && <p className="reclamos-aviso reclamos-aviso-error" role="alert">{errorFormulario}</p>}
                    </form>
                </Modal>
            )}

        </main>
    );
}

export default Reclamos;
