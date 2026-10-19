import { useCallback, useEffect, useMemo, useState } from "react";
import { Calendar, Clock, CheckCircle2, XCircle, ChevronRight, AlertCircle, RefreshCw, Phone, Check, X, Download } from "lucide-react";

import "./Reservas.css";
import Panel from "../../../components/Panel/Panel";
import TarjetaResumen from "../../../components/TarjetaResumen/TarjetaResumen";
import Tabla from "../../../components/Tabla/Tabla";
import Navegador from "../../../components/Navegador/Navegador";
import Modal from "../../../components/Modal/Modal";
import { obtenerOpcionesPeriodo } from "../../../utils/periodos";
import {
    ESTADOS, obtenerReservasAdmin, resolverReserva, reservasQueSePisan, mesesDisponibles, nombreDeMes,
    estadisticasDelMes, reservasACsv, descargarCsv,
} from "../../../services/reservasAdminService";

const CLASE = { Confirmada: "confirmada", Pendiente: "pendiente", Cancelada: "cancelada", Rechazada: "rechazada", Finalizada: "finalizada", Vencida: "finalizada" };
const Badge = ({ estado }) => <span className={`reservas-badge reservas-badge-${CLASE[estado] ?? "finalizada"}`}>{estado}</span>;
const Fila = ({ etiqueta, children }) => <div className="rsv-fila"><span>{etiqueta}</span><strong>{children}</strong></div>;

/* ---------- Detalle + aceptar / rechazar / cancelar ---------- */
function ModalReserva({ reserva: r, todas, onClose, onResuelta }) {
    const [paso, setPaso] = useState(null); // null | "rechazar" | "cancelar"
    const [motivo, setMotivo] = useState("");
    const [error, setError] = useState("");
    const [ocupado, setOcupado] = useState(false);

    const cruces = useMemo(() => reservasQueSePisan(r, todas), [r, todas]);
    const confirmadas = cruces.filter((o) => o.estado === "Confirmada" || o.estado === "Finalizada");
    const competidoras = cruces.filter((o) => o.estado === "Pendiente");

    async function ejecutar(accion, mensaje) {
        setOcupado(true); setError("");
        try {
            await resolverReserva({ id: r.id, accion, motivo });
            await onResuelta(mensaje);
        } catch (e) { setError(e.message); setOcupado(false); }
    }

    let pie;
    if (paso) {
        const rechazar = paso === "rechazar";
        pie = (
            <>
                <button type="button" className="modal-boton" onClick={() => { setPaso(null); setError(""); }} disabled={ocupado}>Volver</button>
                <button type="button" className="modal-boton peligro" disabled={ocupado || (rechazar && motivo.trim().length < 3)}
                    onClick={() => ejecutar(rechazar ? "RECHAZAR" : "CANCELAR", rechazar ? "Solicitud rechazada." : "Reserva cancelada.")}>
                    {ocupado ? "Guardando..." : rechazar ? "Rechazar solicitud" : "Cancelar reserva"}
                </button>
            </>
        );
    } else if (r.accionable) {
        pie = (
            <>
                <button type="button" className="modal-boton" onClick={onClose}>Cerrar</button>
                <button type="button" className="modal-boton contorno-peligro" onClick={() => setPaso("rechazar")}><X size={14} /> Rechazar</button>
                <button type="button" className="modal-boton principal" disabled={ocupado || confirmadas.length > 0} onClick={() => ejecutar("CONFIRMAR", "Reserva aceptada.")}>
                    <Check size={14} /> {ocupado ? "Guardando..." : "Aceptar"}
                </button>
            </>
        );
    } else if (r.cancelable) {
        pie = (
            <>
                <button type="button" className="modal-boton" onClick={onClose}>Cerrar</button>
                <button type="button" className="modal-boton contorno-peligro" onClick={() => setPaso("cancelar")}>Cancelar reserva</button>
            </>
        );
    } else {
        pie = <button type="button" className="modal-boton" onClick={onClose}>Cerrar</button>;
    }

    return (
        <Modal titulo="Detalle de la reserva" onClose={onClose} ancho={560} pie={pie}>
            <div className="rsv-cabecera">
                <div><h3>{r.espacio}</h3><span>Reserva N° {r.numero}</span></div>
                <Badge estado={r.estado} />
            </div>
            <Fila etiqueta="Ubicación">{r.ubicacion || "--"}</Fila>
            <Fila etiqueta="Solicitado por">{r.residente}</Fila>
            {r.telefono && <Fila etiqueta="Teléfono"><Phone size={12} /> {r.telefono}</Fila>}
            <Fila etiqueta="Unidad">{r.unidad}{r.piso ? ` (piso ${r.piso})` : ""} · {r.edificio}</Fila>
            <Fila etiqueta="Fecha"><span className="rsv-capital">{r.diaSemana}</span> {r.fecha}</Fila>
            <Fila etiqueta="Horario">{r.horario} ({r.horas.toLocaleString("es-AR")} h)</Fila>
            {r.asunto && <Fila etiqueta="Motivo / asunto">{r.asunto}</Fila>}
            <Fila etiqueta="Solicitada el">{r.creada}</Fila>

            {r.motivo && <p className="rsv-nota rsv-nota-info"><strong>{r.estado === "Rechazada" ? "Motivo del rechazo:" : "Motivo:"}</strong> {r.motivo}</p>}

            {r.accionable && confirmadas.length > 0 && (
                <p className="rsv-nota rsv-nota-error"><AlertCircle size={15} /><span>No se puede aceptar: ese horario ya está confirmado para {confirmadas.map((o) => `${o.residente} (${o.unidad}, ${o.horario})`).join(", ")}.</span></p>
            )}
            {r.accionable && competidoras.length > 0 && (
                <p className="rsv-nota rsv-nota-aviso"><AlertCircle size={15} /><span>Hay {competidoras.length === 1 ? "otra solicitud pendiente" : `${competidoras.length} solicitudes pendientes`} para el mismo horario ({competidoras.map((o) => `${o.residente} · ${o.unidad}`).join(", ")}). Al aceptar esta, rechazá las otras.</span></p>
            )}
            {r.estado === "Vencida" && <p className="rsv-nota rsv-nota-aviso"><AlertCircle size={15} /><span>La fecha ya pasó sin que se resolviera la solicitud.</span></p>}

            {paso && (
                <div className="rsv-motivo">
                    <label htmlFor="rsv-motivo">{paso === "rechazar" ? "Motivo del rechazo (lo ve el residente)" : "Motivo de la cancelación (opcional, lo ve el residente)"}</label>
                    <textarea id="rsv-motivo" rows={3} maxLength={300} value={motivo} onChange={(e) => setMotivo(e.target.value)}
                        placeholder={paso === "rechazar" ? "Ej: El SUM está reservado para una asamblea ese día." : "Ej: Cierre del espacio por mantenimiento."} />
                </div>
            )}
            {error && <p className="rsv-nota rsv-nota-error" role="alert"><AlertCircle size={15} /><span>{error}</span></p>}
        </Modal>
    );
}

/* ---------- Reporte completo ---------- */
function ModalReporte({ reservas, espacios, periodoActual, onClose }) {
    const meses = useMemo(() => mesesDisponibles(reservas, periodoActual), [reservas, periodoActual]);
    const [mes, setMes] = useState(periodoActual);
    const e = useMemo(() => estadisticasDelMes(reservas, espacios, mes), [reservas, espacios, mes]);
    const maxEsp = Math.max(1, ...e.porEspacio.map((x) => x.solicitudes));
    const maxDia = Math.max(1, ...e.porDia.map((x) => x.cantidad));

    return (
        <Modal titulo="Reporte de reservas" onClose={onClose} ancho={720}
            pie={<>
                <button type="button" className="modal-boton" onClick={onClose}>Cerrar</button>
                <button type="button" className="modal-boton principal rsv-boton-icono" disabled={e.total === 0}
                    onClick={() => descargarCsv(`reservas-${mes}.csv`, reservasACsv(e.delMes))}><Download size={14} /> Descargar CSV</button>
            </>}>
            <div className="rsv-reporte-cab">
                <label htmlFor="rsv-mes">Mes</label>
                <select id="rsv-mes" value={mes} onChange={(ev) => setMes(ev.target.value)}>
                    {meses.map((m) => <option key={m.clave} value={m.clave}>{m.nombre}</option>)}
                </select>
            </div>

            <div className="rsv-kpis">
                <div><strong>{e.total}</strong><span>Solicitudes</span></div>
                <div><strong>{e.confirmadas}</strong><span>Aprobadas</span></div>
                <div><strong>{e.rechazadas}</strong><span>Rechazadas</span></div>
                <div><strong>{e.canceladas}</strong><span>Canceladas</span></div>
                <div><strong>{e.aprobacion === null ? "--" : `${e.aprobacion}%`}</strong><span>Tasa de aprobación</span></div>
                <div><strong>{e.horasReservadas.toLocaleString("es-AR")} h</strong><span>Horas reservadas</span></div>
            </div>

            {e.total === 0 ? <p className="rsv-vacio-texto">No hubo reservas en {e.nombre}.</p> : (
                <>
                    <h4 className="rsv-titulo-seccion">Por espacio</h4>
                    <table className="rsv-tabla-reporte">
                        <thead><tr><th>Espacio</th><th>Solicitudes</th><th>Aprobadas</th><th>Horas</th><th>Ocupación</th></tr></thead>
                        <tbody>
                            {e.porEspacio.map((x) => (
                                <tr key={x.id}>
                                    <td>{x.nombre}</td>
                                    <td><div className="rsv-barra-celda"><div className="rsv-barra"><div style={{ width: `${(x.solicitudes / maxEsp) * 100}%` }} /></div><span>{x.solicitudes}</span></div></td>
                                    <td>{x.aprobadas}</td>
                                    <td>{x.horas.toLocaleString("es-AR")}</td>
                                    <td>{x.ocupacion}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="rsv-doble">
                        <div>
                            <h4 className="rsv-titulo-seccion">Por día de la semana</h4>
                            <div className="rsv-dias">
                                {e.porDia.map((d) => (
                                    <div key={d.dia} className="rsv-dia">
                                        <span className="rsv-dia-valor">{d.cantidad}</span>
                                        <div className="rsv-dia-barra"><div style={{ height: `${(d.cantidad / maxDia) * 100}%` }} /></div>
                                        <span>{d.dia}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h4 className="rsv-titulo-seccion">Unidades que más reservan</h4>
                            <ol className="rsv-top">
                                {e.topUnidades.map((u) => <li key={`${u.unidad}${u.residente}`}><span>{u.unidad} · {u.residente}</span><strong>{u.cantidad}</strong></li>)}
                            </ol>
                        </div>
                    </div>
                </>
            )}
        </Modal>
    );
}

/* ---------- Pantalla ---------- */
function Reservas() {
    const [datos, setDatos] = useState(null);
    const [error, setError] = useState("");
    const [vista, setVista] = useState(null); // { tipo: "detalle", id } | { tipo: "reporte" }
    const [aviso, setAviso] = useState("");

    const cargar = useCallback(async () => {
        try { setDatos(await obtenerReservasAdmin()); setError(""); } catch (e) { setError(e.message); }
    }, []);
    useEffect(() => { document.title = "Habita | Reservas"; cargar(); }, [cargar]);
    useEffect(() => {
        if (!aviso) return undefined;
        const t = setTimeout(() => setAviso(""), 3500);
        return () => clearTimeout(t);
    }, [aviso]);

    const reservas = datos?.reservas ?? [];
    const espacios = datos?.espacios ?? [];

    const actual = useMemo(() => (datos ? estadisticasDelMes(reservas, espacios, datos.periodoActual) : null), [datos, reservas, espacios]);
    const anterior = useMemo(() => {
        if (!datos) return null;
        const [a, m] = datos.periodoActual.split("-").map(Number);
        const d = new Date(Date.UTC(a, m - 2, 1));
        return estadisticasDelMes(reservas, espacios, `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`);
    }, [datos, reservas, espacios]);

    const filtros = useMemo(() => [
        { key: "periodoFecha", label: "Todos los períodos", options: obtenerOpcionesPeriodo(reservas) },
        { key: "estado", label: "Todos los estados", options: ESTADOS },
        { key: "espacio", label: "Todos los espacios", options: espacios.map((e) => e.nombre) },
    ], [reservas, espacios]);

    const columnas = useMemo(() => [
        { clave: "creada", titulo: "Solicitada el", ancho: "0.8fr", clase: "reservas-creada" },
        { clave: "espacio", titulo: "Espacio", ancho: "1fr", render: (r) => <span className="reservas-espacio-celda"><strong>{r.espacio}</strong><small>{r.ubicacion}</small></span> },
        { clave: "fecha", titulo: "Fecha y hora", ancho: "1fr", render: (r) => <span className="reservas-fecha-celda"><span>{r.fecha}<small>{r.horario}</small></span></span> },
        { clave: "residente", titulo: "Residente", ancho: "1fr" },
        { clave: "unidad", titulo: "Unidad", ancho: "0.6fr" },
        { clave: "estado", titulo: "Estado", ancho: "0.9fr", render: (r) => <Badge estado={r.estado} /> },
    ], []);

    if (error && !datos) {
        return (
            <main className="reservas">
                <div className="rsv-vacio"><AlertCircle size={28} /><h2>{error}</h2>
                    <button type="button" className="modal-boton principal" onClick={cargar}><RefreshCw size={13} /> Reintentar</button></div>
            </main>
        );
    }
    if (!datos) return <main className="reservas"><p className="rsv-cargando">Cargando reservas...</p></main>;

    const seleccionada = vista?.tipo === "detalle" ? reservas.find((r) => r.id === vista.id) ?? null : null;
    const pendientesTotal = reservas.filter((r) => r.accionable).length;
    const tendencia = anterior.total
        ? (() => { const p = Math.round(((actual.total - anterior.total) / anterior.total) * 100); return `${p >= 0 ? "↑" : "↓"} ${p >= 0 ? "+" : ""}${p}% vs. mes anterior`; })()
        : "Sin datos del mes anterior";
    const maxEsp = Math.max(1, ...actual.porEspacio.map((e) => e.solicitudes));

    return (
        <main className="reservas">
            <section className="reservas-resumen">
                <TarjetaResumen icono={<Calendar />} titulo="Reservas este mes" valor={actual.total} contenido={<span className="reservas-tendencia">{tendencia}</span>} />
                <TarjetaResumen icono={<Clock />} titulo="Pendientes" valor={pendientesTotal} contenido={<span>Por confirmar</span>} />
                <TarjetaResumen icono={<CheckCircle2 />} titulo="Confirmadas" valor={actual.confirmadas} contenido={<span>Este mes</span>} />
                <TarjetaResumen icono={<XCircle />} titulo="Canceladas" valor={actual.canceladas} contenido={<span>{actual.rechazadas} rechazadas este mes</span>} />
            </section>

            <Navegador data={reservas} searchKey="busqueda" searchPlaceholder="Buscar espacio, residente o unidad..." filters={filtros}>
                {(filtradas) => (
                    <Tabla columnas={columnas} datos={filtradas} etiqueta="reservas" className="reservas-tabla" onFilaClick={(r) => setVista({ tipo: "detalle", id: r.id })} />
                )}
            </Navegador>

            <Panel className="reservas-espacios" titulo={`Espacios más reservados · ${actual.nombre}`}>
                {actual.total === 0 ? <p className="rsv-vacio-texto">Todavía no hay reservas este mes.</p> : (
                    <div className="reservas-espacios-lista">
                        {actual.porEspacio.filter((e) => e.solicitudes > 0).map((e) => (
                            <div key={e.id} className="reservas-espacio-fila">
                                <div className="reservas-espacio-texto"><span>{e.nombre}</span><strong>{e.solicitudes}</strong></div>
                                <div className="rsv-barra"><div style={{ width: `${(e.solicitudes / maxEsp) * 100}%` }} /></div>
                            </div>
                        ))}
                    </div>
                )}
                <button type="button" className="reservas-ver-reporte" onClick={() => setVista({ tipo: "reporte" })}>Ver reporte completo <ChevronRight size={14} /></button>
            </Panel>

            {seleccionada && (
                <ModalReserva key={seleccionada.id} reserva={seleccionada} todas={reservas} onClose={() => setVista(null)}
                    onResuelta={async (m) => { await cargar(); setVista(null); setAviso(m); }} />
            )}
            {vista?.tipo === "reporte" && <ModalReporte reservas={reservas} espacios={espacios} periodoActual={datos.periodoActual} onClose={() => setVista(null)} />}
            {aviso && <p className="rsv-nota rsv-nota-ok rsv-flotante" role="status"><CheckCircle2 size={16} /><span>{aviso}</span></p>}
        </main>
    );
}

export default Reservas;
