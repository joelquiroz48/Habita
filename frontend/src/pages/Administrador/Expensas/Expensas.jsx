import { useEffect, useState } from "react";
import {
    Calendar,
    DollarSign,
    Users,
    PiggyBank,
    Plus,
    ChevronDown,
    Search,
    Eye,
    MoreVertical,
    ChevronLeft,
    ChevronRight,
    Pencil,
    Download,
    Trash2,
} from "lucide-react";

import "./Expensas.css";

// =========================
// DATOS DE EJEMPLO
// =========================

const expensas = [
    {
        periodo: "Agosto 2026",
        vencimiento: "10/09/2026",
        importe: 5450230,
        recaudado: 4251200,
        porcentaje: 78,
        estado: "En curso",
        conceptos: [
            { nombre: "Mantenimiento", monto: 2200000 },
            { nombre: "Limpieza", monto: 850000 },
            { nombre: "Seguridad", monto: 920000 },
            { nombre: "Servicios", monto: 900000 },
            { nombre: "Fondo de reserva", monto: 430230 },
        ],
    },
    {
        periodo: "Julio 2026",
        vencimiento: "10/08/2026",
        importe: 5284500,
        recaudado: 5284500,
        porcentaje: 100,
        estado: "Cerrada",
        conceptos: [
            { nombre: "Mantenimiento", monto: 2150000 },
            { nombre: "Limpieza", monto: 820000 },
            { nombre: "Seguridad", monto: 900000 },
            { nombre: "Servicios", monto: 890000 },
            { nombre: "Fondo de reserva", monto: 524500 },
        ],
    },
    {
        periodo: "Junio 2026",
        vencimiento: "10/07/2026",
        importe: 5123000,
        recaudado: 5123000,
        porcentaje: 100,
        estado: "Cerrada",
        conceptos: [
            { nombre: "Mantenimiento", monto: 2080000 },
            { nombre: "Limpieza", monto: 800000 },
            { nombre: "Seguridad", monto: 880000 },
            { nombre: "Servicios", monto: 860000 },
            { nombre: "Fondo de reserva", monto: 503000 },
        ],
    },
    {
        periodo: "Mayo 2026",
        vencimiento: "10/06/2026",
        importe: 4987500,
        recaudado: 4987500,
        porcentaje: 100,
        estado: "Cerrada",
        conceptos: [
            { nombre: "Mantenimiento", monto: 2020000 },
            { nombre: "Limpieza", monto: 780000 },
            { nombre: "Seguridad", monto: 850000 },
            { nombre: "Servicios", monto: 840000 },
            { nombre: "Fondo de reserva", monto: 497500 },
        ],
    },
    {
        periodo: "Abril 2026",
        vencimiento: "10/05/2026",
        importe: 4862000,
        recaudado: 4862000,
        porcentaje: 100,
        estado: "Cerrada",
        conceptos: [
            { nombre: "Mantenimiento", monto: 1980000 },
            { nombre: "Limpieza", monto: 760000 },
            { nombre: "Seguridad", monto: 830000 },
            { nombre: "Servicios", monto: 820000 },
            { nombre: "Fondo de reserva", monto: 472000 },
        ],
    },
];

const totalUnidadesConExpensa = 96;
const totalPeriodos = 47;
const paginas = [1, 2, 3, 4, 5];

function formatearMonto(numero) {
    return `$ ${numero.toLocaleString("es-AR")}`;
}

function badgeClase(estado) {
    return estado === "En curso" ? "expensas-badge-curso" : "expensas-badge-cerrada";
}

function Expensas() {

    const [periodoSeleccionado, setPeriodoSeleccionado] = useState(expensas[0].periodo);

    useEffect(() => {
        document.title = "Habita | Expensas";
    }, []);

    const expensaActual = expensas[0];
    const detalle = expensas.find((e) => e.periodo === periodoSeleccionado);
    const pendiente = detalle.importe - detalle.recaudado;

    return (
        <main className="expensas">

            {/* CABECERA CON KPIS */}

            <div className="expensas-cabecera">

                <section className="expensas-kpi-grid">

                    <article className="expensas-kpi-card">
                        <div className="expensas-kpi-icon">
                            <Calendar />
                        </div>
                        <div>
                            <span className="expensas-kpi-label">Expensa actual</span>
                            <strong>{expensaActual.periodo}</strong>
                            <span className="expensas-kpi-info">Período vigente</span>
                        </div>
                    </article>

                    <article className="expensas-kpi-card">
                        <div className="expensas-kpi-icon">
                            <DollarSign />
                        </div>
                        <div>
                            <span className="expensas-kpi-label">Importe total</span>
                            <strong>{formatearMonto(expensaActual.importe)}</strong>
                            <span className="expensas-kpi-info">Total a recaudar</span>
                        </div>
                    </article>

                    <article className="expensas-kpi-card">
                        <div className="expensas-kpi-icon">
                            <Users />
                        </div>
                        <div>
                            <span className="expensas-kpi-label">Unidades</span>
                            <strong>{totalUnidadesConExpensa}</strong>
                            <span className="expensas-kpi-info">Con expensa</span>
                        </div>
                    </article>

                    <article className="expensas-kpi-card">
                        <div className="expensas-kpi-icon">
                            <PiggyBank />
                        </div>
                        <div>
                            <span className="expensas-kpi-label">Recaudado</span>
                            <strong>{formatearMonto(expensaActual.recaudado)}</strong>
                            <div className="expensas-progreso">
                                <div
                                    className="expensas-progreso-relleno"
                                    style={{ width: `${expensaActual.porcentaje}%` }}
                                />
                            </div>
                            <span className="expensas-kpi-info">{expensaActual.porcentaje}% del total</span>
                        </div>
                    </article>

                </section>

                <button className="expensas-btn-nuevo">
                    <Plus size={16} />
                    Nueva expensa
                </button>

            </div>

            {/* TABS */}

            <div className="expensas-tabs">
                <button className="expensas-tab activo">Listado de expensas</button>
                <button className="expensas-tab">Conceptos y categorías</button>
            </div>

            {/* CONTENIDO PRINCIPAL */}

            <div className="expensas-contenido">

                {/* LISTADO */}

                <section className="expensas-listado">

                    <div className="expensas-filtros">
                        <button className="expensas-filtro">
                            <Calendar size={15} />
                            Todos los períodos
                            <ChevronDown size={15} />
                        </button>

                        <button className="expensas-filtro">
                            Todos los estados
                            <ChevronDown size={15} />
                        </button>

                        <div className="expensas-buscador">
                            <Search size={16} />
                            <input type="text" placeholder="Buscar período..." />
                        </div>
                    </div>

                    <div className="expensas-tabla-card">
                        <div className="expensas-tabla-header">
                            <span></span>
                            <span>Período</span>
                            <span>Vencimiento</span>
                            <span>Importe total</span>
                            <span>Recaudado</span>
                            <span>Estado</span>
                            <span>Acciones</span>
                        </div>

                        <div className="expensas-tabla-body">
                            {expensas.map((item) => {
                                const seleccionada = item.periodo === periodoSeleccionado;

                                return (
                                    <button
                                        key={item.periodo}
                                        className={`expensas-tabla-fila ${seleccionada ? "seleccionada" : ""}`}
                                        onClick={() => setPeriodoSeleccionado(item.periodo)}
                                    >
                                        <span className="expensas-chevron">
                                            {seleccionada && <ChevronRight size={15} />}
                                        </span>
                                        <span className="expensas-periodo">{item.periodo}</span>
                                        <span>{item.vencimiento}</span>
                                        <span>{formatearMonto(item.importe)}</span>
                                        <span>
                                            {formatearMonto(item.recaudado)} ({item.porcentaje}%)
                                        </span>

                                        <span className={`expensas-badge ${badgeClase(item.estado)}`}>
                                            {item.estado}
                                        </span>

                                        <span className="expensas-tabla-acciones">
                                            <span aria-label="Ver detalle">
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

                    <div className="expensas-paginacion">
                        <button className="expensas-pagina-flecha" aria-label="Página anterior">
                            <ChevronLeft size={16} />
                        </button>

                        {paginas.map((pagina) => (
                            <button
                                key={pagina}
                                className={`expensas-pagina ${pagina === 1 ? "activa" : ""}`}
                            >
                                {pagina}
                            </button>
                        ))}

                        <span className="expensas-pagina-puntos">...</span>

                        <button className="expensas-pagina">10</button>

                        <button className="expensas-pagina-flecha" aria-label="Página siguiente">
                            <ChevronRight size={16} />
                        </button>

                        <span className="expensas-paginacion-info">
                            Mostrando 1 a {expensas.length} de {totalPeriodos} períodos
                        </span>
                    </div>

                </section>

                {/* DETALLE */}

                <aside className="expensas-detalle">

                    <div className="expensas-detalle-header">
                        <h2>Detalle de {detalle.periodo}</h2>
                        <span className={`expensas-badge ${badgeClase(detalle.estado)}`}>
                            {detalle.estado}
                        </span>
                    </div>

                    <p className="expensas-detalle-linea">
                        Vencimiento: <strong>{detalle.vencimiento}</strong>
                    </p>
                    <p className="expensas-detalle-linea">
                        Estado: <strong>{detalle.estado}</strong>
                    </p>

                    <h3>Resumen</h3>
                    <div className="expensas-resumen-fila">
                        <span>Importe total</span>
                        <span>{formatearMonto(detalle.importe)}</span>
                    </div>
                    <div className="expensas-resumen-fila">
                        <span>Recaudado</span>
                        <span>{formatearMonto(detalle.recaudado)}</span>
                    </div>
                    <div className="expensas-resumen-fila">
                        <span>Pendiente</span>
                        <span className="expensas-pendiente">{formatearMonto(pendiente)}</span>
                    </div>
                    <div className="expensas-resumen-fila">
                        <span>Porcentaje recaudado</span>
                        <span className="expensas-porcentaje">{detalle.porcentaje}%</span>
                    </div>

                    <h3>Conceptos</h3>
                    {detalle.conceptos.map((concepto) => (
                        <div className="expensas-resumen-fila" key={concepto.nombre}>
                            <span>{concepto.nombre}</span>
                            <span>{formatearMonto(concepto.monto)}</span>
                        </div>
                    ))}

                    <h3>Acciones</h3>
                    <button className="expensas-btn-accion principal">
                        <Pencil size={15} />
                        Editar expensa
                    </button>
                    <button className="expensas-btn-accion secundario">
                        <Download size={15} />
                        Descargar boleta
                    </button>
                    <button className="expensas-btn-accion peligro">
                        <Trash2 size={15} />
                        Anular expensa
                    </button>

                </aside>

            </div>

        </main>
    );
}

export default Expensas;
