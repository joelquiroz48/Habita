import { useEffect, useState } from "react";
import {
    Settings,
    Palette,
    Globe,
    CalendarCheck,
    Shield,
    HelpCircle,
    MessageCircle,
    FileText,
    LogOut,
    Trash2,
    ChevronRight,
} from "lucide-react";

import "./Configuracion.css";

function Configuracion() {
    useEffect(() => {
        document.title = "Habita | Configuración";
    }, []);

    const [preferencias, setPreferencias] = useState({
        espaciosDisponibles: false,
        recordatorioReservas: false,
        confirmarCancelacion: false,
    });

    const cambiarPreferencia = (tipo) => {
        setPreferencias((prev) => ({
            ...prev,
            [tipo]: !prev[tipo],
        }));
    };

    return (
        <main className="configuracion">
            <div className="configuracion-grid">

                {/* =========================
                    COLUMNA PRINCIPAL
                ========================= */}

                <div className="configuracion-principal">

                    {/* =========================
                        PREFERENCIAS
                    ========================= */}

                    <section className="config-card">

                        <div className="config-card-header">

                            <div className="config-icon">
                                <Settings size={17} />
                            </div>

                            <div>
                                <h2>Preferencias de la aplicación</h2>
                                <p>
                                    Personalizá cómo querés utilizar Habita.
                                </p>
                            </div>

                        </div>

                        <div className="config-list">

                            <div className="config-item">

                                <div className="config-item-icon">
                                    <Palette size={16} />
                                </div>

                                <div className="config-item-content">
                                    <strong>Apariencia</strong>
                                    <span>
                                        Elegí cómo se muestra la aplicación.
                                    </span>
                                </div>

                                <select defaultValue="claro">
                                    <option value="claro">
                                        Claro
                                    </option>

                                    <option value="automatico">
                                        Automático
                                    </option>
                                </select>

                            </div>


                            <div className="config-item">

                                <div className="config-item-icon">
                                    <Globe size={16} />
                                </div>

                                <div className="config-item-content">
                                    <strong>Idioma</strong>
                                    <span>
                                        Seleccioná el idioma de Habita.
                                    </span>
                                </div>

                                <select defaultValue="es">
                                    <option value="es">
                                        Español
                                    </option>
                                </select>

                            </div>


                            <div className="config-item">

                                <div className="config-item-icon">
                                    <CalendarCheck size={16} />
                                </div>

                                <div className="config-item-content">
                                    <strong>Formato de fecha</strong>
                                    <span>
                                        Elegí cómo querés visualizar las fechas.
                                    </span>
                                </div>

                                <select defaultValue="ddmmyyyy">
                                    <option value="ddmmyyyy">
                                        DD/MM/AAAA
                                    </option>

                                    <option value="mmddyyyy">
                                        MM/DD/AAAA
                                    </option>
                                </select>

                            </div>

                        </div>

                    </section>


                    {/* =========================
                        RESERVAS
                    ========================= */}

                    <section className="config-card">

                        <div className="config-card-header">

                            <div className="config-icon">
                                <CalendarCheck size={17} />
                            </div>

                            <div>
                                <h2>Preferencias de reservas</h2>
                                <p>
                                    Configurá algunas opciones relacionadas
                                    con tus reservas.
                                </p>
                            </div>

                        </div>


                        <div className="config-list">

                            <div className="config-item">

                                <div className="config-item-icon">
                                    <CalendarCheck size={16} />
                                </div>

                                <div className="config-item-content">
                                    <strong>
                                        Mostrar espacios disponibles
                                    </strong>

                                    <span>
                                        Priorizá los espacios con disponibilidad.
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    className={`switch ${
                                        preferencias.espaciosDisponibles ? "activo" : ""
                                    }`}
                                    onClick={() => cambiarPreferencia("espaciosDisponibles")}
                                    aria-pressed={preferencias.espaciosDisponibles}
                                >
                                    <span></span>
                                </button>

                            </div>


                            <div className="config-item">

                                <div className="config-item-icon">
                                    <CalendarCheck size={16} />
                                </div>

                                <div className="config-item-content">
                                    <strong>
                                        Recordatorio de reservas
                                    </strong>

                                    <span>
                                        Mostrá recordatorios de próximas reservas.
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    className={`switch ${
                                        preferencias.recordatorioReservas ? "activo" : ""
                                    }`}
                                    onClick={() => cambiarPreferencia("recordatorioReservas")}
                                    aria-pressed={preferencias.recordatorioReservas}
                                >
                                    <span></span>
                                </button>

                            </div>


                            <div className="config-item">

                                <div className="config-item-icon">
                                    <Shield size={16} />
                                </div>

                                <div className="config-item-content">
                                    <strong>
                                        Confirmar antes de cancelar
                                    </strong>

                                    <span>
                                        Pedir confirmación antes de cancelar
                                        una reserva.
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    className={`switch ${
                                        preferencias.confirmarCancelacion ? "activo" : ""
                                    }`}
                                    onClick={() => cambiarPreferencia("confirmarCancelacion")}
                                    aria-pressed={preferencias.confirmarCancelacion}
                                >
                                    <span></span>
                                </button>

                            </div>

                        </div>

                    </section>

                </div>


                {/* =========================
                    COLUMNA LATERAL
                ========================= */}

                <aside className="configuracion-lateral">

                    {/* =========================
                            AYUDA
                    ========================= */}

                    <section className="config-card ayuda-card">

                        <div className="config-card-header">

                            <div className="config-icon">
                                <HelpCircle size={17} />
                            </div>

                            <div>
                                <h2>Ayuda y soporte</h2>
                                <p>
                                    ¿Necesitás ayuda con Habita?
                                </p>
                            </div>

                        </div>


                        <div className="ayuda-lista">

                            <button className="config-link">

                                <div className="config-item-icon">
                                    <HelpCircle size={15} />
                                </div>

                                <div className="config-item-content">
                                    <strong>
                                        Centro de ayuda
                                    </strong>

                                    <span>
                                        Consultá preguntas frecuentes.
                                    </span>
                                </div>

                                <ChevronRight size={14} />

                            </button>


                            <button className="config-link">

                                <div className="config-item-icon">
                                    <MessageCircle size={15} />
                                </div>

                                <div className="config-item-content">
                                    <strong>
                                        Reportar un problema
                                    </strong>

                                    <span>
                                        Contanos si encontraste un error.
                                    </span>
                                </div>

                                <ChevronRight size={14} />

                            </button>

                        </div>

                    </section>


                    {/* =========================
                            INFORMACIÓN
                    ========================= */}

                    <section className="config-card">

                        <div className="config-card-header">

                            <div className="config-icon">
                                <FileText size={17} />
                            </div>

                            <div>
                                <h2>Información</h2>
                                <p>
                                    Información legal de Habita.
                                </p>
                            </div>

                        </div>


                        <div className="info-links">

                            <button className="config-simple-link">
                                Términos y condiciones
                                <ChevronRight size={14} />
                            </button>

                            <button className="config-simple-link">
                                Política de privacidad
                                <ChevronRight size={14} />
                            </button>

                        </div>


                        <div className="version-habita">
                            Habita · Versión 1.0.0
                        </div>

                    </section>


                    {/* =========================
                        ZONA DE CUENTA
                    ========================= */}

                    <section className="config-card cuenta-card">

                        <h2>Cuenta</h2>

                        <button className="btn-logout">
                            <LogOut size={15} />
                            Cerrar sesión
                        </button>

                        <button className="btn-eliminar">
                            <Trash2 size={14} />
                            Eliminar cuenta
                        </button>

                    </section>

                </aside>

            </div>
        </main>
    );
}

export default Configuracion;