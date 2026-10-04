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
    ChevronRight,
} from "lucide-react";

import "./Configuracion.css";
import Panel from "../../../components/Panel/Panel";

{/* =========================
       DATOS EJEMPLOS
========================== */}

const configuraciones = [
    {
        clave: "espaciosDisponibles",
        icono: CalendarCheck,
        titulo: "Mostrar espacios disponibles",
        descripcion: "Priorizá los espacios con disponibilidad.",
    },
    {
        clave: "recordatorioReservas",
        icono: CalendarCheck,
        titulo: "Recordatorio de reservas",
        descripcion: "Mostrá recordatorios de próximas reservas.",
    },
    {
        clave: "confirmarCancelacion",
        icono: Shield,
        titulo: "Confirmar antes de cancelar",
        descripcion: "Pedir confirmación antes de cancelar una reserva.",
    },
];


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

            {/* ===========================
                  CONTENIDO PRINCIPAL
            ============================= */}

            <div className="configuracion-contenido">

                {/* =========================
                    COLUMNA IZQUIERDA
                ========================= */}

                <section className="configuracion-columna">

                    {/* PREFERENCIAS */}

                    <Panel titulo="Preferencias de la aplicación" descripcion="Personalizá cómo querés utilizar Habita." icono={<Settings />}>
                        <div className="config-list">
                            <div className="config-item">
                                <div className="config-item-icon"><Palette /></div>

                                <div className="config-item-content">
                                    <strong>Apariencia</strong>
                                    <span>Elegí cómo se muestra la aplicación.</span>
                                </div>

                                <select defaultValue="claro">
                                    <option value="claro">Claro</option>
                                    <option value="automatico">Automático</option>
                                </select>
                            </div>

                            <div className="config-item">
                                <div className="config-item-icon"><Globe /></div>

                                <div className="config-item-content">
                                    <strong>Idioma</strong>
                                    <span>Seleccioná el idioma de Habita.</span>
                                </div>

                                <select defaultValue="es">
                                    <option value="es">Español</option>
                                </select>
                            </div>

                            <div className="config-item">
                                <div className="config-item-icon"><CalendarCheck /></div>

                                <div className="config-item-content">
                                    <strong>Formato de fecha</strong>
                                    <span>Elegí cómo querés visualizar las fechas.</span>
                                </div>

                                <select defaultValue="ddmmyyyy">
                                    <option value="ddmmyyyy">DD/MM/AAAA</option>
                                    <option value="mmddyyyy">MM/DD/AAAA</option>
                                </select>
                            </div>
                        </div>
                    </Panel>

                    {/* RESERVAS */}

                    <Panel titulo="Preferencias de reservas" descripcion="Configurá algunas opciones relacionadas con tus reservas." icono={<CalendarCheck />}>
                        <div className="config-list">
                            {configuraciones.map((configuracion) => {
                                const Icono = configuracion.icono;

                                return (
                                    <div className="config-item" key={configuracion.clave}>
                                        <div className="config-item-icon"><Icono /></div>

                                        <div className="config-item-content">
                                            <strong>{configuracion.titulo}</strong>
                                            <span>{configuracion.descripcion}</span>
                                        </div>

                                        <button
                                            type="button"
                                            className={`switch ${
                                                preferencias[configuracion.clave] ? "activo" : ""
                                            }`}
                                            onClick={() =>
                                                cambiarPreferencia(configuracion.clave)
                                            }
                                            aria-pressed={preferencias[configuracion.clave]}
                                        >
                                            <span></span>
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </Panel>

                </section>

                {/* =========================
                    COLUMNA DERECHA
                ========================= */}

                <section className="configuracion-columna">

                    {/* AYUDA */}

                    <Panel className="ayuda-card" icono={<HelpCircle />} titulo="Ayuda y soporte" descripcion="¿Necesitás ayuda con Habita?">
                        <div className="ayuda-lista">
                            <button className="config-link">
                                <div className="config-item-icon"><HelpCircle /></div>

                                <div className="config-item-content">
                                    <strong>Centro de ayuda</strong>
                                    <span>Consultá preguntas frecuentes.</span>
                                </div>

                                <ChevronRight />
                            </button>

                            <button className="config-link">
                                <div className="config-item-icon"><MessageCircle /></div>

                                <div className="config-item-content">
                                    <strong>Reportar un problema</strong>
                                    <span>Contanos si encontraste un error.</span>
                                </div>

                                <ChevronRight />
                            </button>
                        </div>
                    </Panel>

                    {/* INFORMACIÓN */}

                    <Panel titulo="Cuenta" icono={<FileText />} descripcion="Información legal de Habita.">

                        <div className="info-links">

                            <button className="config-simple-link">
                                Términos y condiciones
                                <ChevronRight />
                            </button>

                            <button className="config-simple-link">
                                Política de privacidad
                                <ChevronRight />
                            </button>

                        </div>

                        <div className="version-habita">Habita · Versión 1.0.0</div>

                    </Panel>

                    {/* ZONA DE CUENTA */}

                    <Panel titulo="Cuenta" className="cuenta-card">
                        <button className="btn-logout">
                            <LogOut />
                            Cerrar sesión
                        </button>
                    </Panel>

                </section>

            </div>
        </main>
    );
}

export default Configuracion;