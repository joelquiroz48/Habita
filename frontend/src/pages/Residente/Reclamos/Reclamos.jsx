import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Info, MousePointer2, Paperclip, Pencil, Plus, Save, X } from "lucide-react";

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
    editarReclamo,
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

/* ---------------------------------------------------------
   Campos del formulario (los usan "Nuevo reclamo" y "Editar reclamo").
   Esta afuera de Reclamos() para que React no lo vuelva a crear en
   cada tecla (si no, el campo perderia el foco al escribir).

   adjuntoActual: adjunto que el reclamo ya tiene (solo al editar).
--------------------------------------------------------- */
function CamposReclamo({
    prefijo, formulario, onCambio, archivo, onElegirArchivo, onQuitarArchivo,
    inputArchivoRef, adjuntoActual, onQuitarActual, error,
}) {
    return (
        <>
            <div className="campo-reclamo">
                <label htmlFor={`${prefijo}-asunto`}>Asunto</label>
                <input
                    id={`${prefijo}-asunto`}
                    type="text"
                    placeholder="Escribí un asunto breve"
                    maxLength={100}
                    value={formulario.titulo}
                    onChange={(e) => onCambio("titulo", e.target.value)}
                    autoFocus
                />
            </div>

            <div className="campo-reclamo">
                <label htmlFor={`${prefijo}-categoria`}>Categoría</label>
                <span className="select-reclamo-wrap">
                    <select
                        id={`${prefijo}-categoria`}
                        value={formulario.categoria}
                        onChange={(e) => onCambio("categoria", e.target.value)}
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
                <label htmlFor={`${prefijo}-descripcion`}>Descripción</label>
                <textarea
                    id={`${prefijo}-descripcion`}
                    placeholder="Contanos con detalle cuál es el inconveniente"
                    rows={5}
                    maxLength={1000}
                    value={formulario.descripcion}
                    onChange={(e) => onCambio("descripcion", e.target.value)}
                />
            </div>

            <div className="campo-reclamo">
                <span className="campo-reclamo-etiqueta">Archivo adjunto (opcional)</span>

                {archivo ? (
                    <div className="reclamo-archivo-elegido">
                        <Paperclip aria-hidden="true" />
                        <span>{archivo.name}</span>
                        <button type="button" onClick={onQuitarArchivo} aria-label="Quitar archivo">
                            <X aria-hidden="true" />
                        </button>
                    </div>
                ) : adjuntoActual ? (
                    <div className="reclamo-archivo-elegido">
                        <Paperclip aria-hidden="true" />
                        <span>
                            {adjuntoActual.nombre}
                            {adjuntoActual.tamano ? ` · ${adjuntoActual.tamano}` : ""}
                        </span>
                        <button type="button" onClick={onQuitarActual} aria-label="Quitar archivo actual">
                            <X aria-hidden="true" />
                        </button>
                    </div>
                ) : (
                    <label className="adjuntar-archivo" htmlFor={`${prefijo}-archivo`}>
                        <Plus aria-hidden="true" />
                        <span>Adjuntar archivo</span>
                        <input
                            ref={inputArchivoRef}
                            id={`${prefijo}-archivo`}
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            onChange={onElegirArchivo}
                        />
                    </label>
                )}
                <small className="reclamo-ayuda-archivo">PDF, imagen o Word. Hasta 5 MB.</small>
            </div>

            {error && <p className="reclamos-aviso reclamos-aviso-error" role="alert">{error}</p>}
        </>
    );
}

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

    /* ---------- Edicion (solo reclamos Pendientes) ---------- */
    const [editando, setEditando] = useState(false);
    const [formEdicion, setFormEdicion] = useState(FORMULARIO_VACIO);
    const [archivoEdicion, setArchivoEdicion] = useState(null);   // archivo nuevo elegido
    const [quitarActual, setQuitarActual] = useState(false);       // sacar el adjunto que ya tenia
    const [errorEdicion, setErrorEdicion] = useState("");
    const [guardando, setGuardando] = useState(false);
    const inputArchivoEdicionRef = useRef(null);

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

    function procesarArchivo(evento, guardarArchivo, guardarError) {
        const elegido = evento.target.files[0] ?? null;
        const problema = validarAdjunto(elegido);
        if (problema) {
            guardarError(problema);
            guardarArchivo(null);
            evento.target.value = "";
            return;
        }
        guardarError("");
        guardarArchivo(elegido);
    }

    function elegirArchivo(evento) {
        procesarArchivo(evento, setArchivo, setErrorFormulario);
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

    /* =========================
          EDITAR RECLAMO
    ========================= */

    function cerrarDetalle() {
        setDetalle(null);
        setEditando(false);
    }

    function abrirEdicion() {
        setFormEdicion({
            titulo: detalle.titulo,
            categoria: detalle.categoria,
            descripcion: detalle.descripcion,
        });
        setArchivoEdicion(null);
        setQuitarActual(false);
        setErrorEdicion("");
        setGuardando(false);
        setEditando(true);
    }

    function cancelarEdicion() {
        setEditando(false);
        setErrorEdicion("");
    }

    function cambiarCampoEdicion(campo, valor) {
        setFormEdicion((actual) => ({ ...actual, [campo]: valor }));
    }

    function elegirArchivoEdicion(evento) {
        procesarArchivo(evento, setArchivoEdicion, setErrorEdicion);
    }

    function quitarArchivoEdicion() {
        setArchivoEdicion(null);
        if (inputArchivoEdicionRef.current) inputArchivoEdicionRef.current.value = "";
    }

    async function guardarEdicion(evento) {
        evento.preventDefault();
        setErrorEdicion("");

        if (!formEdicion.titulo.trim() || !formEdicion.categoria || !formEdicion.descripcion.trim()) {
            setErrorEdicion("Completá el asunto, la categoría y la descripción.");
            return;
        }

        setGuardando(true);
        try {
            const actualizado = await editarReclamo({
                id: detalle.id,
                titulo: formEdicion.titulo,
                categoria: formEdicion.categoria,
                descripcion: formEdicion.descripcion,
                archivo: archivoEdicion,
                quitarAdjunto: quitarActual,
                adjuntoActual: detalle.adjunto,
            });
            setReclamos((actuales) => actuales.map((r) => (r.id === actualizado.id ? actualizado : r)));
            setDetalle(actualizado);
            setEditando(false);
            setAviso("Guardamos los cambios de tu reclamo.");
        } catch (err) {
            setErrorEdicion(err.message);
            setGuardando(false);
            // Si ya no estaba pendiente, se vuelve a cargar la lista para mostrar el estado real
            if (err.codigo === "NO_EDITABLE") {
                listarReclamosResidente().then(setReclamos).catch(() => {});
            }
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
                            onFilaClick={(reclamo) => { setEditando(false); setDetalle(reclamo); }}
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

            {detalle && !editando && (
                <Modal
                    titulo="Detalle del reclamo"
                    onClose={cerrarDetalle}
                    ancho={560}
                    pie={
                        <>
                            {detalle.estado === "Pendiente" && (
                                <button type="button" className="modal-boton reclamo-boton-icono" onClick={abrirEdicion}>
                                    <Pencil aria-hidden="true" />
                                    Editar reclamo
                                </button>
                            )}
                            <button type="button" className="modal-boton principal" onClick={cerrarDetalle}>
                                Cerrar
                            </button>
                        </>
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

                        {detalle.estado !== "Pendiente" && (
                            <p className="reclamo-detalle-nota">
                                Este reclamo ya fue tomado por la administración, por eso no se puede editar.
                                Si necesitás agregar algo, podés cargar un reclamo nuevo.
                            </p>
                        )}
                    </div>
                </Modal>
            )}

            {/* =========================
               MODAL: EDITAR RECLAMO
            ========================= */}

            {detalle && editando && (
                <Modal
                    titulo="Editar reclamo"
                    onClose={cerrarDetalle}
                    ancho={560}
                    pie={
                        <>
                            <button type="button" className="modal-boton" onClick={cancelarEdicion} disabled={guardando}>
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                form="form-editar-reclamo"
                                className="modal-boton principal reclamo-boton-icono"
                                disabled={guardando}
                            >
                                <Save aria-hidden="true" />
                                {guardando ? "Guardando..." : "Guardar cambios"}
                            </button>
                        </>
                    }
                >
                    <form id="form-editar-reclamo" className="form-reclamo" onSubmit={guardarEdicion}>
                        <CamposReclamo
                            prefijo="editar"
                            formulario={formEdicion}
                            onCambio={cambiarCampoEdicion}
                            archivo={archivoEdicion}
                            onElegirArchivo={elegirArchivoEdicion}
                            onQuitarArchivo={quitarArchivoEdicion}
                            inputArchivoRef={inputArchivoEdicionRef}
                            adjuntoActual={quitarActual ? null : detalle.adjunto}
                            onQuitarActual={() => setQuitarActual(true)}
                            error={errorEdicion}
                        />
                    </form>
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

                        <CamposReclamo
                            prefijo="nuevo"
                            formulario={formulario}
                            onCambio={cambiarCampo}
                            archivo={archivo}
                            onElegirArchivo={elegirArchivo}
                            onQuitarArchivo={quitarArchivo}
                            inputArchivoRef={inputArchivoRef}
                            error={errorFormulario}
                        />
                    </form>
                </Modal>
            )}

        </main>
    );
}

export default Reclamos;
