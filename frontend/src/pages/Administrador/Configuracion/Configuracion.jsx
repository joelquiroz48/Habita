import { useCallback, useEffect, useRef, useState } from "react";
import {
    AlertCircle, ArrowDown, ArrowUp, Bell, Building2, CalendarClock, Camera, CheckCircle2, DollarSign,
    KeyRound, ListChecks, LogOut, Pencil, Plus, Settings, Trash2, UserRound, X,
} from "lucide-react";

import "./Configuracion.css";
import Panel from "../../../components/Panel/Panel";
import Modal from "../../../components/Modal/Modal";
import imagenPredeterminada from "../../../assets/img/imagen-predeterminada.png";
import { nombrePeriodo } from "../../../utils/formatos";
import {
    NOTIFICACIONES, cambiarContrasena, cambiarFotoEdificio, cerrarSesionEnTodos, convertirMonto, eliminarCategoria,
    guardarCategoria, guardarConsorcio, guardarCuenta, guardarPreferenciasAdmin, guardarVencimiento, hoyISO,
    moverCategoria, obtenerConfiguracion, periodoActualClave, proximaGeneracion, quitarFotoEdificio,
    validarCategoria, validarConsorcio, validarContrasenaNueva, validarFoto,
} from "../../../services/configuracionAdminService";

const DIAS = Array.from({ length: 28 }, (_, i) => i + 1);

/* ---------- Modal: día de vencimiento ---------- */
function ModalVencimiento({ edificio, alCerrar, alGuardar }) {
    const [dia, setDia] = useState(edificio.diaVencimiento);
    const [error, setError] = useState("");
    const [guardando, setGuardando] = useState(false);

    async function enviar(e) {
        e.preventDefault();
        setGuardando(true);
        try { await alGuardar(Number(dia)); } catch (err) { setError(err.message); setGuardando(false); }
    }

    return (
        <Modal
            titulo="Período de expensas"
            onClose={alCerrar}
            ancho={460}
            pie={<>
                <button type="button" className="modal-boton" onClick={alCerrar}>Cancelar</button>
                <button type="submit" form="form-vencimiento" className="modal-boton principal" disabled={guardando}>{guardando ? "Guardando…" : "Guardar"}</button>
            </>}
        >
            <form id="form-vencimiento" className="cfg-form" onSubmit={enviar}>
                <p className="cfg-ayuda">Las expensas se generan solas el <strong>día 1 de cada mes</strong>. Elegí hasta qué día del mes tienen para pagarse sin estar vencidas.</p>
                <div className="cfg-campo">
                    <label htmlFor="cfg-dia">Día de vencimiento</label>
                    <select id="cfg-dia" value={dia} onChange={(e) => setDia(e.target.value)}>
                        {DIAS.map((d) => <option key={d} value={d}>Día {d} de cada mes</option>)}
                    </select>
                    <small>Se permite del 1 al 28 para que valga en todos los meses.</small>
                </div>
                <p className="cfg-aviso cfg-aviso-info"><AlertCircle size={15} /><span>Vale para las expensas que se generen de ahora en adelante. Las ya emitidas no cambian (para eso editá el vencimiento desde Expensas).</span></p>
                {error && <p className="cfg-aviso cfg-aviso-error" role="alert"><AlertCircle size={15} /><span>{error}</span></p>}
            </form>
        </Modal>
    );
}

/* ---------- Modal: categorías (conceptos de la expensa) ---------- */
function ModalCategorias({ edificio, categorias, alCambiar, alCerrar, avisar }) {
    const [editando, setEditando] = useState(null); // null | "nuevo" | id
    const [concepto, setConcepto] = useState("");
    const [monto, setMonto] = useState("");
    const [error, setError] = useState("");
    const [ocupado, setOcupado] = useState(false);
    const [porBorrar, setPorBorrar] = useState(null);

    const total = categorias.filter((c) => c.activo).reduce((s, c) => s + c.monto, 0);

    function abrirNuevo() { setEditando("nuevo"); setConcepto(""); setMonto(""); setError(""); }
    function abrirEditar(c) { setEditando(c.id); setConcepto(c.concepto); setMonto(String(c.monto).replace(".", ",")); setError(""); }

    async function ejecutar(accion, mensajeOk) {
        setOcupado(true);
        try { await accion(); await alCambiar(); if (mensajeOk) avisar(mensajeOk); return true; }
        catch (err) { setError(err.message); return false; }
        finally { setOcupado(false); }
    }

    async function guardar(e) {
        e.preventDefault();
        const mensaje = validarCategoria({ concepto, monto });
        if (mensaje) { setError(mensaje); return; }
        const actual = categorias.find((c) => c.id === editando);
        const ok = await ejecutar(
            () => guardarCategoria({ id: actual?.id ?? null, edificioId: edificio.id, concepto, monto, activo: actual?.activo ?? true }),
            actual ? "Concepto actualizado." : "Concepto agregado."
        );
        if (ok) setEditando(null);
    }

    return (
        <Modal
            titulo="Categorías de expensas"
            onClose={alCerrar}
            ancho={640}
            pie={<button type="button" className="modal-boton principal" onClick={alCerrar}>Listo</button>}
        >
            <div className="cfg-form">
                <p className="cfg-ayuda">Estos son los conceptos que se copian a la boleta de cada unidad cuando se generan las expensas del mes de <strong>{edificio.nombre}</strong>. Los desactivados no se incluyen. Las expensas ya emitidas no se modifican.</p>

                {categorias.length === 0 && <p className="cfg-vacio">Todavía no cargaste conceptos. Sin conceptos no se pueden generar expensas.</p>}

                <ul className="cfg-categorias">
                    {categorias.map((c, i) => (
                        <li key={c.id} className={c.activo ? "" : "inactiva"}>
                            <div className="cfg-cat-orden">
                                <button type="button" aria-label={`Subir ${c.concepto}`} disabled={ocupado || i === 0} onClick={() => ejecutar(() => moverCategoria(c.id, "ARRIBA"))}><ArrowUp size={14} /></button>
                                <button type="button" aria-label={`Bajar ${c.concepto}`} disabled={ocupado || i === categorias.length - 1} onClick={() => ejecutar(() => moverCategoria(c.id, "ABAJO"))}><ArrowDown size={14} /></button>
                            </div>
                            <div className="cfg-cat-texto">
                                <strong>{c.concepto}</strong>
                                <span>{c.montoTexto} por unidad{c.activo ? "" : " · desactivado"}</span>
                            </div>
                            <button type="button" role="switch" aria-checked={c.activo} aria-label={`${c.activo ? "Desactivar" : "Activar"} ${c.concepto}`}
                                className={`cfg-switch ${c.activo ? "activo" : ""}`} disabled={ocupado}
                                onClick={() => ejecutar(() => guardarCategoria({ id: c.id, edificioId: edificio.id, concepto: c.concepto, monto: c.monto, activo: !c.activo }))}>
                                <span></span>
                            </button>
                            <button type="button" className="cfg-icono" aria-label={`Editar ${c.concepto}`} disabled={ocupado} onClick={() => abrirEditar(c)}><Pencil size={15} /></button>
                            <button type="button" className="cfg-icono peligro" aria-label={`Borrar ${c.concepto}`} disabled={ocupado} onClick={() => setPorBorrar(c)}><Trash2 size={15} /></button>
                        </li>
                    ))}
                </ul>

                {categorias.length > 0 && <p className="cfg-total"><span>Total de la expensa por unidad</span><strong>{new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 2 }).format(total)}</strong></p>}

                {porBorrar && (
                    <div className="cfg-confirmar" role="alertdialog" aria-label="Confirmar borrado">
                        <p>¿Borrar <strong>{porBorrar.concepto}</strong>? Las expensas ya emitidas lo conservan; solo deja de incluirse en las próximas. Si preferís no perderlo, desactivalo.</p>
                        <div className="cfg-cat-botones">
                            <button type="button" className="modal-boton" onClick={() => setPorBorrar(null)}>Cancelar</button>
                            <button type="button" className="modal-boton peligro" disabled={ocupado}
                                onClick={async () => { const c = porBorrar; setPorBorrar(null); await ejecutar(() => eliminarCategoria(c.id), "Concepto borrado."); }}>Borrar</button>
                        </div>
                    </div>
                )}

                {editando === null ? (
                    <button type="button" className="cfg-btn-secundario" onClick={abrirNuevo}><Plus size={15} />Agregar concepto</button>
                ) : (
                    <form className="cfg-cat-form" onSubmit={guardar} noValidate>
                        <div className="cfg-campo">
                            <label htmlFor="cfg-concepto">Nombre del concepto</label>
                            <input id="cfg-concepto" value={concepto} maxLength={80} onChange={(e) => setConcepto(e.target.value)} placeholder="Ej.: Ascensor" autoFocus />
                        </div>
                        <div className="cfg-campo">
                            <label htmlFor="cfg-monto">Monto por unidad ($)</label>
                            <input id="cfg-monto" inputMode="decimal" value={monto} onChange={(e) => setMonto(e.target.value)} placeholder="Ej.: 12500" />
                        </div>
                        <div className="cfg-cat-botones">
                            <button type="button" className="modal-boton" onClick={() => { setEditando(null); setError(""); }}>Cancelar</button>
                            <button type="submit" className="modal-boton principal" disabled={ocupado}>{ocupado ? "Guardando…" : editando === "nuevo" ? "Agregar" : "Guardar"}</button>
                        </div>
                    </form>
                )}

                {error && <p className="cfg-aviso cfg-aviso-error" role="alert"><AlertCircle size={15} /><span>{error}</span></p>}
            </div>

        </Modal>
    );
}

/* ---------- Modal: contraseña ---------- */
function ModalContrasena({ alCerrar, avisar }) {
    const [actual, setActual] = useState("");
    const [nueva, setNueva] = useState("");
    const [repetida, setRepetida] = useState("");
    const [error, setError] = useState("");
    const [guardando, setGuardando] = useState(false);

    async function enviar(e) {
        e.preventDefault();
        const mensaje = validarContrasenaNueva(actual, nueva, repetida);
        if (mensaje) { setError(mensaje); return; }
        setGuardando(true);
        try { await cambiarContrasena(actual, nueva); avisar("Contraseña actualizada."); alCerrar(); }
        catch (err) { setError(err.message); setGuardando(false); }
    }

    return (
        <Modal titulo="Cambiar contraseña" onClose={alCerrar} ancho={440}
            pie={<>
                <button type="button" className="modal-boton" onClick={alCerrar}>Cancelar</button>
                <button type="submit" form="form-contrasena" className="modal-boton principal" disabled={guardando}>{guardando ? "Guardando…" : "Cambiar contraseña"}</button>
            </>}>
            <form id="form-contrasena" className="cfg-form" onSubmit={enviar} noValidate>
                <div className="cfg-campo"><label htmlFor="cfg-pw-actual">Contraseña actual</label><input id="cfg-pw-actual" type="password" autoComplete="current-password" value={actual} onChange={(e) => setActual(e.target.value)} /></div>
                <div className="cfg-campo"><label htmlFor="cfg-pw-nueva">Contraseña nueva</label><input id="cfg-pw-nueva" type="password" autoComplete="new-password" value={nueva} onChange={(e) => setNueva(e.target.value)} /><small>Mínimo 8 caracteres.</small></div>
                <div className="cfg-campo"><label htmlFor="cfg-pw-rep">Repetí la contraseña nueva</label><input id="cfg-pw-rep" type="password" autoComplete="new-password" value={repetida} onChange={(e) => setRepetida(e.target.value)} /></div>
                {error && <p className="cfg-aviso cfg-aviso-error" role="alert"><AlertCircle size={15} /><span>{error}</span></p>}
            </form>
        </Modal>
    );
}

/* ---------- Switch ---------- */
function Interruptor({ activo, etiqueta, alCambiar, deshabilitado }) {
    return (
        <button type="button" role="switch" aria-checked={activo} aria-label={etiqueta} disabled={deshabilitado}
            className={`cfg-switch ${activo ? "activo" : ""}`} onClick={alCambiar}><span></span></button>
    );
}

/* ---------- Página ---------- */
function Configuracion() {
    const [datos, setDatos] = useState(null);
    const [errorCarga, setErrorCarga] = useState("");
    const [edificioId, setEdificioId] = useState(null);
    const [aviso, setAviso] = useState(null);

    const [editandoDatos, setEditandoDatos] = useState(false);
    const [form, setForm] = useState({ nombre: "", direccion: "", telefono: "", email: "", fechaInicio: "" });
    const [erroresForm, setErroresForm] = useState({});
    const [guardandoDatos, setGuardandoDatos] = useState(false);

    const [subiendoFoto, setSubiendoFoto] = useState(false);
    const [modal, setModal] = useState(null); // "vencimiento" | "categorias" | "contrasena"
    const [cuentaForm, setCuentaForm] = useState({ nombre: "", telefono: "" });
    const [guardandoCuenta, setGuardandoCuenta] = useState(false);
    const [cerrandoSesiones, setCerrandoSesiones] = useState(false);
    const [prefs, setPrefs] = useState(null);
    const inputFoto = useRef(null);

    const avisar = useCallback((texto, esError = false) => setAviso({ texto, esError, id: Date.now() }), []);

    useEffect(() => { document.title = "Habita | Configuración"; }, []);
    useEffect(() => {
        if (!aviso) return undefined;
        const t = setTimeout(() => setAviso(null), 4500);
        return () => clearTimeout(t);
    }, [aviso]);

    const cargar = useCallback(async () => {
        try {
            const d = await obtenerConfiguracion();
            setDatos(d);
            setPrefs(d.preferencias);
            setCuentaForm({ nombre: d.cuenta.nombre, telefono: d.cuenta.telefono });
            setEdificioId((actual) => (d.edificios.some((e) => e.id === actual) ? actual : d.edificios[0]?.id ?? null));
            setErrorCarga("");
        } catch (e) { setErrorCarga(e.message); }
    }, []);
    useEffect(() => { cargar(); }, [cargar]);

    if (errorCarga) return <div className="configuracion"><p className="cfg-aviso cfg-aviso-error"><AlertCircle size={16} /><span>{errorCarga}</span></p></div>;
    if (!datos) return <div className="configuracion"><p className="cfg-cargando">Cargando configuración…</p></div>;

    const edificio = datos.edificios.find((e) => e.id === edificioId) ?? datos.edificios[0];
    const categorias = datos.categorias.filter((c) => c.edificioId === edificio.id);
    const activas = categorias.filter((c) => c.activo);
    const ultimaCat = categorias.reduce((m, c) => (c.actualizado > m ? c.actualizado : m), "");
    const ultimaCatTexto = categorias.find((c) => c.actualizado === ultimaCat)?.actualizadoTexto ?? "—";
    const periodo = nombrePeriodo(periodoActualClave());

    function empezarEdicion() {
        setForm({ nombre: edificio.nombre, direccion: edificio.direccion, telefono: edificio.telefono, email: edificio.email, fechaInicio: edificio.fechaInicio });
        setErroresForm({});
        setEditandoDatos(true);
    }

    async function guardarDatos(e) {
        e.preventDefault();
        const errores = validarConsorcio(form);
        setErroresForm(errores);
        if (Object.keys(errores).length) return;
        setGuardandoDatos(true);
        try {
            await guardarConsorcio(edificio.id, form);
            await cargar();
            setEditandoDatos(false);
            avisar("Datos del consorcio actualizados.");
        } catch (err) { avisar(err.message, true); }
        finally { setGuardandoDatos(false); }
    }

    async function elegirFoto(e) {
        const archivo = e.target.files?.[0];
        e.target.value = "";
        if (!archivo) return;
        const mensaje = validarFoto(archivo);
        if (mensaje) { avisar(mensaje, true); return; }
        setSubiendoFoto(true);
        try { await cambiarFotoEdificio(edificio.id, archivo); await cargar(); avisar("Foto actualizada. Los residentes la ven en su menú."); }
        catch (err) { avisar(err.message, true); }
        finally { setSubiendoFoto(false); }
    }

    async function quitarFoto() {
        setSubiendoFoto(true);
        try { await quitarFotoEdificio(edificio.id); await cargar(); avisar("Foto quitada. Se muestra la imagen predeterminada."); }
        catch (err) { avisar(err.message, true); }
        finally { setSubiendoFoto(false); }
    }

    async function cambiarPreferencia(clave) {
        const valor = !prefs[clave];
        setPrefs({ ...prefs, [clave]: valor });
        try { await guardarPreferenciasAdmin({ [clave]: valor }); }
        catch (err) { setPrefs((p) => ({ ...p, [clave]: !valor })); avisar(err.message, true); }
    }

    async function guardarMiCuenta(e) {
        e.preventDefault();
        setGuardandoCuenta(true);
        try { await guardarCuenta(cuentaForm); await cargar(); avisar("Tus datos se guardaron."); }
        catch (err) { avisar(err.message, true); }
        finally { setGuardandoCuenta(false); }
    }

    async function cerrarTodas() {
        setCerrandoSesiones(true);
        try { await cerrarSesionEnTodos(); window.location.assign("/login"); }
        catch (err) { avisar(err.message, true); setCerrandoSesiones(false); }
    }

    const cuentaCambio = cuentaForm.nombre.trim() !== datos.cuenta.nombre || cuentaForm.telefono.trim() !== datos.cuenta.telefono;
    const campo = (clave, etiqueta, props = {}) => (
        <div className="cfg-campo">
            <label htmlFor={`cfg-${clave}`}>{etiqueta}</label>
            <input id={`cfg-${clave}`} value={form[clave]} onChange={(e) => setForm({ ...form, [clave]: e.target.value })} aria-invalid={!!erroresForm[clave]} {...props} />
            {erroresForm[clave] && <small className="cfg-error-campo">{erroresForm[clave]}</small>}
        </div>
    );

    return (
        <div className="configuracion">
            {datos.edificios.length > 1 && (
                <div className="cfg-selector">
                    <Building2 size={16} />
                    <label htmlFor="cfg-edificio">Edificio</label>
                    <select id="cfg-edificio" value={edificio.id} onChange={(e) => { setEdificioId(Number(e.target.value)); setEditandoDatos(false); }}>
                        {datos.edificios.map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                    </select>
                </div>
            )}

            {/* ---------- FILA 1: datos + imagen ---------- */}
            <div className="cfg-fila-principal">
                <Panel
                    titulo="Datos del consorcio"
                    className="cfg-datos"
                    accion={!editandoDatos && <button type="button" className="cfg-btn-editar" onClick={empezarEdicion}><Pencil size={14} />Editar</button>}
                >
                    {editandoDatos ? (
                        <form className="cfg-form" onSubmit={guardarDatos} noValidate>
                            {campo("nombre", "Nombre del consorcio", { maxLength: 80 })}
                            {campo("direccion", "Dirección", { maxLength: 150 })}
                            <div className="cfg-dos">
                                {campo("telefono", "Teléfono", { inputMode: "tel", placeholder: "11 1234-5678" })}
                                {campo("fechaInicio", "Fecha de inicio", { type: "date", max: hoyISO() })}
                            </div>
                            {campo("email", "Email de contacto", { type: "email", placeholder: "administracion@tuconsorcio.com" })}
                            <div className="cfg-botones">
                                <button type="button" className="modal-boton" onClick={() => setEditandoDatos(false)}>Cancelar</button>
                                <button type="submit" className="modal-boton principal" disabled={guardandoDatos}>{guardandoDatos ? "Guardando…" : "Guardar cambios"}</button>
                            </div>
                        </form>
                    ) : (
                        <dl className="cfg-datos-lista">
                            <div><dt>Nombre del consorcio</dt><dd>{edificio.nombre}</dd></div>
                            <div><dt>Dirección</dt><dd>{edificio.direccion}</dd></div>
                            <div><dt>Teléfono</dt><dd className={edificio.telefono ? "" : "vacio"}>{edificio.telefono || "Sin cargar"}</dd></div>
                            <div><dt>Email de contacto</dt><dd className={edificio.email ? "" : "vacio"}>{edificio.email || "Sin cargar"}</dd></div>
                        </dl>
                    )}
                </Panel>

                <Panel className="cfg-imagen" titulo="Imagen del edificio" descripcion="Es la foto que ven los residentes en su menú, debajo de las secciones.">
                    <div className="cfg-imagen-cuerpo">
                        <div className="cfg-banner">
                            <img src={edificio.fotoUrl ?? imagenPredeterminada} alt={`Foto de ${edificio.nombre}`} />
                            {subiendoFoto && <div className="cfg-banner-cargando">Subiendo…</div>}
                        </div>
                        <div className="cfg-imagen-lado">
                            <div className="cfg-vista-residente" aria-label="Así lo ven los residentes">
                                <span>Así lo ven los residentes</span>
                                <div className="cfg-mini">
                                    <img src={edificio.fotoUrl ?? imagenPredeterminada} alt="" />
                                    <div><strong>{edificio.nombre}</strong><small>{edificio.direccion}</small></div>
                                </div>
                            </div>
                            <div className="cfg-imagen-botones">
                                <input ref={inputFoto} type="file" accept="image/jpeg,image/png,image/webp" id="cfg-foto" hidden onChange={elegirFoto} />
                                <button type="button" className="cfg-btn-secundario" disabled={subiendoFoto} onClick={() => inputFoto.current?.click()}><Camera size={15} />{edificio.fotoUrl ? "Cambiar foto" : "Subir foto"}</button>
                                {edificio.fotoUrl && <button type="button" className="cfg-btn-texto peligro" disabled={subiendoFoto} onClick={quitarFoto}><X size={14} />Quitar foto</button>}
                            </div>
                            <small className="cfg-nota">JPG, PNG o WebP de hasta 5 MB. Se ve mejor en horizontal.</small>
                        </div>
                    </div>
                </Panel>

                <Panel className="cfg-info" titulo="Información general">
                    <div className="cfg-info-lista">
                        <div><span>Fecha de inicio</span><strong>{edificio.fechaInicioTexto}</strong></div>
                        <div><span>Unidades</span><strong>{edificio.unidades}</strong></div>
                        <div><span>Unidades ocupadas</span><strong>{edificio.ocupadas} de {edificio.unidades}</strong></div>
                        <div><span>Residentes</span><strong>{edificio.residentes}</strong></div>
                        <div><span>Edificios que administrás</span><strong>{datos.edificios.length}</strong></div>
                    </div>
                </Panel>
            </div>

            {/* ---------- FILA 2: expensas (izquierda) + notificaciones (derecha) ---------- */}
            <section className="cfg-fila-config">
                <div className="cfg-col">
                    <Panel className="cfg-tarjeta" icono={<CalendarClock size={20} />} titulo="Período de expensas"
                        accion={<button type="button" className="cfg-btn-secundario chico" onClick={() => setModal("vencimiento")}><Settings size={14} />Configurar</button>}>
                        <p className="cfg-ayuda">Hasta qué día del mes se pueden pagar las expensas sin estar vencidas.</p>
                        <div className="cfg-stats">
                            <div><span>Período actual</span><strong>{periodo}</strong></div>
                            <div><span>Día de vencimiento</span><strong>Día {edificio.diaVencimiento}</strong></div>
                            <div><span>Próxima generación automática</span><strong>{proximaGeneracion()}</strong></div>
                        </div>
                    </Panel>

                    <Panel className="cfg-tarjeta" icono={<DollarSign size={20} />} titulo="Categorías de expensas"
                        accion={<button type="button" className="cfg-btn-secundario chico" onClick={() => setModal("categorias")}><ListChecks size={14} />Gestionar</button>}>
                        <p className="cfg-ayuda">Los conceptos que se cobran en la expensa de cada unidad.</p>
                        <div className="cfg-stats">
                            <div><span>Conceptos activos</span><strong>{activas.length}{categorias.length > activas.length ? ` de ${categorias.length}` : ""}</strong></div>
                            <div><span>Última actualización</span><strong>{ultimaCatTexto}</strong></div>
                            <div><span>Total por unidad</span><strong>{new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 2 }).format(activas.reduce((s, c) => s + c.monto, 0))}</strong></div>
                        </div>
                    </Panel>
                </div>

                <Panel className="cfg-tarjeta cfg-notificaciones" icono={<Bell size={20} />} titulo="Notificaciones del sistema" descripcion="Elegí de qué querés que te avisemos.">
                    {NOTIFICACIONES.map((n) => (
                        <div className="cfg-notif-fila" key={n.clave}>
                            <div><strong>{n.titulo}</strong><span>{n.texto}</span></div>
                            <Interruptor activo={!!prefs[n.clave]} etiqueta={n.titulo} alCambiar={() => cambiarPreferencia(n.clave)} />
                        </div>
                    ))}
                </Panel>
            </section>

            {/* ---------- FILA 3: mi cuenta ---------- */}
            <section className="cfg-fila-cuenta">
                <Panel className="cfg-tarjeta" icono={<UserRound size={20} />} titulo="Mi cuenta" descripcion="Tus datos como administrador.">
                    <form className="cfg-form" onSubmit={guardarMiCuenta} noValidate>
                        <div className="cfg-dos">
                            <div className="cfg-campo"><label htmlFor="cfg-nombre-admin">Nombre</label><input id="cfg-nombre-admin" value={cuentaForm.nombre} onChange={(e) => setCuentaForm({ ...cuentaForm, nombre: e.target.value })} /></div>
                            <div className="cfg-campo"><label htmlFor="cfg-tel-admin">Teléfono</label><input id="cfg-tel-admin" inputMode="tel" value={cuentaForm.telefono} onChange={(e) => setCuentaForm({ ...cuentaForm, telefono: e.target.value })} /></div>
                        </div>
                        <div className="cfg-campo"><label htmlFor="cfg-mail-admin">Email de acceso</label><input id="cfg-mail-admin" value={datos.cuenta.email} readOnly disabled /><small>Es el email con el que iniciás sesión.</small></div>
                        <div className="cfg-botones"><button type="submit" className="modal-boton principal" disabled={!cuentaCambio || guardandoCuenta}>{guardandoCuenta ? "Guardando…" : "Guardar mis datos"}</button></div>
                    </form>
                </Panel>

                <Panel className="cfg-tarjeta" icono={<KeyRound size={20} />} titulo="Seguridad" descripcion="Protegé el acceso a la administración.">
                    <div className="cfg-seguridad">
                        <div><strong>Contraseña</strong><span>Cambiala cada tanto y no la repitas en otros sitios.</span><button type="button" className="cfg-btn-secundario" onClick={() => setModal("contrasena")}><KeyRound size={15} />Cambiar contraseña</button></div>
                        <div><strong>Sesiones abiertas</strong><span>Si iniciaste sesión en una computadora ajena, cerrá todas las sesiones. Vas a tener que volver a entrar.</span><button type="button" className="cfg-btn-secundario peligro" disabled={cerrandoSesiones} onClick={cerrarTodas}><LogOut size={15} />{cerrandoSesiones ? "Cerrando…" : "Cerrar sesión en todos los dispositivos"}</button></div>
                    </div>
                </Panel>
            </section>

            {modal === "vencimiento" && (
                <ModalVencimiento edificio={edificio} alCerrar={() => setModal(null)}
                    alGuardar={async (dia) => { await guardarVencimiento(edificio.id, dia); await cargar(); setModal(null); avisar(`Las expensas vencen el día ${dia} de cada mes.`); }} />
            )}
            {modal === "categorias" && <ModalCategorias edificio={edificio} categorias={categorias} alCambiar={cargar} alCerrar={() => setModal(null)} avisar={avisar} />}
            {modal === "contrasena" && <ModalContrasena alCerrar={() => setModal(null)} avisar={avisar} />}

            {aviso && <p className={`cfg-aviso ${aviso.esError ? "cfg-aviso-error" : "cfg-aviso-ok"} cfg-aviso-flotante`} role="status">{aviso.esError ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}<span>{aviso.texto}</span></p>}
        </div>
    );
}

export default Configuracion;
