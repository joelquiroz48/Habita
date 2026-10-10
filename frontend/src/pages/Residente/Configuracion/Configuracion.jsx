import { useEffect, useState } from "react";
import {
    Bell,
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

const preferencias = [
    {
        clave: "avisos",
        titulo: "Avisos",
        descripcion: "Recibí avisos importantes del consorcio",
    },
    {
        clave: "expensas",
        titulo: "Expensas",
        descripcion: "Recordatorios y novedades de expensas",
    },
    {
        clave: "reservas",
        titulo: "Reservas",
        descripcion: "Confirmaciones y recordatorios de reservas",
    },
];
    

function Configuracion() {
    useEffect(() => {
        document.title = "Habita | Configuración";
    }, []);

    const [notificaciones, setNotificaciones] = useState({
        avisos: false,
        expensas: false,
        reservas: false,
    });

   const cambiarNotificacion = (tipo) => {
        setNotificaciones({
            ...notificaciones,
            [tipo]: !notificaciones[tipo],
        });
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

                    <Panel
                        titulo="Preferencias de notificación"
                        icono={<Bell />}
                        className="preferencias-card"
                    >
                        <div className="preferencias-lista">
                            {preferencias.map((preferencia) => (
                                <div className="preferencia" key={preferencia.clave}>
                                    <div>
                                        <strong>{preferencia.titulo}</strong>
                                        <span>{preferencia.descripcion}</span>
                                    </div>

                                    <button className={`switch ${
                                            notificaciones[preferencia.clave] ? "activo" : ""
                                        }`}
                                        onClick={() => cambiarNotificacion(preferencia.clave)}
                                    >
                                        <span></span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </Panel>


                {/* CONFIGURACIONES */}
                    {/* RESERVAS */}


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