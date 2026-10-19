import { useCallback, useEffect, useMemo, useState } from "react";
import {
    UserCheck,
    Clock3,
    UserX,
    DoorOpen,
    Pencil,
    Copy,
    Check,
    Lock,
    AlertCircle,
    CheckCircle2,
    ChevronDown,
    MessageSquare,
    Wallet,
    CalendarDays,
    RefreshCw,
    Send,
    UserPlus,
} from "lucide-react";

import "./Residentes.css";
import Tabla from "../../../components/Tabla/Tabla";
import Navegador from "../../../components/Navegador/Navegador";
import Modal from "../../../components/Modal/Modal";
import TarjetaResumen from "../../../components/TarjetaResumen/TarjetaResumen";
import { formatearFechaISO, formatearFechaPago, formatearMoneda } from "../../../utils/formatos";
import {
    ROLES,
    textoRol,
    obtenerResidentesAdmin,
    invitarResidente,
    reenviarCodigo,
    cancelarInvitacion,
    actualizarResidente,
    darDeBaja,
} from "../../../services/residentesAdminService";

/* =========================
        CONSTANTES
========================== */

const PESTANAS = [
    { clave: "Todos", texto: "Todos" },
    { clave: "Activo", texto: "Activos" },
    { clave: "Pendiente", texto: "Pendientes" },
    { clave: "Inactivo", texto: "Inactivos" },
];

const CLASE_ESTADO = {
    Activo: "residentes-badge-activo",
    Pendiente: "residentes-badge-pendiente",
    Inactivo: "residentes-badge-inactivo",
};

function iniciales(r) {
    const base = r.tieneNombre ? r.nombre : r.email;
    return base
        .split(/[\s@.]+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0].toLocaleUpperCase("es-AR"))
        .join("") || "?";
}

function textoUnidad(unidad) {
    return unidad.piso ? `${unidad.numero} · piso ${unidad.piso}` : unidad.numero;
}

function Estado({ estado }) {
    return <span className={`residentes-badge ${CLASE_ESTADO[estado]}`}>{estado}</span>;
}

/* Boton "copiar" con aviso de que se copio */
function BotonCopiar({ texto }) {
    const [copiado, setCopiado] = useState(false);

    async function copiar() {
        try {
            await navigator.clipboard.writeText(texto);
            setCopiado(true);
            setTimeout(() => setCopiado(false), 1800);
        } catch {
            window.prompt("Copiá el código:", texto);
        }
    }

    return (
        <button type="button" className="res-copiar" onClick={copiar}>
            {copiado ? <Check size={14} /> : <Copy size={14} />}
            {copiado ? "Copiado" : "Copiar"}
        </button>
    );
}

function CajaCodigo({ codigo, venceEn }) {
    return (
        <div className="res-codigo">
            <div>
                <span className="res-codigo-etiqueta">Código de invitación</span>
                <strong className="res-codigo-valor">{codigo}</strong>
                {venceEn && <span className="res-codigo-vence">Vence el {formatearFechaPago(venceEn)} · un solo uso</span>}
            </div>
            <BotonCopiar texto={codigo} />
        </div>
    );
}

function Dato({ etiqueta, children, bloqueado }) {
    return (
        <div className="res-dato">
            <span className="res-dato-etiqueta">
                {etiqueta}
                {bloqueado && <Lock size={11} aria-label="No editable" />}
            </span>
            <span className="res-dato-valor">{children || "--"}</span>
        </div>
    );
}

/* =========================================================
   VENTANA: NUEVO RESIDENTE
========================================================= */
function ModalNuevo({ datos, inicial, onClose, onCreada }) {
    const { edificios, unidades } = datos;
    const [edificioId, setEdificioId] = useState(
        String(inicial?.edificioId ?? edificios[0]?.id ?? "")
    );
    const [unidadId, setUnidadId] = useState(inicial?.unidadId ? String(inicial.unidadId) : "");
    const [rol, setRol] = useState(inicial?.rol ?? "PROPIETARIO");
    const [email, setEmail] = useState(inicial?.email ?? "");
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState("");
    const [resultado, setResultado] = useState(null);

    const unidadesDeLaTorre = useMemo(
        () => unidades.filter((u) => String(u.edificioId) === edificioId),
        [unidades, edificioId]
    );
    const completo = edificioId && unidadId && email.trim();

    async function enviar(evento) {
        evento.preventDefault();
        if (!completo || enviando) return;
        setEnviando(true);
        setError("");
        try {
            const r = await invitarResidente({ unidadId: Number(unidadId), email, rol });
            setResultado(r);
            onCreada();
        } catch (e) {
            setError(e.message);
        } finally {
            setEnviando(false);
        }
    }

    function otra() {
        setResultado(null);
        setEmail("");
        setUnidadId("");
        setError("");
    }

    if (resultado) {
        return (
            <Modal
                titulo="Invitación creada"
                onClose={onClose}
                ancho={480}
                pie={
                    <>
                        <button type="button" className="modal-boton" onClick={otra}>
                            Invitar a otra persona
                        </button>
                        <button type="button" className="modal-boton principal" onClick={onClose}>
                            Listo
                        </button>
                    </>
                }
            >
                <div className="res-resultado">
                    {resultado.enviado ? (
                        <p className="res-aviso res-aviso-ok">
                            <CheckCircle2 size={18} />
                            <span>Enviamos el código a <strong>{resultado.email}</strong>. El residente figura como <strong>Pendiente</strong> hasta que se registre.</span>
                        </p>
                    ) : (
                        <p className="res-aviso res-aviso-alerta">
                            <AlertCircle size={18} />
                            <span>
                                La invitación quedó creada, pero <strong>no pudimos enviar el mail</strong>
                                {resultado.motivo ? ` (${resultado.motivo})` : ""}. Pasale el código a mano a {resultado.email}; también lo vas a poder ver y reenviar desde “Editar”.
                            </span>
                        </p>
                    )}
                    <CajaCodigo codigo={resultado.codigo} venceEn={resultado.venceEn} />
                </div>
            </Modal>
        );
    }

    return (
        <Modal
            titulo="Nuevo residente"
            onClose={onClose}
            ancho={480}
            pie={
                <>
                    <button type="button" className="modal-boton" onClick={onClose}>Cancelar</button>
                    <button
                        type="submit"
                        form="form-nuevo-residente"
                        className="modal-boton principal"
                        disabled={!completo || enviando}
                    >
                        {enviando ? "Enviando..." : "Enviar código"}
                    </button>
                </>
            }
        >
            <form id="form-nuevo-residente" className="res-form" onSubmit={enviar}>
                <p className="res-form-ayuda">
                    Elegí la unidad y el email del residente. Le mandamos un <strong>código de un solo uso</strong> (vence a los 7 días) para que cree su cuenta.
                </p>

                {edificios.length > 1 && (
                    <div className="res-campo">
                        <label htmlFor="res-torre">Torre</label>
                        <div className="res-select">
                            <select
                                id="res-torre"
                                value={edificioId}
                                onChange={(e) => { setEdificioId(e.target.value); setUnidadId(""); }}
                            >
                                {edificios.map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                            </select>
                            <ChevronDown size={16} />
                        </div>
                    </div>
                )}

                <div className="res-campo">
                    <label htmlFor="res-unidad">Unidad{edificios.length === 1 ? ` · ${edificios[0].nombre}` : ""}</label>
                    <div className="res-select">
                        <select id="res-unidad" value={unidadId} onChange={(e) => setUnidadId(e.target.value)} required>
                            <option value="">Elegí una unidad</option>
                            {unidadesDeLaTorre.map((u) => (
                                <option key={u.id} value={u.id}>
                                    {textoUnidad(u)}
                                    {u.residentes > 0
                                        ? ` — ${u.residentes} residente${u.residentes === 1 ? "" : "s"}`
                                        : u.invitaciones > 0 ? " — invitación pendiente" : " — sin residentes"}
                                </option>
                            ))}
                        </select>
                        <ChevronDown size={16} />
                    </div>
                </div>

                <div className="res-campo">
                    <label htmlFor="res-rol">Relación con la unidad</label>
                    <div className="res-select">
                        <select id="res-rol" value={rol} onChange={(e) => setRol(e.target.value)}>
                            {ROLES.map((r) => <option key={r.valor} value={r.valor}>{r.texto}</option>)}
                        </select>
                        <ChevronDown size={16} />
                    </div>
                </div>

                <div className="res-campo">
                    <label htmlFor="res-email">Email del residente</label>
                    <input
                        id="res-email"
                        type="email"
                        placeholder="residente@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="off"
                        required
                    />
                    <small>El residente tiene que registrarse con este mismo email.</small>
                </div>

                {error && <p className="res-aviso res-aviso-error"><AlertCircle size={16} /><span>{error}</span></p>}
            </form>
        </Modal>
    );
}

/* =========================================================
   VENTANA: EDITAR / VER RESIDENTE
========================================================= */
function ModalEditar({ residente: r, onClose, onGuardado, onCambio, onReinvitar, avisar }) {
    const [rol, setRol] = useState(r.rol);
    const [nota, setNota] = useState(r.nota);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState("");
    const [confirmar, setConfirmar] = useState(null); // "baja" | "cancelar"
    const [trabajando, setTrabajando] = useState(false);
    const [codigoNuevo, setCodigoNuevo] = useState(null);

    const esActivo = r.estado === "Activo";
    const esPendiente = r.estado === "Pendiente";
    const esInactivo = r.estado === "Inactivo";
    const hayCambios = esActivo && (rol !== r.rol || nota.trim() !== r.nota.trim());
    const titulo = r.tieneNombre ? r.nombre : r.email;

    async function guardar() {
        setGuardando(true);
        setError("");
        try {
            await actualizarResidente({ vinculacionId: r.refId, rol, nota });
            avisar("Guardamos los cambios.");
            onGuardado();
        } catch (e) {
            setError(e.message);
        } finally {
            setGuardando(false);
        }
    }

    async function reenviar() {
        setTrabajando(true);
        setError("");
        try {
            const res = await reenviarCodigo(r.refId);
            setCodigoNuevo(res);
            avisar(res.enviado ? `Reenviamos un código nuevo a ${r.email}.` : "Generamos un código nuevo, pero no pudimos enviar el mail.", res.enviado ? "ok" : "alerta");
            onCambio();
        } catch (e) {
            setError(e.message);
        } finally {
            setTrabajando(false);
        }
    }

    async function confirmarAccion() {
        setTrabajando(true);
        setError("");
        try {
            if (confirmar === "baja") {
                await darDeBaja(r.refId);
                avisar(`${titulo} quedó como Inactivo.`);
            } else {
                await cancelarInvitacion(r.refId);
                avisar(`Cancelamos la invitación de ${r.email}.`);
            }
            onGuardado();
        } catch (e) {
            setError(e.message);
            setConfirmar(null);
        } finally {
            setTrabajando(false);
        }
    }

    /* ---- confirmacion ---- */
    if (confirmar) {
        const esBaja = confirmar === "baja";
        return (
            <Modal
                titulo={esBaja ? "Dar de baja al residente" : "Cancelar invitación"}
                onClose={() => setConfirmar(null)}
                ancho={460}
                pie={
                    <>
                        <button type="button" className="modal-boton" onClick={() => setConfirmar(null)} disabled={trabajando}>
                            Volver
                        </button>
                        <button type="button" className="modal-boton peligro" onClick={confirmarAccion} disabled={trabajando}>
                            {trabajando ? "Procesando..." : esBaja ? "Sí, dar de baja" : "Sí, cancelar invitación"}
                        </button>
                    </>
                }
            >
                <div className="res-confirmar">
                    <p className="res-aviso res-aviso-alerta">
                        <AlertCircle size={18} />
                        <span>
                            {esBaja
                                ? <>¿Seguro que querés dar de baja a <strong>{titulo}</strong> de la unidad <strong>{r.unidad}</strong>?</>
                                : <>¿Seguro que querés cancelar la invitación de <strong>{r.email}</strong>? El código dejará de funcionar.</>}
                        </span>
                    </p>
                    {esBaja ? (
                        <ul className="res-lista">
                            <li>Pasa a <strong>Inactivo</strong> y queda registrada la fecha de hoy.</li>
                            <li>Pierde el acceso a la información de la unidad.</li>
                            <li>Su historial (reclamos, pagos) se conserva.</li>
                            <li>Para que vuelva a entrar, hay que invitarlo de nuevo con un código nuevo.</li>
                            {r.reclamosAbiertos > 0 && (
                                <li className="res-lista-alerta">Tiene <strong>{r.reclamosAbiertos}</strong> reclamo{r.reclamosAbiertos === 1 ? "" : "s"} abierto{r.reclamosAbiertos === 1 ? "" : "s"} que seguirán en la lista de reclamos.</li>
                            )}
                            {r.expensasPendientes > 0 && (
                                <li className="res-lista-alerta">La unidad tiene <strong>{r.expensasPendientes}</strong> expensa{r.expensasPendientes === 1 ? "" : "s"} pendiente{r.expensasPendientes === 1 ? "" : "s"} ({formatearMoneda(r.expensasMonto)}); la deuda es de la unidad y se mantiene.</li>
                            )}
                        </ul>
                    ) : (
                        <ul className="res-lista">
                            <li>El residente pasa a <strong>Inactivo</strong> en el historial.</li>
                            <li>Si más adelante lo necesitás, creás una invitación nueva.</li>
                        </ul>
                    )}
                    {error && <p className="res-aviso res-aviso-error"><AlertCircle size={16} /><span>{error}</span></p>}
                </div>
            </Modal>
        );
    }

    /* ---- ventana principal ---- */
    const pie = esActivo ? (
        <>
            <button type="button" className="modal-boton contorno-peligro res-pie-izq" onClick={() => setConfirmar("baja")}>
                Dar de baja
            </button>
            <button type="button" className="modal-boton" onClick={onClose}>Cancelar</button>
            <button type="button" className="modal-boton principal" onClick={guardar} disabled={!hayCambios || guardando}>
                {guardando ? "Guardando..." : "Guardar cambios"}
            </button>
        </>
    ) : esPendiente ? (
        <>
            <button type="button" className="modal-boton contorno-peligro res-pie-izq" onClick={() => setConfirmar("cancelar")}>
                Cancelar invitación
            </button>
            <button type="button" className="modal-boton" onClick={onClose}>Cerrar</button>
            <button type="button" className="modal-boton principal res-boton-icono" onClick={reenviar} disabled={trabajando}>
                <Send size={13} /> {trabajando ? "Enviando..." : "Reenviar código"}
            </button>
        </>
    ) : (
        <>
            <button type="button" className="modal-boton" onClick={onClose}>Cerrar</button>
            <button type="button" className="modal-boton principal res-boton-icono" onClick={() => onReinvitar(r)}>
                <UserPlus size={13} /> Invitar de nuevo
            </button>
        </>
    );

    const codigo = codigoNuevo?.codigo ?? r.codigo;
    const vence = codigoNuevo?.venceEn ?? r.venceEn;

    return (
        <Modal titulo={esPendiente ? "Invitación pendiente" : "Editar residente"} onClose={onClose} ancho={620} pie={pie}>
            <div className="res-editar">
                <header className="res-cabecera">
                    <span className="res-avatar" aria-hidden="true">{iniciales(r)}</span>
                    <div>
                        <h3>{titulo}</h3>
                        <span>{r.tieneNombre ? r.email : "Todavía no se registró"}</span>
                    </div>
                    <Estado estado={r.estado} />
                </header>

                <section className="res-bloque">
                    <h4>Datos</h4>
                    <div className="res-datos">
                        <Dato etiqueta="Unidad" bloqueado>{r.unidad}{r.piso ? ` · piso ${r.piso}` : ""}</Dato>
                        <Dato etiqueta="Torre" bloqueado>{r.edificio}</Dato>
                        <Dato etiqueta="Email">{r.email}</Dato>
                        <Dato etiqueta="Teléfono">{r.telefono}</Dato>
                        {!esPendiente && <Dato etiqueta="Documento">{r.dni}</Dato>}
                        {esActivo && <Dato etiqueta="Residente desde">{formatearFechaISO(r.desde)}</Dato>}
                        {esActivo && <Dato etiqueta="Último ingreso">{r.ultimoIngreso ? formatearFechaPago(r.ultimoIngreso) : "Nunca ingresó"}</Dato>}
                        {esInactivo && !r.codigo && <Dato etiqueta="Dado de baja el">{formatearFechaISO(r.fechaBaja)}</Dato>}
                        {esInactivo && r.codigo && <Dato etiqueta="Invitación cancelada el">{formatearFechaISO(r.fechaBaja)}</Dato>}
                        {esPendiente && <Dato etiqueta="Invitado el">{formatearFechaPago(r.creadaEn)}</Dato>}
                    </div>
                    {esActivo && (
                        <p className="res-nota-bloqueo">
                            <Lock size={12} /> La unidad no se edita: si el residente se muda, se lo da de baja y se invita a la persona nueva con un código nuevo.
                        </p>
                    )}
                </section>

                {esPendiente && (
                    <section className="res-bloque">
                        <h4>Invitación</h4>
                        <CajaCodigo codigo={codigo} venceEn={vence} />
                        <p className="res-form-ayuda">
                            {codigoNuevo
                                ? codigoNuevo.enviado
                                    ? "Mandamos un código nuevo por mail. El anterior ya no sirve."
                                    : `Generamos un código nuevo (el anterior ya no sirve), pero no pudimos enviar el mail${codigoNuevo.motivo ? `: ${codigoNuevo.motivo}` : ""}. Pasaselo a mano.`
                                : r.enviadaEn
                                    ? `Mail enviado el ${formatearFechaPago(r.enviadaEn)}${r.reenvios ? ` · reenviado ${r.reenvios} ${r.reenvios === 1 ? "vez" : "veces"}` : ""}.`
                                    : "El mail todavía no se envió: pasale el código a mano o tocá “Reenviar código”."}
                            {" "}“Reenviar código” genera un código nuevo y extiende el plazo 7 días.
                        </p>
                    </section>
                )}

                {!esPendiente && (
                    <section className="res-bloque">
                        <h4>Relacionado con este residente</h4>
                        <div className="res-relacionado">
                            <div className={`res-rel ${r.reclamosAbiertos ? "res-rel-atencion" : ""}`}>
                                <MessageSquare size={16} />
                                <strong>{r.reclamosAbiertos}</strong>
                                <span>reclamo{r.reclamosAbiertos === 1 ? "" : "s"} abierto{r.reclamosAbiertos === 1 ? "" : "s"}</span>
                                <small>{r.reclamosTotal} en total</small>
                            </div>
                            <div className={`res-rel ${r.expensasVencidas ? "res-rel-alerta" : r.expensasPendientes ? "res-rel-atencion" : ""}`}>
                                <Wallet size={16} />
                                <strong>{r.expensasPendientes}</strong>
                                <span>expensa{r.expensasPendientes === 1 ? "" : "s"} pendiente{r.expensasPendientes === 1 ? "" : "s"}</span>
                                <small>
                                    {r.expensasPendientes
                                        ? `${formatearMoneda(r.expensasMonto)}${r.expensasVencidas ? ` · ${r.expensasVencidas} vencida${r.expensasVencidas === 1 ? "" : "s"}` : ""}`
                                        : "Al día"}
                                </small>
                            </div>
                            <div className="res-rel">
                                <CalendarDays size={16} />
                                <strong>{r.reservasProximas}</strong>
                                <span>reserva{r.reservasProximas === 1 ? "" : "s"} próxima{r.reservasProximas === 1 ? "" : "s"}</span>
                                <small>Desde hoy</small>
                            </div>
                        </div>
                        <p className="res-form-ayuda">Las expensas son de la unidad; los reclamos y reservas son de este residente.</p>
                    </section>
                )}

                {esActivo && (
                    <section className="res-bloque">
                        <h4>Editar</h4>
                        <div className="res-campo">
                            <label htmlFor="res-edit-rol">Relación con la unidad</label>
                            <div className="res-select">
                                <select id="res-edit-rol" value={rol} onChange={(e) => setRol(e.target.value)}>
                                    {ROLES.map((x) => <option key={x.valor} value={x.valor}>{x.texto}</option>)}
                                </select>
                                <ChevronDown size={16} />
                            </div>
                        </div>
                        <div className="res-campo">
                            <label htmlFor="res-edit-nota">Nota interna <small>(solo la ve la administración)</small></label>
                            <textarea
                                id="res-edit-nota"
                                rows={3}
                                maxLength={500}
                                placeholder="Ej: prefiere que lo contacten por WhatsApp."
                                value={nota}
                                onChange={(e) => setNota(e.target.value)}
                            />
                        </div>
                    </section>
                )}

                {esInactivo && (
                    <section className="res-bloque">
                        <h4>Rol y nota</h4>
                        <div className="res-datos">
                            <Dato etiqueta="Relación con la unidad">{textoRol(r.rol)}</Dato>
                            <Dato etiqueta="Nota interna">{r.nota}</Dato>
                        </div>
                    </section>
                )}

                {error && <p className="res-aviso res-aviso-error"><AlertCircle size={16} /><span>{error}</span></p>}
            </div>
        </Modal>
    );
}

/* =========================================================
   PANTALLA
========================================================= */
function Residentes() {
    const [datos, setDatos] = useState(null);
    const [error, setError] = useState("");
    const [pestana, setPestana] = useState("Todos");
    const [nuevo, setNuevo] = useState(null);       // null | {} | datos de reinvitacion
    const [editando, setEditando] = useState(null); // id del residente abierto
    const [aviso, setAviso] = useState(null);       // { texto, tipo }

    const cargar = useCallback(async () => {
        try {
            const d = await obtenerResidentesAdmin();
            setDatos(d);
            setError("");
        } catch (e) {
            setError(e.message);
        }
    }, []);

    useEffect(() => {
        document.title = "Habita | Residentes";
        cargar();
    }, [cargar]);

    useEffect(() => {
        if (!aviso) return undefined;
        const t = setTimeout(() => setAviso(null), 5000);
        return () => clearTimeout(t);
    }, [aviso]);

    const avisar = useCallback((texto, tipo = "ok") => setAviso({ texto, tipo }), []);

    const hayVarias = (datos?.edificios.length ?? 0) > 1;

    const residentes = useMemo(
        () => (datos?.residentes ?? []).map((r) => ({
            ...r,
            rolTexto: textoRol(r.rol),
            unidadTexto: r.unidad,
        })),
        [datos]
    );

    const conteo = useMemo(() => {
        const c = { Todos: residentes.length, Activo: 0, Pendiente: 0, Inactivo: 0 };
        residentes.forEach((r) => { c[r.estado] += 1; });
        return c;
    }, [residentes]);

    const unidadesVacias = useMemo(
        () => (datos?.unidades ?? []).filter((u) => u.residentes === 0 && u.invitaciones === 0).length,
        [datos]
    );

    const visibles = useMemo(
        () => (pestana === "Todos" ? residentes : residentes.filter((r) => r.estado === pestana)),
        [residentes, pestana]
    );

    const abierto = residentes.find((r) => r.id === editando) ?? null;

    const filtros = useMemo(() => {
        const f = [{ key: "rolTexto", label: "Todos los roles", options: ROLES.map((r) => r.texto) }];
        if (hayVarias) {
            f.unshift({ key: "edificio", label: "Todas las torres", options: datos.edificios.map((e) => e.nombre) });
        }
        return f;
    }, [hayVarias, datos]);

    const columnas = useMemo(() => [
        {
            clave: "nombre",
            titulo: "Nombre",
            ancho: "minmax(150px, 1.2fr)",
            clase: "residentes-nombre",
            render: (r) => <span className={r.tieneNombre ? "" : "residentes-sin-dato"}>{r.nombre}</span>,
        },
        {
            clave: "unidad",
            titulo: "Unidad",
            ancho: "minmax(80px, 0.7fr)",
            render: (r) => (
                <span>
                    {r.unidad}
                    {hayVarias && <small className="residentes-torre"> · {r.edificio}</small>}
                </span>
            ),
        },
        { clave: "email", titulo: "Email", ancho: "minmax(180px, 1.5fr)", clase: "residentes-email" },
        {
            clave: "telefono",
            titulo: "Teléfono",
            ancho: "minmax(120px, 1fr)",
            render: (r) => <span className={r.telefono === "--" ? "residentes-sin-dato" : ""}>{r.telefono}</span>,
        },
        {
            clave: "estado",
            titulo: "Estado",
            ancho: "minmax(110px, 0.8fr)",
            render: (r) => <Estado estado={r.estado} />,
        },
    ], [hayVarias]);

    /* ---- estados de carga / error ---- */
    if (error && !datos) {
        return (
            <main className="residentes">
                <div className="res-vacio">
                    <AlertCircle size={28} />
                    <h2>{error}</h2>
                    <button type="button" className="modal-boton principal" onClick={cargar}>
                        <RefreshCw size={13} /> Reintentar
                    </button>
                </div>
            </main>
        );
    }
    if (!datos) {
        return <main className="residentes"><p className="res-cargando">Cargando residentes...</p></main>;
    }

    return (
        <main className="residentes">

            {aviso && (
                <p className={`res-aviso res-aviso-${aviso.tipo} res-aviso-flotante`} role="status">
                    {aviso.tipo === "ok" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                    <span>{aviso.texto}</span>
                </p>
            )}

            <section className="residentes-resumen" aria-label="Resumen de residentes">
                <TarjetaResumen icono={<UserCheck size={20} />} titulo="Activos" valor={conteo.Activo} contenido={<span className="res-resumen-sub">Con acceso a la app</span>} />
                <TarjetaResumen icono={<Clock3 size={20} />} titulo="Pendientes" valor={conteo.Pendiente} contenido={<span className="res-resumen-sub">Esperando que se registren</span>} />
                <TarjetaResumen icono={<UserX size={20} />} titulo="Inactivos" valor={conteo.Inactivo} contenido={<span className="res-resumen-sub">Historial de bajas</span>} />
                <TarjetaResumen icono={<DoorOpen size={20} />} titulo="Unidades vacías" valor={unidadesVacias} contenido={<span className="res-resumen-sub">Sin residentes ni invitación</span>} />
            </section>

            <div className="residentes-pestanas" role="tablist" aria-label="Filtrar por estado">
                {PESTANAS.map((p) => (
                    <button
                        key={p.clave}
                        type="button"
                        role="tab"
                        aria-selected={pestana === p.clave}
                        className={`residentes-pestana ${pestana === p.clave ? "activa" : ""}`}
                        onClick={() => setPestana(p.clave)}
                    >
                        {p.texto} <span>{conteo[p.clave]}</span>
                    </button>
                ))}
            </div>

            <Navegador
                key={pestana}
                data={visibles}
                searchKey="busqueda"
                searchPlaceholder="Buscar por nombre, email o unidad..."
                filters={filtros}
                onNew={() => setNuevo({})}
                newButtonText="Nuevo residente"
            >
                {(filtrados) => (
                    <Tabla
                        columnas={columnas}
                        datos={filtrados}
                        etiqueta="residentes"
                        className="residentes-tabla"
                        claseFila={(r) => (r.estado === "Inactivo" ? "residentes-fila-inactiva" : "")}
                        mostrarAcciones
                        opcionesAcciones={[
                            { label: "Editar", icon: Pencil, onClick: (r) => setEditando(r.id) },
                        ]}
                    />
                )}
            </Navegador>

            {nuevo && (
                <ModalNuevo
                    datos={datos}
                    inicial={nuevo}
                    onClose={() => setNuevo(null)}
                    onCreada={cargar}
                />
            )}

            {abierto && (
                <ModalEditar
                    key={abierto.id}
                    residente={abierto}
                    onClose={() => setEditando(null)}
                    onGuardado={() => { setEditando(null); cargar(); }}
                    onCambio={cargar}
                    onReinvitar={(r) => {
                        setEditando(null);
                        setNuevo({ edificioId: r.edificioId, unidadId: r.unidadId, email: r.email, rol: r.rol });
                    }}
                    avisar={avisar}
                />
            )}
        </main>
    );
}

export default Residentes;
