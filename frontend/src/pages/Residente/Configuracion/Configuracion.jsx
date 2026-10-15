import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Bell, Bug, ChevronDown, ChevronRight, CircleHelp, FileText, LifeBuoy, LogOut,
    MousePointer2, ShieldCheck, UserRound,
} from "lucide-react";

import "./Configuracion.css";
import Panel from "../../../components/Panel/Panel";
import Modal from "../../../components/Modal/Modal";
import { usePerfil } from "../../../context/PerfilContext";
import {
    TIPOS_REPORTE,
    PREFERENCIAS_POR_DEFECTO,
    obtenerPreferencias,
    guardarPreferencias,
    validarReporte,
    enviarReporte,
    cerrarSesionEnTodosLosDispositivos,
} from "../../../services/configuracionService";

const VERSION_APP = "1.0.0";

const NOTIFICACIONES = [
    { clave: "notif_avisos", titulo: "Avisos", detalle: "Recibí avisos importantes del consorcio" },
    { clave: "notif_expensas", titulo: "Expensas", detalle: "Recordatorios y novedades de expensas" },
    { clave: "notif_reservas", titulo: "Reservas", detalle: "Confirmaciones y recordatorios de reservas" },
    { clave: "notif_reclamos", titulo: "Reclamos", detalle: "Cambios de estado en tus reclamos" },
    { clave: "notif_documentos", titulo: "Documentos", detalle: "Aviso cuando se publica un documento nuevo" },
];

const OPCIONES_DIAS = [1, 3, 5, 7];

const PREGUNTAS = [
    {
        pregunta: "¿Cómo pago mis expensas?",
        respuesta: "Entrá a Mis expensas, elegí la expensa pendiente y tocá el botón de pago. También podés descargar la boleta en PDF.",
    },
    {
        pregunta: "¿Cómo reservo un espacio común?",
        respuesta: "En Reservas elegí el espacio, la fecha y el horario disponible. Podés modificar o cancelar tu reserva desde la misma pantalla.",
    },
    {
        pregunta: "¿Cómo hago un reclamo?",
        respuesta: "En Reclamos tocá Nuevo reclamo, completá el asunto, la categoría y la descripción, y adjuntá una foto si ayuda. Vas a ver el estado en el listado.",
    },
    {
        pregunta: "¿Cómo cambio mi contraseña o mis datos?",
        respuesta: "Desde Mi perfil podés editar tu nombre, tu foto, tu teléfono y cambiar tu contraseña.",
    },
];

const REPORTE_VACIO = { asunto: "", tipo: "", descripcion: "" };

function Configuracion() {
    const navigate = useNavigate();
    const { perfil } = usePerfil();

    useEffect(() => {
        document.title = "Habita | Configuración";
    }, []);

    /* ---------- Preferencias de notificación ---------- */
    const [preferencias, setPreferencias] = useState(PREFERENCIAS_POR_DEFECTO);
    const [cargandoPreferencias, setCargandoPreferencias] = useState(true);
    const [mensajePreferencias, setMensajePreferencias] = useState({ tipo: "", texto: "" });

    useEffect(() => {
        let cancelado = false;
        obtenerPreferencias()
            .then((guardadas) => { if (!cancelado) setPreferencias(guardadas); })
            .catch((err) => {
                console.error("No se pudieron cargar las preferencias", err);
                if (!cancelado) setMensajePreferencias({ tipo: "error", texto: "No pudimos cargar tus preferencias. Se muestran las predeterminadas." });
            })
            .finally(() => { if (!cancelado) setCargandoPreferencias(false); });
        return () => { cancelado = true; };
    }, []);

    async function cambiarPreferencia(clave, valor) {
        const anterior = preferencias[clave];
        setPreferencias((actuales) => ({ ...actuales, [clave]: valor }));
        setMensajePreferencias({ tipo: "", texto: "" });
        try {
            await guardarPreferencias({ [clave]: valor });
            setMensajePreferencias({ tipo: "ok", texto: "Preferencia guardada." });
        } catch (err) {
            console.error("No se pudo guardar la preferencia", err);
            setPreferencias((actuales) => ({ ...actuales, [clave]: anterior }));
            setMensajePreferencias({ tipo: "error", texto: "No pudimos guardar el cambio. Probá de nuevo." });
        }
    }

    /* ---------- Cuenta: cerrar sesión en todos lados ---------- */
    const [cerrandoSesiones, setCerrandoSesiones] = useState(false);
    const [errorSesiones, setErrorSesiones] = useState("");

    async function cerrarEnTodos() {
        setCerrandoSesiones(true);
        setErrorSesiones("");
        try {
            await cerrarSesionEnTodosLosDispositivos();
            navigate("/");
        } catch (err) {
            console.error("No se pudo cerrar la sesión", err);
            setErrorSesiones("No pudimos cerrar las sesiones. Probá de nuevo.");
            setCerrandoSesiones(false);
        }
    }

    /* ---------- Reportar un problema (modal) ---------- */
    const [reporteAbierto, setReporteAbierto] = useState(false);
    const [reporte, setReporte] = useState(REPORTE_VACIO);
    const [errorReporte, setErrorReporte] = useState("");
    const [enviandoReporte, setEnviandoReporte] = useState(false);
    const [reporteEnviado, setReporteEnviado] = useState(false);

    function abrirReporte() {
        setReporte(REPORTE_VACIO);
        setErrorReporte("");
        setReporteAbierto(true);
    }

    function cerrarReporte() {
        if (!enviandoReporte) setReporteAbierto(false);
    }

    async function enviarFormularioReporte(evento) {
        evento.preventDefault();
        const problema = validarReporte(reporte);
        if (problema) {
            setErrorReporte(problema);
            return;
        }
        setEnviandoReporte(true);
        setErrorReporte("");
        try {
            await enviarReporte(reporte);
            setReporteAbierto(false);
            setReporteEnviado(true);
        } catch (err) {
            console.error("No se pudo enviar el reporte", err);
            setErrorReporte("No pudimos enviar tu reporte. Probá de nuevo en unos minutos.");
        } finally {
            setEnviandoReporte(false);
        }
    }

    return (
        <main className="configuracion">
            <div className="configuracion-columna">

                {/* =========== CUENTA Y SEGURIDAD =========== */}
                <Panel
                    icono={<UserRound />}
                    titulo="Cuenta y seguridad"
                    descripcion="Datos de acceso y sesiones de tu cuenta."
                    className="config-panel"
                >
                    <div className="config-fila">
                        <div>
                            <strong>Correo electrónico</strong>
                            <span>{perfil?.email ?? "—"}</span>
                        </div>
                    </div>

                    <div className="config-fila">
                        <div>
                            <strong>Contraseña y datos personales</strong>
                            <span>Cambiá tu contraseña, tu teléfono o tu foto desde Mi perfil.</span>
                        </div>
                        <Link to="/perfil" className="config-boton-secundario">Ir a Mi perfil</Link>
                    </div>

                    <div className="config-fila">
                        <div>
                            <strong>Cerrar sesión en todos los dispositivos</strong>
                            <span>Útil si usaste tu cuenta en una computadora o celular que no es tuyo.</span>
                        </div>
                        <button
                            type="button"
                            className="config-boton-secundario config-boton-peligro"
                            onClick={cerrarEnTodos}
                            disabled={cerrandoSesiones}
                        >
                            <LogOut aria-hidden="true" />
                            {cerrandoSesiones ? "Cerrando..." : "Cerrar sesiones"}
                        </button>
                    </div>
                    {errorSesiones && <p className="config-mensaje error" role="alert">{errorSesiones}</p>}
                </Panel>

                {/* =========== AYUDA Y SOPORTE =========== */}
                <Panel
                    icono={<LifeBuoy />}
                    titulo="Ayuda y soporte"
                    descripcion="Respuestas rápidas y un canal para contarnos qué pasa."
                    className="config-panel"
                >
                    {reporteEnviado && (
                        <p className="config-mensaje ok" role="status">
                            ¡Gracias! Recibimos tu reporte y lo va a revisar el equipo.
                        </p>
                    )}

                    <div className="config-fila">
                        <div>
                            <strong>Reportar un problema</strong>
                            <span>Contanos si encontraste un error o algo que podamos mejorar en Habita.</span>
                        </div>
                        <button type="button" className="config-boton-principal" onClick={abrirReporte}>
                            <Bug aria-hidden="true" />
                            Reportar un problema
                        </button>
                    </div>

                    <h3 className="config-subtitulo"><CircleHelp aria-hidden="true" /> Preguntas frecuentes</h3>
                    <div className="config-preguntas">
                        {PREGUNTAS.map((item) => (
                            <details key={item.pregunta}>
                                <summary>
                                    {item.pregunta}
                                    <ChevronDown aria-hidden="true" />
                                </summary>
                                <p>{item.respuesta}</p>
                            </details>
                        ))}
                    </div>
                </Panel>
            </div>

            <div className="configuracion-columna">

                {/* =========== NOTIFICACIONES =========== */}
                <Panel
                    icono={<Bell />}
                    titulo="Preferencias de notificación"
                    descripcion="Elegí de qué querés enterarte."
                    className="config-panel"
                >
                    <ul className="config-notificaciones">
                        {NOTIFICACIONES.map((item) => (
                            <li key={item.clave}>
                                <div>
                                    <strong id={`etiqueta-${item.clave}`}>{item.titulo}</strong>
                                    <span>{item.detalle}</span>
                                </div>
                                <label className="config-switch">
                                    <input
                                        type="checkbox"
                                        role="switch"
                                        aria-labelledby={`etiqueta-${item.clave}`}
                                        checked={preferencias[item.clave]}
                                        disabled={cargandoPreferencias}
                                        onChange={(e) => cambiarPreferencia(item.clave, e.target.checked)}
                                    />
                                    <span aria-hidden="true" />
                                </label>
                            </li>
                        ))}
                    </ul>

                    <div className="config-fila config-fila-dias">
                        <div>
                            <strong>Recordar vencimiento de expensas</strong>
                            <span>Cuántos días antes del vencimiento te avisamos.</span>
                        </div>
                        <span className="config-select">
                            <select
                                aria-label="Días antes del vencimiento"
                                value={preferencias.dias_aviso_vencimiento}
                                disabled={cargandoPreferencias || !preferencias.notif_expensas}
                                onChange={(e) => cambiarPreferencia("dias_aviso_vencimiento", Number(e.target.value))}
                            >
                                {OPCIONES_DIAS.map((dias) => (
                                    <option key={dias} value={dias}>{dias} {dias === 1 ? "día" : "días"} antes</option>
                                ))}
                            </select>
                            <ChevronDown aria-hidden="true" />
                        </span>
                    </div>

                    {mensajePreferencias.texto && (
                        <p className={`config-mensaje ${mensajePreferencias.tipo}`} role={mensajePreferencias.tipo === "error" ? "alert" : "status"}>
                            {mensajePreferencias.texto}
                        </p>
                    )}
                    <p className="config-nota">
                        Tus preferencias quedan guardadas. Los envíos de notificaciones se van a activar cuando esté listo ese módulo.
                    </p>
                </Panel>

                {/* =========== INFORMACIÓN LEGAL =========== */}
                <Panel
                    icono={<FileText />}
                    titulo="Información legal"
                    descripcion="Información sobre el uso de Habita."
                    className="config-panel"
                >
                    <nav className="config-enlaces" aria-label="Información legal">
                        <a href="/terminos" target="_blank" rel="noopener noreferrer">
                            Términos y condiciones <ChevronRight aria-hidden="true" />
                        </a>
                        <a href="/privacidad" target="_blank" rel="noopener noreferrer">
                            Política de privacidad <ChevronRight aria-hidden="true" />
                        </a>
                    </nav>
                    <p className="config-version"><ShieldCheck aria-hidden="true" /> Habita · Versión {VERSION_APP}</p>
                </Panel>
            </div>

            {/* =========== MODAL: REPORTAR UN PROBLEMA =========== */}
            {reporteAbierto && (
                <Modal
                    titulo="Reportar un problema"
                    onClose={cerrarReporte}
                    ancho={560}
                    pie={
                        <>
                            <button type="button" className="modal-boton" onClick={cerrarReporte} disabled={enviandoReporte}>
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                form="form-reporte"
                                className="modal-boton principal config-btn-enviar"
                                disabled={enviandoReporte}
                            >
                                <MousePointer2 aria-hidden="true" />
                                {enviandoReporte ? "Enviando..." : "Enviar reporte"}
                            </button>
                        </>
                    }
                >
                    <form id="form-reporte" className="config-form" onSubmit={enviarFormularioReporte}>
                        <p className="config-form-intro">Contanos si encontraste un error o algo que podamos mejorar en Habita.</p>

                        <div className="config-campo">
                            <label htmlFor="reporte-asunto">Asunto</label>
                            <input
                                id="reporte-asunto"
                                type="text"
                                placeholder="Ej.: No puedo ver mis expensas"
                                maxLength={100}
                                value={reporte.asunto}
                                onChange={(e) => setReporte({ ...reporte, asunto: e.target.value })}
                                autoFocus
                            />
                        </div>

                        <div className="config-campo">
                            <label htmlFor="reporte-tipo">Tipo de reporte</label>
                            <span className="config-select">
                                <select
                                    id="reporte-tipo"
                                    value={reporte.tipo}
                                    onChange={(e) => setReporte({ ...reporte, tipo: e.target.value })}
                                >
                                    <option value="" disabled>Seleccioná una opción</option>
                                    {TIPOS_REPORTE.map((tipo) => (
                                        <option key={tipo.valor} value={tipo.valor}>{tipo.etiqueta}</option>
                                    ))}
                                </select>
                                <ChevronDown aria-hidden="true" />
                            </span>
                        </div>

                        <div className="config-campo">
                            <label htmlFor="reporte-descripcion">Descripción</label>
                            <textarea
                                id="reporte-descripcion"
                                rows={5}
                                maxLength={1000}
                                placeholder="Describí qué ocurrió y qué esperabas que sucediera."
                                value={reporte.descripcion}
                                onChange={(e) => setReporte({ ...reporte, descripcion: e.target.value })}
                            />
                        </div>

                        {errorReporte && <p className="config-mensaje error" role="alert">{errorReporte}</p>}
                    </form>
                </Modal>
            )}
        </main>
    );
}

export default Configuracion;
