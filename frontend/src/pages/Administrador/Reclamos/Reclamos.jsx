import { useEffect } from "react";
import {
    ClipboardList,
    Clock,
    Settings2,
    CheckCircle2,
    ChevronDown,
    Search,
    Download,
    Eye,
    MoreVertical,
    ChevronLeft,
    ChevronRight,
    Wrench,
    Sparkles,
    ArrowUpDown,
    Lightbulb,
    MoreHorizontal,
    BarChart3,
} from "lucide-react";

import "./Reclamos.css";

// =========================
// DATOS DE EJEMPLO
// =========================

const kpis = {
    total: 64,
    pendientes: 18,
    enProceso: 26,
    resueltos: 20,
};

const reclamos = [
    { id: "#R-2026-0064", fecha: "01/09/2026", residente: "Nicolás Paz", unidad: "5B", categoria: "Mantenimiento", asunto: "Fuga de agua en cocina", estado: "Pendiente", prioridad: "Alta" },
    { id: "#R-2026-0063", fecha: "01/09/2026", residente: "María Gómez", unidad: "3A", categoria: "Limpieza", asunto: "Suciedad en pasillos", estado: "En proceso", prioridad: "Media" },
    { id: "#R-2026-0062", fecha: "31/08/2026", residente: "Juan López", unidad: "7C", categoria: "Ascensores", asunto: "Ascensor se detiene entre pisos", estado: "En proceso", prioridad: "Alta" },
    { id: "#R-2026-0061", fecha: "31/08/2026", residente: "Carla Romero", unidad: "1B", categoria: "Iluminación", asunto: "Luz quemada en garage", estado: "Resuelto", prioridad: "Baja" },
    { id: "#R-2026-0060", fecha: "30/08/2026", residente: "Pedro Martínez", unidad: "2D", categoria: "Espacios comunes", asunto: "Mesa rota en SUM", estado: "Resuelto", prioridad: "Media" },
    { id: "#R-2026-0059", fecha: "29/08/2026", residente: "Laura Sánchez", unidad: "4A", categoria: "Seguridad", asunto: "Puerta del edificio sin traba", estado: "Pendiente", prioridad: "Alta" },
    { id: "#R-2026-0058", fecha: "28/08/2026", residente: "Diego Fernández", unidad: "6E", categoria: "Mantenimiento", asunto: "Aire acondicionado no enfría", estado: "En proceso", prioridad: "Media" },
];

const totalReclamos = 64;
const paginas = [1, 2, 3, 4, 5];

const resumenEstados = [
    { estado: "Pendientes", cantidad: 18, claseColor: "pendiente" },
    { estado: "En proceso", cantidad: 26, claseColor: "proceso" },
    { estado: "Resueltos", cantidad: 20, claseColor: "resuelto" },
];

const categoriasFrecuentes = [
    { nombre: "Mantenimiento", cantidad: 22, icon: Wrench, claseColor: "mantenimiento" },
    { nombre: "Limpieza", cantidad: 14, icon: Sparkles, claseColor: "limpieza" },
    { nombre: "Ascensores", cantidad: 10, icon: ArrowUpDown, claseColor: "ascensores" },
    { nombre: "Iluminación", cantidad: 8, icon: Lightbulb, claseColor: "iluminacion" },
    { nombre: "Otros", cantidad: 10, icon: MoreHorizontal, claseColor: "otros" },
];

function armarGradienteDonut(datos, total) {
    let acumulado = 0;
    const segmentos = datos.map((d) => {
        const desde = acumulado;
        const porcentaje = (d.cantidad / total) * 100;
        acumulado += porcentaje;
        return `var(--reclamos-color-${d.claseColor}) ${desde}% ${acumulado}%`;
    });
    return `conic-gradient(${segmentos.join(", ")})`;
}

function categoriaBadgeClase(categoria) {
    const mapa = {
        "Mantenimiento": "reclamos-cat-mantenimiento",
        "Limpieza": "reclamos-cat-limpieza",
        "Ascensores": "reclamos-cat-ascensores",
        "Iluminación": "reclamos-cat-iluminacion",
        "Espacios comunes": "reclamos-cat-comunes",
        "Seguridad": "reclamos-cat-seguridad",
    };
    return mapa[categoria] || "";
}

function estadoBadgeClase(estado) {
    if (estado === "Pendiente") return "reclamos-badge-pendiente";
    if (estado === "En proceso") return "reclamos-badge-proceso";
    return "reclamos-badge-resuelto";
}

function prioridadBadgeClase(prioridad) {
    if (prioridad === "Alta") return "reclamos-prioridad-alta";
    if (prioridad === "Media") return "reclamos-prioridad-media";
    return "reclamos-prioridad-baja";
}

function Reclamos() {

    useEffect(() => {
        document.title = "Habita | Reclamos";
    }, []);

    return (
        <main className="reclamos">

            {/* KPIS */}

            <section className="reclamos-kpi-grid">

                <article className="reclamos-kpi-card">
                    <div className="reclamos-kpi-icon verde">
                        <ClipboardList />
                    </div>
                    <div>
                        <span className="reclamos-kpi-label">Total de reclamos</span>
                        <strong>{kpis.total}</strong>
                        <span className="reclamos-kpi-info">Este mes</span>
                    </div>
                </article>

                <article className="reclamos-kpi-card">
                    <div className="reclamos-kpi-icon amarillo">
                        <Clock />
                    </div>
                    <div>
                        <span className="reclamos-kpi-label">Pendientes</span>
                        <strong>{kpis.pendientes}</strong>
                        <span className="reclamos-kpi-info">Esperando respuesta</span>
                    </div>
                </article>

                <article className="reclamos-kpi-card">
                    <div className="reclamos-kpi-icon azul">
                        <Settings2 />
                    </div>
                    <div>
                        <span className="reclamos-kpi-label">En proceso</span>
                        <strong>{kpis.enProceso}</strong>
                        <span className="reclamos-kpi-info">En tratamiento</span>
                    </div>
                </article>

                <article className="reclamos-kpi-card">
                    <div className="reclamos-kpi-icon verde">
                        <CheckCircle2 />
                    </div>
                    <div>
                        <span className="reclamos-kpi-label">Resueltos</span>
                        <strong>{kpis.resueltos}</strong>
                        <span className="reclamos-kpi-info">Este mes</span>
                    </div>
                </article>

            </section>

            {/* FILTROS */}

            <div className="reclamos-filtros">
                <button className="reclamos-filtro">
                    Todos los estados
                    <ChevronDown size={15} />
                </button>

                <button className="reclamos-filtro">
                    Todas las categorías
                    <ChevronDown size={15} />
                </button>

                <button className="reclamos-filtro">
                    Todos los edificios
                    <ChevronDown size={15} />
                </button>

                <div className="reclamos-buscador">
                    <Search size={16} />
                    <input type="text" placeholder="Buscar reclamo..." />
                </div>

                <button className="reclamos-btn-exportar">
                    <Download size={15} />
                    Exportar
                </button>
            </div>

            {/* CONTENIDO */}

            <div className="reclamos-contenido">

                <section className="reclamos-listado">

                    <div className="reclamos-tabla-card">
                        <div className="reclamos-tabla-header">
                            <span>ID</span>
                            <span>Fecha</span>
                            <span>Residente</span>
                            <span>Unidad</span>
                            <span>Categoría</span>
                            <span>Asunto</span>
                            <span>Estado</span>
                            <span>Prioridad</span>
                            <span>Acciones</span>
                        </div>

                        <div className="reclamos-tabla-body">
                            {reclamos.map((reclamo) => (
                                <div className="reclamos-tabla-fila" key={reclamo.id}>
                                    <span className="reclamos-id">{reclamo.id}</span>
                                    <span>{reclamo.fecha}</span>
                                    <span className="reclamos-residente">{reclamo.residente}</span>
                                    <span>{reclamo.unidad}</span>

                                    <span className={`reclamos-cat-badge ${categoriaBadgeClase(reclamo.categoria)}`}>
                                        {reclamo.categoria}
                                    </span>

                                    <span className="reclamos-asunto">{reclamo.asunto}</span>

                                    <span className={`reclamos-badge ${estadoBadgeClase(reclamo.estado)}`}>
                                        {reclamo.estado}
                                    </span>

                                    <span className={`reclamos-badge ${prioridadBadgeClase(reclamo.prioridad)}`}>
                                        {reclamo.prioridad}
                                    </span>

                                    <span className="reclamos-tabla-acciones">
                                        <button aria-label="Ver reclamo">
                                            <Eye size={16} />
                                        </button>
                                        <button aria-label="Más opciones">
                                            <MoreVertical size={16} />
                                        </button>
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="reclamos-paginacion">
                        <button className="reclamos-pagina-flecha" aria-label="Página anterior">
                            <ChevronLeft size={16} />
                        </button>

                        {paginas.map((pagina) => (
                            <button
                                key={pagina}
                                className={`reclamos-pagina ${pagina === 1 ? "activa" : ""}`}
                            >
                                {pagina}
                            </button>
                        ))}

                        <span className="reclamos-pagina-puntos">...</span>

                        <button className="reclamos-pagina">10</button>

                        <button className="reclamos-pagina-flecha" aria-label="Página siguiente">
                            <ChevronRight size={16} />
                        </button>

                        <span className="reclamos-paginacion-info">
                            Mostrando 1 a {reclamos.length} de {totalReclamos} reclamos
                        </span>
                    </div>

                </section>

                {/* RESUMEN */}

                <aside className="reclamos-resumen">

                    <h2>Resumen de reclamos</h2>

                    <div className="reclamos-donut-wrap">
                        <div
                            className="reclamos-donut"
                            style={{ background: armarGradienteDonut(resumenEstados, totalReclamos) }}
                        >
                            <div className="reclamos-donut-centro" />
                        </div>

                        <ul className="reclamos-donut-leyenda">
                            {resumenEstados.map((item) => (
                                <li key={item.estado}>
                                    <span className={`reclamos-leyenda-punto ${item.claseColor}`} />
                                    <span className="reclamos-leyenda-label">{item.estado}</span>
                                    <span className="reclamos-leyenda-valor">
                                        {item.cantidad} ({Math.round((item.cantidad / totalReclamos) * 100)}%)
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <h3>Categorías más frecuentes</h3>

                    <div className="reclamos-categorias-lista">
                        {categoriasFrecuentes.map((cat) => {
                            const Icono = cat.icon;
                            return (
                                <div className="reclamos-categoria-fila" key={cat.nombre}>
                                    <span className={`reclamos-categoria-icon ${cat.claseColor}`}>
                                        <Icono size={16} />
                                    </span>
                                    <span className="reclamos-categoria-nombre">{cat.nombre}</span>
                                    <span className="reclamos-categoria-valor">{cat.cantidad}</span>
                                </div>
                            );
                        })}
                    </div>

                    <button className="reclamos-btn-reportes">
                        <BarChart3 size={15} />
                        Ver reportes
                    </button>

                </aside>

            </div>

        </main>
    );
}

export default Reclamos;
