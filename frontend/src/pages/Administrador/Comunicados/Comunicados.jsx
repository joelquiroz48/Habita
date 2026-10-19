import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Megaphone, CalendarClock, FileText, Eye, Paperclip, Download, Pencil, Trash2, Send,
    AlertCircle, CheckCircle2, RefreshCw, Star,
} from "lucide-react";

import "./Comunicados.css";
import TarjetaResumen from "../../../components/TarjetaResumen/TarjetaResumen";
import Tabla from "../../../components/Tabla/Tabla";
import Navegador from "../../../components/Navegador/Navegador";
import Modal from "../../../components/Modal/Modal";
import { obtenerOpcionesPeriodo } from "../../../utils/periodos";
import {
    CATEGORIAS, AUDIENCIAS, obtenerComunicadosAdmin, guardarComunicado, eliminarComunicado, urlAdjunto, validarAdjunto, aInputFecha,
} from "../../../services/comunicadosAdminService";

const CLASE_CAT = { "Aviso": "aviso", "Mantenimiento": "mantenimiento", "Reunión": "reunion", "Obra": "obra", "Recordatorio": "recordatorio", "Novedad": "novedad" };
const claseEstado = (e) => (e === "Publicado" ? "publicado" : e === "Programado" ? "programado" : "borrador");

const BadgeCat = ({ categoria }) => <span className={`comunicados-tipo-badge ${CLASE_CAT[categoria] ?? "general"}`}>{categoria}</span>;
const BadgeEstado = ({ estado }) => <span className={`comunicados-badge comunicados-badge-${claseEstado(estado)}`}>{estado}</span>;

/* ---------- Crear / editar ---------- */
function ModalFormulario({ comunicado, edificios, onClose, onGuardado }) {
    const editando = Boolean(comunicado);
    const [asunto, setAsunto] = useState(comunicado?.asunto ?? "");
    const [contenido, setContenido] = useState(comunicado?.contenido ?? "");
    const [categoria, setCategoria] = useState(comunicado?.categoria ?? "Aviso");
    const [audiencia, setAudiencia] = useState(comunicado?.audienciaClave ?? "TODOS");
    const [importante, setImportante] = useState(comunicado?.importante ?? false);
    const [edificioId, setEdificioId] = useState(comunicado?.edificioId ?? edificios[0]?.id);
    const [cuando, setCuando] = useState(comunicado?.estado === "Programado" ? "PROGRAMAR" : comunicado?.estado === "Borrador" ? "BORRADOR" : "PUBLICAR");
    const [fecha, setFecha] = useState(comunicado?.estado === "Programado" ? comunicado.fechaInput : "");
    const [archivo, setArchivo] = useState(null);
    const [quitar, setQuitar] = useState(false);
    const [error, setError] = useState("");
    const [guardando, setGuardando] = useState(false);

    const categorias = CATEGORIAS.includes(categoria) ? CATEGORIAS : [categoria, ...CATEGORIAS];
    const adjuntoActual = !quitar && !archivo ? comunicado?.adjunto : null;
    const etiquetaBoton = cuando === "PUBLICAR" ? (editando && comunicado.estado === "Publicado" ? "Guardar cambios" : "Publicar") : cuando === "PROGRAMAR" ? "Programar" : "Guardar borrador";

    function elegirArchivo(evento) {
        const f = evento.target.files?.[0] ?? null;
        const mensaje = validarAdjunto(f);
        if (mensaje) { setError(mensaje); evento.target.value = ""; return; }
        setError(""); setArchivo(f); setQuitar(false);
    }

    async function enviar(evento) {
        evento.preventDefault();
        setError("");
        if (asunto.trim().length < 3) return setError("Escribí un asunto de al menos 3 caracteres.");
        if (!contenido.trim()) return setError("Escribí el mensaje del comunicado.");
        if (cuando === "PROGRAMAR" && (!fecha || new Date(`${fecha}:00-03:00`) <= new Date())) return setError("Elegí una fecha y hora futuras para programar.");
        setGuardando(true);
        try {
            await guardarComunicado({ actual: comunicado, edificioId, asunto, contenido, categoria, importante, audiencia, modo: cuando, fechaInput: fecha, archivo, quitarAdjunto: quitar });
            await onGuardado(cuando === "PUBLICAR" ? "Comunicado publicado." : cuando === "PROGRAMAR" ? "Comunicado programado." : "Borrador guardado.");
        } catch (e) { setError(e.message); setGuardando(false); }
    }

    return (
        <Modal
            titulo={editando ? "Editar comunicado" : "Crear comunicado"}
            onClose={onClose}
            ancho={600}
            pie={
                <>
                    <button type="button" className="modal-boton" onClick={onClose}>Cancelar</button>
                    <button type="submit" form="form-comunicado" className="modal-boton principal" disabled={guardando}>{guardando ? "Guardando..." : etiquetaBoton}</button>
                </>
            }
        >
            <form id="form-comunicado" className="com-form" onSubmit={enviar} noValidate>
                <div className="com-campo">
                    <label htmlFor="com-asunto">Asunto</label>
                    <input id="com-asunto" value={asunto} maxLength={120} onChange={(e) => setAsunto(e.target.value)} placeholder="Ej: Corte de luz programado" />
                </div>

                <div className="com-grilla">
                    <div className="com-campo">
                        <label htmlFor="com-categoria">Categoría</label>
                        <select id="com-categoria" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                            {categorias.map((c) => <option key={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="com-campo">
                        <label htmlFor="com-audiencia">Dirigido a</label>
                        <select id="com-audiencia" value={audiencia} onChange={(e) => setAudiencia(e.target.value)}>
                            {AUDIENCIAS.map((a) => <option key={a.valor} value={a.valor}>{a.texto}</option>)}
                        </select>
                    </div>
                </div>

                {!editando && edificios.length > 1 && (
                    <div className="com-campo">
                        <label htmlFor="com-edificio">Edificio</label>
                        <select id="com-edificio" value={edificioId} onChange={(e) => setEdificioId(Number(e.target.value))}>
                            {edificios.map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                        </select>
                    </div>
                )}

                <div className="com-campo">
                    <label htmlFor="com-mensaje">Mensaje <span className="com-contador">{contenido.length}/2000</span></label>
                    <textarea id="com-mensaje" rows={5} maxLength={2000} value={contenido} onChange={(e) => setContenido(e.target.value)} placeholder="Escribí el comunicado para los residentes..." />
                </div>

                <label className="com-check">
                    <input type="checkbox" checked={importante} onChange={(e) => setImportante(e.target.checked)} />
                    <span><Star size={13} /> Marcar como importante</span>
                </label>

                <div className="com-campo">
                    <label>Adjunto (opcional)</label>
                    {adjuntoActual && (
                        <div className="comunicados-adjunto">
                            <Paperclip size={16} />
                            <div className="comunicados-adjunto-info"><strong>{adjuntoActual.nombre}</strong><span>{adjuntoActual.tamano}</span></div>
                            <button type="button" className="com-quitar" onClick={() => setQuitar(true)}>Quitar</button>
                        </div>
                    )}
                    {archivo && (
                        <div className="comunicados-adjunto">
                            <Paperclip size={16} />
                            <div className="comunicados-adjunto-info"><strong>{archivo.name}</strong><span>Nuevo archivo</span></div>
                            <button type="button" className="com-quitar" onClick={() => setArchivo(null)}>Quitar</button>
                        </div>
                    )}
                    {!adjuntoActual && !archivo && (
                        <input id="com-archivo" type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={elegirArchivo} />
                    )}
                    <small>PDF, imagen o Word. Máximo 5 MB.</small>
                </div>

                <fieldset className="com-cuando">
                    <legend>¿Cuándo se publica?</legend>
                    {[["PUBLICAR", "Publicar ahora"], ["PROGRAMAR", "Programar"], ["BORRADOR", "Guardar como borrador"]].map(([valor, texto]) => (
                        <label key={valor} className="com-radio">
                            <input type="radio" name="cuando" value={valor} checked={cuando === valor} onChange={() => setCuando(valor)} /> {texto}
                        </label>
                    ))}
                    {cuando === "PROGRAMAR" && (
                        <input id="com-fecha" type="datetime-local" className="com-fecha" value={fecha} min={aInputFecha(new Date())} onChange={(e) => { setFecha(e.target.value); setError(""); }} aria-label="Fecha y hora de publicación" />
                    )}
                    {cuando === "BORRADOR" && <small>Los residentes no lo ven hasta que lo publiques.</small>}
                </fieldset>

                {error && <p className="com-aviso com-aviso-error" role="alert"><AlertCircle size={15} /><span>{error}</span></p>}
            </form>
        </Modal>
    );
}

/* ---------- Detalle ---------- */
function Fila({ etiqueta, children }) {
    return <div className="com-fila"><span>{etiqueta}</span><strong>{children}</strong></div>;
}

function ModalDetalle({ comunicado: c, onClose, onEditar, onEliminar, onPublicar, ocupado }) {
    const [error, setError] = useState("");
    async function abrirAdjunto() {
        try { window.open(await urlAdjunto(c.adjunto.ruta), "_blank", "noopener"); } catch (e) { setError(e.message); }
    }
    return (
        <Modal
            titulo="Detalle del comunicado"
            onClose={onClose}
            ancho={600}
            pie={
                <>
                    <button type="button" className="modal-boton contorno-peligro" onClick={onEliminar} disabled={ocupado}><Trash2 size={14} /> Eliminar</button>
                    <button type="button" className="modal-boton" onClick={onEditar} disabled={ocupado}><Pencil size={14} /> Editar</button>
                    {c.estado !== "Publicado" && (
                        <button type="button" className="modal-boton principal" onClick={onPublicar} disabled={ocupado}><Send size={14} /> Publicar ahora</button>
                    )}
                </>
            }
        >
            <div className="com-cabecera">
                <h3>{c.importante && <Star size={15} className="com-estrella" aria-label="Importante" />}{c.asunto}</h3>
                <BadgeEstado estado={c.estado} />
            </div>
            <Fila etiqueta="Categoría"><BadgeCat categoria={c.categoria} /></Fila>
            <Fila etiqueta={c.estado === "Programado" ? "Se publica el" : "Fecha de publicación"}>{c.fecha}</Fila>
            <Fila etiqueta="Audiencia">{c.audiencia}</Fila>
            <Fila etiqueta="Edificio">{c.edificio}</Fila>

            {c.estado === "Publicado" && (
                <div className="com-lectura">
                    <div className="com-lectura-texto"><Eye size={14} /> <strong>{c.lecturas} de {c.destinatarios}</strong> residentes lo leyeron <span>({c.porcentajeLectura}%)</span></div>
                    <div className="com-barra"><div style={{ width: `${c.porcentajeLectura}%` }} /></div>
                </div>
            )}

            <h4 className="com-titulo-seccion">Mensaje</h4>
            <p className="com-texto">{c.contenido}</p>

            <h4 className="com-titulo-seccion">Adjuntos</h4>
            {c.adjunto ? (
                <div className="comunicados-adjunto">
                    <Paperclip size={16} />
                    <div className="comunicados-adjunto-info"><strong>{c.adjunto.nombre}</strong><span>{c.adjunto.tamano}</span></div>
                    <button type="button" aria-label="Descargar adjunto" onClick={abrirAdjunto}><Download size={16} /></button>
                </div>
            ) : <p className="comunicados-sin-adjunto">Sin archivos adjuntos.</p>}
            {error && <p className="com-aviso com-aviso-error"><AlertCircle size={15} /><span>{error}</span></p>}
        </Modal>
    );
}

/* ---------- Pantalla ---------- */
function Comunicados() {
    const [datos, setDatos] = useState(null);
    const [error, setError] = useState("");
    const [vista, setVista] = useState(null); // { tipo: "detalle"|"form"|"eliminar", id? }
    const [avisoObj, setAvisoObj] = useState(null);
    const aviso = avisoObj?.texto;
    const setAviso = (texto, esError = false) => setAvisoObj(texto ? { texto, esError } : null);
    const [ocupado, setOcupado] = useState(false);

    const cargar = useCallback(async () => {
        try { setDatos(await obtenerComunicadosAdmin()); setError(""); } catch (e) { setError(e.message); }
    }, []);

    useEffect(() => { document.title = "Habita | Comunicados"; cargar(); }, [cargar]);
    useEffect(() => {
        if (!aviso) return undefined;
        const t = setTimeout(() => setAviso(""), 3500);
        return () => clearTimeout(t);
    }, [aviso]);

    const lista = datos?.comunicados ?? [];
    const edificios = datos?.edificios ?? [];

    const resumen = useMemo(() => {
        const pub = lista.filter((c) => c.estado === "Publicado");
        const dest = pub.reduce((s, c) => s + c.destinatarios, 0);
        const lect = pub.reduce((s, c) => s + c.lecturas, 0);
        return { publicados: pub.length, programados: lista.filter((c) => c.estado === "Programado").length, borradores: lista.filter((c) => c.estado === "Borrador").length, lectura: dest ? Math.round((lect / dest) * 100) : 0 };
    }, [lista]);

    const filtros = useMemo(() => [
        { key: "categoria", label: "Todas las categorías", options: [...new Set([...CATEGORIAS, ...lista.map((c) => c.categoria)])] },
        { key: "estado", label: "Todos los estados", options: ["Publicado", "Programado", "Borrador"] },
        { key: "periodoFecha", label: "Todos los períodos", options: obtenerOpcionesPeriodo(lista) },
    ], [lista]);

    const columnas = useMemo(() => [
        { clave: "asunto", titulo: "Asunto", ancho: "1.3fr", render: (c) => <span className="com-asunto-celda">{c.importante && <Star size={12} className="com-estrella" />}{c.asunto}</span> },
        { clave: "audiencia", titulo: "Audiencia", ancho: "0.9fr" },
        { clave: "categoria", titulo: "Categoría", ancho: "1fr", render: (c) => <BadgeCat categoria={c.categoria} /> },
        { clave: "estado", titulo: "Estado", ancho: "0.9fr", render: (c) => <BadgeEstado estado={c.estado} /> },
        { clave: "fecha", titulo: "Fecha de publicación", ancho: "1.1fr" },
    ], []);

    const seleccionado = vista?.id ? lista.find((c) => c.id === vista.id) ?? null : null;

    async function tras(mensaje) { await cargar(); setVista(null); setAviso(mensaje); }

    async function publicarAhora() {
        setOcupado(true);
        try {
            await guardarComunicado({ actual: seleccionado, asunto: seleccionado.asunto, contenido: seleccionado.contenido, categoria: seleccionado.categoria, importante: seleccionado.importante, audiencia: seleccionado.audienciaClave, modo: "PUBLICAR" });
            await tras("Comunicado publicado.");
        } catch (e) { setAviso(e.message, true); } finally { setOcupado(false); }
    }
    async function borrar() {
        setOcupado(true);
        try { await eliminarComunicado(seleccionado.id); await tras("Comunicado eliminado."); }
        catch (e) { setAviso(e.message, true); } finally { setOcupado(false); }
    }

    if (error && !datos) {
        return (
            <main className="comunicados">
                <div className="com-vacio"><AlertCircle size={28} /><h2>{error}</h2>
                    <button type="button" className="modal-boton principal" onClick={cargar}><RefreshCw size={13} /> Reintentar</button></div>
            </main>
        );
    }
    if (!datos) return <main className="comunicados"><p className="com-cargando">Cargando comunicados...</p></main>;

    return (
        <main className="comunicados">
            <section className="comunicados-resumen">
                <TarjetaResumen icono={<Megaphone />} titulo="Publicados" valor={resumen.publicados} contenido={<span>Visibles para residentes</span>} />
                <TarjetaResumen icono={<CalendarClock />} titulo="Programados" valor={resumen.programados} contenido={<span>Se publican solos</span>} />
                <TarjetaResumen icono={<FileText />} titulo="Borradores" valor={resumen.borradores} contenido={<span>Sin publicar</span>} />
                <TarjetaResumen icono={<Eye />} titulo="Lectura" valor={`${resumen.lectura}%`} contenido={<span>De los comunicados publicados</span>} />
            </section>

            <Navegador data={lista} searchKey="busqueda" searchPlaceholder="Buscar comunicado..." filters={filtros} onNew={() => setVista({ tipo: "form" })} newButtonText="Crear comunicado">
                {(filtrados) => (
                    <Tabla columnas={columnas} datos={filtrados} etiqueta="comunicados" className="comunicados-tabla" onFilaClick={(c) => setVista({ tipo: "detalle", id: c.id })} />
                )}
            </Navegador>

            {vista?.tipo === "detalle" && seleccionado && (
                <ModalDetalle comunicado={seleccionado} ocupado={ocupado} onClose={() => setVista(null)}
                    onEditar={() => setVista({ tipo: "form", id: seleccionado.id })}
                    onEliminar={() => setVista({ tipo: "eliminar", id: seleccionado.id })} onPublicar={publicarAhora} />
            )}
            {vista?.tipo === "form" && (
                <ModalFormulario key={vista.id ?? "nuevo"} comunicado={seleccionado} edificios={edificios} onClose={() => setVista(vista.id ? { tipo: "detalle", id: vista.id } : null)} onGuardado={tras} />
            )}
            {vista?.tipo === "eliminar" && seleccionado && (
                <Modal titulo="Eliminar comunicado" onClose={() => setVista({ tipo: "detalle", id: seleccionado.id })} ancho={460}
                    pie={<>
                        <button type="button" className="modal-boton" onClick={() => setVista({ tipo: "detalle", id: seleccionado.id })}>Cancelar</button>
                        <button type="button" className="modal-boton peligro" onClick={borrar} disabled={ocupado}>{ocupado ? "Eliminando..." : "Eliminar"}</button>
                    </>}>
                    <p className="com-texto">¿Seguro que querés eliminar <strong>{seleccionado.asunto}</strong>? Los residentes dejarán de verlo y no se puede deshacer.</p>
                </Modal>
            )}

            {aviso && <p className={`com-aviso ${avisoObj.esError ? "com-aviso-error" : "com-aviso-ok"} com-aviso-flotante`} role="status"><CheckCircle2 size={16} /><span>{aviso}</span></p>}
        </main>
    );
}

export default Comunicados;
