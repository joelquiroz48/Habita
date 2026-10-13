import { useEffect, useState } from "react";
import { Pencil, X, Paperclip, Download, Trash } from "lucide-react";

import "./Comunicados.css";
import Panel from "../../../components/Panel/Panel";
import Tabla from "../../../components/Tabla/Tabla";
import Navegador from "../../../components/Navegador/Navegador";
import { obtenerOpcionesPeriodo, obtenerPeriodoFecha } from "../../../utils/periodos";

{/* =========================
       DATOS EJEMPLOS
========================== */}

const comunicados = [
    {
        asunto: "Corte de luz programado",
        resumenCorto: "El próximo martes 22/09 habrá un corte...",
        categoria: "Aviso",
        claseColor: "aviso",
        fecha: "01/09/2026 10:30",
        audiencia: "Todos los residentes",
        estado: "Publicado",
        resumen:
            "El próximo martes 22 de septiembre se realizará un corte de luz en todo el edificio desde las 09:00 hasta las 13:00 hs por tareas de EDENOR.",
        adjunto: { nombre: "Comunicado_corte_luz.pdf", tamano: "245 KB" },
    },
    {
        asunto: "Mantenimiento de ascensores",
        resumenCorto: "Se realizará el mantenimiento preventivo...",
        categoria: "Mantenimiento",
        claseColor: "mantenimiento",
        fecha: "29/08/2026 09:15",
        audiencia: "Todos los residentes",
        estado: "Publicado",
        resumen:
            "Se realizará el mantenimiento preventivo de los ascensores del edificio. Durante ese lapso el servicio podría verse interrumpido.",
        adjunto: null,
    },
    {
        asunto: "Asamblea ordinaria",
        resumenCorto: "Se convoca a todos los propietarios a la...",
        categoria: "Reunión",
        claseColor: "reunion",
        fecha: "28/08/2026 16:45",
        audiencia: "Propietarios",
        estado: "Publicado",
        resumen:
            "Se convoca a todos los propietarios a la asamblea ordinaria del consorcio, que se realizará el 15 de septiembre de 2026 a las 20:00 hs en el Salón de Usos Múltiples.",
        adjunto: { nombre: "Orden_del_dia.pdf", tamano: "180 KB" },
    },
    {
        asunto: "Trabajos en espacios comunes",
        resumenCorto: "Durante la próxima semana se realizarán...",
        categoria: "Obra",
        claseColor: "obra",
        fecha: "26/08/2026 11:20",
        audiencia: "Todos los residentes",
        estado: "Publicado",
        resumen:
            "Durante los próximos días se realizarán trabajos de pintura y mantenimiento en los espacios comunes del edificio.",
        adjunto: null,
    },
    {
        asunto: "Recordatorio: Estacionamiento",
        resumenCorto: "Por favor recordar las normas de...",
        categoria: "Recordatorio",
        claseColor: "recordatorio",
        fecha: "--",
        audiencia: "Todos los residentes",
        estado: "Borrador",
        resumen:
            "Por favor recordar las normas de uso del estacionamiento: respetar las cocheras asignadas y no obstruir la circulación.",
        adjunto: null,
    },
    {
        asunto: "Nuevas mejoras en el edificio",
        resumenCorto: "Nos complace informarles sobre las...",
        categoria: "Novedad",
        claseColor: "novedad",
        fecha: "18/08/2026 12:30",
        audiencia: "Todos los residentes",
        estado: "Programado",
        resumen:
            "Nos complace informarles sobre las nuevas mejoras que se incorporarán próximamente al edificio y sus espacios comunes.",
        adjunto: null,
    },
].map((comunicado) => ({
    ...comunicado,
    periodoFecha: obtenerPeriodoFecha(comunicado.fecha) || "Sin fecha",
}));

const filtros=[
    {
        key: "categoria",
        label: "Todas las categorias",
        options: ["Novedad", "Recordatorio", "Obras", "Reunión"],
    },
    {
        key: "estado",
        label: "Todos los estados",
        options: ["Publicado", "Programado", "Borrador"],
    },
    {
        key: "periodoFecha",
        label: "Todos los periodos",
        options: obtenerOpcionesPeriodo(comunicados),
    },
];

function estadoBadgeClase(estado) {
    if (estado === "Publicado") return "comunicados-badge-publicado";
    if (estado === "Programado") return "comunicados-badge-programado";
    return "comunicados-badge-borrador";
}

function Comunicados() {

    const [seleccionado, setSeleccionado] = useState(comunicados[0]);
    const [detalleAbierto, setDetalleAbierto] = useState(false);

    useEffect(() => {
        document.title = "Habita | Comunicados";
    }, []);

    function abrirDetalle(comunicado) {
        setSeleccionado(comunicado);
        setDetalleAbierto(true);
    }

    const columnas = [
        {
            clave: "asunto",
            titulo: "Asunto",
            ancho: "1.2fr",
        },
        { clave: "audiencia", titulo: "Audiencia", ancho: "0.9fr" },
        {
            clave: "categoria",
            titulo: "Categoria",
            ancho: "1fr",
            render: (item) => (
                <span className={`comunicados-tipo-badge ${item.claseColor}`}>
                    {item.categoria}
                </span>
            ),
        },
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
        {
            clave: "fecha",
            titulo: (
                <span className="comunicados-th-fecha">
                    Fecha de publicación
                </span>
            ),
            ancho: "1.1fr",
            render: (item) => (
                <span className="comunicados-fecha-celda">
                    <span>{item.fecha}</span>
                </span>
            ),
        },
    ];

    return (
        <main className="comunicados">

            <Navegador
                data={comunicados}
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

            {/* DETALLE */}

            {detalleAbierto && (
                <Panel
                    className="comunicados-detalle"
                    titulo={seleccionado.asunto}
                    tituloComplemento={
                        <div className={`comunicados-badge ${estadoBadgeClase(seleccionado.estado)}`}>
                            {seleccionado.estado}
                        </div>
                    }
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
                    
                    {/* =========== FILAS =========== */}

                    <div className="comunicados-detalle-fila">
                        <span>Categoría</span>
                        <span className={`comunicados-tipo-badge ${seleccionado.claseColor}`}>
                            {seleccionado.categoria}
                        </span>
                    </div>

                    <div className="comunicados-detalle-fila">
                        <span>Fecha de publicación</span>
                        <strong>{seleccionado.fecha}</strong>
                    </div>

                    <div className="comunicados-detalle-fila">
                        <span>Audiencia</span>
                        <strong>{seleccionado.audiencia}</strong>
                    </div>
                    
                    {/* =========== RESUMEN =========== */}

                    <h3>Resumen</h3>

                    <p className="comunicados-resumen-texto">
                        {seleccionado.resumen}
                    </p>

                    {/* =========== ADJUNTOS =========== */}

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

                    {/* =========== OPCIONES =========== */}

                    <button className="comunicados-btn-editar">
                        <Pencil size={15} />
                        Editar comunicado
                    </button>

                    <button className="comunicados-btn-editar">
                        <Trash size={15} />
                        Eliminar comunicado
                    </button>
                </Panel>
            )}

        </main>
    );
}

export default Comunicados;
