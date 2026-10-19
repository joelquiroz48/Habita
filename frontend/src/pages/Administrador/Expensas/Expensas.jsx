import { useCallback, useEffect, useMemo, useState } from "react";
import { Calendar, DollarSign, Users, PiggyBank, Download, Pencil, Plus, Trash2, ChevronDown, AlertCircle, CheckCircle2, RefreshCw, CalendarClock } from "lucide-react";

import "./Expensas.css";
import TarjetaResumen from "../../../components/TarjetaResumen/TarjetaResumen";
import Tabla from "../../../components/Tabla/Tabla";
import Navegador from "../../../components/Navegador/Navegador";
import Modal from "../../../components/Modal/Modal";
import { formatearMoneda, nombrePeriodo } from "../../../utils/formatos";
import { descargarBoleta } from "../../../utils/boletaPdf";
import {
    obtenerExpensasAdmin,
    expensaParaBoleta,
    editarExpensa,
    editarVencimientoPeriodo,
    generarExpensas,
} from "../../../services/expensasAdminService";

/* ---------- ayudas ---------- */
const CLASE_ESTADO = {
    "En curso": "expensas-badge-curso",
    Cerrada: "expensas-badge-cerrada",
    Pagado: "expensas-residente-pagado",
    Pendiente: "expensas-residente-pendiente",
    "Sin pagar": "expensas-residente-sin-pagar",
};

function Badge({ estado }) {
    return <span className={`expensas-badge ${CLASE_ESTADO[estado]}`}>{estado}</span>;
}

function Fila({ etiqueta, children, clase = "" }) {
    return (
        <div className="eadm-fila">
            <span>{etiqueta}</span>
            <strong className={clase}>{children}</strong>
        </div>
    );
}

function periodoActualYSiguiente() {
    const hoy = new Date();
    const clave = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    return [clave(hoy), clave(new Date(hoy.getFullYear(), hoy.getMonth() + 1, 1))];
}

/* ---------- ventana: detalle del periodo ---------- */
function ModalPeriodo({ periodo: p, hayVarias, onClose, onVencimiento }) {
    const pendiente = p.importeTotal - p.recaudado;
    return (
        <Modal
            titulo={`Detalle de ${p.periodo}`}
            onClose={onClose}
            ancho={720}
            pie={
                <>
                    {pendiente > 0 && (
                        <button type="button" className="modal-boton eadm-izq" onClick={() => onVencimiento(p)}>
                            <CalendarClock size={14} /> Cambiar vencimiento
                        </button>
                    )}
                    <button type="button" className="modal-boton" onClick={onClose}>Cerrar</button>
                    <button
                        type="button"
                        className="modal-boton principal"
                        onClick={() => descargarBoleta(expensaParaBoleta(p, { agregada: true }), { residente: "Todas las unidades" })}
                    >
                        <Download size={14} /> Descargar boleta
                    </button>
                </>
            }
        >
            <div className="eadm-cabecera">
                <div>
                    <h3>{p.periodo}{hayVarias ? ` · ${p.edificio}` : ""}</h3>
                    <span>Vencimiento: <strong>{p.vencimiento}{p.variosVencimientos ? " (la más lejana)" : ""}</strong></span>
                </div>
                <Badge estado={p.estado} />
            </div>

            <div className="eadm-columnas">
                <section>
                    <h4>Resumen</h4>
                    <Fila etiqueta="Importe total">{formatearMoneda(p.importeTotal)}</Fila>
                    <Fila etiqueta="Recaudado">{formatearMoneda(p.recaudado)}</Fila>
                    <Fila etiqueta="Pendiente" clase={pendiente > 0 ? "eadm-naranja" : ""}>{formatearMoneda(pendiente)}</Fila>
                    <Fila etiqueta="Porcentaje recaudado" clase="eadm-verde">{p.porcentaje}%</Fila>
                    <Fila etiqueta="Unidades al día">{p.pagadas} de {p.unidades}</Fila>
                </section>
                <section>
                    <h4>Conceptos <small>(suma de todas las unidades)</small></h4>
                    {p.conceptos.length === 0
                        ? <p className="eadm-vacio">Este período no tiene detalle por concepto.</p>
                        : p.conceptos.map((c) => <Fila key={c.concepto} etiqueta={c.concepto}>{c.montoTexto}</Fila>)}
                </section>
            </div>
        </Modal>
    );
}

/* ---------- ventana: detalle de una boleta (residente) ---------- */
function ModalBoleta({ expensa: e, onClose, onEditar }) {
    return (
        <Modal
            titulo={`Expensa de ${e.nombre}`}
            onClose={onClose}
            ancho={720}
            pie={
                <>
                    <button type="button" className="modal-boton" onClick={onClose}>Cerrar</button>
                    <button type="button" className="modal-boton" onClick={() => descargarBoleta(expensaParaBoleta(e), { residente: e.residentes })}>
                        <Download size={14} /> Descargar boleta
                    </button>
                    <button type="button" className="modal-boton principal" onClick={() => onEditar(e)} disabled={e.pagada} title={e.pagada ? "Una expensa pagada no se puede editar" : ""}>
                        <Pencil size={14} /> Editar boleta
                    </button>
                </>
            }
        >
            <div className="eadm-cabecera">
                <div>
                    <h3>{e.periodo}</h3>
                    <span>Unidad {e.unidad} · {e.edificio}</span>
                </div>
                <Badge estado={e.estado} />
            </div>

            <div className="eadm-columnas">
                <section>
                    <h4>Resumen de expensa</h4>
                    <Fila etiqueta="Residente">{e.nombre}</Fila>
                    <Fila etiqueta="Unidad">{e.unidad}</Fila>
                    <Fila etiqueta="Vencimiento">{e.vencimiento}</Fila>
                    <Fila etiqueta="Importe">{formatearMoneda(e.importe)}</Fila>
                    {e.pagada && <Fila etiqueta="Pagada el">{e.fechaPago}</Fila>}
                    {e.pagada && e.metodoPago && <Fila etiqueta="Medio de pago">{e.metodoPago}</Fila>}
                </section>
                <section>
                    <h4>Conceptos</h4>
                    {e.conceptos.length === 0
                        ? <p className="eadm-vacio">Esta boleta no tiene detalle por concepto. Podés cargarlo con “Editar boleta”.</p>
                        : e.conceptos.map((c, i) => <Fila key={`${c.concepto}-${i}`} etiqueta={c.concepto}>{c.montoTexto}</Fila>)}
                </section>
            </div>
        </Modal>
    );
}

/* ---------- ventana: editar boleta ---------- */
function ModalEditarBoleta({ expensa: e, onClose, onGuardada }) {
    const [filas, setFilas] = useState(
        e.conceptos.length ? e.conceptos.map((c) => ({ concepto: c.concepto, monto: String(c.monto) })) : [{ concepto: "", monto: "" }]
    );
    const [vencimiento, setVencimiento] = useState(e.vencimientoISO);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState("");

    const total = filas.reduce((s, f) => s + (Number(String(f.monto).replace(",", ".")) || 0), 0);
    const completo = filas.length > 0 && filas.every((f) => f.concepto.trim() && f.monto !== "" && Number(String(f.monto).replace(",", ".")) >= 0) && vencimiento;

    const cambiar = (i, campo, valor) => setFilas((fs) => fs.map((f, j) => (j === i ? { ...f, [campo]: valor } : f)));

    async function guardar(ev) {
        ev.preventDefault();
        if (!completo || guardando) return;
        setGuardando(true);
        setError("");
        try {
            await editarExpensa({ id: e.id, conceptos: filas, vencimiento });
            onGuardada(`Actualizamos la boleta de ${e.nombre} (${e.periodo}).`);
        } catch (err) {
            setError(err.message);
        } finally {
            setGuardando(false);
        }
    }

    return (
        <Modal
            titulo={`Editar boleta · ${e.periodo}`}
            onClose={onClose}
            ancho={600}
            pie={
                <>
                    <button type="button" className="modal-boton" onClick={onClose}>Cancelar</button>
                    <button type="submit" form="form-editar-boleta" className="modal-boton principal" disabled={!completo || guardando}>
                        {guardando ? "Guardando..." : "Guardar cambios"}
                    </button>
                </>
            }
        >
            <form id="form-editar-boleta" className="eadm-form" onSubmit={guardar}>
                <p className="eadm-ayuda">Unidad <strong>{e.unidad}</strong> · {e.nombre}. El importe total se calcula solo con la suma de los conceptos.</p>

                <div className="eadm-campo">
                    <label htmlFor="eadm-venc">Vencimiento</label>
                    <input id="eadm-venc" type="date" value={vencimiento} onChange={(ev) => setVencimiento(ev.target.value)} required />
                </div>

                <div className="eadm-conceptos">
                    <div className="eadm-conceptos-titulo"><span>Concepto</span><span>Importe ($)</span><span /></div>
                    {filas.map((f, i) => (
                        <div className="eadm-concepto-fila" key={i}>
                            <input aria-label={`Concepto ${i + 1}`} value={f.concepto} onChange={(ev) => cambiar(i, "concepto", ev.target.value)} placeholder="Ej: Mantenimiento" maxLength={80} />
                            <input aria-label={`Importe ${i + 1}`} type="number" step="0.01" min="0" value={f.monto} onChange={(ev) => cambiar(i, "monto", ev.target.value)} placeholder="0" />
                            <button type="button" className="eadm-quitar" aria-label="Quitar concepto" onClick={() => setFilas((fs) => fs.filter((_, j) => j !== i))} disabled={filas.length === 1}>
                                <Trash2 size={15} />
                            </button>
                        </div>
                    ))}
                    <button type="button" className="eadm-agregar" onClick={() => setFilas((fs) => [...fs, { concepto: "", monto: "" }])}>
                        <Plus size={14} /> Agregar concepto
                    </button>
                </div>

                <div className="eadm-total"><span>Total de la boleta</span><strong>{formatearMoneda(total)}</strong></div>

                {total !== e.importe && (
                    <p className="eadm-aviso eadm-aviso-alerta"><AlertCircle size={16} /><span>El importe cambia de {formatearMoneda(e.importe)} a {formatearMoneda(total)}. El residente verá el valor nuevo y lo pagará con ese monto.</span></p>
                )}
                {error && <p className="eadm-aviso eadm-aviso-error"><AlertCircle size={16} /><span>{error}</span></p>}
            </form>
        </Modal>
    );
}

/* ---------- ventana: cambiar vencimiento del periodo ---------- */
function ModalVencimiento({ periodo: p, onClose, onGuardada }) {
    const [fecha, setFecha] = useState(p.vencimientoISO);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState("");

    async function guardar(ev) {
        ev.preventDefault();
        setGuardando(true);
        setError("");
        try {
            const n = await editarVencimientoPeriodo({ edificioId: p.edificioId, periodo: p.periodoClave, vencimiento: fecha });
            onGuardada(`Cambiamos el vencimiento de ${n} ${n === 1 ? "boleta" : "boletas"} de ${p.periodo}.`);
        } catch (err) {
            setError(err.message);
        } finally {
            setGuardando(false);
        }
    }

    return (
        <Modal
            titulo={`Vencimiento de ${p.periodo}`}
            onClose={onClose}
            ancho={420}
            pie={
                <>
                    <button type="button" className="modal-boton" onClick={onClose}>Cancelar</button>
                    <button type="submit" form="form-vencimiento" className="modal-boton principal" disabled={!fecha || guardando}>
                        {guardando ? "Guardando..." : "Guardar"}
                    </button>
                </>
            }
        >
            <form id="form-vencimiento" className="eadm-form" onSubmit={guardar}>
                <p className="eadm-ayuda">Se aplica a todas las boletas <strong>impagas</strong> de este período. Las ya pagadas no cambian.</p>
                <div className="eadm-campo">
                    <label htmlFor="eadm-venc-per">Nuevo vencimiento</label>
                    <input id="eadm-venc-per" type="date" value={fecha} onChange={(ev) => setFecha(ev.target.value)} required />
                </div>
                {error && <p className="eadm-aviso eadm-aviso-error"><AlertCircle size={16} /><span>{error}</span></p>}
            </form>
        </Modal>
    );
}

/* ---------- ventana: generar expensas ---------- */
function ModalGenerar({ edificios, onClose, onGenerada }) {
    const opciones = periodoActualYSiguiente();
    const [periodo, setPeriodo] = useState(opciones[0]);
    const [trabajando, setTrabajando] = useState(false);
    const [error, setError] = useState("");
    const sinPlantilla = !edificios.some((e) => e.tienePlantilla);

    async function generar(ev) {
        ev.preventDefault();
        setTrabajando(true);
        setError("");
        try {
            const n = await generarExpensas(periodo);
            onGenerada(n === 0 ? `Las expensas de ${nombrePeriodo(periodo)} ya estaban generadas.` : `Generamos ${n} ${n === 1 ? "expensa" : "expensas"} de ${nombrePeriodo(periodo)}.`);
        } catch (err) {
            setError(err.message);
        } finally {
            setTrabajando(false);
        }
    }

    return (
        <Modal
            titulo="Generar expensas"
            onClose={onClose}
            ancho={440}
            pie={
                <>
                    <button type="button" className="modal-boton" onClick={onClose}>Cancelar</button>
                    <button type="submit" form="form-generar" className="modal-boton principal" disabled={trabajando || sinPlantilla}>
                        {trabajando ? "Generando..." : "Generar"}
                    </button>
                </>
            }
        >
            <form id="form-generar" className="eadm-form" onSubmit={generar}>
                <p className="eadm-ayuda">Crea una boleta por unidad con los conceptos de la plantilla del edificio. Si ya existen, no las duplica. También se generan solas el día 1 de cada mes.</p>
                <div className="eadm-campo">
                    <label htmlFor="eadm-periodo">Período</label>
                    <div className="eadm-select">
                        <select id="eadm-periodo" value={periodo} onChange={(ev) => setPeriodo(ev.target.value)}>
                            {opciones.map((o) => <option key={o} value={o}>{nombrePeriodo(o)}</option>)}
                        </select>
                        <ChevronDown size={16} />
                    </div>
                </div>
                {sinPlantilla && <p className="eadm-aviso eadm-aviso-alerta"><AlertCircle size={16} /><span>Todavía no hay una plantilla de conceptos cargada para tu edificio.</span></p>}
                {error && <p className="eadm-aviso eadm-aviso-error"><AlertCircle size={16} /><span>{error}</span></p>}
            </form>
        </Modal>
    );
}

/* ---------- pantalla ---------- */
function Expensas() {
    const [datos, setDatos] = useState(null);
    const [error, setError] = useState("");
    const [tab, setTab] = useState("expensas");
    const [modal, setModal] = useState(null); // {tipo, id}
    const [aviso, setAviso] = useState("");

    const cargar = useCallback(async () => {
        try {
            setDatos(await obtenerExpensasAdmin());
            setError("");
        } catch (e) {
            setError(e.message);
        }
    }, []);

    useEffect(() => {
        document.title = "Habita | Expensas";
        cargar();
    }, [cargar]);

    useEffect(() => {
        if (!aviso) return undefined;
        const t = setTimeout(() => setAviso(""), 4500);
        return () => clearTimeout(t);
    }, [aviso]);

    const hayVarias = (datos?.edificios.length ?? 0) > 1;
    const periodos = datos?.periodos ?? [];
    const expensas = datos?.expensas ?? [];

    const actual = useMemo(() => {
        if (!periodos.length) return null;
        const clave = periodos[0].periodoClave;
        const delMes = periodos.filter((p) => p.periodoClave === clave);
        const importe = delMes.reduce((s, p) => s + p.importeTotal, 0);
        const recaudado = delMes.reduce((s, p) => s + p.recaudado, 0);
        return {
            periodo: periodos[0].periodo,
            importe,
            recaudado,
            porcentaje: importe ? Math.round((recaudado / importe) * 100) : 0,
            unidades: delMes.reduce((s, p) => s + p.unidades, 0),
        };
    }, [periodos]);

    const filtrosPeriodos = useMemo(() => [{ key: "estado", label: "Todos los estados", options: ["En curso", "Cerrada"] }], []);
    const filtrosResidentes = useMemo(() => [
        { key: "periodo", label: "Todos los períodos", options: [...new Set(expensas.map((e) => e.periodo))] },
        { key: "estado", label: "Todos los estados", options: ["Pagado", "Pendiente", "Sin pagar"] },
    ], [expensas]);

    const columnasPeriodos = useMemo(() => [
        { clave: "periodo", titulo: "Período", ancho: "1fr", clase: "expensas-periodo",
          render: (p) => (hayVarias ? `${p.periodo} · ${p.edificio}` : p.periodo) },
        { clave: "vencimiento", titulo: "Vencimiento", ancho: "1fr" },
        { clave: "importeTotal", titulo: "Importe total", ancho: "1fr", render: (p) => formatearMoneda(p.importeTotal) },
        { clave: "recaudado", titulo: "Recaudado", ancho: "1.3fr", render: (p) => `${formatearMoneda(p.recaudado)} (${p.porcentaje}%)` },
        { clave: "estado", titulo: "Estado", ancho: "0.8fr", render: (p) => <Badge estado={p.estado} /> },
    ], [hayVarias]);

    const columnasResidentes = useMemo(() => [
        { clave: "periodo", titulo: "Período", ancho: "1fr" },
        { clave: "nombre", titulo: "Residente", ancho: "1.2fr" },
        { clave: "unidad", titulo: "Unidad", ancho: "0.7fr" },
        { clave: "vencimiento", titulo: "Vencimiento", ancho: "1fr" },
        { clave: "importe", titulo: "Importe", ancho: "1fr", render: (e) => formatearMoneda(e.importe) },
        { clave: "estado", titulo: "Estado", ancho: "1fr", render: (e) => <Badge estado={e.estado} /> },
    ], []);

    if (error && !datos) {
        return (
            <main className="expensas-admin pagina-administrador">
                <div className="eadm-pantalla-vacia">
                    <AlertCircle size={28} />
                    <h2>{error}</h2>
                    <button type="button" className="modal-boton principal" onClick={cargar}><RefreshCw size={13} /> Reintentar</button>
                </div>
            </main>
        );
    }
    if (!datos) return <main className="expensas-admin pagina-administrador"><p className="eadm-cargando">Cargando expensas...</p></main>;

    const periodoAbierto = modal?.tipo === "periodo" || modal?.tipo === "venc" ? periodos.find((p) => p.id === modal.id) : null;
    const boletaAbierta = modal?.tipo === "boleta" || modal?.tipo === "editar" ? expensas.find((e) => e.id === modal.id) : null;
    const terminar = (m) => { setModal(null); setAviso(m); cargar(); };

    return (
        <main className="expensas-admin pagina-administrador">
            {aviso && (
                <p className="eadm-aviso eadm-aviso-ok eadm-aviso-flotante" role="status"><CheckCircle2 size={16} /><span>{aviso}</span></p>
            )}

            <section className="expensas-resumen">
                <TarjetaResumen icono={<Calendar />} titulo="Expensa actual" valor={actual?.periodo ?? "--"} contenido={<span>Período vigente</span>} />
                <TarjetaResumen icono={<DollarSign />} titulo="Importe total" valor={formatearMoneda(actual?.importe ?? 0)} contenido={<span>Total a recaudar</span>} />
                <TarjetaResumen icono={<Users />} titulo="Unidades" valor={actual?.unidades ?? 0} contenido={<span>Con expensa</span>} />
                <TarjetaResumen
                    icono={<PiggyBank />}
                    titulo="Recaudado"
                    valor={formatearMoneda(actual?.recaudado ?? 0)}
                    contenido={
                        <>
                            <div className="expensas-progreso"><div className="expensas-progreso-relleno" style={{ width: `${actual?.porcentaje ?? 0}%` }} /></div>
                            <span>{actual?.porcentaje ?? 0}% del total</span>
                        </>
                    }
                />
            </section>

            <div className="expensas-tabs" role="tablist" aria-label="Secciones de expensas">
                <button type="button" role="tab" aria-selected={tab === "expensas"} className={`expensas-tab ${tab === "expensas" ? "activo" : ""}`} onClick={() => setTab("expensas")}>Expensas</button>
                <button type="button" role="tab" aria-selected={tab === "residentes"} className={`expensas-tab ${tab === "residentes" ? "activo" : ""}`} onClick={() => setTab("residentes")}>Residentes</button>
            </div>

            {tab === "expensas" ? (
                <Navegador
                    key="n-expensas"
                    data={periodos}
                    searchKey="busqueda"
                    searchPlaceholder="Buscar período..."
                    filters={filtrosPeriodos}
                    onNew={() => setModal({ tipo: "generar" })}
                    newButtonText="Generar expensas"
                >
                    {(filtrados) => (
                        <Tabla
                            columnas={columnasPeriodos}
                            datos={filtrados}
                            etiqueta="expensas"
                            className="expensas-tabla"
                            onFilaClick={(p) => setModal({ tipo: "periodo", id: p.id })}
                        />
                    )}
                </Navegador>
            ) : (
                <Navegador
                    key="n-residentes"
                    data={expensas}
                    searchKey="busqueda"
                    searchPlaceholder="Buscar residente o unidad..."
                    filters={filtrosResidentes}
                    onNew={() => setModal({ tipo: "generar" })}
                    newButtonText="Generar expensas"
                >
                    {(filtrados) => (
                        <Tabla
                            columnas={columnasResidentes}
                            datos={filtrados}
                            etiqueta="expensas"
                            className="expensas-tabla"
                            onFilaClick={(e) => setModal({ tipo: "boleta", id: e.id })}
                        />
                    )}
                </Navegador>
            )}

            {modal?.tipo === "periodo" && periodoAbierto && (
                <ModalPeriodo periodo={periodoAbierto} hayVarias={hayVarias} onClose={() => setModal(null)} onVencimiento={(p) => setModal({ tipo: "venc", id: p.id })} />
            )}
            {modal?.tipo === "venc" && periodoAbierto && (
                <ModalVencimiento periodo={periodoAbierto} onClose={() => setModal({ tipo: "periodo", id: periodoAbierto.id })} onGuardada={terminar} />
            )}
            {modal?.tipo === "boleta" && boletaAbierta && (
                <ModalBoleta expensa={boletaAbierta} onClose={() => setModal(null)} onEditar={(e) => setModal({ tipo: "editar", id: e.id })} />
            )}
            {modal?.tipo === "editar" && boletaAbierta && (
                <ModalEditarBoleta key={boletaAbierta.id} expensa={boletaAbierta} onClose={() => setModal({ tipo: "boleta", id: boletaAbierta.id })} onGuardada={terminar} />
            )}
            {modal?.tipo === "generar" && (
                <ModalGenerar edificios={datos.edificios} onClose={() => setModal(null)} onGenerada={terminar} />
            )}
        </main>
    );
}

export default Expensas;
