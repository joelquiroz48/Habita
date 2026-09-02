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

// =========================
// DATOS DE EJEMPLO
// =========================

const tabs = ["General", "Expensas", "Pagos", "Comunicación", "Seguridad", "Integraciones"];

const datosConsorcio = {
    nombre: "Torres del Parque",
    cuit: "30-71234567-8",
    direccion: "Av. Siempre Viva 1234, CABA",
    telefono: "11 1234-5678",
    email: "administracion@torresdelparque.com.ar",
    sitioWeb: "www.torresdelparque.com.ar",
};

const infoGeneral = [
    { label: "Fecha de inicio", valor: "01/01/2018" },
    { label: "Cantidad de unidades", valor: "96" },
    { label: "Cantidad de edificios", valor: "2" },
    { label: "Administración", valor: "Administración Propia" },
    { label: "Banco", valor: "Banco Galicia" },
    { label: "CBU", valor: "0070001120000012345678" },
    { label: "Alias", valor: "torresdelparque.consorcio" },
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
    {
        icon: CreditCard,
        titulo: "Medios de pago",
        descripcion: "Configurá los medios de pago habilitados para los residentes.",
        stats: [
            { label: "Medios activos", valor: "4" },
            { label: "Última actualización", valor: "15/08/2026" },
        ],
        boton: "Configurar medios",
        botonIcon: CreditCard,
    },
    {
        icon: Send,
        titulo: "Plantillas de comunicación",
        descripcion: "Creá y editá plantillas para comunicados y notificaciones.",
        stats: [
            { label: "Plantillas activas", valor: "8" },
        ],
        boton: "Gestionar plantillas",
        botonIcon: FileText,
    },
];

const notificacionesIniciales = [
    { id: 1, label: "Recibir resumen diario de pagos", descripcion: "Un resumen de los pagos recibidos cada día." },
    { id: 2, label: "Recibir alertas de reclamos", descripcion: "Notificaciones cuando se crea un nuevo reclamo." },
    { id: 3, label: "Recibir vencimientos próximos", descripcion: "Recordatorios de expensas próximas a vencer." },
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

            {/* TABS */}

            <div className="configuracion-tabs">
                {tabs.map((tab, index) => (
                    <button
                        key={tab}
                        className={`configuracion-tab ${index === 0 ? "activo" : ""}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* DATOS + INFO GENERAL */}

            <div className="configuracion-fila-superior">

                <section className="configuracion-panel-card">
                    <h2>Datos del consorcio</h2>

                    <div className="configuracion-datos-grid">

                        <div className="configuracion-logo-col">
                            <div className="configuracion-logo-placeholder">
                                <Building2 size={32} />
                            </div>
                            <button className="configuracion-btn-secundario">Cambiar logo</button>
                        </div>

                        <div className="configuracion-campos-grid">
                            <label>
                                Nombre del consorcio
                                <input type="text" defaultValue={datosConsorcio.nombre} />
                            </label>
                            <label>
                                CUIT
                                <input type="text" defaultValue={datosConsorcio.cuit} />
                            </label>
                            <label>
                                Dirección
                                <input type="text" defaultValue={datosConsorcio.direccion} />
                            </label>
                            <label>
                                Teléfono
                                <input type="text" defaultValue={datosConsorcio.telefono} />
                            </label>
                            <label>
                                Email
                                <input type="email" defaultValue={datosConsorcio.email} />
                            </label>
                            <label>
                                Sitio web
                                <input type="text" defaultValue={datosConsorcio.sitioWeb} />
                            </label>
                        </div>

                    </div>

                    <div className="configuracion-guardar-fila">
                        <button className="configuracion-btn-guardar">Guardar cambios</button>
                    </div>
                </section>

                <section className="configuracion-panel-card">
                    <h2>Información general</h2>

                    <div className="configuracion-info-lista">
                        {infoGeneral.map((item) => (
                            <div className="configuracion-info-fila" key={item.label}>
                                <span>{item.label}</span>
                                <strong>{item.valor}</strong>
                            </div>
                        ))}
                    </div>

                    <button className="configuracion-btn-secundario ancho">
                        <Pencil size={15} />
                        Editar información
                    </button>
                </section>

            </div>

            {/* TARJETAS DE CONFIGURACION */}

            <section className="configuracion-tarjetas-grid">
                {tarjetasConfig.map((tarjeta) => {
                    const Icono = tarjeta.icon;
                    const BotonIcono = tarjeta.botonIcon;

                    return (
                        <article className="configuracion-tarjeta" key={tarjeta.titulo}>
                            <div className="configuracion-tarjeta-icon">
                                <Icono size={20} />
                            </div>

                            <h3>{tarjeta.titulo}</h3>
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
                        </article>
                    );
                })}
            </section>

            {/* NOTIFICACIONES */}

            <section className="configuracion-notificaciones">

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
                                className={`configuracion-checkbox ${n.activo ? "activo" : ""}`}
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

                <button className="configuracion-btn-secundario">
                    <Bell size={15} />
                    Configurar notificaciones
                </button>

            </section>

        </main>
    );
}

export default Configuracion;
