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
    Wrench,
    Sparkles,
    ArrowUpDown,
    Lightbulb,
    MoreHorizontal,
    BarChart3,
} from "lucide-react";

import "./Reclamos.css";
import armarGradienteDonut from "../../../utils/armarGradienteDonut";
import Panel from "../../../components/Panel/Panel";
import TarjetaResumen from "../../../components/TarjetaResumen/TarjetaResumen";
import Tabla from "../../../components/Tabla/Tabla";

{/* =========================
       DATOS EJEMPLOS
========================== */}

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

{/* =========================
       TARJETAS RESUMEN
========================== */}

const resumenTarjetas = [
    {
        icono: ClipboardList,
        titulo: "Total de reclamos",
        valor: kpis.total,
        contenido: <span>Este mes</span>,
        claseIcono: "verde",
    },
    {
        icono: Clock,
        titulo: "Pendientes",
        valor: kpis.pendientes,
        contenido: <span>Esperando respuesta</span>,
        claseIcono: "amarillo",
    },
    {
        icono: Settings2,
        titulo: "En proceso",
        valor: kpis.enProceso,
        contenido: <span>En tratamiento</span>,
        claseIcono: "azul",
    },
    {
        icono: CheckCircle2,
        titulo: "Resueltos",
        valor: kpis.resueltos,
        contenido: <span>Este mes</span>,
        claseIcono: "verde",
    },
];


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

const columnas = [
    { clave: "id", titulo: "ID", ancho: "1fr", clase: "reclamos-id" },
    { clave: "fecha", titulo: "Fecha", ancho: "0.9fr" },
    { clave: "residente", titulo: "Residente", ancho: "1.1fr", clase: "reclamos-residente" },
    { clave: "unidad", titulo: "Unidad", ancho: "0.6fr" },
    {
        clave: "categoria",
        titulo: "Categoría",
        ancho: "1fr",
        render: (reclamo) => (
            <span className={`reclamos-cat-badge ${categoriaBadgeClase(reclamo.categoria)}`}>
                {reclamo.categoria}
            </span>
        ),
    },
    { clave: "asunto", titulo: "Asunto", ancho: "1.5fr", clase: "reclamos-asunto" },
    {
        clave: "estado",
        titulo: "Estado",
        ancho: "0.9fr",
        render: (reclamo) => (
            <span className={`reclamos-badge ${estadoBadgeClase(reclamo.estado)}`}>
                {reclamo.estado}
            </span>
        ),
    },
];

function Reclamos() {

    useEffect(() => {
        document.title = "Habita | Reclamos";
    }, []);

    return (
        <main className="reclamos">

            {/* =========================
                  RESUMEN SUPERIOR
            ========================= */}

            <section className="reclamos-resumen">
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

            {/* RESUMEN */}

            <Panel className="reclamos-resumen-panel" titulo="Resumen de reclamos">
                <div className="reclamos-resumen-contenido">
                    <div className="reclamos-donut-wrap">
                        <div
                            className="reclamos-donut"
                            style={{
                                background: armarGradienteDonut(
                                    resumenEstados,
                                    "reclamos-color"
                                )
                            }}
                        >
                            <div className="reclamos-donut-centro" />
                        </div>

                        <ul className="reclamos-donut-leyenda">
                            {resumenEstados.map((item) => (
                                <li key={item.estado}>
                                    <span className={`reclamos-leyenda-punto ${item.claseColor}`}/>

                                    <span className="reclamos-leyenda-label">
                                        {item.estado}
                                    </span>

                                    <span className="reclamos-leyenda-valor">
                                        {item.cantidad} (
                                        {Math.round(
                                            (item.cantidad / totalReclamos) * 100
                                        )}
                                        %)
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="reclamos-categorias">
                        <h3>Categorías más frecuentes</h3>

                        <div className="reclamos-categorias-lista">
                            {categoriasFrecuentes.map((cat) => {
                                const Icono = cat.icon;

                                return (
                                    <div
                                        className="reclamos-categoria-fila"
                                        key={cat.nombre}
                                    >
                                        <span
                                            className={`reclamos-categoria-icon ${cat.claseColor}`}
                                        >
                                            <Icono size={16} />
                                        </span>

                                        <span className="reclamos-categoria-nombre">
                                            {cat.nombre}
                                        </span>

                                        <span className="reclamos-categoria-valor">
                                            {cat.cantidad}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </Panel>

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
            </div>

            {/* CONTENIDO */}

            <div className="reclamos-contenido">

                <section className="reclamos-listado">

                    <Tabla
                        columnas={columnas}
                        datos={reclamos}
                        etiqueta="reclamos"
                        className="reclamos-tabla"
                    />

                </section>

            </div>

        </main>
    );
}

export default Reclamos;
