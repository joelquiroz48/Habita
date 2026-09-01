import { useEffect } from "react";
import {
    WalletCards,
    CalendarDays,
    Tag,
    CreditCard,
    Download,
    Eye,
    ChevronRight,
    CircleHelp,
    FileText,
    Plus,
} from "lucide-react";

import "./Expensas.css";


/* =========================
        DATOS DE EJEMPLO
========================= */

const expensaActual = {
    monto: "$ 45.230",
    periodo: "Mayo 2024",
    vencimiento: "10/06/2024",
    estado: "Pendiente de pago",
    medioPago: "Tarjeta de crédito",
    terminacion: "**** 4242",
};


const detalleExpensa = [
    {
        concepto: "Mantenimiento del edificio",
        monto: "$ 18.500",
    },
    {
        concepto: "Limpieza",
        monto: "$ 8.200",
    },
    {
        concepto: "Seguridad",
        monto: "$ 7.600",
    },
    {
        concepto: "Servicios (luz, agua, gas)",
        monto: "$ 6.200",
    },
    {
        concepto: "Fondo de reserva",
        monto: "$ 4.730",
    },
];


const historialExpensas = [
    {
        periodo: "Mayo 2024",
        importe: "$ 45.230",
        vencimiento: "10/06/2024",
        estado: "Pendiente de pago",
    },
    {
        periodo: "Abril 2024",
        importe: "$ 43.980",
        vencimiento: "10/05/2024",
        estado: "Pagada",
    },
    {
        periodo: "Marzo 2024",
        importe: "$ 43.500",
        vencimiento: "10/04/2024",
        estado: "Pagada",
    },
    {
        periodo: "Febrero 2024",
        importe: "$ 42.830",
        vencimiento: "10/03/2024",
        estado: "Pagada",
    },
    {
        periodo: "Enero 2024",
        importe: "$ 42.100",
        vencimiento: "10/02/2024",
        estado: "Pagada",
    },
    {
        periodo: "Diciembre 2023",
        importe: "$ 41.650",
        vencimiento: "10/01/2024",
        estado: "Pagada",
    },
];


function Expensas() {

    useEffect(() => {
        document.title = "Habita | Mis expensas";
    }, []);

    return (
        <main className="expensas">

            {/* =========================
                    RESUMEN SUPERIOR
            ========================= */}

            <section className="expensas-resumen">

                {/* EXPENSA ACTUAL */}
                <article className="expensa-resumen-card">

                    <div className="expensa-resumen-icon">
                        <WalletCards />
                    </div>

                    <div>
                        <span>Expensa actual</span>

                        <strong>
                            {expensaActual.monto}
                        </strong>

                        <small>
                            {expensaActual.periodo}
                        </small>

                        <em className="badge-expensa">
                            Pendiente de pago
                        </em>
                    </div>

                </article>


                {/* VENCIMIENTO */}
                <article className="expensa-resumen-card">

                    <div className="expensa-resumen-icon">
                        <CalendarDays />
                    </div>

                    <div>
                        <span>Vencimiento</span>

                        <strong>
                            {expensaActual.vencimiento}
                        </strong>

                        <small>
                            En 5 días
                        </small>
                    </div>

                </article>


                {/* ESTADO */}
                <article className="expensa-resumen-card">

                    <div className="expensa-resumen-icon">
                        <Tag />
                    </div>

                    <div>
                        <span>Estado</span>

                        <em className="badge-expensa">
                            Pendiente
                        </em>

                        <small className="estado-descripcion">
                            Tu expensa aún
                            <br />
                            no fue pagada.
                        </small>
                    </div>

                </article>


                {/* MEDIO DE PAGO */}
                <article className="expensa-resumen-card">

                    <div className="expensa-resumen-icon">
                        <CreditCard />
                    </div>

                    <div>
                        <span>Medio de pago preferido</span>

                        <strong className="medio-preferido">
                            Tarjeta de crédito
                        </strong>

                        <small>
                            Terminada en 4242
                        </small>

                        <button className="link-verde">
                            Cambiar medio de pago
                        </button>
                    </div>

                </article>

            </section>


            {/* =========================
                    CONTENIDO PRINCIPAL
            ========================= */}

            <section className="expensas-contenido">


                {/* =========================
                        DETALLE EXPENSA
                ========================= */}

                <article className="panel-expensas detalle-expensa">

                    <div className="detalle-header">

                        <div className="detalle-info">
                            <h2>Expensa de Mayo 2024</h2>

                            <strong>
                                {expensaActual.monto}
                            </strong>

                            <span>
                                Período: 01/05/2024 al 31/05/2024
                            </span>

                            <small>
                                Vence el 10/06/2024
                            </small>

                            <em className="badge-expensa">
                                Pendiente de pago
                            </em>

                            <button className="btn-pagar">
                                Pagar ahora
                            </button>

                            <button className="btn-descargar">
                                <Download size={14} />
                                Descargar boleta
                            </button>
                        </div>

                    </div>


                    <div className="detalle-lista">

                        <h3>Detalle de la expensa</h3>

                        {detalleExpensa.map((item, index) => (

                            <div
                                className="detalle-item"
                                key={index}
                            >

                                <div>
                                    <CircleHelp size={12} />
                                    <span>{item.concepto}</span>
                                </div>

                                <strong>
                                    {item.monto}
                                </strong>

                            </div>

                        ))}


                        <div className="detalle-total">

                            <strong>Total</strong>

                            <strong>
                                {expensaActual.monto}
                            </strong>

                        </div>

                    </div>

                </article>


                {/* =========================
                        COLUMNA DERECHA
                ========================= */}

                <aside className="expensas-sidebar">


                    {/* MEDIOS DE PAGO */}

                    <article className="panel-expensas medios-pago">

                        <div className="panel-expensas-header">
                            <div>
                                <h2>Medios de pago</h2>
                                <span>
                                    Elegí cómo querés pagar tu expensa
                                </span>
                            </div>
                        </div>


                        <div className="metodos-tabs">

                            <button className="activo">
                                Tarjeta
                            </button>

                            <button>
                                Transferencia
                            </button>

                            <button>
                                QR
                            </button>

                        </div>


                        <div className="tarjeta-guardada">

                            <span>Tarjeta de crédito</span>

                            <div>
                                <strong>VISA</strong>

                                <span>
                                    Visa terminada en 4242
                                </span>

                                <em>
                                    Predeterminada
                                </em>
                            </div>

                        </div>


                        <div className="tarjeta-guardada">

                            <span>Otra tarjeta</span>

                            <div>
                                <strong>VISA</strong>

                                <span>
                                    Visa terminada en 1234
                                </span>

                                <input
                                    type="radio"
                                    name="tarjeta"
                                />
                            </div>

                        </div>


                        <button className="nueva-tarjeta">
                            <Plus size={14} />
                            Agregar nueva tarjeta
                            <ChevronRight size={14} />
                        </button>


                        <button className="ver-medios">
                            Ver mis medios de pago
                            <ChevronRight size={14} />
                        </button>

                    </article>
                </aside>

                {/* =========================
                        HISTORIAL
                ========================= */}

                <article className="panel-expensas historial-expensas">

                    <div className="historial-header">

                        <div className="filtros-expensas">

                            <button className="activo">
                                Todas
                            </button>

                            <button>
                                Pendientes
                            </button>

                            <button>
                                Pagadas
                            </button>

                        </div>


                        <button className="filtro-fecha">
                            <CalendarDays size={13} />
                            Últimos 12 meses
                            <ChevronRight size={13} />
                        </button>

                    </div>


                    <div className="tabla-expensas">

                        <div className="tabla-header">

                            <span>Período</span>
                            <span>Importe</span>
                            <span>Vencimiento</span>
                            <span>Estado</span>
                            <span>Acciones</span>

                        </div>


                        {historialExpensas.map((expensa, index) => (

                            <div
                                className="tabla-fila"
                                key={index}
                            >

                                <span>
                                    {expensa.periodo}
                                </span>

                                <strong>
                                    {expensa.importe}
                                </strong>

                                <span>
                                    {expensa.vencimiento}
                                </span>

                                <span>

                                    <small
                                        className={
                                            expensa.estado === "Pagada"
                                                ? "estado-pagada"
                                                : "estado-pendiente-expensa"
                                        }
                                    >
                                        {expensa.estado}
                                    </small>

                                </span>


                                <div className="acciones-expensa">

                                    <button title="Descargar">
                                        <Download size={13} />
                                        Descargar
                                    </button>

                                    <button title="Ver detalle">
                                        <Eye size={13} />
                                        Ver detalle
                                    </button>

                                    <button className="accion-menu">
                                        ⋮
                                    </button>

                                </div>

                            </div>

                        ))}

                    </div>


                    <div className="paginacion-expensas">

                        <span>
                            1 de 2
                        </span>

                        <button>
                            <ChevronRight size={15} />
                        </button>

                    </div>

                </article>

                    {/* AYUDA */}

                    <article className="panel-expensas ayuda-expensas">

                        <div className="panel-expensas-header">

                            <div>
                                <h2>Ayuda sobre expensas</h2>
                            </div>

                        </div>


                        <div className="ayuda-item">

                            <div className="ayuda-icon">
                                <CircleHelp size={14} />
                            </div>

                            <div>
                                <strong>
                                    ¿Cómo se calculan las expensas?
                                </strong>

                                <span>
                                    Entendé qué incluye tu expensa mensual.
                                </span>
                            </div>

                            <ChevronRight size={14} />

                        </div>


                        <div className="ayuda-item">

                            <div className="ayuda-icon">
                                <WalletCards size={14} />
                            </div>

                            <div>
                                <strong>
                                    Medios de pago y promociones
                                </strong>

                                <span>
                                    Conocé las opciones disponibles.
                                </span>
                            </div>

                            <ChevronRight size={14} />

                        </div>


                        <div className="ayuda-item">

                            <div className="ayuda-icon">
                                <FileText size={14} />
                            </div>

                            <div>
                                <strong>
                                    ¿Tenés un problema con tu pago?
                                </strong>

                                <span>
                                    Te ayudamos a resolverlo.
                                </span>
                            </div>

                            <ChevronRight size={14} />

                        </div>

                    </article>

            </section>

        </main>
    );
}

export default Expensas;