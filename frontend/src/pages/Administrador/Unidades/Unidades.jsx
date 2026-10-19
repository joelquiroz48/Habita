import { useCallback, useEffect, useMemo, useState } from "react";
import { Building2, DoorOpen, DoorClosed, Percent, Pencil, Trash2, ChevronDown, AlertCircle, CheckCircle2, MessageSquare, Wallet, RefreshCw } from "lucide-react";

import "./Unidades.css";
import Tabla from "../../../components/Tabla/Tabla";
import Navegador from "../../../components/Navegador/Navegador";
import Modal from "../../../components/Modal/Modal";
import TarjetaResumen from "../../../components/TarjetaResumen/TarjetaResumen";
import { formatearMoneda } from "../../../utils/formatos";
import { obtenerUnidadesAdmin, guardarUnidad, eliminarUnidad } from "../../../services/unidadesAdminService";

const CLASE_ESTADO = {
    Ocupada: "unidades-badge-activa",
    "Invitación pendiente": "unidades-badge-pendiente",
    Disponible: "unidades-badge-disponible",
};

const columnas = [
    { clave: "unidad", titulo: "Unidad", ancho: "minmax(70px, 0.8fr)", clase: "unidades-nombre" },
    { clave: "torre", titulo: "Torre", ancho: "minmax(90px, 1fr)" },
    { clave: "piso", titulo: "Piso", ancho: "minmax(50px, 0.6fr)" },
    { clave: "tipo", titulo: "Tipo", ancho: "minmax(70px, 0.8fr)" },
    {
        clave: "superficie",
        titulo: "Superficie",
        ancho: "minmax(80px, 0.8fr)",
        render: (u) => (u.superficie == null ? "--" : `${u.superficie} m²`),
    },
    { clave: "responsable", titulo: "Propietario / Responsable", ancho: "minmax(160px, 2fr)", clase: "unidades-responsable" },
    {
        clave: "estado",
        titulo: "Estado",
        ancho: "minmax(130px, 1.1fr)",
        render: (u) => <span className={`unidades-badge ${CLASE_ESTADO[u.estado]}`}>{u.estado}</span>,
    },
];

/* ---------------- ventana: agregar / editar ---------------- */
function ModalUnidad({ unidad, edificios, onClose, onGuardada, onEliminar }) {
    const editando = Boolean(unidad);
    const [edificioId, setEdificioId] = useState(String(unidad?.edificioId ?? edificios[0]?.id ?? ""));
    const [numero, setNumero] = useState(unidad?.numero ?? "");
    const [piso, setPiso] = useState(unidad?.piso ?? "");
    const [ambientes, setAmbientes] = useState(unidad?.ambientes ?? "");
    const [superficie, setSuperficie] = useState(unidad?.superficie ?? "");
    const [nota, setNota] = useState(unidad?.nota ?? "");
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState("");

    async function enviar(e) {
        e.preventDefault();
        if (guardando) return;
        setGuardando(true);
        setError("");
        try {
            await guardarUnidad({
                id: unidad?.id ?? null,
                edificioId: Number(edificioId),
                numero, piso, ambientes, superficie, nota,
            });
            onGuardada(editando ? `Guardamos la unidad ${numero.toUpperCase()}.` : `Agregamos la unidad ${numero.toUpperCase()}.`);
        } catch (err) {
            setError(err.message);
        } finally {
            setGuardando(false);
        }
    }

    return (
        <Modal
            titulo={editando ? `Editar unidad ${unidad.numero}` : "Agregar unidad"}
            onClose={onClose}
            ancho={editando ? 560 : 480}
            pie={
                <>
                    {editando && (
                        <button type="button" className="modal-boton contorno-peligro uni-pie-izq" onClick={() => onEliminar(unidad)}>
                            Eliminar
                        </button>
                    )}
                    <button type="button" className="modal-boton" onClick={onClose}>Cancelar</button>
                    <button type="submit" form="form-unidad" className="modal-boton principal" disabled={guardando || !numero.trim() || !String(piso).trim()}>
                        {guardando ? "Guardando..." : editando ? "Guardar cambios" : "Agregar unidad"}
                    </button>
                </>
            }
        >
            <form id="form-unidad" className="uni-form" onSubmit={enviar}>
                {editando && (
                    <div className="uni-resumen-unidad">
                        <div>
                            <span>Residentes</span>
                            <strong>{unidad.residentes.length ? unidad.residentes.map((r) => r.nombre).join(", ") : "Sin residentes"}</strong>
                            {unidad.invitaciones > 0 && <small>{unidad.invitaciones} invitación pendiente</small>}
                        </div>
                        <div className="uni-rel-fila">
                            <span className={unidad.reclamosAbiertos ? "uni-rel uni-rel-atencion" : "uni-rel"}>
                                <MessageSquare size={14} /> {unidad.reclamosAbiertos} reclamo{unidad.reclamosAbiertos === 1 ? "" : "s"} abierto{unidad.reclamosAbiertos === 1 ? "" : "s"}
                            </span>
                            <span className={unidad.expensasVencidas ? "uni-rel uni-rel-alerta" : unidad.expensasPendientes ? "uni-rel uni-rel-atencion" : "uni-rel"}>
                                <Wallet size={14} />{" "}
                                {unidad.expensasPendientes
                                    ? `${unidad.expensasPendientes} expensa${unidad.expensasPendientes === 1 ? "" : "s"} (${formatearMoneda(unidad.expensasMonto)})`
                                    : "Expensas al día"}
                            </span>
                        </div>
                    </div>
                )}

                <div className="uni-campo">
                    <label htmlFor="uni-torre">Torre</label>
                    <div className="uni-select">
                        <select id="uni-torre" value={edificioId} onChange={(e) => setEdificioId(e.target.value)} disabled={editando}>
                            {edificios.map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                        </select>
                        <ChevronDown size={16} />
                    </div>
                    {editando && <small>La torre no se puede cambiar.</small>}
                </div>

                <div className="uni-fila">
                    <div className="uni-campo">
                        <label htmlFor="uni-numero">Número / letra</label>
                        <input id="uni-numero" value={numero} onChange={(e) => setNumero(e.target.value)} placeholder="Ej: 4B" maxLength={10} required />
                    </div>
                    <div className="uni-campo">
                        <label htmlFor="uni-piso">Piso</label>
                        <input id="uni-piso" value={piso} onChange={(e) => setPiso(e.target.value)} placeholder="Ej: 4" maxLength={5} required />
                    </div>
                </div>

                <div className="uni-fila">
                    <div className="uni-campo">
                        <label htmlFor="uni-amb">Ambientes</label>
                        <div className="uni-select">
                            <select id="uni-amb" value={ambientes} onChange={(e) => setAmbientes(e.target.value)}>
                                <option value="">Sin dato</option>
                                {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n} {n === 1 ? "ambiente" : "ambientes"}</option>)}
                            </select>
                            <ChevronDown size={16} />
                        </div>
                    </div>
                    <div className="uni-campo">
                        <label htmlFor="uni-sup">Superficie (m²)</label>
                        <input id="uni-sup" type="number" step="0.01" min="1" value={superficie} onChange={(e) => setSuperficie(e.target.value)} placeholder="Ej: 58" />
                    </div>
                </div>

                <div className="uni-campo">
                    <label htmlFor="uni-nota">Nota interna <small>(solo la ve la administración)</small></label>
                    <textarea id="uni-nota" rows={2} maxLength={300} value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Ej: balcón al contrafrente." />
                </div>

                {error && <p className="uni-aviso uni-aviso-error"><AlertCircle size={16} /><span>{error}</span></p>}
            </form>
        </Modal>
    );
}

/* ---------------- ventana: confirmar eliminar ---------------- */
function ModalEliminar({ unidad, onClose, onEliminada }) {
    const [trabajando, setTrabajando] = useState(false);
    const [error, setError] = useState("");
    const bloqueada = unidad.tieneHistorial;

    async function confirmar() {
        setTrabajando(true);
        setError("");
        try {
            await eliminarUnidad(unidad.id);
            onEliminada(`Eliminamos la unidad ${unidad.numero}.`);
        } catch (e) {
            setError(e.message);
        } finally {
            setTrabajando(false);
        }
    }

    return (
        <Modal
            titulo="Eliminar unidad"
            onClose={onClose}
            ancho={440}
            pie={
                <>
                    <button type="button" className="modal-boton" onClick={onClose}>{bloqueada ? "Entendido" : "Cancelar"}</button>
                    {!bloqueada && (
                        <button type="button" className="modal-boton peligro" onClick={confirmar} disabled={trabajando}>
                            {trabajando ? "Eliminando..." : "Sí, eliminar"}
                        </button>
                    )}
                </>
            }
        >
            <div className="uni-form">
                <p className={`uni-aviso ${bloqueada ? "uni-aviso-alerta" : "uni-aviso-alerta"}`}>
                    <AlertCircle size={18} />
                    <span>
                        {bloqueada
                            ? <>La unidad <strong>{unidad.numero}</strong> tiene residentes, expensas, reclamos o invitaciones en su historial, así que no se puede eliminar. Si dejó de usarse, dejala sin residentes: queda como “Disponible”.</>
                            : <>¿Seguro que querés eliminar la unidad <strong>{unidad.numero}</strong> ({unidad.torre})? Nunca tuvo residentes ni movimientos. No se puede deshacer.</>}
                    </span>
                </p>
                {error && <p className="uni-aviso uni-aviso-error"><AlertCircle size={16} /><span>{error}</span></p>}
            </div>
        </Modal>
    );
}

/* ---------------- pantalla ---------------- */
function Unidades() {
    const [datos, setDatos] = useState(null);
    const [error, setError] = useState("");
    const [modal, setModal] = useState(null); // {tipo:"nueva"} | {tipo:"editar", id} | {tipo:"eliminar", id}
    const [aviso, setAviso] = useState("");

    const cargar = useCallback(async () => {
        try {
            setDatos(await obtenerUnidadesAdmin());
            setError("");
        } catch (e) {
            setError(e.message);
        }
    }, []);

    useEffect(() => {
        document.title = "Habita | Unidades";
        cargar();
    }, [cargar]);

    useEffect(() => {
        if (!aviso) return undefined;
        const t = setTimeout(() => setAviso(""), 4500);
        return () => clearTimeout(t);
    }, [aviso]);

    const unidades = datos?.unidades ?? [];
    const hayVarias = (datos?.edificios.length ?? 0) > 1;

    const resumen = useMemo(() => {
        const total = unidades.length;
        const ocupadas = unidades.filter((u) => u.estado === "Ocupada").length;
        return {
            total,
            ocupadas,
            disponibles: total - ocupadas,
            porcentaje: total ? Math.round((ocupadas / total) * 100) : 0,
        };
    }, [unidades]);

    const filtros = useMemo(() => {
        const unicos = (clave) => [...new Set(unidades.map((u) => u[clave]).filter((v) => v !== "" && v != null && v !== "--"))];
        const pisos = unicos("piso").sort((a, b) => Number(a) - Number(b));
        const tipos = unicos("tipo").sort();
        return [
            ...(hayVarias ? [{ key: "torre", label: "Todas las torres", options: unicos("torre").sort() }] : []),
            { key: "piso", label: "Todos los pisos", options: pisos },
            { key: "tipo", label: "Todos los ambientes", options: tipos },
            { key: "estado", label: "Todos los estados", options: ["Ocupada", "Invitación pendiente", "Disponible"] },
        ];
    }, [unidades, hayVarias]);

    const seleccionada = unidades.find((u) => u.id === modal?.id) ?? null;

    if (error && !datos) {
        return (
            <main className="unidades">
                <div className="uni-vacio">
                    <AlertCircle size={28} />
                    <h2>{error}</h2>
                    <button type="button" className="modal-boton principal" onClick={cargar}><RefreshCw size={13} /> Reintentar</button>
                </div>
            </main>
        );
    }
    if (!datos) return <main className="unidades"><p className="uni-cargando">Cargando unidades...</p></main>;

    return (
        <main className="unidades">
            {aviso && (
                <p className="uni-aviso uni-aviso-ok uni-aviso-flotante" role="status">
                    <CheckCircle2 size={16} /><span>{aviso}</span>
                </p>
            )}

            <section className="unidades-resumen" aria-label="Resumen de unidades">
                <TarjetaResumen icono={<Building2 size={20} />} titulo="Unidades" valor={resumen.total} contenido={<span className="uni-resumen-sub">{datos.edificios.length} {datos.edificios.length === 1 ? "torre" : "torres"}</span>} />
                <TarjetaResumen icono={<DoorClosed size={20} />} titulo="Ocupadas" valor={resumen.ocupadas} contenido={<span className="uni-resumen-sub">Con residentes activos</span>} />
                <TarjetaResumen icono={<DoorOpen size={20} />} titulo="Disponibles" valor={resumen.disponibles} contenido={<span className="uni-resumen-sub">Sin residentes</span>} />
                <TarjetaResumen icono={<Percent size={20} />} titulo="Ocupación" valor={`${resumen.porcentaje}%`} contenido={<span className="uni-resumen-sub">Unidades ocupadas</span>} />
            </section>

            <Navegador
                data={unidades}
                searchKey="busqueda"
                searchPlaceholder="Buscar por unidad o residente..."
                filters={filtros}
                onNew={() => setModal({ tipo: "nueva" })}
                newButtonText="Agregar unidad"
            >
                {(filtradas) => (
                    <Tabla
                        columnas={columnas}
                        datos={filtradas}
                        etiqueta="unidades"
                        className="unidades-tabla"
                        mostrarAcciones
                        opcionesAcciones={[
                            { label: "Editar", icon: Pencil, onClick: (u) => setModal({ tipo: "editar", id: u.id }) },
                            { label: "Eliminar", icon: Trash2, onClick: (u) => setModal({ tipo: "eliminar", id: u.id }) },
                        ]}
                    />
                )}
            </Navegador>

            {modal?.tipo === "nueva" && (
                <ModalUnidad
                    edificios={datos.edificios}
                    onClose={() => setModal(null)}
                    onGuardada={(m) => { setModal(null); setAviso(m); cargar(); }}
                />
            )}
            {modal?.tipo === "editar" && seleccionada && (
                <ModalUnidad
                    key={seleccionada.id}
                    unidad={seleccionada}
                    edificios={datos.edificios}
                    onClose={() => setModal(null)}
                    onGuardada={(m) => { setModal(null); setAviso(m); cargar(); }}
                    onEliminar={(u) => setModal({ tipo: "eliminar", id: u.id })}
                />
            )}
            {modal?.tipo === "eliminar" && seleccionada && (
                <ModalEliminar
                    unidad={seleccionada}
                    onClose={() => setModal(null)}
                    onEliminada={(m) => { setModal(null); setAviso(m); cargar(); }}
                />
            )}
        </main>
    );
}

export default Unidades;
