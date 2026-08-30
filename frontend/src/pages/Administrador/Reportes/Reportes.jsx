import { useEffect } from "react";
import {
    Calendar,
    ChevronDown,
    Download,
    Wallet,
    CreditCard,
    AlertTriangle,
    CheckCircle2,
    Users,
    CalendarCheck,
    ArrowUp,
    FileText,
    ChevronRight,
    AlertCircle,
    Megaphone,
} from "lucide-react";

import "./Reportes.css";

// =========================
// DATOS DE EJEMPLO
// =========================

const kpis = [
    { label: "Recaudado en el período", valor: "$ 35.420", variacion: "12.5%", positivo: true, icon: Wallet, clase: "verde" },
    { label: "Pagos realizados", valor: "78", variacion: "6.8%", positivo: true, icon: CreditCard, clase: "azul" },
    { label: "Reclamos totales", valor: "64", variacion: "8.3%", positivo: false, icon: AlertTriangle, clase: "amarillo" },
    { label: "Reclamos resueltos", valor: "20", variacion: "25%", positivo: true, icon: CheckCircle2, clase: "azul" },
    { label: "Nuevos residentes", valor: "12", variacion: "9.1%", positivo: true, icon: Users, clase: "amarillo" },
    { label: "Reservas realizadas", valor: "46", variacion: "15.2%", positivo: true, icon: CalendarCheck, clase: "azul" },
];

const recaudacionMensual = [
    { mes: "Dic 2023", recaudado: 30500, pendiente: 7500 },
    { mes: "Ene 2024", recaudado: 31800, pendiente: 8200 },
    { mes: "Feb 2024", recaudado: 29800, pendiente: 8100 },
    { mes: "Mar 2024", recaudado: 31200, pendiente: 8700 },
    { mes: "Abr 2024", recaudado: 33100, pendiente: 10500 },
    { mes: "May 2024", recaudado: 35420, pendiente: 9810 },
];
const MAX_ESCALA = 50000;

const reclamosPorEstado = [
    { nombre: "Pendientes", cantidad: 18, claseColor: "pendiente" },
    { nombre: "En proceso", cantidad: 26, claseColor: "proceso" },
    { nombre: "Resueltos", cantidad: 20, claseColor: "resuelto" },
];
const totalReclamosEstado = reclamosPorEstado.reduce((acc, r) => acc + r.cantidad, 0);

const reclamosPorCategoria = [
    { nombre: "Mantenimiento", cantidad: 22, claseColor: "mantenimiento" },
    { nombre: "Limpieza", cantidad: 14, claseColor: "limpieza" },
    { nombre: "Ascensores", cantidad: 10, claseColor: "ascensores" },
    { nombre: "Iluminación", cantidad: 8, claseColor: "iluminacion" },
    { nombre: "Seguridad", cantidad: 6, claseColor: "seguridad" },
    { nombre: "Otros", cantidad: 4, claseColor: "otros" },
];
const totalReclamosCategoria = reclamosPorCategoria.reduce((acc, r) => acc + r.cantidad, 0);

function armarGradienteDonut(datos, total, prefijo) {
    let acumulado = 0;
    const segmentos = datos.map((d) => {
        const desde = acumulado;
        const porcentaje = (d.cantidad / total) * 100;
        acumulado += porcentaje;
        return `var(--reportes-color-${prefijo}-${d.claseColor}) ${desde}% ${acumulado}%`;
    });
    return `conic-gradient(${segmentos.join(", ")})`;
}

const actividadReciente = [
    {
        icon: CheckCircle2, clase: "verde",
        titulo: "Pago recibido de Nicolás Paz - Unidad 5B",
        subtitulo: "Expensa Mayo 2024",
        fecha: "15/05/2024 10:24",
    },
    {
        icon: AlertCircle, clase: "amarillo",
        titulo: "Nuevo reclamo de María Gómez - Unidad 3A",
        subtitulo: "Fuga de agua en cocina",
        fecha: "15/05/2024 09:15",
    },
    {
        icon: Megaphone, clase: "azul",
        titulo: "Comunicado publicado: Corte de agua programado",
        subtitulo: "Publicado por Administrador",
        fecha: "13/05/2024 10:30",
    },
    {
        icon: Calendar, clase: "teal",
        titulo: "Nueva reserva en SUM",
        subtitulo: "Reservado por Juan López - Unidad 7C",
        fecha: "12/05/2024 18:45",
    },
];

const resumenGeneral = [
    { metrica: "Recaudación total", valor: "$ 35.420", variacion: "12.5%", positivo: true },
    { metrica: "Pagos realizados", valor: "78", variacion: "6.8%", positivo: true },
    { metrica: "Reclamos totales", valor: "64", variacion: "8.3%", positivo: false },
    { metrica: "Reclamos resueltos", valor: "20", variacion: "25%", positivo: true },
    { metrica: "Reservas realizadas", valor: "46", variacion: "15.2%", positivo: true },
    { metrica: "Comunicados publicados", valor: "6", variacion: "20%", positivo: true },
    { metrica: "Nuevos residentes", valor: "12", variacion: "9.1%", positivo: true },
];

function Reportes() {

    useEffect(() => {
        document.title = "Habita | Reportes y estadísticas";
    }, []);

    return (
        <main className="reportes">

            {/* FILTROS */}

            <div className="reportes-filtros">
                <button className="reportes-filtro">
                    <Calendar size={15} />
                    01/05/2024 - 31/05/2024
                    <ChevronDown size={15} />
                </button>

                <button className="reportes-filtro">
                    Todos los edificios
                    <ChevronDown size={15} />
                </button>

                <button className="reportes-filtro">
                    Comparar con: Mes anterior
                    <ChevronDown size={15} />
                </button>

                <button className="reportes-btn-exportar">
                    <Download size={15} />
                    Exportar reporte
                </button>
            </div>

            {/* KPIS */}

            <section className="reportes-kpi-grid">
                {kpis.map((kpi) => {
                    const Icono = kpi.icon;
                    return (
                        <article className="reportes-kpi-card" key={kpi.label}>
                            <div className={`reportes-kpi-icon ${kpi.clase}`}>
                                <Icono size={19} />
                            </div>
                            <div>
                                <span className="reportes-kpi-label">{kpi.label}</span>
                                <strong>{kpi.valor}</strong>
                                <span className={`reportes-tendencia ${kpi.positivo ? "positiva" : "negativa"}`}>
                                    <ArrowUp size={12} />
                                    {kpi.variacion} vs. mes anterior
                                </span>
                            </div>
                        </article>
                    );
                })}
            </section>

            {/* GRAFICOS */}

            <section className="reportes-graficos-grid">

                <article className="reportes-panel-card">
                    <h2>Recaudación mensual</h2>

                    <div className="reportes-leyenda-barras">
                        <span><span className="reportes-punto recaudado" /> Recaudado</span>
                        <span><span className="reportes-punto pendiente" /> Pendiente</span>
                    </div>

                    <div className="reportes-barras-chart">
                        <div className="reportes-barras-eje-y">
                            <span>$50.000</span>
                            <span>$40.000</span>
                            <span>$30.000</span>
                            <span>$20.000</span>
                            <span>$10.000</span>
                            <span>$0</span>
                        </div>

                        <div className="reportes-barras-lista">
                            {recaudacionMensual.map((item) => (
                                <div className="reportes-barra-columna" key={item.mes}>
                                    <div className="reportes-barra-pista">
                                        <div
                                            className="reportes-barra-segmento pendiente"
                                            style={{ height: `${(item.pendiente / MAX_ESCALA) * 100}%` }}
                                        />
                                        <div
                                            className="reportes-barra-segmento recaudado"
                                            style={{ height: `${(item.recaudado / MAX_ESCALA) * 100}%` }}
                                        />
                                    </div>
                                    <span>{item.mes}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="reportes-insight">
                        <FileText size={14} />
                        La recaudación de mayo aumentó un 12.5% respecto al mes anterior.
                        <ChevronRight size={14} className="reportes-insight-flecha" />
                    </div>
                </article>

                <article className="reportes-panel-card">
                    <h2>Reclamos por estado</h2>

                    <div className="reportes-donut-wrap">
                        <div
                            className="reportes-donut"
                            style={{ background: armarGradienteDonut(reclamosPorEstado, totalReclamosEstado, "estado") }}
                        >
                            <div className="reportes-donut-centro">
                                <strong>{totalReclamosEstado}</strong>
                                <span>Total</span>
                            </div>
                        </div>

                        <ul className="reportes-donut-leyenda">
                            {reclamosPorEstado.map((item) => (
                                <li key={item.nombre}>
                                    <span className={`reportes-punto estado-${item.claseColor}`} />
                                    <span className="reportes-leyenda-label">{item.nombre}</span>
                                    <span className="reportes-leyenda-valor">
                                        {item.cantidad} ({Math.round((item.cantidad / totalReclamosEstado) * 100)}%)
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="reportes-insight">
                        <FileText size={14} />
                        El 41% de los reclamos se encuentran en proceso.
                        <ChevronRight size={14} className="reportes-insight-flecha" />
                    </div>
                </article>

                <article className="reportes-panel-card">
                    <h2>Reclamos por categoría</h2>

                    <div className="reportes-donut-wrap">
                        <div
                            className="reportes-donut"
                            style={{ background: armarGradienteDonut(reclamosPorCategoria, totalReclamosCategoria, "cat") }}
                        >
                            <div className="reportes-donut-centro" />
                        </div>

                        <ul className="reportes-donut-leyenda">
                            {reclamosPorCategoria.map((item) => (
                                <li key={item.nombre}>
                                    <span className={`reportes-punto cat-${item.claseColor}`} />
                                    <span className="reportes-leyenda-label">{item.nombre}</span>
                                    <span className="reportes-leyenda-valor">
                                        {item.cantidad} ({Math.round((item.cantidad / totalReclamosCategoria) * 100)}%)
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="reportes-insight">
                        <FileText size={14} />
                        Mantenimiento es la categoría con más reclamos.
                        <ChevronRight size={14} className="reportes-insight-flecha" />
                    </div>
                </article>

            </section>

            {/* ACTIVIDAD + RESUMEN */}

            <section className="reportes-inferior-grid">

                <article className="reportes-panel-card">
                    <h2>Actividad reciente</h2>

                    <div className="reportes-actividad-lista">
                        {actividadReciente.map((item, index) => {
                            const Icono = item.icon;
                            return (
                                <div className="reportes-actividad-fila" key={index}>
                                    <span className={`reportes-actividad-icon ${item.clase}`}>
                                        <Icono size={16} />
                                    </span>
                                    <span className="reportes-actividad-texto">
                                        <strong>{item.titulo}</strong>
                                        <small>{item.subtitulo}</small>
                                    </span>
                                    <span className="reportes-actividad-fecha">{item.fecha}</span>
                                </div>
                            );
                        })}
                    </div>

                    <a href="#" className="reportes-link-centrado">
                        Ver toda la actividad
                        <ChevronRight size={14} />
                    </a>
                </article>

                <article className="reportes-panel-card">
                    <h2>Resumen general del período</h2>

                    <div className="reportes-tabla-resumen">
                        <div className="reportes-tabla-resumen-header">
                            <span>Métrica</span>
                            <span>Valor</span>
                            <span>Vs. mes anterior</span>
                        </div>

                        {resumenGeneral.map((fila) => (
                            <div className="reportes-tabla-resumen-fila" key={fila.metrica}>
                                <span>{fila.metrica}</span>
                                <span className="reportes-tabla-resumen-valor">{fila.valor}</span>
                                <span className={`reportes-tendencia ${fila.positivo ? "positiva" : "negativa"}`}>
                                    <ArrowUp size={12} />
                                    {fila.variacion}
                                </span>
                            </div>
                        ))}
                    </div>

                    <a href="#" className="reportes-link-centrado">
                        Ver reporte completo
                        <ChevronRight size={14} />
                    </a>
                </article>

            </section>

        </main>
    );
}

export default Reportes;
