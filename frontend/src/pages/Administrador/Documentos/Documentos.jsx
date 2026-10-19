import { useCallback, useEffect, useMemo, useState } from "react";
import { Download, Eye, Trash, Pencil, FileText, CalendarPlus, HardDrive, Lock, AlertCircle, CheckCircle2, RefreshCw, Paperclip, UploadCloud } from "lucide-react";

import "./Documentos.css";
import TarjetaResumen from "../../../components/TarjetaResumen/TarjetaResumen";
import Tabla from "../../../components/Tabla/Tabla";
import Navegador from "../../../components/Navegador/Navegador";
import Modal from "../../../components/Modal/Modal";
import { obtenerOpcionesPeriodo } from "../../../utils/periodos";
import {
    CATEGORIAS, AUDIENCIAS, EXTENSIONES_ACEPTADAS, obtenerDocumentosAdmin, guardarDocumento, eliminarDocumento,
    urlArchivo, descargarArchivo, validarArchivo, formatearTamano,
} from "../../../services/documentosAdminService";

const CLASE_CAT = {
    "Reglamentos": "reglamentos", "Contratos": "reglamentos", "Asambleas": "asambleas", "Actas": "asambleas",
    "Obras y mejoras": "obras", "Seguros": "obras", "Estados contables": "estados", "Finanzas": "estados",
};
const Badge = ({ categoria }) => <span className={`documentos-badge ${CLASE_CAT[categoria] ?? "otros"}`}>{categoria}</span>;
const Fila = ({ etiqueta, children }) => <div className="doc-fila"><span>{etiqueta}</span><strong>{children}</strong></div>;

/* ---------- Subir / editar ---------- */
function ModalFormulario({ documento, edificios, onClose, onGuardado }) {
    const editando = Boolean(documento);
    const [nombre, setNombre] = useState(documento?.nombre ?? "");
    const [descripcion, setDescripcion] = useState(documento?.descripcion ?? "");
    const [categoria, setCategoria] = useState(documento?.categoria ?? "Reglamentos");
    const [audiencia, setAudiencia] = useState(documento?.audienciaClave ?? "TODOS");
    const [edificioId, setEdificioId] = useState(documento?.edificioId ?? edificios[0]?.id);
    const [archivo, setArchivo] = useState(null);
    const [arrastrando, setArrastrando] = useState(false);
    const [error, setError] = useState("");
    const [guardando, setGuardando] = useState(false);

    const categorias = CATEGORIAS.includes(categoria) ? CATEGORIAS : [categoria, ...CATEGORIAS];

    function recibir(f) {
        if (!f) return;
        const mensaje = validarArchivo(f);
        if (mensaje) { setError(mensaje); return; }
        setError(""); setArchivo(f);
        // si todavía no escribió un nombre, propone el del archivo
        if (!nombre.trim()) setNombre(f.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").slice(0, 120));
    }

    async function enviar(evento) {
        evento.preventDefault();
        setError("");
        if (nombre.trim().length < 3) return setError("Escribí un nombre de al menos 3 caracteres.");
        if (!editando && !archivo) return setError("Elegí el archivo que querés subir.");
        setGuardando(true);
        try {
            await guardarDocumento({ actual: documento, edificioId, nombre, descripcion, categoria, audiencia, archivo });
            await onGuardado(editando ? "Documento actualizado." : "Documento subido.");
        } catch (e) { setError(e.message); setGuardando(false); }
    }

    return (
        <Modal titulo={editando ? "Editar documento" : "Subir documento"} onClose={onClose} ancho={560}
            pie={<>
                <button type="button" className="modal-boton" onClick={onClose} disabled={guardando}>Cancelar</button>
                <button type="submit" form="form-documento" className="modal-boton principal" disabled={guardando}>
                    {guardando ? "Guardando..." : editando ? "Guardar cambios" : "Subir documento"}
                </button>
            </>}>
            <form id="form-documento" className="doc-form" onSubmit={enviar} noValidate>
                <div className="doc-campo">
                    <label>{editando ? "Archivo" : "Archivo *"}</label>
                    {editando && !archivo && (
                        <div className="doc-archivo"><Paperclip size={16} />
                            <div><strong>{documento.archivo.nombre}</strong><span>{documento.archivo.formato} · {documento.archivo.tamanoTexto}</span></div></div>
                    )}
                    {archivo ? (
                        <div className="doc-archivo"><Paperclip size={16} />
                            <div><strong>{archivo.name}</strong><span>{formatearTamano(archivo.size)}{editando ? " · reemplaza al actual" : ""}</span></div>
                            <button type="button" className="doc-quitar" onClick={() => setArchivo(null)}>Quitar</button></div>
                    ) : (
                        <label htmlFor="doc-archivo" className={`doc-zona ${arrastrando ? "arrastrando" : ""}`}
                            onDragOver={(e) => { e.preventDefault(); setArrastrando(true); }} onDragLeave={() => setArrastrando(false)}
                            onDrop={(e) => { e.preventDefault(); setArrastrando(false); recibir(e.dataTransfer.files?.[0]); }}>
                            <UploadCloud size={22} />
                            <span><strong>{editando ? "Elegir un archivo nuevo para reemplazarlo" : "Elegí un archivo"}</strong> o arrastralo acá</span>
                            <small>PDF, imagen, Word o Excel. Máximo 10 MB.</small>
                            <input id="doc-archivo" type="file" accept={EXTENSIONES_ACEPTADAS} onChange={(e) => { recibir(e.target.files?.[0]); e.target.value = ""; }} />
                        </label>
                    )}
                </div>

                <div className="doc-campo">
                    <label htmlFor="doc-nombre">Nombre</label>
                    <input id="doc-nombre" value={nombre} maxLength={120} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Reglamento de Copropiedad" />
                </div>
                <div className="doc-campo">
                    <label htmlFor="doc-descripcion">Descripción (opcional) <span className="doc-contador">{descripcion.length}/300</span></label>
                    <input id="doc-descripcion" value={descripcion} maxLength={300} onChange={(e) => setDescripcion(e.target.value)} placeholder="Ej: Normas y reglamentos del edificio" />
                </div>

                <div className="doc-grilla">
                    <div className="doc-campo">
                        <label htmlFor="doc-categoria">Categoría</label>
                        <select id="doc-categoria" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                            {categorias.map((c) => <option key={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="doc-campo">
                        <label htmlFor="doc-audiencia">Quién lo ve</label>
                        <select id="doc-audiencia" value={audiencia} onChange={(e) => setAudiencia(e.target.value)}>
                            {AUDIENCIAS.map((a) => <option key={a.valor} value={a.valor}>{a.texto}</option>)}
                        </select>
                    </div>
                </div>

                {!editando && edificios.length > 1 && (
                    <div className="doc-campo">
                        <label htmlFor="doc-edificio">Edificio</label>
                        <select id="doc-edificio" value={edificioId} onChange={(e) => setEdificioId(Number(e.target.value))}>
                            {edificios.map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                        </select>
                    </div>
                )}
                {error && <p className="doc-aviso doc-aviso-error" role="alert"><AlertCircle size={15} /><span>{error}</span></p>}
            </form>
        </Modal>
    );
}

/* ---------- Detalle + vista previa ---------- */
function ModalDetalle({ documento: d, onClose, onEditar, onBorrar, onError }) {
    const [url, setUrl] = useState("");
    const [cargando, setCargando] = useState(d.archivo.previsualizable);
    const esImagen = (d.archivo.tipo ?? "").startsWith("image/");

    useEffect(() => {
        if (!d.archivo.previsualizable) return undefined;
        let vigente = true;
        urlArchivo(d).then((u) => vigente && setUrl(u)).catch((e) => vigente && onError(e.message)).finally(() => vigente && setCargando(false));
        return () => { vigente = false; };
    }, [d, onError]);

    return (
        <Modal titulo="Detalle del documento" onClose={onClose} ancho={680}
            pie={<>
                <button type="button" className="modal-boton contorno-peligro" onClick={onBorrar}><Trash size={14} /> Borrar</button>
                <button type="button" className="modal-boton" onClick={onEditar}><Pencil size={14} /> Editar</button>
                <button type="button" className="modal-boton principal" onClick={() => descargarArchivo(d).catch((e) => onError(e.message))}><Download size={14} /> Descargar</button>
            </>}>
            <div className="doc-cabecera">
                <div><h3>{d.nombre}</h3>{d.descripcion && <span>{d.descripcion}</span>}</div>
                <Badge categoria={d.categoria} />
            </div>
            <Fila etiqueta="Quién lo ve">{d.audiencia}</Fila>
            <Fila etiqueta="Edificio">{d.edificio}</Fila>
            <Fila etiqueta="Publicado">{d.fecha} · {d.autor}</Fila>
            {d.actualizado && <Fila etiqueta="Última actualización">{d.actualizado}</Fila>}
            <Fila etiqueta="Archivo">{d.archivo.nombre} ({d.archivo.formato} · {d.archivo.tamanoTexto})</Fila>

            <h4 className="doc-titulo-seccion">Vista previa</h4>
            {!d.archivo.previsualizable ? (
                <p className="doc-sin-previa">Los archivos de {d.archivo.formato} no se pueden previsualizar. Descargalo para abrirlo.</p>
            ) : cargando ? <p className="doc-sin-previa">Cargando vista previa...</p> : url ? (
                esImagen ? <img className="doc-previa-img" src={url} alt={`Vista previa de ${d.nombre}`} />
                    : <iframe className="doc-previa-pdf" src={url} title={`Vista previa de ${d.nombre}`} />
            ) : <p className="doc-sin-previa">No pudimos cargar la vista previa.</p>}
        </Modal>
    );
}

/* ---------- Pantalla ---------- */
function Documentos() {
    const [datos, setDatos] = useState(null);
    const [error, setError] = useState("");
    const [vista, setVista] = useState(null); // { tipo: "detalle"|"form"|"borrar", id? }
    const [avisoObj, setAvisoObj] = useState(null);
    const [ocupado, setOcupado] = useState(false);
    const aviso = avisoObj?.texto;
    const setAviso = useCallback((texto, esError = false) => setAvisoObj(texto ? { texto, esError } : null), []);

    const cargar = useCallback(async () => {
        try { setDatos(await obtenerDocumentosAdmin()); setError(""); } catch (e) { setError(e.message); }
    }, []);
    useEffect(() => { document.title = "Habita | Documentos"; cargar(); }, [cargar]);
    useEffect(() => {
        if (!aviso) return undefined;
        const t = setTimeout(() => setAviso(""), 3500);
        return () => clearTimeout(t);
    }, [aviso, setAviso]);

    const documentos = datos?.documentos ?? [];
    const edificios = datos?.edificios ?? [];
    const seleccionado = vista?.id ? documentos.find((d) => d.id === vista.id) ?? null : null;

    const resumen = useMemo(() => ({
        total: documentos.length,
        mes: documentos.filter((d) => d.mesClave === datos?.mesActual).length,
        bytes: documentos.reduce((s, d) => s + d.archivo.tamano, 0),
        restringidos: documentos.filter((d) => d.audienciaClave !== "TODOS").length,
    }), [documentos, datos]);

    const filtros = useMemo(() => [
        { key: "categoria", label: "Todas las categorías", options: [...new Set([...CATEGORIAS, ...documentos.map((d) => d.categoria)])] },
        { key: "periodo", label: "Todos los períodos", options: obtenerOpcionesPeriodo(documentos, "periodo") },
    ], [documentos]);

    const columnas = useMemo(() => [
        { clave: "nombre", titulo: "Nombre", ancho: "1.5fr", render: (d) => (
            <span className="documentos-nombre-celda"><span className="documentos-nombre-texto"><strong>{d.nombre}</strong><small>{d.descripcion || d.archivo.nombre}</small></span></span>) },
        { clave: "audiencia", titulo: "Audiencia", ancho: "0.9fr" },
        { clave: "categoria", titulo: "Categoría", ancho: "1fr", render: (d) => <Badge categoria={d.categoria} /> },
        { clave: "archivo", titulo: "Archivo", ancho: "0.7fr", clase: "documentos-tamano", render: (d) => `${d.archivo.formato} · ${d.archivo.tamanoTexto}` },
        { clave: "fecha", titulo: "Fecha de publicación", ancho: "0.8fr", clase: "documentos-fecha" },
    ], []);

    const opciones = useMemo(() => [
        { label: "Vista previa", icon: Eye, onClick: (d) => setVista({ tipo: "detalle", id: d.id }) },
        { label: "Editar", icon: Pencil, onClick: (d) => setVista({ tipo: "form", id: d.id }) },
        { label: "Descargar", icon: Download, onClick: (d) => descargarArchivo(d).catch((e) => setAviso(e.message, true)) },
        { label: "Borrar", icon: Trash, onClick: (d) => setVista({ tipo: "borrar", id: d.id }) },
    ], [setAviso]);

    async function tras(mensaje) { await cargar(); setVista(null); setAviso(mensaje); }
    async function borrar() {
        setOcupado(true);
        try { await eliminarDocumento(seleccionado.id); await tras("Documento borrado."); }
        catch (e) { setAviso(e.message, true); } finally { setOcupado(false); }
    }

    if (error && !datos) {
        return (
            <main className="documentos pagina-administrador">
                <div className="doc-vacio"><AlertCircle size={28} /><h2>{error}</h2>
                    <button type="button" className="modal-boton principal" onClick={cargar}><RefreshCw size={13} /> Reintentar</button></div>
            </main>
        );
    }
    if (!datos) return <main className="documentos pagina-administrador"><p className="doc-cargando">Cargando documentos...</p></main>;

    return (
        <main className="documentos pagina-administrador">
            <section className="documentos-resumen">
                <TarjetaResumen icono={<FileText />} titulo="Documentos" valor={resumen.total} contenido={<span>Publicados en total</span>} />
                <TarjetaResumen icono={<CalendarPlus />} titulo="Subidos este mes" valor={resumen.mes} contenido={<span>Nuevos documentos</span>} />
                <TarjetaResumen icono={<HardDrive />} titulo="Espacio usado" valor={formatearTamano(resumen.bytes) || "0 KB"} contenido={<span>Archivos guardados</span>} />
                <TarjetaResumen icono={<Lock />} titulo="Con audiencia limitada" valor={resumen.restringidos} contenido={<span>Solo propietarios o inquilinos</span>} />
            </section>

            <Navegador data={documentos} searchKey="busqueda" searchPlaceholder="Buscar documento..." filters={filtros}
                onNew={() => setVista({ tipo: "form" })} newButtonText="Subir documento">
                {(filtrados) => (
                    <Tabla columnas={columnas} datos={filtrados} etiqueta="documentos" className="documentos-tabla"
                        onFilaClick={(d) => setVista({ tipo: "detalle", id: d.id })} mostrarAcciones opcionesAcciones={opciones} />
                )}
            </Navegador>
            {documentos.length === 0 && <p className="doc-vacio-texto">Todavía no subiste documentos. Usá “Subir documento” para compartir el primero con los residentes.</p>}

            {vista?.tipo === "detalle" && seleccionado && (
                <ModalDetalle documento={seleccionado} onClose={() => setVista(null)} onError={(m) => setAviso(m, true)}
                    onEditar={() => setVista({ tipo: "form", id: seleccionado.id })} onBorrar={() => setVista({ tipo: "borrar", id: seleccionado.id })} />
            )}
            {vista?.tipo === "form" && (
                <ModalFormulario key={vista.id ?? "nuevo"} documento={seleccionado} edificios={edificios}
                    onClose={() => setVista(vista.id ? { tipo: "detalle", id: vista.id } : null)} onGuardado={tras} />
            )}
            {vista?.tipo === "borrar" && seleccionado && (
                <Modal titulo="Borrar documento" onClose={() => setVista(null)} ancho={460}
                    pie={<>
                        <button type="button" className="modal-boton" onClick={() => setVista(null)} disabled={ocupado}>Cancelar</button>
                        <button type="button" className="modal-boton peligro" onClick={borrar} disabled={ocupado}>{ocupado ? "Borrando..." : "Borrar"}</button>
                    </>}>
                    <p className="doc-texto">¿Seguro que querés borrar <strong>{seleccionado.nombre}</strong>? Los residentes dejarán de verlo y no se puede deshacer.</p>
                </Modal>
            )}

            {aviso && <p className={`doc-aviso ${avisoObj.esError ? "doc-aviso-error" : "doc-aviso-ok"} doc-aviso-flotante`} role="status">{avisoObj.esError ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}<span>{aviso}</span></p>}
        </main>
    );
}

export default Documentos;
