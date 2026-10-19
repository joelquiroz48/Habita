import { useCallback, useEffect, useMemo, useState } from "react";
import {
    ClipboardList, Clock, Settings2, CheckCircle2, Wrench, Sparkles, ArrowUpDown, Lightbulb,
    MoreHorizontal, Image, Eye, AlertCircle, RefreshCw, ShieldAlert, Users, Phone,
} from "lucide-react";

import "./Reclamos.css";
import Panel from "../../../components/Panel/Panel";
import TarjetaResumen from "../../../components/TarjetaResumen/TarjetaResumen";
import Tabla from "../../../components/Tabla/Tabla";
import Navegador from "../../../components/Navegador/Navegador";
import Modal from "../../../components/Modal/Modal";
import { obtenerOpcionesPeriodo } from "../../../utils/periodos";
import { ESTADOS, obtenerReclamosAdmin, actualizarReclamo, urlAdjunto } from "../../../services/reclamosAdminService";

const CATEGORIAS = ["Mantenimiento", "Limpieza", "Ascensores", "Iluminación", "Seguridad", "Espacios comunes", "Otros"];
const CAT_CLASE = {
    "Mantenimiento": "mantenimiento", "Limpieza": "limpieza", "Ascensores": "ascensores", "Iluminación": "iluminacion",
    "Espacios comunes": "comunes", "Seguridad": "seguridad", "Otros": "otros",
};
const CAT_ICONO = {
    "Mantenimiento": Wrench, "Limpieza": Sparkles, "Ascensores": ArrowUpDown, "Iluminación": Lightbulb,
    "Espacios comunes": Users, "Seguridad": ShieldAlert, "Otros": MoreHorizontal,
};
const ESTADO_CLASE = { "Pendiente": "pendiente", "En proceso": "proceso", "Resuelto": "resuelto" };

const claseCategoria = (c) => `reclamos-cat-${CAT_CLASE[c] ?? "otros"}`;

function BadgeEstado({ estado }) {
    return <span className={`reclamos-badge reclamos-badge-${ESTADO_CLASE[estado] ?? "pendiente"}`}>{estado}</span>;
}
function BadgeCategoria({ categoria }) {
    return <span className={`reclamos-cat-badge ${claseCategoria(categoria)}`}>{categoria}</span>;
}

/* ---------- Gráfico de dona (SVG propio, sin librerías) ---------- */
const COLOR_ESTADO = { "Pendiente": "var(--reclamos-color-pendiente)", "En proceso": "var(--reclamos-color-proceso)", "Resuelto": "var(--reclamos-color-resuelto)" };

function Dona({ partes, total }) {
    const R = 54, C = 2 * Math.PI * R;
    let acumulado = 0;
    return (
        <svg className="reclamos-dona" viewBox="0 0 140 140" role="img" aria-label={`${total} reclamos por estado`}>
            <circle cx="70" cy="70" r={R} fill="none" stroke="var(--borde-input)" strokeWidth="18" />
            {total > 0 && partes.filter((p) => p.cantidad > 0).map((p) => {
                const largo = (p.cantidad / total) * C;
                const trozo = (
                    <circle key={p.estado} cx="70" cy="70" r={R} fill="none" stroke={COLOR_ESTADO[p.estado]} strokeWidth="18"
                        strokeDasharray={`${Math.max(largo - 2, 0)} ${C}`} strokeDashoffset={-acumulado} transform="rotate(-90 70 70)" />
                );
                acumulado += largo;
                return trozo;
            })}
            <text x="70" y="68" textAnchor="middle" className="reclamos-dona-total">{total}</text>
            <text x="70" y="86" textAnchor="middle" className="reclamos-dona-sub">reclamos</text>
        </svg>
    );
}

/* ---------- Modal de detalle + seguimiento + cambio de estado ---------- */
function ModalReclamo({ reclamo, onClose, onGuardado }) {
    const [estado, setEstado] = useState(reclamo.estado);
    const [comentario, setComentario] = useState("");
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState("");

    const sinCambios = estado === reclamo.estado && !comentario.trim();

    async function abrirAdjunto() {
        try { window.open(await urlAdjunto(reclamo.adjunto.ruta), "_blank", "noopener"); }
        catch (e) { setError(e.message); }
    }

    async function guardar(evento) {
        evento.preventDefault();
        setGuardando(true); setError("");
        try {
            await actualizarReclamo({ id: reclamo.id, estado, comentario });
            await onGuardado(estado === reclamo.estado ? "Nota agregada al seguimiento." : `Reclamo marcado como "${estado}".`);
            setComentario("");
        } catch (e) { setError(e.message); }
        finally { setGuardando(false); }
    }

    return (
        <Modal
            titulo="Detalle del reclamo"
            onClose={onClose}
            ancho={640}
            pie={
                <>
                    <button type="button" className="modal-boton" onClick={onClose}>Cerrar</button>
                    <button type="submit" form="form-reclamo" className="modal-boton principal" disabled={guardando || sinCambios}>
                        {guardando ? "Guardando..." : "Guardar cambios"}
                    </button>
                </>
            }
        >
            <div className="rcl-cabecera">
                <h3>{reclamo.asunto}</h3>
                <BadgeEstado estado={reclamo.estado} />
            </div>

            <div className="rcl-fila"><span>Categoría</span><BadgeCategoria categoria={reclamo.categoria} /></div>
            <div className="rcl-fila"><span>Fecha de publicación</span><strong>{reclamo.fechaHora}</strong></div>
            <div className="rcl-fila"><span>Residente</span><strong>{reclamo.residente}</strong></div>
            {reclamo.telefono && <div className="rcl-fila"><span>Teléfono</span><strong><Phone size={12} /> {reclamo.telefono}</strong></div>}
            <div className="rcl-fila"><span>Unidad</span><strong>{reclamo.unidad}{reclamo.piso ? ` (piso ${reclamo.piso})` : ""} · {reclamo.edificio}</strong></div>

            <h4 className="rcl-titulo-seccion">Descripción</h4>
            <p className="rcl-texto">{reclamo.descripcion}</p>

            <h4 className="rcl-titulo-seccion">Adjuntos</h4>
            {reclamo.adjunto ? (
                <div className="reclamos-adjunto">
                    <Image size={16} />
                    <div className="reclamos-adjunto-info">
                        <strong>{reclamo.adjunto.nombre}</strong>
                        <span>Tamaño - {reclamo.adjunto.tamano}</span>
                    </div>
                    <button type="button" aria-label="Abrir adjunto" onClick={abrirAdjunto}><Eye size={16} /></button>
                </div>
            ) : <p className="reclamos-sin-adjunto">Sin archivos adjuntos.</p>}

            <h4 className="rcl-titulo-seccion">Seguimiento</h4>
            <ol className="rcl-linea">
                {[...reclamo.seguimiento].reverse().map((s) => (
                    <li key={s.id} className={`rcl-hito rcl-hito-${s.tipo === "alta" || s.tipo === "nota" ? s.tipo : ESTADO_CLASE[s.tipo]}`}>
                        <div className="rcl-hito-titulo"><strong>{s.titulo}</strong><span>{s.fecha}</span></div>
                        {s.detalle && <p>{s.detalle}</p>}
                        {s.autor && <small>{s.autor}</small>}
                    </li>
                ))}
            </ol>

            <form id="form-reclamo" className="rcl-form" onSubmit={guardar}>
                <h4 className="rcl-titulo-seccion">Actualizar reclamo</h4>
                <div className="rcl-estados" role="radiogroup" aria-label="Estado del reclamo">
                    {ESTADOS.map((e) => (
                        <button key={e.visible} type="button" role="radio" aria-checked={estado === e.visible}
                            className={`rcl-estado rcl-estado-${ESTADO_CLASE[e.visible]} ${estado === e.visible ? "activo" : ""}`}
                            onClick={() => setEstado(e.visible)} title={e.ayuda}>
                            {e.visible}
                        </button>
                    ))}
                </div>
                <label htmlFor="rcl-comentario" className="rcl-label">Comentario para el seguimiento (opcional)</label>
                <textarea id="rcl-comentario" rows={3} maxLength={500} value={comentario} onChange={(e) => setComentario(e.target.value)}
                    placeholder="Ej: Ya avisamos al plomero, viene mañana." />
                {error && <p className="rcl-aviso rcl-aviso-error"><AlertCircle size={15} /><span>{error}</span></p>}
            </form>
        </Modal>
    );
}

/* ---------- Pantalla ---------- */
function Reclamos() {
    const [datos, setDatos] = useState(null);
    const [error, setError] = useState("");
    const [abierto, setAbierto] = useState(null);
    const [aviso, setAviso] = useState("");

    const cargar = useCallback(async () => {
        try { setDatos(await obtenerReclamosAdmin()); setError(""); }
        catch (e) { setError(e.message); }
    }, []);

    useEffect(() => { document.title = "Habita | Reclamos"; cargar(); }, [cargar]);
    useEffect(() => {
        if (!aviso) return undefined;
        const t = setTimeout(() => setAviso(""), 3500);
        return () => clearTimeout(t);
    }, [aviso]);

    const reclamos = datos?.reclamos ?? [];
    const hayVarios = (datos?.edificios.length ?? 0) > 1;

    const resumen = useMemo(() => {
        const cuenta = (e) => reclamos.filter((r) => r.estado === e).length;
        const delMes = reclamos.filter((r) => r.mesClave === datos?.periodoActual).length;
        const categorias = CATEGORIAS.map((c) => ({ nombre: c, cantidad: reclamos.filter((r) => r.categoria === c).length }))
            .filter((c) => c.cantidad > 0).sort((a, b) => b.cantidad - a.cantidad);
        return { total: reclamos.length, delMes, pendientes: cuenta("Pendiente"), proceso: cuenta("En proceso"), resueltos: cuenta("Resuelto"), categorias };
    }, [reclamos, datos]);

    const filtros = useMemo(() => [
        ...(hayVarios ? [{ key: "edificio", label: "Todos los edificios", options: datos.edificios.map((e) => e.nombre) }] : []),
        { key: "categoria", label: "Todas las categorías", options: CATEGORIAS },
        { key: "estado", label: "Todos los estados", options: ESTADOS.map((e) => e.visible) },
        { key: "periodoFecha", label: "Todos los períodos", options: obtenerOpcionesPeriodo(reclamos) },
    ], [reclamos, hayVarios, datos]);

    const columnas = useMemo(() => [
        { clave: "asunto", titulo: "Asunto", ancho: "1.3fr", clase: "reclamos-asunto" },
        { clave: "residente", titulo: "Residente", ancho: "1fr", clase: "reclamos-residente" },
        { clave: "unidad", titulo: "Unidad", ancho: "0.6fr" },
        { clave: "categoria", titulo: "Categoría", ancho: "1.1fr", render: (r) => <BadgeCategoria categoria={r.categoria} /> },
        { clave: "estado", titulo: "Estado", ancho: "1fr", render: (r) => <BadgeEstado estado={r.estado} /> },
        { clave: "fecha", titulo: "Fecha", ancho: "0.8fr" },
    ], []);

    if (error && !datos) {
        return (
            <main className="reclamos">
                <div className="reclamos-vacio">
                    <AlertCircle size={28} /><h2>{error}</h2>
                    <button type="button" className="modal-boton principal" onClick={cargar}><RefreshCw size={13} /> Reintentar</button>
                </div>
            </main>
        );
    }
    if (!datos) return <main className="reclamos"><p className="reclamos-cargando">Cargando reclamos...</p></main>;

    const seleccionado = reclamos.find((r) => r.id === abierto) ?? null;
    const partesDona = [
        { estado: "Pendiente", cantidad: resumen.pendientes },
        { estado: "En proceso", cantidad: resumen.proceso },
        { estado: "Resuelto", cantidad: resumen.resueltos },
    ];
    const maxCat = Math.max(1, ...resumen.categorias.map((c) => c.cantidad));
    const pct = (n) => (resumen.total ? Math.round((n / resumen.total) * 100) : 0);

    return (
        <main className="reclamos">
            <section className="reclamos-resumen">
                <TarjetaResumen icono={<ClipboardList />} titulo="Total de reclamos" valor={resumen.total} contenido={<span>{resumen.delMes} este mes</span>} />
                <TarjetaResumen icono={<Clock />} titulo="Pendientes" valor={resumen.pendientes} contenido={<span>Esperando respuesta</span>} />
                <TarjetaResumen icono={<Settings2 />} titulo="En proceso" valor={resumen.proceso} contenido={<span>En tratamiento</span>} />
                <TarjetaResumen icono={<CheckCircle2 />} titulo="Resueltos" valor={resumen.resueltos} contenido={<span>Solucionados</span>} />
            </section>

            <Navegador data={reclamos} searchKey="busqueda" searchPlaceholder="Buscar reclamo, residente o unidad..." filters={filtros}>
                {(filtrados) => (
                    <Tabla columnas={columnas} datos={filtrados} etiqueta="reclamos" className="reclamos-tabla" onFilaClick={(r) => setAbierto(r.id)} />
                )}
            </Navegador>

            <Panel className="reclamos-resumen-panel" titulo="Resumen de reclamos">
                {resumen.total === 0 ? (
                    <p className="reclamos-sin-adjunto">Todavía no hay reclamos para mostrar.</p>
                ) : (
                    <div className="reclamos-resumen-contenido">
                        <div className="reclamos-donut-wrap">
                            <Dona partes={partesDona} total={resumen.total} />
                            <ul className="reclamos-donut-leyenda">
                                {partesDona.map((p) => (
                                    <li key={p.estado}>
                                        <span className={`reclamos-leyenda-punto ${ESTADO_CLASE[p.estado]}`} />
                                        <span className="reclamos-leyenda-label">{p.estado}</span>
                                        <span className="reclamos-leyenda-valor">{p.cantidad} ({pct(p.cantidad)}%)</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="reclamos-categorias">
                            <h3>Categorías más frecuentes</h3>
                            <div className="reclamos-categorias-lista">
                                {resumen.categorias.map((c) => {
                                    const Icono = CAT_ICONO[c.nombre];
                                    return (
                                        <div className="reclamos-categoria-fila" key={c.nombre}>
                                            <span className={`reclamos-categoria-icon ${CAT_CLASE[c.nombre]}`}><Icono size={16} /></span>
                                            <div className="reclamos-categoria-barra">
                                                <div className="reclamos-categoria-texto"><span>{c.nombre}</span><strong>{c.cantidad}</strong></div>
                                                <div className="reclamos-barra"><div className={`reclamos-barra-relleno ${CAT_CLASE[c.nombre]}`} style={{ width: `${(c.cantidad / maxCat) * 100}%` }} /></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </Panel>

            {seleccionado && (
                <ModalReclamo
                    key={seleccionado.id}
                    reclamo={seleccionado}
                    onClose={() => setAbierto(null)}
                    onGuardado={async (mensaje) => { await cargar(); setAviso(mensaje); }}
                />
            )}
            {aviso && <p className="rcl-aviso rcl-aviso-ok rcl-aviso-flotante" role="status"><CheckCircle2 size={16} /><span>{aviso}</span></p>}
        </main>
    );
}

export default Reclamos;
