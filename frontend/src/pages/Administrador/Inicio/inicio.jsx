import { useEffect } from "react";
import {
    Users,
    Building2,
    DollarSign,
    MessageSquare,
    ChevronDown,
    ArrowUp,
    ArrowDown,
    CheckCircle2,
    AlertCircle,
    Calendar,
    Megaphone,
    Download,
} from "lucide-react";

import "./Inicio.css";
import Panel from "../../../components/Panel/Panel";
import TarjetaResumen from "../../../components/TarjetaResumen/TarjetaResumen";
import TablaReportes from "../../../components/TablaReportes/TablaReportes";
import armarGradienteDonut from "../../../utils/armarGradienteDonut";

{/* =========================
        DATOS EJEMPLO
========================== */}

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
    { nombre: "Pendientes", cantidad: 18, claseColor: "pendiente" },
    { nombre: "En proceso", cantidad: 26, claseColor: "proceso" },
    { nombre: "Resueltos", cantidad: 20, claseColor: "resuelto" },
];
const totalReclamosEstado = reclamosPorEstado.reduce((acc, r) => acc + r.cantidad, 0);

const reclamosPorCategoria = [
    { nombre: "Mantenimiento", cantidad: 22, claseColor: "mantenimiento" },
    { nombre: "Limpieza", cantidad: 15, claseColor: "limpieza" },
    { nombre: "Ascensores", cantidad: 10, claseColor: "ascensores" },
    { nombre: "Iluminación", cantidad: 8, claseColor: "iluminacion" },
    { nombre: "Seguridad", cantidad: 6, claseColor: "seguridad" },
    { nombre: "Otros", cantidad: 4, claseColor: "otros" },
];
const totalReclamosCategoria = reclamosPorCategoria.reduce((acc, r) => acc + r.cantidad, 0);

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
        icono: Users,
        titulo: kpis.residentes.label,
        valor: kpis.residentes.valor,
        contenido: (
            <>
                <span className="admin-info">
                    {kpis.residentes.info}
                </span>
                <span className="admin-tendencia positiva">
                    <ArrowUp size={12} />
                    {kpis.residentes.tendencia}
                </span>
            </>
        ),
    },
    {
        icono: Building2,
        titulo: kpis.unidades.label,
        valor: kpis.unidades.valor,
        contenido: (
            <>
                <span className="admin-info">
                    {kpis.unidades.info}
                </span>
                <span className="admin-tendencia">
                    {kpis.unidades.tendencia}
                </span>
            </>
        ),
    },
    {
        icono: DollarSign,
        titulo: kpis.expensas.label,
        valor: kpis.expensas.valor,
        contenido: (
            <>
                <span className="admin-info">
                    {kpis.expensas.info}
                </span>

                <div className="admin-progreso">
                    <div
                        className="admin-progreso-relleno"
                        style={{ width: `${kpis.expensas.progreso}%` }}
                    />
                </div>

                <span className="admin-info">
                    {kpis.expensas.progreso}% del total
                </span>
            </>
        ),
    },
    {
        icono: MessageSquare,
        titulo: kpis.reclamos.label,
        valor: kpis.reclamos.valor,
        contenido: (
            <>
                <span className="admin-info">
                    {kpis.reclamos.info}
                </span>
                <span className="admin-tendencia positiva">
                    <ArrowUp size={12} />
                    {kpis.reclamos.tendencia}
                </span>
            </>
        ),
    },
    {
        icono: Users,
        titulo: "Nuevos residentes",
        valor: "12",
        contenido: (
            <span className="admin-tendencia positiva">
                <ArrowUp size={12} />
                9.1% vs. mes anterior
            </span>
        ),
    },
];

function Dashboard() {

    useEffect(() => {
        document.title = "Habita | Dashboard";
    }, []);

    return (
        <main className="admin-dashboard">

            {/* =========================
                  RESUMEN SUPERIOR
            ========================= */}

            <section className="admin-resumen">
                {resumenTarjetas.map((item, index) => {
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
                
            <button className="reportes-btn-exportar">
                <Download size={15} />
                Exportar reporte
            </button>

            {/* GRAFICOS */}

            <section className="admin-graficos">
                <Panel
                    titulo="Recaudación mensual"
                    accion={
                        <button className="admin-selector-anio">
                            Este año
                            <ChevronDown size={15} />
                        </button>
                    }
                >
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
                                            style={{
                                                height: `${(item.valor / MAX_RECAUDACION) * 100}%`
                                            }}
                                        />
                                    </div>

                                    <span>{item.mes}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </Panel>

                <div className="admin-fila-superior">
                    <Panel titulo="Reclamos por estado">
                        <div className="reportes-donut-wrap">
                            <div
                                className="reportes-donut"
                                style={{
                                    background: armarGradienteDonut(
                                        reclamosPorEstado,
                                        "reportes-color-estado"
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
                                        <span className={`reportes-punto estado-${item.claseColor}`} />
                                        <span className="reportes-leyenda-label">{item.nombre}</span>
                                        <span className="reportes-leyenda-valor">
                                            {item.cantidad} (
                                            {Math.round((item.cantidad / totalReclamosEstado) * 100)}%)
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </Panel>

                    <Panel titulo="Reclamos por categoría">
                        <div className="reportes-donut-wrap">
                            <div
                                className="reportes-donut"
                                style={{
                                    background: armarGradienteDonut(
                                        reclamosPorCategoria,
                                        "reportes-color-cat"
                                    )
                                }}
                            >
                                <div className="reportes-donut-centro">
                                    <strong>{totalReclamosCategoria}</strong>
                                    <span>Total</span>
                                </div>
                            </div>

                            <ul className="reportes-donut-leyenda">
                                {reclamosPorCategoria.map((item) => (
                                    <li key={item.nombre}>
                                        <span className={`reportes-punto cat-${item.claseColor}`} />
                                        <span className="reportes-leyenda-label">
                                            {item.nombre}
                                        </span>
                                        <span className="reportes-leyenda-valor">
                                            {item.cantidad} (
                                            {Math.round((item.cantidad / totalReclamosCategoria) * 100)}%)
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </Panel>
                </div>
            </section>

            {/* ACTIVIDAD + RESUMEN */}

            <section className="reportes-inferior-grid">

                <Panel titulo="Actividad reciente">
                    <TablaReportes
                        columnas={columnasActividad}
                        datos={actividadReciente}
                        obtenerClave={(item) => `${item.titulo}-${item.fecha}`}
                    />
                </Panel>

                <Panel titulo="Resumen general del período">
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

export default Dashboard;
