import { useEffect, useState } from "react";
import {
    Wallet,
    Download,
    Clock,
    CheckCircle2,
    Calendar,
    ChevronDown,
    Search,
    Eye,
    MoreVertical,
    ChevronLeft,
    ChevronRight,
    X,
    CreditCard,
    Landmark,
    Banknote,
} from "lucide-react";

import "./Pagos.css";

// =========================
// DATOS DE EJEMPLO
// =========================

const kpis = {
    totalRecaudado: 4251200,
    pagosRealizados: 78,
    pendientes: 12,
    tasaExito: 89,
};

const pagos = [
    {
        fecha: "01/09/2026", hora: "10:24 hs", residente: "Nicolás Paz", unidad: "5B",
        periodo: "Agosto 2026", importe: 45230, metodo: "tarjeta", metodoLabel: "Tarjeta •••• 4242",
        estado: "Confirmado", transaccion: "MP-8457293847",
    },
    {
        fecha: "01/09/2026", hora: "09:10 hs", residente: "María Gómez", unidad: "3A",
        periodo: "Agosto 2026", importe: 45230, metodo: "billetera", metodoLabel: "Mercado Pago",
        estado: "Confirmado", transaccion: "MP-8457293848",
    },
    {
        fecha: "31/08/2026", hora: "16:45 hs", residente: "Juan López", unidad: "7C",
        periodo: "Agosto 2026", importe: 45230, metodo: "transferencia", metodoLabel: "Transferencia",
        metodoSub: "Banco Galicia", estado: "Confirmado", transaccion: "MP-8457293849",
    },
    {
        fecha: "31/08/2026", hora: "08:30 hs", residente: "Carla Romero", unidad: "1B",
        periodo: "Agosto 2026", importe: 45230, metodo: "tarjeta", metodoLabel: "Tarjeta •••• 1234",
        estado: "Pendiente", transaccion: "MP-8457293850",
    },
    {
        fecha: "30/08/2026", hora: "14:20 hs", residente: "Pedro Martínez", unidad: "2D",
        periodo: "Agosto 2026", importe: 45230, metodo: "billetera", metodoLabel: "Rapipago",
        estado: "Confirmado", transaccion: "MP-8457293851",
    },
    {
        fecha: "29/08/2026", hora: "11:05 hs", residente: "Laura Sánchez", unidad: "4A",
        periodo: "Agosto 2026", importe: 45230, metodo: "efectivo", metodoLabel: "Efectivo",
        estado: "Confirmado", transaccion: "MP-8457293852",
    },
    {
        fecha: "28/08/2026", hora: "17:50 hs", residente: "Diego Fernández", unidad: "6E",
        periodo: "Agosto 2026", importe: 45230, metodo: "transferencia", metodoLabel: "Transferencia",
        metodoSub: "Banco BBVA", estado: "Rechazado", transaccion: "MP-8457293853",
    },
];

const totalPagos = 78;
const paginas = [1, 2, 3, 4, 5];

const iconosMetodo = {
    tarjeta: CreditCard,
    billetera: Wallet,
    transferencia: Landmark,
    efectivo: Banknote,
};

function formatearMonto(numero) {
    return `$ ${numero.toLocaleString("es-AR")}`;
}

function badgeClase(estado) {
    if (estado === "Confirmado") return "pagos-badge-confirmado";
    if (estado === "Pendiente") return "pagos-badge-pendiente";
    return "pagos-badge-rechazado";
}

function Pagos() {

    const [pagoSeleccionado, setPagoSeleccionado] = useState(pagos[0]);
    const [detalleAbierto, setDetalleAbierto] = useState(true);

    useEffect(() => {
        document.title = "Habita | Pagos";
    }, []);

    function abrirDetalle(pago) {
        setPagoSeleccionado(pago);
        setDetalleAbierto(true);
    }

    return (
        <main className="pagos">

            {/* KPIS */}

            <section className="pagos-kpi-grid">

                <article className="pagos-kpi-card">
                    <div className="pagos-kpi-icon">
                        <Wallet />
                    </div>
                    <div>
                        <span className="pagos-kpi-label">Total recaudado</span>
                        <strong>{formatearMonto(kpis.totalRecaudado)}</strong>
                        <span className="pagos-kpi-info">Este mes</span>
                    </div>
                </article>

                <article className="pagos-kpi-card">
                    <div className="pagos-kpi-icon">
                        <Download />
                    </div>
                    <div>
                        <span className="pagos-kpi-label">Pagos realizados</span>
                        <strong>{kpis.pagosRealizados}</strong>
                        <span className="pagos-kpi-info">Este mes</span>
                    </div>
                </article>

                <article className="pagos-kpi-card">
                    <div className="pagos-kpi-icon">
                        <Clock />
                    </div>
                    <div>
                        <span className="pagos-kpi-label">Pendientes</span>
                        <strong>{kpis.pendientes}</strong>
                        <span className="pagos-kpi-info">Este mes</span>
                    </div>
                </article>

                <article className="pagos-kpi-card">
                    <div className="pagos-kpi-icon">
                        <CheckCircle2 />
                    </div>
                    <div>
                        <span className="pagos-kpi-label">Pagos confirmados</span>
                        <strong>{kpis.tasaExito}%</strong>
                        <div className="pagos-progreso">
                            <div
                                className="pagos-progreso-relleno"
                                style={{ width: `${kpis.tasaExito}%` }}
                            />
                        </div>
                        <span className="pagos-kpi-info">Tasa de éxito</span>
                    </div>
                </article>

            </section>

            {/* FILTROS */}

            <div className="pagos-filtros">
                <button className="pagos-filtro">
                    <Calendar size={15} />
                    01/08/2026 - 10/09/2026
                    <ChevronDown size={15} />
                </button>

                <button className="pagos-filtro">
                    Todos los métodos
                    <ChevronDown size={15} />
                </button>

                <button className="pagos-filtro">
                    Todos los estados
                    <ChevronDown size={15} />
                </button>

                <div className="pagos-buscador">
                    <Search size={16} />
                    <input type="text" placeholder="Buscar pago..." />
                </div>

                <button className="pagos-btn-exportar">
                    <Download size={15} />
                    Exportar
                </button>
            </div>

            {/* CONTENIDO */}

            <div className={`pagos-contenido ${detalleAbierto ? "" : "sin-detalle"}`}>

                <section className="pagos-listado">

                    <div className="pagos-tabla-card">
                        <div className="pagos-tabla-header">
                            <span>Fecha</span>
                            <span>Residente</span>
                            <span>Unidad</span>
                            <span>Período</span>
                            <span>Importe</span>
                            <span>Método de pago</span>
                            <span>Estado</span>
                            <span>Comprobante</span>
                        </div>

                        <div className="pagos-tabla-body">
                            {pagos.map((pago, index) => {
                                const Icono = iconosMetodo[pago.metodo];
                                const seleccionado = pagoSeleccionado.transaccion === pago.transaccion;

                                return (
                                    <button
                                        key={index}
                                        className={`pagos-tabla-fila ${seleccionado && detalleAbierto ? "seleccionada" : ""}`}
                                        onClick={() => abrirDetalle(pago)}
                                    >
                                        <span>{pago.fecha}</span>
                                        <span className="pagos-residente">{pago.residente}</span>
                                        <span>{pago.unidad}</span>
                                        <span>{pago.periodo}</span>
                                        <span>{formatearMonto(pago.importe)}</span>

                                        <span className="pagos-metodo">
                                            <Icono size={16} />
                                            <span>
                                                {pago.metodoLabel}
                                                {pago.metodoSub && (
                                                    <small>{pago.metodoSub}</small>
                                                )}
                                            </span>
                                        </span>

                                        <span className={`pagos-badge ${badgeClase(pago.estado)}`}>
                                            {pago.estado}
                                        </span>

                                        <span className="pagos-tabla-acciones">
                                            <span aria-label="Ver comprobante">
                                                <Eye size={16} />
                                            </span>
                                            <span aria-label="Más opciones">
                                                <MoreVertical size={16} />
                                            </span>
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="pagos-paginacion">
                        <button className="pagos-pagina-flecha" aria-label="Página anterior">
                            <ChevronLeft size={16} />
                        </button>

                        {paginas.map((pagina) => (
                            <button
                                key={pagina}
                                className={`pagos-pagina ${pagina === 1 ? "activa" : ""}`}
                            >
                                {pagina}
                            </button>
                        ))}

                        <span className="pagos-pagina-puntos">...</span>

                        <button className="pagos-pagina">10</button>

                        <button className="pagos-pagina-flecha" aria-label="Página siguiente">
                            <ChevronRight size={16} />
                        </button>

                        <span className="pagos-paginacion-info">
                            Mostrando 1 a {pagos.length} de {totalPagos} pagos
                        </span>
                    </div>

                </section>

                {/* DETALLE */}

                {detalleAbierto && (
                    <aside className="pagos-detalle">

                        <div className="pagos-detalle-header">
                            <h2>Detalle del pago</h2>
                            <button
                                className="pagos-detalle-cerrar"
                                onClick={() => setDetalleAbierto(false)}
                                aria-label="Cerrar detalle"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <span className={`pagos-badge ${badgeClase(pagoSeleccionado.estado)}`}>
                            {pagoSeleccionado.estado}
                        </span>

                        <div className="pagos-detalle-fila">
                            <span>Residente</span>
                            <strong>{pagoSeleccionado.residente}</strong>
                        </div>
                        <div className="pagos-detalle-fila">
                            <span>Unidad</span>
                            <strong>{pagoSeleccionado.unidad}</strong>
                        </div>
                        <div className="pagos-detalle-fila">
                            <span>Período</span>
                            <strong>{pagoSeleccionado.periodo}</strong>
                        </div>
                        <div className="pagos-detalle-fila">
                            <span>Importe</span>
                            <strong>{formatearMonto(pagoSeleccionado.importe)}</strong>
                        </div>
                        <div className="pagos-detalle-fila">
                            <span>Fecha de pago</span>
                            <strong>{pagoSeleccionado.fecha} - {pagoSeleccionado.hora}</strong>
                        </div>

                        <p className="pagos-detalle-subtitulo">Método de pago</p>
                        <div className="pagos-detalle-metodo">
                            {(() => {
                                const Icono = iconosMetodo[pagoSeleccionado.metodo];
                                return <Icono size={18} />;
                            })()}
                            <span>
                                {pagoSeleccionado.metodoLabel}
                                {pagoSeleccionado.metodoSub && ` - ${pagoSeleccionado.metodoSub}`}
                            </span>
                        </div>

                        <p className="pagos-detalle-subtitulo">N° de transacción</p>
                        <p className="pagos-detalle-transaccion">{pagoSeleccionado.transaccion}</p>

                        <div className="pagos-detalle-fila">
                            <span>Estado</span>
                            <strong>{pagoSeleccionado.estado}</strong>
                        </div>

                        <h3>Comprobante</h3>
                        <button className="pagos-btn-comprobante">
                            <Download size={15} />
                            Descargar comprobante
                        </button>
                        <span className="pagos-detalle-archivo">PDF - 124 KB</span>

                    </aside>
                )}

            </div>

        </main>
    );
}

export default Pagos;
