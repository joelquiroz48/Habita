import { useEffect, useState } from "react";
import {
    Settings,
    DollarSign,
    Pencil,
    Bell,
    ListChecks,
    CalendarClock,
} from "lucide-react";

import "./Configuracion.css";
import Panel from "../../../components/Panel/Panel";
import fondo from "../../../assets/img/fondo.png";

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
    { label: "Cantidad de residentes", valor: "64" },
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
    {
        id: 1,
        label: "Recibir alertas de nuevos mensajes",
        descripcion: "Notificaciones cuando un residente envía una nueva consulta o mensaje.",
        activo: false,
    },
    {
        id: 2,
        label: "Recibir vencimientos próximos",
        descripcion: "Recordatorios de expensas próximas a vencer.",
        activo: false,
    },
    {
        id: 3,
        label: "Recibir alertas de expensas vencidas",
        descripcion: "Avisos sobre expensas que ya superaron su fecha de vencimiento.",
        activo: false,
    },
];


function Configuracion() {
    const [notificaciones, setNotificaciones] = useState(notificacionesIniciales);

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

                <Panel 
                titulo="Datos del consorcio" 
                className="configuracion-datos" 
                accion={
                    <button className="btn-editar">
                        <Pencil />
                        Editar
                    </button>
                }>
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
                </Panel>

                <Panel className="configuracion-info">
                    <div className="configuracion-info-banner">
                        <img src={fondo} alt="Vista del edificio Torres del Parque" />
                    </div>
                    <h2>Información general</h2>
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

                <Panel
                    titulo="Notificaciones del sistema"
                    icono={<Bell size={20} />}
                    className="configuracion-notificaciones-panel"
                >
                    {notificaciones.map((n) => (
                        <div className="configuracion-notif-fila" key={n.id}>
                            <div>
                                <strong>{n.label}</strong>
                                <span>{n.descripcion}</span>
                            </div>
                            <button
                                type="button"
                                className={`switch ${
                                    n.activo ? "activo" : ""
                                }`}
                                onClick={() => alternarNotificacion(n.id)}
                                role="switch"
                                aria-pressed={n.activo}
                                aria-checked={n.activo}
                                aria-label={n.label}
                            >
                                <span></span>
                            </button>
                        </div>
                    ))}
                </Panel>
            </section>

            {/* NOTIFICACIONES */}

            

        </main>
    );
}

export default Configuracion;
