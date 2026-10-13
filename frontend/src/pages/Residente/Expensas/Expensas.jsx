import { useEffect, useState } from "react";
import { WalletCards, CalendarDays, Tag, Download, BanknoteArrowDown, ChevronRight, CircleHelp, FileText, X } from "lucide-react";

import "./Expensas.css";
import TarjetaResumen from "../../../components/TarjetaResumen/TarjetaResumen";
import Panel from "../../../components/Panel/Panel";
import Tabla from "../../../components/Tabla/Tabla";
import Navegador from "../../../components/Navegador/Navegador";

/* =========================
    DATOS DE EJEMPLO
========================= */

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
        fecha: "--",
        vencimiento: "10/09/2026",
        estado: "Pendiente",
    },
    {
        periodo: "Julio 2026",
        importe: "$ 43.980",
        fecha: "09/04/2026",
        vencimiento: "10/08/2026",
        estado: "Pagada",
    },
    {
        periodo: "Junio 2026",
        importe: "$ 43.500",
        fecha: "09/04/2026",
        vencimiento: "10/07/2026",
        estado: "Pagada",
    },
    {
        periodo: "Mayo 2026",
        importe: "$ 42.830",
        fecha: "09/04/2026",
        vencimiento: "10/06/2026",
        estado: "Pagada",
    },
    {
        periodo: "Abril 2026",
        importe: "$ 42.100",
        fecha: "09/04/2026",
        vencimiento: "10/05/2026",
        estado: "Pagada",
    },
    {
        periodo: "Marzo 2026",
        importe: "$ 41.650",
        fecha: "09/04/2026",
        vencimiento: "10/04/2026",
        estado: "Pagada",
    },
];

const columnasHistorialExpensas = [
    { clave: "periodo", titulo: "Período", ancho: "1.2fr" },
    {
        clave: "importe",
        titulo: "Importe",
        ancho: "1fr",
    },
    {
        clave: "fecha",
        titulo: "Pagado el",
        ancho: "1fr",
    },
    { clave: "vencimiento", titulo: "Vencimiento", ancho: "1.2fr" },
    {
        clave: "estado",
        titulo: "Estado",
        ancho: "1fr",
        render: (expensa) => (
            <small className={`badge-expensa ${estadoBadgeClase(expensa.estado)}`}>
                {expensa.estado}
            </small>
        ),
    },
];

/* =========================
       TARJETAS RESUMEN
========================== */

const resumenExpensas = [
    {
        icono: WalletCards,
        titulo: "Expensa actual",
        valor: historialExpensas[0].monto,
        contenido: <small>{historialExpensas[0].periodo}</small>,
    },
    {
        icono: CalendarDays,
        titulo: "Vencimiento",
        valor: historialExpensas[0].vencimiento,
        contenido: (
            <small>En 7 días</small>
        ),
    },
    {
        icono: Tag,
        titulo: "Estado",
        contenido: (
            <>
                <em className="badge-expensa expensas-badge-pendiente">
                    Pendiente
                </em>
                <small>
                    Tu expensa aún no fue pagada.
                </small>
            </>
        ),
    },
];

const filtros = [
    {
        key: "estado",
        label: "Todos los estados",
        options: ["Pagada", "Pendiente", "Rechazada"],
    },
];

function estadoBadgeClase(estado) {
    if (estado === "Pagada") return "expensas-badge-pagado";
    return "expensas-badge-pendiente";
}

function Expensas() {

    const [expensaSeleccionada, setExpensaSeleccionada] = useState(historialExpensas[0]);
    const [detalleAbierto, setDetalleAbierto] = useState(false);

    useEffect(() => {
        document.title = "Habita | Mis expensas";
    }, []);

    function abrirDetalle(expensa) {
        setExpensaSeleccionada(expensa);
        setDetalleAbierto(true);
    }

    return (
        <main className="expensas">

            {/* =========================
                    RESUMEN SUPERIOR
            ========================= */}

            <section className="expensas-resumen">
                {resumenExpensas.map((item) => {
                    const Icono = item.icono;
                    return (
                        <TarjetaResumen
                            key={item.titulo}
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

            {/* HISTORIAL */}
            <Navegador
                data={historialExpensas}
                searchKey="periodo"
                searchPlaceholder="Buscar periodo..."
                filters={filtros}
            >
                {(historialExpensasFiltradas) => (
                    <Tabla
                        columnas={columnasHistorialExpensas}
                        datos={historialExpensasFiltradas}
                        filasPorPagina={5}
                        etiqueta="expensas"
                        onFilaClick={abrirDetalle}
                        seleccionable
                        filaSeleccionada={detalleAbierto ? expensaSeleccionada : null}
                    />
                )}
            </Navegador>

            {detalleAbierto && (
                <Panel
                    className="expensas-residente-detalle"
                    titulo="Detalle de expensa"
                    tituloComplemento={
                        <div className={`badge-expensa ${estadoBadgeClase(expensaSeleccionada.estado)}`}>
                            {expensaSeleccionada.estado}
                        </div>
                    }
                    accion={
                        <button
                            type="button"
                            onClick={() => setDetalleAbierto(false)}
                            aria-label="Cerrar detalle"
                        >
                            <X size={18} />
                        </button>
                    }
                >

                    {/* =========== COLUMNAS =========== */}

                    <div className="expensas-residente-detalle-columnas">

                        {/* =========== FILAS =========== */}

                        <section className="expensas-residente-detalle-seccion">
                            <h3>Resumen</h3>
                            <div className="expensas-residente-detalle-fila">
                                <span>Importe total</span>
                                <span>{expensaSeleccionada.importe}</span>
                            </div>
                            <div className="expensas-residente-detalle-fila">
                                <span>Periodo</span>
                                <span>{expensaSeleccionada.periodo}</span>
                            </div>
                            <div className="expensas-residente-detalle-fila">
                                <span>Vencimiento</span>
                                <span>{expensaSeleccionada.vencimiento}</span>
                            </div>
                            <div className="expensas-residente-detalle-fila">
                                <span>Pagado el</span>
                                <span>{expensaSeleccionada.fecha}</span>
                            </div>
                        </section>

                        {/* =========== FILAS =========== */}

                        <section className="expensas-residente-detalle-seccion">
                            <h3>Detalle de la expensa</h3>

                            {detalleExpensa.map((item) => (
                                <div className="detalle-item" key={item.concepto}>
                                    <div>
                                        <CircleHelp />
                                        <span>{item.concepto}</span>
                                    </div>

                                    <strong>{item.monto}</strong>
                                </div>
                            ))}

                            <div className="detalle-total">
                                <strong>Total</strong>

                                <strong>{expensaSeleccionada.importe}</strong>
                            </div>
                        </section>
                    </div>

                    {/* =========== COMPROBANTE =========== */}

                    <div className="expensas-residente-detalle-acciones">
                        <button type="button" className="expensas-residente-detalle-boton expensas-residente-detalle-boton-principal">
                            <BanknoteArrowDown size={16} />
                            Pagar ahora
                        </button>
                        <button type="button" className="expensas-residente-detalle-boton">
                            <Download size={16} />
                            Descargar boleta
                        </button>
                    </div>
                </Panel>
            )}

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


        </main>
    );
}

export default Expensas;