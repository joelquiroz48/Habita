import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
    Users,
    Building2,
    DollarSign,
    MessageSquare,
    ChevronDown,
    ArrowUp,
    ArrowDown,
    ChevronRight,
    CalendarClock,
    Megaphone,
    FileText,
} from "lucide-react";

import "./Inicio.css";

// =========================
// DATOS DE EJEMPLO
// =========================

const kpis = {
    residentes: {
        valor: 128,
        label: "Residentes",
        info: "Activos",
        tendencia: "+5 este mes",
        direccion: "up",
    },
    unidades: {
        valor: 96,
        label: "Unidades",
        info: "Registradas",
        tendencia: "—",
        direccion: null,
    },
    expensas: {
        valor: "$ 5.450.230",
        label: "Expensas del mes",
        info: "Recaudado",
        progreso: 78,
    },
    reclamos: {
        valor: 12,
        label: "Reclamos abiertos",
        info: "Pendientes",
        tendencia: "-3 vs mes anterior",
        direccion: "down",
    },
};

const recaudacionMensual = [
    { mes: "Ene", valor: 3.4 },
    { mes: "Feb", valor: 4.6 },
    { mes: "Mar", valor: 3.1 },
    { mes: "Abr", valor: 4.4 },
    { mes: "May", valor: 2.8 },
    { mes: "Jun", valor: 3.9 },
    { mes: "Jul", valor: 2.1 },
    { mes: "Ago", valor: 5.3 },
    { mes: "Sep", valor: 3.3 },
    { mes: "Oct", valor: 4.5 },
    { mes: "Nov", valor: 3.7 },
    { mes: "Dic", valor: 3.2 },
];

const MAX_RECAUDACION = 6; // millones, define la escala del eje Y

const reclamosPorEstado = [
    { estado: "Pendiente", cantidad: 12, claseColor: "pendiente" },
    { estado: "En proceso", cantidad: 7, claseColor: "proceso" },
    { estado: "Resuelto", cantidad: 25, claseColor: "resuelto" },
];

const totalReclamos = reclamosPorEstado.reduce((acc, r) => acc + r.cantidad, 0);

// Genera los porcentajes acumulados para el conic-gradient del donut
function armarGradienteDonut(datos) {
    let acumulado = 0;
    const segmentos = datos.map((d) => {
        const desde = acumulado;
        const porcentaje = (d.cantidad / totalReclamos) * 100;
        acumulado += porcentaje;
        return `var(--admin-color-${d.claseColor}) ${desde}% ${acumulado}%`;
    });
    return `conic-gradient(${segmentos.join(", ")})`;
}

const ultimosReclamos = [
    {
        titulo: "Fuga de agua en cochera",
        estado: "Pendiente",
        ubicacion: "Torre A - Piso 1",
        fecha: "Hoy 10:30",
    },
    {
        titulo: "Luz de pasillo quemada",
        estado: "En proceso",
        ubicacion: "Torre B - Piso 5",
        fecha: "Hoy 08:15",
    },
    {
        titulo: "Ascensor fuera de servicio",
        estado: "Pendiente",
        ubicacion: "Torre A - Piso 1",
        fecha: "Ayer 14:45",
    },
    {
        titulo: "Pintura en paredes",
        estado: "Resuelto",
        ubicacion: "Torre C - Piso 2",
        fecha: "28/08/2026",
    },
    {
        titulo: "Puerta de ingreso suelta",
        estado: "Pendiente",
        ubicacion: "Torre A - Piso 2",
        fecha: "27/08/2026",
    },
];

const ultimosPagos = [
    { unidad: "Unidad 5B", monto: "$ 45.230", fecha: "01/09/2026", estado: "Aprobado" },
    { unidad: "Unidad 2A", monto: "$ 45.230", fecha: "01/09/2026", estado: "Aprobado" },
    { unidad: "Unidad 7C", monto: "$ 45.230", fecha: "31/08/2026", estado: "Aprobado" },
    { unidad: "Unidad 1B", monto: "$ 45.230", fecha: "31/08/2026", estado: "Pendiente" },
    { unidad: "Unidad 2D", monto: "$ 45.230", fecha: "30/08/2026", estado: "Aprobado" },
];

const proximaReunion = {
    titulo: "Asamblea ordinaria",
    fecha: "15 de septiembre de 2026 - 20:00 hs",
    lugar: "Salón de usos múltiples",
};

const comunicadoDestacado = {
    titulo: "Corte de luz programado",
    descripcion:
        "El martes 22/09 habrá un corte de luz de 9:00 a 13:00 por tareas de EDENOR en todo el edificio.",
};

const documentosRecientes = [
    {
        nombre: "Reglamento de Copropiedad",
        fecha: "12/08/2026",
    },
    {
        nombre: "Acta Asamblea Ordinaria 08/2026",
        fecha: "10/08/2026",
    },
    {
        nombre: "Recibo expensas 08/2026",
        fecha: "10/08/2026",
    },
];

function badgeClase(estado) {
    switch (estado) {
        case "Pendiente":
            return "admin-badge-pendiente";
        case "En proceso":
            return "admin-badge-proceso";
        case "Resuelto":
        case "Aprobado":
            return "admin-badge-resuelto";
        default:
            return "";
    }
}

function Dashboard() {

    useEffect(() => {
        document.title = "Habita | Dashboard";
    }, []);

    return (
        <main className="admin-dashboard">

            {/* ENCABEZADO */}



            {/* TARJETAS DE KPI */}

            <section className="admin-kpi-grid">

                <article className="admin-kpi-card">
                    <div className="admin-kpi-icon">
                        <Users />
                    </div>
                    <div>
                        <span className="admin-kpi-label">{kpis.residentes.label}</span>
                        <strong>{kpis.residentes.valor}</strong>
                        <span className="admin-kpi-info">{kpis.residentes.info}</span>
                        <span className="admin-kpi-tendencia positiva">
                            <ArrowUp size={12} />
                            {kpis.residentes.tendencia}
                        </span>
                    </div>
                </article>

                <article className="admin-kpi-card">
                    <div className="admin-kpi-icon">
                        <Building2 />
                    </div>
                    <div>
                        <span className="admin-kpi-label">{kpis.unidades.label}</span>
                        <strong>{kpis.unidades.valor}</strong>
                        <span className="admin-kpi-info">{kpis.unidades.info}</span>
                        <span className="admin-kpi-tendencia">{kpis.unidades.tendencia}</span>
                    </div>
                </article>

                <article className="admin-kpi-card">
                    <div className="admin-kpi-icon">
                        <DollarSign />
                    </div>
                    <div>
                        <span className="admin-kpi-label">{kpis.expensas.label}</span>
                        <strong>{kpis.expensas.valor}</strong>
                        <span className="admin-kpi-info">{kpis.expensas.info}</span>
                        <div className="admin-progreso">
                            <div
                                className="admin-progreso-relleno"
                                style={{ width: `${kpis.expensas.progreso}%` }}
                            />
                        </div>
                        <span className="admin-kpi-info">{kpis.expensas.progreso}% del total</span>
                    </div>
                </article>

                <article className="admin-kpi-card">
                    <div className="admin-kpi-icon">
                        <MessageSquare />
                    </div>
                    <div>
                        <span className="admin-kpi-label">{kpis.reclamos.label}</span>
                        <strong>{kpis.reclamos.valor}</strong>
                        <span className="admin-kpi-info">{kpis.reclamos.info}</span>
                        <span className="admin-kpi-tendencia positiva">
                            <ArrowDown size={12} />
                            {kpis.reclamos.tendencia}
                        </span>
                    </div>
                </article>

            </section>

            {/* GRAFICOS */}

            <section className="admin-graficos-grid">

                <article className="admin-panel-card">
                    <div className="admin-panel-header">
                        <h2>Recaudación mensual</h2>
                        <button className="admin-selector-anio">
                            Este año
                            <ChevronDown size={15} />
                        </button>
                    </div>

                    <div className="admin-barras-chart">
                        <div className="admin-barras-eje-y">
                            <span>$6M</span>
                            <span>$4M</span>
                            <span>$2M</span>
                            <span>$0</span>
                        </div>

                        <div className="admin-barras-lista">
                            {recaudacionMensual.map((item) => (
                                <div className="admin-barra-columna" key={item.mes}>
                                    <div className="admin-barra-pista">
                                        <div
                                            className="admin-barra"
                                            style={{ height: `${(item.valor / MAX_RECAUDACION) * 100}%` }}
                                        />
                                    </div>
                                    <span>{item.mes}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </article>

                <article className="admin-panel-card">
                    <div className="admin-panel-header">
                        <h2>Reclamos por estado</h2>
                    </div>

                    <div className="admin-donut-wrap">
                        <div
                            className="admin-donut"
                            style={{ background: armarGradienteDonut(reclamosPorEstado) }}
                        >
                            <div className="admin-donut-centro">
                                <strong>{totalReclamos}</strong>
                                <span>Total</span>
                            </div>
                        </div>

                        <ul className="admin-donut-leyenda">
                            {reclamosPorEstado.map((item) => (
                                <li key={item.estado}>
                                    <span className={`admin-leyenda-punto ${item.claseColor}`} />
                                    <span className="admin-leyenda-label">{item.estado}</span>
                                    <span className="admin-leyenda-valor">{item.cantidad}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </article>

            </section>

            {/* LISTADOS */}

            <section className="admin-listados-grid">

                <article className="admin-panel-card">
                    <div className="admin-panel-header">
                        <h2>Últimos reclamos</h2>
                        <Link to="/administrador/reclamos">Ver todos</Link>
                    </div>

                    <div className="admin-tabla-lista">
                        {ultimosReclamos.map((reclamo, index) => (
                            <div className="admin-tabla-fila" key={index}>
                                <span className="admin-tabla-titulo">{reclamo.titulo}</span>
                                <span className={`admin-badge ${badgeClase(reclamo.estado)}`}>
                                    {reclamo.estado}
                                </span>
                                <span className="admin-tabla-secundario">{reclamo.ubicacion}</span>
                                <span className="admin-tabla-fecha">{reclamo.fecha}</span>
                            </div>
                        ))}
                    </div>
                </article>

                <article className="admin-panel-card">
                    <div className="admin-panel-header">
                        <h2>Últimos pagos</h2>
                        <Link to="/administrador/pagos">Ver todos</Link>
                    </div>

                    <div className="admin-tabla-lista">
                        {ultimosPagos.map((pago, index) => (
                            <div className="admin-tabla-fila" key={index}>
                                <span className="admin-tabla-titulo">{pago.unidad}</span>
                                <span className="admin-tabla-secundario">{pago.monto}</span>
                                <span className="admin-tabla-fecha">{pago.fecha}</span>
                                <span className={`admin-badge ${badgeClase(pago.estado)}`}>
                                    {pago.estado}
                                </span>
                            </div>
                        ))}
                    </div>
                </article>

            </section>

            {/* TARJETAS INFERIORES */}

            <section className="admin-inferior-grid">

                <article className="admin-panel-card admin-inferior-card">
                    <div className="admin-inferior-icon">
                        <CalendarClock />
                    </div>
                    <div className="admin-inferior-contenido">
                        <h3>Próxima reunión</h3>
                        <strong>{proximaReunion.titulo}</strong>
                        <span>{proximaReunion.fecha}</span>
                        <span>{proximaReunion.lugar}</span>
                        <button className="admin-btn-secundario">Ver detalles</button>
                    </div>
                </article>

                <article className="admin-panel-card admin-inferior-card">
                    <div className="admin-inferior-icon">
                        <Megaphone />
                    </div>
                    <div className="admin-inferior-contenido">
                        <h3>Comunicado destacado</h3>
                        <strong>{comunicadoDestacado.titulo}</strong>
                        <span>{comunicadoDestacado.descripcion}</span>
                        <button className="admin-btn-secundario">Ver comunicado</button>
                    </div>
                </article>

                <article className="admin-panel-card">
                    <div className="admin-panel-header">
                        <h2>Documentos recientes</h2>
                        <Link to="/administrador/documentos">Ver todos</Link>
                    </div>

                    <div className="admin-documentos-lista">
                        {documentosRecientes.map((doc, index) => (
                            <div className="admin-documento-fila" key={index}>
                                <span className="admin-documento-icon">
                                    <FileText size={16} />
                                </span>
                                <span className="admin-documento-nombre">{doc.nombre}</span>
                                <span className="admin-documento-fecha">{doc.fecha}</span>
                            </div>
                        ))}
                    </div>
                </article>

            </section>
        </main>
    );
}

export default Dashboard;
