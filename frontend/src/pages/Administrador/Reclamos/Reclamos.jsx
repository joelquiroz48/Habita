import { useEffect, useState } from "react";
import "chart.js/auto";
import { Doughnut } from "react-chartjs-2";
import {
    ClipboardList,
    Clock,
    Settings2,
    CheckCircle2,
    Wrench,
    Sparkles,
    ArrowUpDown,
    Lightbulb,
    MoreHorizontal,
    Image,
    X,
    Eye,
} from "lucide-react";

import "./Reclamos.css";
import Panel from "../../../components/Panel/Panel";
import TarjetaResumen from "../../../components/TarjetaResumen/TarjetaResumen";
import Tabla from "../../../components/Tabla/Tabla";
import Navegador from "../../../components/Navegador/Navegador";
import { obtenerOpcionesPeriodo, obtenerPeriodoFecha } from "../../../utils/periodos";

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
    { fecha: "01/09/2026", residente: "Nicolás Paz", unidad: "5B", categoria: "Mantenimiento", asunto: "Fuga de agua en cocina", estado: "Pendiente", prioridad: "Alta", descripcion: "Holaaa", adjunto: { nombre: "foto1.png", tamano: "245 KB" }, },
    { fecha: "01/09/2026", residente: "María Gómez", unidad: "3A", categoria: "Limpieza", asunto: "Suciedad en pasillos", estado: "En proceso", prioridad: "Media", descripcion: "Holaaa" },
    { fecha: "31/08/2026", residente: "Juan López", unidad: "7C", categoria: "Ascensores", asunto: "Ascensor se detiene entre pisos", estado: "En proceso", prioridad: "Alta", descripcion: "Holaaa" },
    { fecha: "31/08/2026", residente: "Carla Romero", unidad: "1B", categoria: "Iluminación", asunto: "Luz quemada en garage", estado: "Resuelto", prioridad: "Baja", descripcion: "Holaaa", adjunto: { nombre: "1234.jpg", tamano: "245 KB" }, },
    { fecha: "30/08/2026", residente: "Pedro Martínez", unidad: "2D", categoria: "Espacios comunes", asunto: "Mesa rota en SUM", estado: "Resuelto", prioridad: "Media", descripcion: "Holaaa" },
    { fecha: "29/08/2026", residente: "Laura Sánchez", unidad: "4A", categoria: "Seguridad", asunto: "Puerta del edificio sin traba", estado: "Pendiente", prioridad: "Alta", descripcion: "Holaaa" },
    { fecha: "28/08/2026", residente: "Diego Fernández", unidad: "6E", categoria: "Mantenimiento", asunto: "Aire acondicionado no enfría", estado: "En proceso", prioridad: "Media", descripcion: "Holaaa" },
].map((reclamo) => ({
    ...reclamo,
    periodoFecha: obtenerPeriodoFecha(reclamo.fecha),
}));

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
        "Otros": "reclamos-cat-otros",
    };
    return mapa[categoria] || "";
}

function estadoBadgeClase(estado) {
    if (estado === "Pendiente") return "reclamos-badge-pendiente";
    if (estado === "En proceso") return "reclamos-badge-proceso";
    return "reclamos-badge-resuelto";
}

const columnas = [
    { clave: "asunto", titulo: "Asunto", ancho: "1.3fr", clase: "reclamos-asunto" },
    { clave: "residente", titulo: "Residente", ancho: "1fr", clase: "reclamos-residente" },
    { clave: "unidad", titulo: "Unidad", ancho: "0.6fr" },
    {
        clave: "categoria",
        titulo: "Categoría",
        ancho: "1.1fr",
        render: (reclamo) => (
            <span className={`reclamos-cat-badge ${categoriaBadgeClase(reclamo.categoria)}`}>
                {reclamo.categoria}
            </span>
        ),
    },
    {
        clave: "estado",
        titulo: "Estado",
        ancho: "1fr",
        render: (reclamo) => (
            <span className={`reclamos-badge ${estadoBadgeClase(reclamo.estado)}`}>
                {reclamo.estado}
            </span>
        ),
    },
    { clave: "fecha", titulo: "Fecha", ancho: "0.8fr" },
];

const filtros=[
    {
        key: "categoria",
        label: "Todas las categorias",
        options: ["Mantenimiento", "Limpieza", "Ascensores", "Iluminación", "Espacios comunes", "Seguridad", "Otros"],
    },
    {
        key: "estado",
        label: "Todos los estados",
        options: ["Resuelto", "Pendiente", "En proceso"],
    },
    {
        key: "periodoFecha",
        label: "Todos los periodos",
        options: obtenerOpcionesPeriodo(reclamos),
    },
];

function Reclamos() {

    const [seleccionado, setSeleccionado] = useState(reclamos[0]);
    const [detalleAbierto, setDetalleAbierto] = useState(false);

    useEffect(() => {
        document.title = "Habita | Reclamos";
    }, []);

    function abrirDetalle(comunicado) {
        setSeleccionado(comunicado);
        setDetalleAbierto(true);
    }

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

            <Navegador
                data={reclamos}
                searchKey="asunto"
                searchPlaceholder="Buscar reclamo..."
                filters={filtros}
            >
                {(ReclamosFiltrados) => (
                    <Tabla
                        columnas={columnas}
                        datos={ReclamosFiltrados}
                        etiqueta="reclamos"
                        className="reclamos-tabla"
                        onFilaClick={abrirDetalle}
                        seleccionable
                        filaSeleccionada={detalleAbierto ? seleccionado : null}
                    />
                        )}
            </Navegador>

            {/* DETALLE */}

            {detalleAbierto && (
                <Panel
                    className="reclamos-detalle"
                    titulo={seleccionado.asunto}
                    tituloComplemento={
                        <div className={`reclamos-badge ${estadoBadgeClase(seleccionado.estado)}`}>
                            {seleccionado.estado}
                        </div>
                    }
                    accion={
                        <button
                            className="reclamos-detalle-cerrar"
                            onClick={() => setDetalleAbierto(false)}
                            aria-label="Cerrar detalle"
                        >
                            <X size={18} />
                        </button>
                    }
                >
                    
                    {/* =========== FILAS =========== */}

                    <div className="reclamos-detalle-fila">
                        <span>Categoria</span>
                        <span className={`reclamos-cat-badge ${categoriaBadgeClase(seleccionado.categoria)}`}>
                            {seleccionado.categoria}
                        </span>
                    </div>

                    <div className="reclamos-detalle-fila">
                        <span>Fecha de publicación</span>
                        <strong>{seleccionado.fecha}</strong>
                    </div>

                    <div className="reclamos-detalle-fila">
                        <span>Residente</span>
                        <strong>{seleccionado.residente}</strong>
                    </div>

                    <div className="reclamos-detalle-fila">
                        <span>Unidad</span>
                        <strong>{seleccionado.unidad}</strong>
                    </div>
                    
                    {/* =========== DESCRIPCION =========== */}

                    <h3>Descripción</h3>

                    <p className="reclamos-resumen-texto">
                        {seleccionado.descripcion}
                    </p>

                    {/* =========== ADJUNTOS =========== */}

                    <h3>Adjuntos</h3>

                    {seleccionado.adjunto ? (
                        <div className="reclamos-adjunto">
                            <Image size={16} />

                            <div className="reclamos-adjunto-info">
                                <strong>{seleccionado.adjunto.nombre}</strong>
                                <span>Tamaño - {seleccionado.adjunto.tamano}</span>
                            </div>

                            <button aria-label="Descargar adjunto">
                                <Eye size={16} />
                            </button>
                        </div>
                    ) : (
                        <p className="reclamos-sin-adjunto">
                            Sin archivos adjuntos.
                        </p>
                    )}

                    {/* =========== OPCIONES =========== */}

                    <button className="reclamos-btn-editar">
                        Seguimiento
                    </button>
                </Panel>
            )}
            
            {/* RESUMEN */}

            <Panel className="reclamos-resumen-panel" titulo="Resumen de reclamos">
                <div className="reclamos-resumen-contenido">
                    <div className="reclamos-donut-wrap">
                        <div className="reclamos-donut-chart">
                            <Doughnut
                                data={{
                                    labels: resumenEstados.map((item) => item.estado),
                                    datasets: [
                                        {
                                            data: resumenEstados.map((item) => item.cantidad),
                                            backgroundColor: ["#ee9d25", "#328bc2", "#399665"],
                                            borderWidth: 0,
                                            hoverOffset: 4,
                                        },
                                    ],
                                }}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    cutout: "66%",
                                    plugins: { legend: { display: false } },
                                }}
                            />
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
                                    <div className="reclamos-categoria-fila" key={cat.nombre}>
                                        <span className={`reclamos-categoria-icon ${cat.claseColor}`}>
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

        </main>
    );
}

export default Reclamos;
