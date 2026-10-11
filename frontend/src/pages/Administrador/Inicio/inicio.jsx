import { useEffect, useState } from "react";
import { Chart as ChartJS } from "chart.js/auto";
import { Bar, Doughnut } from "react-chartjs-2";
import { Link } from "react-router-dom";
import {
    Users,
    Building2,
    DollarSign,
    MessageSquare,
    ChevronDown,
    ArrowUp,
    CheckCircle2,
    AlertCircle,
    Calendar,
    Megaphone,
    Download,
    ArrowDown,
} from "lucide-react";

import "./Inicio.css";
import estadisticasMensuales from "../../../data/estadisticasMensuales.json";
import reclamosEstadosData from "../../../data/reclamosEstadosData.json";
import reclamosCategoriasData from "../../../data/reclamosCategoriasData.json";
import Panel from "../../../components/Panel/Panel";
import TarjetaResumen from "../../../components/TarjetaResumen/TarjetaResumen";
import Tabla from "../../../components/Tabla/Tabla";

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

const actividadReciente = [
    {
        icon: CheckCircle2,
        clase: "verde",
        titulo: "Pago recibido de Nicolás Paz - Unidad 5B",
        subtitulo: "Expensa Agosto 2026",
        fecha: "01/09/2026 10:24",
        seccion: "Pagos",
        ruta: "/administrador/pagos",
    },
    {
        icon: AlertCircle,
        clase: "amarillo",
        titulo: "Nuevo reclamo de Nicolás Paz - Unidad 5B",
        subtitulo: "Fuga de agua en cocina",
        fecha: "01/09/2026 10:30",
        seccion: "Reclamos",
        ruta: "/administrador/reclamos",
    },
    {
        icon: Megaphone,
        clase: "azul",
        titulo: "Comunicado publicado: Corte de luz programado",
        subtitulo: "Publicado por Administrador",
        fecha: "01/09/2026 10:30",
        seccion: "Comunicados",
        ruta: "/administrador/comunicados",
    },
    {
        icon: Calendar,
        clase: "teal",
        titulo: "Nueva reserva en SUM",
        subtitulo: "Reservado por María Gómez - Unidad 3A",
        fecha: "01/09/2026 10:15",
        seccion: "Reservas",
        ruta: "/administrador/reservas",
    },
    {
        icon: CheckCircle2,
        clase: "verde",
        titulo: "Pago recibido de Camila Duarte - Unidad 2C",
        subtitulo: "Expensa Septiembre 2026",
        fecha: "01/09/2026 09:52",
        seccion: "Pagos",
        ruta: "/administrador/pagos",
    },
    {
        icon: AlertCircle,
        clase: "amarillo",
        titulo: "Nuevo reclamo de Jorge Acosta - Unidad 8A",
        subtitulo: "Portón de acceso no cierra",
        fecha: "31/08/2026 18:42",
        seccion: "Reclamos",
        ruta: "/administrador/reclamos",
    },
    {
        icon: Megaphone,
        clase: "azul",
        titulo: "Comunicado publicado: Mantenimiento del ascensor",
        subtitulo: "Publicado por Administrador",
        fecha: "31/08/2026 16:20",
        seccion: "Comunicados",
        ruta: "/administrador/comunicados",
    },
    {
        icon: Calendar,
        clase: "teal",
        titulo: "Nueva reserva en terraza",
        subtitulo: "Reservada por Lucía Fernández - Unidad 6D",
        fecha: "31/08/2026 14:08",
        seccion: "Reservas",
        ruta: "/administrador/reservas",
    },
    {
        icon: CheckCircle2,
        clase: "verde",
        titulo: "Pago recibido de Martín Suárez - Unidad 4A",
        subtitulo: "Expensa Septiembre 2026",
        fecha: "31/08/2026 12:36",
        seccion: "Pagos",
        ruta: "/administrador/pagos",
    },
    {
        icon: AlertCircle,
        clase: "amarillo",
        titulo: "Mantenimiento preventivo de bombas",
        subtitulo: "Trabajo programado para el 02/09/2026",
        fecha: "31/08/2026 11:20",
        seccion: "Comunicados",
        ruta: "/administrador/comunicados",
    },
];

const definicionesMetricas = [
    { metrica: "Recaudación total", campo: "recaudacion", moneda: true },
    { metrica: "Pagos realizados", campo: "pagosRealizados" },
    { metrica: "Reclamos totales", campo: "reclamosTotales" },
    { metrica: "Reclamos resueltos", campo: "reclamosResueltos" },
    { metrica: "Reservas realizadas", campo: "reservas" },
];

const ultimoMes = estadisticasMensuales.at(-1);
const mesAnterior = estadisticasMensuales.at(-2);
const formatoMoneda = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
});

const resumenGeneral = definicionesMetricas.map((definicion) => {
    const total = estadisticasMensuales.reduce(
        (acumulado, mes) => acumulado + mes[definicion.campo],
        0
    );
    const valorActual = ultimoMes[definicion.campo];
    const valorAnterior = mesAnterior[definicion.campo];
    const porcentajeCambio = ((valorActual - valorAnterior) / valorAnterior) * 100;

    return {
        ...definicion,
        valor: definicion.moneda
            ? formatoMoneda.format(total)
            : total.toLocaleString("es-AR"),
        variacion: `${Math.abs(porcentajeCambio).toFixed(1)}%`,
        positivo: porcentajeCambio >= 0,
    };
});

const columnasResumen = [
    {
        clave: "metrica",
        titulo: "Métrica",
        ancho: "minmax(0, 1fr)",
    },
    {
        clave: "valor",
        titulo: "Valor",
        ancho: "minmax(40px, 1fr)",
        clase: "reportes-tabla-resumen-valor",
    },
    {
        clave: "variacion",
        titulo: "Vs. mes anterior",
        ancho: "minmax(50px, 1fr)",
        render: (fila) => {
            const IconoTendencia = fila.positivo ? ArrowUp : ArrowDown;

            return (
                <span
                    className={`reportes-tendencia ${
                        fila.positivo ? "positiva" : "negativa"
                    }`}
                >
                    <IconoTendencia size={12} />
                    {fila.variacion}
                </span>
            );
        },
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
];

function Dashboard() {
    const [campoSeleccionado, setCampoSeleccionado] = useState("recaudacion");
    const metricaSeleccionada = resumenGeneral.find(
        (fila) => fila.campo === campoSeleccionado
    );

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

            <section className="graficos-inferiores">
                <div className="graficos-metricos">
                     <Panel
                        titulo={`${metricaSeleccionada.metrica} por mes`}
                        className="grafico-barra"
                        accion={
                            <button className="admin-selector-anio">
                                Este año
                                <ChevronDown size={15} />
                            </button>
                        }
                    >
                        <Bar
                            data={{
                                labels: estadisticasMensuales.map((data) => data.mes),
                                datasets: [
                                    {
                                        label: metricaSeleccionada.metrica,
                                        data: estadisticasMensuales.map(
                                            (data) => data[campoSeleccionado]
                                        ),
                                        backgroundColor: "#5ba6a8",
                                    }
                                ],
                            }}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false } },
                            }}
                        />
                    </Panel>

                    <Tabla
                        columnas={columnasResumen}
                        datos={resumenGeneral}
                        onFilaClick={(fila) => setCampoSeleccionado(fila.campo)}
                        filaSeleccionada={metricaSeleccionada}
                        seleccionable
                    />

                </div>

                <div className="contenido inferior">
                    <div className="graficos-dona-columna">
                        <Panel titulo="Reclamos por estado" className="grafico-dona">
                            <Doughnut
                                data={{
                                    labels: reclamosEstadosData.map((data) => data.nombre),
                                    datasets: [
                                        {
                                            label: "Reclamos por estado",
                                            data: reclamosEstadosData.map((data) => data.cantidad)
                                        }
                                    ],
                                }}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: { legend: { display: false } },
                                }}
                            />
                        </Panel>

                        <Panel titulo="Reclamos por categoría" className="grafico-dona">
                            <Doughnut
                                data={{
                                    labels: reclamosCategoriasData.map((data) => data.nombre),
                                    datasets: [
                                        {
                                            label: "Reclamos por categoría",
                                            data: reclamosCategoriasData.map((data) => data.cantidad)
                                        }
                                    ]
                                }}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: { legend: { display: false } },
                                }}
                            />
                        </Panel>
                    </div>

                    <Panel titulo="Actividad reciente">
                        <ul className="reportes-actividad-lista">
                            {actividadReciente.map((item) => (
                                <li
                                    className="reportes-actividad-item"
                                    key={`${item.titulo}-${item.fecha}`}
                                >
                                    <span className="reportes-actividad-texto">
                                            <strong>{item.titulo}</strong>
                                            <small>{item.subtitulo}</small>
                                    </span>
                                    <div className="reportes-actividad-meta">
                                        <time className="reportes-actividad-fecha">{item.fecha}</time>
                                        <Link
                                            className="reportes-actividad-link"
                                            to={item.ruta}
                                        >
                                            Ir a {item.seccion.toLowerCase()}
                                        </Link>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </Panel>

                </div>
            </section>
        </main>
    );
}

export default Dashboard;
