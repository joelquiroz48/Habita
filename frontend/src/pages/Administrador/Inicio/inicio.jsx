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
    CalendarClock,
    Megaphone,
    FileText,
} from "lucide-react";

import "./Inicio.css";
import Panel from "../../../components/Panel/Panel";
import TarjetaResumen from "../../../components/TarjetaResumen/TarjetaResumen";
import TablaReportes from "../../../components/TablaReportes/TablaReportes";

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
    { estado: "Pendiente", cantidad: 12, claseColor: "pendiente" },
    { estado: "En proceso", cantidad: 7, claseColor: "proceso" },
    { estado: "Resuelto", cantidad: 25, claseColor: "resuelto" },
];

const totalReclamos = reclamosPorEstado.reduce((acc, r) => acc + r.cantidad, 0);

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

const columnasReclamos = [
    {
        clave: "titulo",
        ancho: "minmax(0, 1.6fr)",
        className: "admin-tabla-titulo",
    },
    {
        clave: "estado",
        ancho: "auto",
        render: (estado) => (
            <span className={`admin-badge ${badgeClase(estado)}`}>
                {estado}
            </span>
        ),
    },
    {
        clave: "ubicacion",
        ancho: "minmax(0, 1fr)",
        className: "admin-tabla-secundario",
    },
    {
        clave: "fecha",
        ancho: "auto",
        className: "admin-tabla-fecha",
    },
];

const columnasPagos = [
    {
        clave: "unidad",
        ancho: "minmax(0, 1.6fr)",
        className: "admin-tabla-titulo",
    },
    {
        clave: "monto",
        ancho: "minmax(0, 1fr)",
        className: "admin-tabla-secundario",
    },
    {
        clave: "fecha",
        ancho: "auto",
        className: "admin-tabla-fecha",
    },
    {
        clave: "estado",
        ancho: "auto",
        render: (estado) => (
            <span className={`admin-badge ${badgeClase(estado)}`}>
                {estado}
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
                <span className="admin-tendencia negativa">
                    <ArrowDown size={12} />
                    {kpis.reclamos.tendencia}
                </span>
            </>
        ),
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

            {/* GRAFICOS */}

            <section className="admin-fila-superior">

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

                <Panel titulo="Reclamos por estado">
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
                </Panel>

            </section>

            {/* LISTADOS */}

            <section className="admin-fila-central">

                <Panel titulo="Últimos reclamos" accion={<Link to="/administrador/reclamos">Ver todos</Link>}>
                    <TablaReportes
                        columnas={columnasReclamos}
                        datos={ultimosReclamos}
                        obtenerClave={(reclamo) =>
                            `${reclamo.titulo}-${reclamo.fecha}`
                        }
                    />
                </Panel>

                <Panel titulo="Últimos pagos" accion={<Link to="/administrador/pagos">Ver todos</Link>}>
                    <TablaReportes
                        columnas={columnasPagos}
                        datos={ultimosPagos}
                        obtenerClave={(pago) => `${pago.unidad}-${pago.fecha}`}
                    />
                </Panel>

            </section>

            {/* TARJETAS INFERIORES */}

            <section className="admin-fila-inferior">

                <Panel>
                    <div className="admin-inferior-card">
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
                    </div>
                </Panel>

                <Panel>
                    <div className="admin-inferior-card">
                        <div className="admin-inferior-icon">
                            <Megaphone />
                        </div>
                        <div className="admin-inferior-contenido">
                            <h3>Comunicado destacado</h3>
                            <strong>{comunicadoDestacado.titulo}</strong>
                            <span>{comunicadoDestacado.descripcion}</span>
                            <button className="admin-btn-secundario">Ver comunicado</button>
                        </div>
                    </div>
                </Panel>

                <Panel titulo="Documentos recientes" accion={<Link to="/administrador/documentos">Ver todos</Link>}>
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
                </Panel>

            </section>
        </main>
    );
}

export default Dashboard;
