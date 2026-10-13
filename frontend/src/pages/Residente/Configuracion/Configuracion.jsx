import { useEffect, useState } from "react";
import { Bell, Bug, ChevronRight, FileText } from "lucide-react";

import "./Configuracion.css";
import Panel from "../../../components/Panel/Panel";

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
    const [notificaciones, setNotificaciones] = useState({
        avisos: false,
        expensas: false,
        reservas: false,
    });

    useEffect(() => {
        document.title = "Habita | Configuración";
    }, []);

    function cambiarNotificacion(tipo) {
        setNotificaciones((actuales) => ({
            ...actuales,
            [tipo]: !actuales[tipo],
        }));
    }

    return (
        <main className="configuracion-residente">
            <div className="configuracion-residente-contenido">
                <Panel
                    titulo="Reportar un problema"
                    descripcion="Contanos si encontraste un error o algo que podamos mejorar en Habita."
                    icono={<Bug />}
                    className="configuracion-residente-reporte"
                >
                    <form className="configuracion-residente-formulario">
                        <label className="configuracion-residente-campo">
                            <span>Asunto</span>
                            <input
                                name="asunto"
                                type="text"
                                placeholder="Ej.: No puedo ver mis expensas"
                            />
                        </label>

                        <label className="configuracion-residente-campo">
                            <span>Tipo de reporte</span>
                            <select name="tipo" defaultValue="">
                                <option value="" disabled>Seleccioná una opción</option>
                                <option value="error">Reportar un error</option>
                                <option value="visual">Problema visual</option>
                                <option value="sugerencia">Sugerencia</option>
                                <option value="otro">Otro</option>
                            </select>
                        </label>

                        <label className="configuracion-residente-campo configuracion-residente-descripcion">
                            <span>Descripción</span>
                            <textarea
                                name="descripcion"
                                placeholder="Describí qué ocurrió y qué esperabas que sucediera."
                                rows={6}
                            />
                        </label>

                        <div className="configuracion-residente-acciones">
                            <button type="button" className="configuracion-residente-enviar">
                                Enviar reporte
                            </button>
                        </div>
                    </form>
                </Panel>

                <section className="configuracion-residente-lateral">
                    <Panel
                        titulo="Preferencias de notificación"
                        icono={<Bell />}
                        className="configuracion-residente-preferencias"
                    >
                        <div className="configuracion-residente-lista">
                            {preferencias.map((preferencia) => {
                                const activa = notificaciones[preferencia.clave];

                                return (
                                    <div className="configuracion-residente-preferencia" key={preferencia.clave}>
                                        <div className="configuracion-residente-preferencia-texto">
                                            <strong>{preferencia.titulo}</strong>
                                            <span>{preferencia.descripcion}</span>
                                        </div>
                                        <button
                                            type="button"
                                            className={`configuracion-residente-switch ${activa ? "activo" : ""}`}
                                            role="switch"
                                            aria-checked={activa}
                                            aria-label={preferencia.titulo}
                                            onClick={() => cambiarNotificacion(preferencia.clave)}
                                        >
                                            <span />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </Panel>

                    <Panel
                        titulo="Información legal"
                        icono={<FileText />}
                        descripcion="Información sobre el uso de Habita."
                        className="configuracion-residente-legal"
                    >
                        <div className="configuracion-residente-enlaces">
                            <button type="button" className="configuracion-residente-enlace">
                                Términos y condiciones
                                <ChevronRight aria-hidden="true" />
                            </button>
                            <button type="button" className="configuracion-residente-enlace">
                                Política de privacidad
                                <ChevronRight aria-hidden="true" />
                            </button>
                        </div>
                        <p className="configuracion-residente-version">Habita · Versión 1.0.0</p>
                    </Panel>
                </section>
            </div>
        </main>
    );
}

export default Configuracion;
