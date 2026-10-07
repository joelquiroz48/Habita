import { useEffect, useState } from "react";
import {
    Pencil,
    X,
    Droplet,
    Wrench,
    Users,
    Hammer,
    Car,
    Star,
    Paperclip,
    Download,
} from "lucide-react";

import "./Comunicados.css";
import Panel from "../../../components/Panel/Panel";
import Tabla from "../../../components/Tabla/Tabla";
import Navegador from "../../../components/Navegador/Navegador";

{/* =========================
       DATOS EJEMPLOS
========================== */}

const comunicados = [
    {
        id: 1,
        titulo: "Corte de luz programado",
        resumenCorto: "El próximo martes 22/09 habrá un corte...",
        tipo: "Aviso",
        claseColor: "aviso",
        icon: Droplet,
        fecha: "01/09/2026 10:30",
        audiencia: "Todos los residentes",
        estado: "Publicado",
        publicadoPor: "Administrador",
        resumen:
            "El próximo martes 22 de septiembre se realizará un corte de luz en todo el edificio desde las 09:00 hasta las 13:00 hs por tareas de EDENOR.",
        adjunto: { nombre: "Comunicado_corte_luz.pdf", tamano: "245 KB" },
    },
    {
        id: 2,
        titulo: "Mantenimiento de ascensores",
        resumenCorto: "Se realizará el mantenimiento preventivo...",
        tipo: "Mantenimiento",
        claseColor: "mantenimiento",
        icon: Wrench,
        fecha: "29/08/2026 09:15",
        audiencia: "Todos los residentes",
        estado: "Publicado",
        publicadoPor: "Administrador",
        resumen:
            "Se realizará el mantenimiento preventivo de los ascensores del edificio. Durante ese lapso el servicio podría verse interrumpido.",
        adjunto: null,
    },
    {
        id: 3,
        titulo: "Asamblea ordinaria",
        resumenCorto: "Se convoca a todos los propietarios a la...",
        tipo: "Reunión",
        claseColor: "reunion",
        icon: Users,
        fecha: "28/08/2026 16:45",
        audiencia: "Propietarios",
        estado: "Publicado",
        publicadoPor: "Administrador",
        resumen:
            "Se convoca a todos los propietarios a la asamblea ordinaria del consorcio, que se realizará el 15 de septiembre de 2026 a las 20:00 hs en el Salón de Usos Múltiples.",
        adjunto: { nombre: "Orden_del_dia.pdf", tamano: "180 KB" },
    },
    {
        id: 4,
        titulo: "Trabajos en espacios comunes",
        resumenCorto: "Durante la próxima semana se realizarán...",
        tipo: "Obra",
        claseColor: "obra",
        icon: Hammer,
        fecha: "26/08/2026 11:20",
        audiencia: "Todos los residentes",
        estado: "Publicado",
        publicadoPor: "Administrador",
        resumen:
            "Durante los próximos días se realizarán trabajos de pintura y mantenimiento en los espacios comunes del edificio.",
        adjunto: null,
    },
    {
        id: 5,
        titulo: "Recordatorio: Estacionamiento",
        resumenCorto: "Por favor recordar las normas de...",
        tipo: "Recordatorio",
        claseColor: "recordatorio",
        icon: Car,
        fecha: "22/08/2026 14:00",
        audiencia: "Todos los residentes",
        estado: "Borrador",
        publicadoPor: "Administrador",
        resumen:
            "Por favor recordar las normas de uso del estacionamiento: respetar las cocheras asignadas y no obstruir la circulación.",
        adjunto: null,
    },
    {
        id: 6,
        titulo: "Nuevas mejoras en el edificio",
        resumenCorto: "Nos complace informarles sobre las...",
        tipo: "Novedad",
        claseColor: "novedad",
        icon: Star,
        fecha: "18/08/2026 12:30",
        audiencia: "Todos los residentes",
        estado: "Programado",
        publicadoPor: "Administrador",
        resumen:
            "Nos complace informarles sobre las nuevas mejoras que se incorporarán próximamente al edificio y sus espacios comunes.",
        adjunto: null,
    },
];

const filtros=[
    {
        key: "estado",
        label: "Todos los estados",
        options: ["Publicado", "Borrador"],
    },
    {
        key: "fecha",
        label: "Todos los periodos",
        options: ["Enero", "Febrero", "Marzo"],
    },
];

function estadoBadgeClase(estado) {
    if (estado === "Publicado") return "comunicados-badge-publicado";
    if (estado === "Programado") return "comunicados-badge-programado";
    return "comunicados-badge-borrador";
}

function Comunicados() {

    const [seleccionado, setSeleccionado] = useState(comunicados[0]);
    const [detalleAbierto, setDetalleAbierto] = useState(true);
    
    const [comunicadosListado, setComunicadosListado] = useState(comunicados);

    useEffect(() => {
        document.title = "Habita | Comunicados";
    }, []);

    function abrirDetalle(comunicado) {
        setSeleccionado(comunicado);
        setDetalleAbierto(true);
    }

    const columnas = [
        {
            clave: "titulo",
            titulo: "Título",
            ancho: "2.2fr",
            clase: "comunicados-titulo-celda",
        },
        {
            clave: "tipo",
            titulo: "Tipo",
            ancho: "1fr",
            render: (item) => (
                <span className={`comunicados-tipo-badge ${item.claseColor}`}>
                    {item.tipo}
                </span>
            ),
        },
        {
            clave: "fecha",
            titulo: (
                <span className="comunicados-th-fecha">
                    Fecha de publicación
                </span>
            ),
            ancho: "1.3fr",
            render: (item) => (
                <span className="comunicados-fecha-celda">
                    <span>{item.fecha}</span>
                </span>
            ),
        },
        { clave: "audiencia", titulo: "Audiencia", ancho: "1.1fr" },
        {
            clave: "estado",
            titulo: "Estado",
            ancho: "0.9fr",
            render: (item) => (
                <span className={`comunicados-badge ${estadoBadgeClase(item.estado)}`}>
                    {item.estado}
                </span>
            ),
        },
    ];

    return (
        <main className="comunicados">

            <div className={`comunicados-contenido ${detalleAbierto ? "" : "sin-detalle"}`}>

                <section className="comunicados-listado">

                    <Navegador
                        data={comunicadosListado}
                        searchKey="titulo"
                        searchPlaceholder="Buscar comunicado..."
                        filters={filtros}
                        onNew={() => {}}
                        newButtonText="Crear comunicado"
                    >
                        {(ComunicadosFiltrados) => (
                            <Tabla
                                columnas={columnas}
                                datos={ComunicadosFiltrados}
                                etiqueta="comunicados"
                                className="comunicados-tabla"
                                onFilaClick={abrirDetalle}
                                seleccionable
                                filaSeleccionada={detalleAbierto ? seleccionado : null}
                            />
                                )}
                    </Navegador>

                </section>

                {/* DETALLE */}

                {detalleAbierto && (
                    <Panel
                        className="comunicados-detalle"
                        titulo="Detalle del comunicado"
                        accion={
                            <button
                                className="comunicados-detalle-cerrar"
                                onClick={() => setDetalleAbierto(false)}
                                aria-label="Cerrar detalle"
                            >
                                <X size={18} />
                            </button>
                        }
                    >
                        <span
                            className={`comunicados-badge ${estadoBadgeClase(
                                seleccionado.estado
                            )}`}
                        >
                            {seleccionado.estado}
                        </span>

                        <div className="comunicados-detalle-titulo">
                            <span className={`comunicados-icono ${seleccionado.claseColor}`}>
                                {(() => {
                                    const Icono = seleccionado.icon;
                                    return <Icono size={20} />;
                                })()}
                            </span>

                            <strong>{seleccionado.titulo}</strong>
                        </div>

                        <div className="comunicados-detalle-fila">
                            <span>Tipo</span>
                            <span className={`comunicados-tipo-badge ${seleccionado.claseColor}`}>
                                {seleccionado.tipo}
                            </span>
                        </div>

                        <div className="comunicados-detalle-fila">
                            <span>Fecha de publicación</span>
                            <strong>{seleccionado.fecha}</strong>
                        </div>

                        <div className="comunicados-detalle-fila">
                            <span>Publicado por</span>
                            <strong>{seleccionado.publicadoPor}</strong>
                        </div>

                        <div className="comunicados-detalle-fila">
                            <span>Audiencia</span>
                            <strong>{seleccionado.audiencia}</strong>
                        </div>

                        <h3>Resumen</h3>

                        <p className="comunicados-resumen-texto">
                            {seleccionado.resumen}
                        </p>

                        <h3>Adjuntos</h3>

                        {seleccionado.adjunto ? (
                            <div className="comunicados-adjunto">
                                <Paperclip size={16} />

                                <div className="comunicados-adjunto-info">
                                    <strong>{seleccionado.adjunto.nombre}</strong>
                                    <span>PDF - {seleccionado.adjunto.tamano}</span>
                                </div>

                                <button aria-label="Descargar adjunto">
                                    <Download size={16} />
                                </button>
                            </div>
                        ) : (
                            <p className="comunicados-sin-adjunto">
                                Sin archivos adjuntos.
                            </p>
                        )}

                        <button className="comunicados-btn-editar">
                            <Pencil size={15} />
                            Editar comunicado
                        </button>
                    </Panel>
                )}

            </div>

        </main>
    );
}

export default Comunicados;
