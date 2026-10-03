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
import TarjetaResumen from "../../../components/TarjetaResumen/TarjetaResumen";
import Panel from "../../../components/Panel/Panel";

/* =========================
    DATOS DE EJEMPLO
========================= */

const expensaActual = {
    monto: "$ 45.230",
    periodo: "Agosto 2026",
    vencimiento: "10/09/2026",
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
        periodo: "Agosto 2026",
        importe: "$ 45.230",
        vencimiento: "10/09/2026",
        estado: "Pendiente de pago",
    },
    {
        periodo: "Julio 2026",
        importe: "$ 43.980",
        vencimiento: "10/08/2026",
        estado: "Pagada",
    },
    {
        periodo: "Junio 2026",
        importe: "$ 43.500",
        vencimiento: "10/07/2026",
        estado: "Pagada",
    },
    {
        periodo: "Mayo 2026",
        importe: "$ 42.830",
        vencimiento: "10/06/2026",
        estado: "Pagada",
    },
    {
        periodo: "Abril 2026",
        importe: "$ 42.100",
        vencimiento: "10/05/2026",
        estado: "Pagada",
    },
    {
        periodo: "Marzo 2026",
        importe: "$ 41.650",
        vencimiento: "10/04/2026",
        estado: "Pagada",
    },
];

{/* =========================
       TARJETAS RESUMEN
========================== */}

const resumenExpensas = [
    {
        icono: WalletCards,
        titulo: "Expensa actual",
        valor: expensaActual.monto,
        contenido: (
            <>
                <small>{expensaActual.periodo}</small>
                <em className="badge-expensa">
                    Pendiente de pago
                </em>
            </>
        ),
    },
    {
        icono: CalendarDays,
        titulo: "Vencimiento",
        valor: expensaActual.vencimiento,
        contenido: (
            <small>En 7 días</small>
        ),
    },
    {
        icono: Tag,
        titulo: "Estado",
        valor: "",
        contenido: (
            <>
                <em className="badge-expensa">
                    Pendiente
                </em>
                <small className="estado-descripcion">
                    Tu expensa aún <br /> no fue pagada.
                </small>
            </>
        ),
    },
    {
        icono: CreditCard,
        titulo: "Medio de pago preferido",
        valor: "",
        contenido: (
            <>
                <strong className="medio-preferido">
                    Tarjeta de crédito
                </strong>
                <small>Terminada en 4242</small>
                <button className="link-verde">
                    Cambiar medio de pago
                </button>
            </>
        ),
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
                {resumenExpensas.map((item, index) => {
                    const Icono = item.icono;
                    return (
                        <TarjetaResumen
                            key={index}
                            icono={<Icono />}
                            titulo={item.titulo}
                            valor={item.valor}
                            contenido={item.contenido}
                        />
                    );
                })}
            </section>

            {/* =========================
                CONTENIDO PRINCIPAL
            ========================= */}

            <section className="expensas-contenido">

                {/* =========================
                      COLUMNA IZQUIERDA
                ========================= */}

                <section className="expensas-columna">

                    {/* EXPENSAS */}

                    <Panel className="detalle-expensa">

                        <div className="detalle-info">
                            <h2>Expensa de Agosto 2026</h2>

                            <strong>{expensaActual.monto}</strong>

                            <span>Período: 01/08/2026 al 31/08/2026</span>

                            <small>Vence el 10/09/2026</small>

                            <em className="badge-expensa">Pendiente de pago</em>

                            <button className="btn-pagar">Pagar ahora</button>

                            <button className="btn-descargar">
                                <Download />
                                Descargar boleta
                            </button>
                        </div>

                        <div className="detalle-lista">
                            <h3>Detalle de la expensa</h3>

                            {detalleExpensa.map((item) => (
                                <div className="detalle-item" key={item.id}>
                                    <div>
                                        <CircleHelp />
                                        <span>{item.concepto}</span>
                                    </div>

                                    <strong>{item.monto}</strong>
                                </div>
                            ))}

                            <div className="detalle-total">
                                <strong>Total</strong>

                                <strong>{expensaActual.monto}</strong>
                            </div>
                        </div>

                    </Panel>

                    {/* HISTORIAL */}

                    <Panel className="historial-expensas">
                        <div className="historial-header">

                            <div className="filtros-expensas">
                                <button className="activo">Todas</button>

                                <button>Pendientes</button>

                                <button>Pagadas</button>
                            </div>

                            <button className="filtro-fecha">
                                <CalendarDays />
                                Últimos 12 meses
                                <ChevronRight />
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

                            {historialExpensas.map((expensa) => (
                                <div className="tabla-fila" key={expensa.id}>
                                    <span>{expensa.periodo}</span>

                                    <strong>{expensa.importe}</strong>

                                    <span>{expensa.vencimiento}</span>

                                    <span>
                                        <small className={
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
                                            <Download />
                                            Descargar
                                        </button>

                                        <button title="Ver detalle">
                                            <Eye />
                                            Ver detalle
                                        </button>

                                        <button
                                            className="accion-menu"
                                            title="Más opciones"
                                        >
                                            ⋮
                                        </button>
                                    </div>
                                </div>
                            ))}

                        </div>

                        <div className="paginacion-expensas">
                            <span>1 de 2</span>

                            <button> <ChevronRight /></button>
                        </div>
                    </Panel>

                </section>

                {/* =========================
                      COLUMNA DERECHA
                ========================= */}

                <section className="expensas-columna">

                    {/* MEDIOS DE PAGO */}

                    <Panel titulo="Medios de pago" descripcion="Elegí cómo querés pagar tu expensa" className="medios-pago">
                        <div className="metodos-tabs">
                            <button className="activo">Tarjeta</button>

                            <button>Transferencia</button>

                            <button>QR</button>
                        </div>

                        <div className="tarjeta-guardada">
                            <span>Tarjeta de crédito</span>

                            <div>
                                <strong>VISA</strong>

                                <span>Visa terminada en 4242</span>

                                <em>Predeterminada</em>
                            </div>
                        </div>

                        <div className="tarjeta-guardada">
                            <span>Otra tarjeta</span>

                            <div>
                                <strong>VISA</strong>

                                <span>Visa terminada en 1234</span>

                                <input type="radio" name="tarjeta"/>
                            </div>
                        </div>

                        <button className="nueva-tarjeta">
                            <Plus />
                            Agregar nueva tarjeta
                            <ChevronRight />
                        </button>

                        <button className="ver-medios">
                            Ver mis medios de pago
                            <ChevronRight />
                        </button>
                    </Panel>

                    {/* AYUDA */}

                    <Panel titulo="Ayuda sobre expensas" className="ayuda-expensas">
                        <div className="ayuda-item">
                            <div className="ayuda-icon"><CircleHelp  /></div>

                            <div>
                                <strong>¿Cómo se calculan las expensas?</strong>
                                <span>Entendé qué incluye tu expensa mensual.</span>
                            </div>

                            <ChevronRight />
                        </div>

                        <div className="ayuda-item">
                            <div className="ayuda-icon"><WalletCards /></div>

                            <div>
                                <strong>Medios de pago y promociones</strong>
                                <span>Conocé las opciones disponibles.</span>
                            </div>

                            <ChevronRight />
                        </div>

                        <div className="ayuda-item">
                            <div className="ayuda-icon"><FileText /></div>

                            <div>
                                <strong>¿Tenés un problema con tu pago?</strong>
                                <span>Te ayudamos a resolverlo.</span>
                            </div>

                            <ChevronRight />
                        </div>
                    </Panel>

                </section>
            
            </section>

        </main>
    );
}

export default Expensas;