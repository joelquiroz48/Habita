import { useEffect } from "react";
import { Link } from "react-router-dom";
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
import Panel from "../../../components/Panel/Panel";
import TarjetaResumen from "../../../components/TarjetaResumen/TarjetaResumen";
import TablaReportes from "../../../components/TablaReportes/TablaReportes";

{/* =========================
       DATOS EJEMPLOS
========================== */}

const recaudacionMensual = [
    { mes: "Mar 2026", recaudado: 4720000, pendiente: 142000 },
    { mes: "Abr 2026", recaudado: 4862000, pendiente: 0 },
    { mes: "May 2026", recaudado: 4987500, pendiente: 0 },
    { mes: "Jun 2026", recaudado: 5123000, pendiente: 0 },
    { mes: "Jul 2026", recaudado: 5284500, pendiente: 0 },
    { mes: "Ago 2026", recaudado: 4251200, pendiente: 1031100 },
];

const MAX_ESCALA = 6000000;

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
        icon: CheckCircle2,
        clase: "verde",
        titulo: "Pago recibido de Nicolás Paz - Unidad 5B",
        subtitulo: "Expensa Agosto 2026",
        fecha: "01/09/2026 10:24",
    },
    {
        icon: AlertCircle,
        clase: "amarillo",
        titulo: "Nuevo reclamo de Nicolás Paz - Unidad 5B",
        subtitulo: "Fuga de agua en cocina",
        fecha: "01/09/2026 10:30",
    },
    {
        icon: Megaphone,
        clase: "azul",
        titulo: "Comunicado publicado: Corte de luz programado",
        subtitulo: "Publicado por Administrador",
        fecha: "01/09/2026 10:30",
    },
    {
        icon: Calendar,
        clase: "teal",
        titulo: "Nueva reserva en SUM",
        subtitulo: "Reservado por María Gómez - Unidad 3A",
        fecha: "01/09/2026 10:15",
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

const columnasActividad = [
    {
        clave: "titulo",
        titulo: "Actividad",
        ancho: "minmax(0, 1fr)",
        render: (_, item) => {

            return (
                <div className="reportes-actividad-contenido">
                    <span className="reportes-actividad-texto">
                        <strong>{item.titulo}</strong>
                        <small>{item.subtitulo}</small>
                    </span>
                </div>
            );
        },
    },
    {
        clave: "fecha",
        titulo: "Fecha",
        ancho: "auto",
        className: "reportes-actividad-fecha",
    },
];

const columnasResumen = [
    {
        clave: "metrica",
        titulo: "Métrica",
        ancho: "minmax(0, 1.5fr)",
    },
    {
        clave: "valor",
        titulo: "Valor",
        ancho: "minmax(70px, 1fr)",
        className: "reportes-tabla-resumen-valor",
    },
    {
        clave: "variacion",
        titulo: "Vs. mes anterior",
        ancho: "minmax(120px, 1fr)",
        render: (_, fila) => (
            <span
                className={`reportes-tendencia ${
                    fila.positivo ? "positiva" : "negativa"
                }`}
            >
                <ArrowUp size={12} />
                {fila.variacion}
            </span>
        ),
    },
];

{/* =========================
       TARJETAS RESUMEN
========================== */}

const resumenTarjetas = [
    {
        icono: Wallet,
        titulo: "Recaudado en el período",
        valor: "$ 4.251.200",
        contenido: (
            <span className="reportes-tendencia positiva">
                <ArrowUp size={12} />
                12.5% vs. mes anterior
            </span>
        ),
    },
    {
        icono: CreditCard,
        titulo: "Pagos realizados",
        valor: "78",
        contenido: (
            <span className="reportes-tendencia positiva">
                <ArrowUp size={12} />
                6.8% vs. mes anterior
            </span>
        ),
    },
    {
        icono: AlertTriangle,
        titulo: "Reclamos totales",
        valor: "64",
        contenido: (
            <span className="reportes-tendencia negativa">
                <ArrowUp size={12} />
                8.3% vs. mes anterior
            </span>
        ),
    },
    {
        icono: CheckCircle2,
        titulo: "Reclamos resueltos",
        valor: "20",
        contenido: (
            <span className="reportes-tendencia positiva">
                <ArrowUp size={12} />
                25% vs. mes anterior
            </span>
        ),
    },
    {
        icono: Users,
        titulo: "Nuevos residentes",
        valor: "12",
        contenido: (
            <span className="reportes-tendencia positiva">
                <ArrowUp size={12} />
                9.1% vs. mes anterior
            </span>
        ),
    },
    {
        icono: CalendarCheck,
        titulo: "Reservas realizadas",
        valor: "28",
        contenido: (
            <span className="reportes-tendencia positiva">
                <ArrowUp size={12} />
                12% vs. mes anterior
            </span>
        ),
    },
];

function Reportes() {

    useEffect(() => {
        document.title = "Habita | Reportes y estadísticas";
    }, []);

    return (
        <main className="reportes">

            <section className="reportes-resumen">
                {resumenTarjetas.map((item, index) => {
                    const Icono = item.icono;

                    return (
                        <TarjetaResumen
                            key={index}
                            icono={<Icono size={19} />}
                            titulo={item.titulo}
                            valor={item.valor}
                            contenido={item.contenido}
                        />
                    );
                })}
            </section>

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

            {/* GRAFICOS */}

            <section className="reportes-graficos-grid">

                <Panel titulo="Recaudación mensual">
                    <div className="reportes-leyenda-barras">
                        <span>
                            <span className="reportes-punto recaudado" />
                            Recaudado
                        </span>

                        <span>
                            <span className="reportes-punto pendiente" />
                            Pendiente
                        </span>
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
                                            style={{
                                                height: `${(item.pendiente / MAX_ESCALA) * 100}%`
                                            }}
                                        />

                                        <div
                                            className="reportes-barra-segmento recaudado"
                                            style={{
                                                height: `${(item.recaudado / MAX_ESCALA) * 100}%`
                                            }}
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
                        <ChevronRight size={14} className="reportes-insight-flecha"/>
                    </div>
                </Panel>

                <Panel titulo="Reclamos por estado">
                    <div className="reportes-donut-wrap">
                        <div
                            className="reportes-donut"
                            style={{
                                background: armarGradienteDonut(
                                    reclamosPorEstado,
                                    totalReclamosEstado,
                                    "estado"
                                )
                            }}
                        >
                            <div className="reportes-donut-centro">
                                <strong>{totalReclamosEstado}</strong>
                                <span>Total</span>
                            </div>
                        </div>

                        <ul className="reportes-donut-leyenda">
                            {reclamosPorEstado.map((item) => (
                                <li key={item.nombre}>
                                    <span className={`reportes-punto estado-${item.claseColor}`}/>

                                    <span className="reportes-leyenda-label">
                                        {item.nombre}
                                    </span>

                                    <span className="reportes-leyenda-valor">
                                        {item.cantidad} (
                                        {Math.round(
                                            (item.cantidad / totalReclamosEstado) * 100
                                        )}
                                        %)
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="reportes-insight">
                        <FileText size={14} />
                        El 41% de los reclamos se encuentran en proceso.
                        <ChevronRight size={14} className="reportes-insight-flecha"/>
                    </div>
                </Panel>

                <Panel titulo="Reclamos por categoría">
                    <div className="reportes-donut-wrap">
                        <div
                            className="reportes-donut"
                            style={{
                                background: armarGradienteDonut(
                                    reclamosPorCategoria,
                                    totalReclamosCategoria,
                                    "cat"
                                )
                            }}
                        >
                            <div className="reportes-donut-centro" />
                        </div>

                        <ul className="reportes-donut-leyenda">
                            {reclamosPorCategoria.map((item) => (
                                <li key={item.nombre}>
                                    <span className={`reportes-punto cat-${item.claseColor}`}/>
                                    <span className="reportes-leyenda-label">
                                        {item.nombre}
                                    </span>
                                    <span className="reportes-leyenda-valor">
                                        {item.cantidad} (
                                        {Math.round(
                                            (item.cantidad / totalReclamosCategoria) * 100
                                        )}
                                        %)
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="reportes-insight">
                        <FileText size={14} />
                        Mantenimiento es la categoría con más reclamos.
                        <ChevronRight size={14} className="reportes-insight-flecha"/>
                    </div>
                </Panel>

            </section>

            {/* ACTIVIDAD + RESUMEN */}

            <section className="reportes-inferior-grid">

                <Panel titulo="Actividad reciente" accion={<Link to="/administrador/reportes">Ver todo</Link>}>
                    <TablaReportes
                        columnas={columnasActividad}
                        datos={actividadReciente}
                        obtenerClave={(item) => `${item.titulo}-${item.fecha}`}
                    />
                </Panel>

                <Panel titulo="Resumen general del período" accion={<Link to="/administrador/reportes">Ver todo</Link>}>
                    <TablaReportes
                        columnas={columnasResumen}
                        datos={resumenGeneral}
                        obtenerClave={(fila) => fila.metrica}
                        mostrarEncabezado
                    />
                </Panel>

            </section>

        </main>
    );
}

export default Reportes;
