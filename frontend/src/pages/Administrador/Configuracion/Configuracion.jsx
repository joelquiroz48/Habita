import { useEffect, useState } from "react";
import {
    Building2,
    Check,
    Settings,
    DollarSign,
    CreditCard,
    Send,
    Bell,
    ListChecks,
    FileText,
    Pencil,
    CalendarClock,
} from "lucide-react";

import "./Configuracion.css";
import Panel from "../../../components/Panel/Panel";

{/* =========================
       DATOS EJEMPLOS
========================== */}

const datosConsorcio = {
    nombre: "Torres del Parque",
    direccion: "Av. Siempre Viva 1234, CABA",
    telefono: "11 1234-5678",
    email: "administracion@torresdelparque.com.ar",
};

const infoGeneral = [
    { label: "Fecha de inicio", valor: "01/01/2018" },
    { label: "Cantidad de unidades", valor: "96" },
    { label: "Cantidad de edificios", valor: "2" },
];

const tarjetasConfig = [
    {
        icon: CalendarClock,
        titulo: "Período de expensas",
        descripcion: "Configurá el período de cálculo y vencimiento de las expensas.",
        stats: [
            { label: "Período actual", valor: "Agosto 2026" },
            { label: "Día de vencimiento", valor: "10" },
        ],
        boton: "Configurar",
        botonIcon: Settings,
    },
    {
        icon: DollarSign,
        titulo: "Categorías de expensas",
        descripcion: "Administrá los conceptos y categorías utilizados en las expensas.",
        stats: [
            { label: "Conceptos activos", valor: "12" },
            { label: "Última actualización", valor: "05/08/2026" },
        ],
        boton: "Gestionar categorías",
        botonIcon: ListChecks,
    },
];

const notificacionesIniciales = [
    { id: 1, label: "Recibir alertas de reclamos", descripcion: "Notificaciones cuando se crea un nuevo reclamo." },
    { id: 2, label: "Recibir vencimientos próximos", descripcion: "Recordatorios de expensas próximas a vencer." },
];

function Configuracion() {

    const [notificaciones, setNotificaciones] = useState(
        notificacionesIniciales.map((n) => ({ ...n, activo: true }))
    );

    useEffect(() => {
        document.title = "Habita | Configuración";
    }, []);

    function alternarNotificacion(id) {
        setNotificaciones((prev) =>
            prev.map((n) => (n.id === id ? { ...n, activo: !n.activo } : n))
        );
    }

    return (
        <main className="configuracion">

            {/* DATOS + INFO GENERAL */}

            <div className="configuracion-fila-superior">

                <Panel titulo="Datos del consorcio">
                    <div className="configuracion-datos-grid">

                        <div className="configuracion-campos-grid">
                            <label>
                                Nombre del consorcio
                                <input type="text" defaultValue={datosConsorcio.nombre}/>
                            </label>

                            <label>
                                Dirección
                                <input type="text" defaultValue={datosConsorcio.direccion}/>
                            </label>

                            <label>
                                Teléfono
                                <input type="text" defaultValue={datosConsorcio.telefono}/>
                            </label>

                            <label>
                                Email
                                <input type="email" defaultValue={datosConsorcio.email}/>
                            </label>
                        </div>
                    </div>

                    <div className="configuracion-guardar-fila">
                        <button className="configuracion-btn-guardar">Guardar cambios</button>
                    </div>
                </Panel>

                <Panel titulo="Información general">
                    <div className="configuracion-info-lista">
                        {infoGeneral.map((item) => (
                            <div className="configuracion-info-fila" key={item.label}>
                                <span>{item.label}</span>
                                <strong>{item.valor}</strong>
                            </div>
                        ))}
                    </div>
                </Panel>

            </div>

            {/* TARJETAS DE CONFIGURACION */}

            <section className="configuracion-tarjetas-grid">
                {tarjetasConfig.map((tarjeta) => {
                    const Icono = tarjeta.icon;
                    const BotonIcono = tarjeta.botonIcon;

                    return (
                        <Panel
                            className="configuracion-tarjeta"
                            key={tarjeta.titulo}
                            icono={<Icono size={20} />}
                            titulo={tarjeta.titulo}
                        >
                            <p>{tarjeta.descripcion}</p>

                            <div className="configuracion-tarjeta-stats">
                                {tarjeta.stats.map((stat) => (
                                    <div key={stat.label}>
                                        <span>{stat.label}</span>
                                        <strong>{stat.valor}</strong>
                                    </div>
                                ))}
                            </div>

                            <button className="configuracion-btn-secundario ancho">
                                <BotonIcono size={15} />
                                {tarjeta.boton}
                            </button>
                        </Panel>
                    );
                })}
            </section>

            {/* NOTIFICACIONES */}

            <Panel>
                <div className="configuracion-notificaciones">
                    <div className="configuracion-notif-encabezado">
                        <div className="configuracion-tarjeta-icon">
                            <Bell size={20} />
                        </div>

                        <div>
                            <h3>Notificaciones del sistema</h3>
                            <p>Elegí qué notificaciones querés recibir y cómo.</p>
                        </div>
                    </div>

                    <div className="configuracion-notif-lista">
                        {notificaciones.map((n) => (
                            <label className="configuracion-notif-fila" key={n.id}>
                                <button
                                    type="button"
                                    className={`configuracion-checkbox ${
                                        n.activo ? "activo" : ""
                                    }`}
                                    onClick={() => alternarNotificacion(n.id)}
                                    aria-pressed={n.activo}
                                    aria-label={n.label}
                                >
                                    {n.activo && <Check size={13} />}
                                </button>

                                <div>
                                    <strong>{n.label}</strong>
                                    <span>{n.descripcion}</span>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>
            </Panel>

        </main>
    );
}

export default Configuracion;
