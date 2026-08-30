import { useEffect, useState } from "react";
import {
    Calendar,
    ChevronDown,
    Search,
    Plus,
    Eye,
    Pencil,
    MoreVertical,
    ChevronLeft,
    ChevronRight,
    X,
    Droplet,
    Wrench,
    Users,
    Hammer,
    Car,
    Star,
    ArrowDown,
    Paperclip,
    Download,
} from "lucide-react";

import "./Comunicados.css";

// =========================
// DATOS DE EJEMPLO
// =========================

const comunicados = [
    {
        id: 1, titulo: "Corte de agua programado", resumenCorto: "El próximo jueves 16/05 habrá un corte...",
        tipo: "Aviso", claseColor: "aviso", icon: Droplet,
        fecha: "13/05/2024 10:30", audiencia: "Todos los residentes", estado: "Publicado",
        publicadoPor: "Administrador",
        resumen: "El próximo jueves 16 de mayo se realizará un corte de agua en todo el edificio desde las 08:00 hasta las 14:00 hs.",
        adjunto: { nombre: "Comunicado_corte_agua.pdf", tamano: "245 KB" },
    },
    {
        id: 2, titulo: "Mantenimiento de ascensores", resumenCorto: "Se realizará el mantenimiento preventivo...",
        tipo: "Mantenimiento", claseColor: "mantenimiento", icon: Wrench,
        fecha: "10/05/2024 09:15", audiencia: "Todos los residentes", estado: "Publicado",
        publicadoPor: "Administrador",
        resumen: "Se realizará el mantenimiento preventivo anual de los ascensores del edificio. Durante ese lapso el servicio podría verse interrumpido.",
        adjunto: null,
    },
    {
        id: 3, titulo: "Reunión de consorcio", resumenCorto: "Se convoca a todos los propietarios a la...",
        tipo: "Reunión", claseColor: "reunion", icon: Users,
        fecha: "08/05/2024 16:45", audiencia: "Propietarios", estado: "Publicado",
        publicadoPor: "Administrador",
        resumen: "Se convoca a todos los propietarios a la asamblea ordinaria anual del consorcio, donde se tratarán los temas habituales de rendición de cuentas.",
        adjunto: { nombre: "Orden_del_dia.pdf", tamano: "180 KB" },
    },
    {
        id: 4, titulo: "Trabajos en espacios comunes", resumenCorto: "Durante la próxima semana se realizarán...",
        tipo: "Obra", claseColor: "obra", icon: Hammer,
        fecha: "06/05/2024 11:20", audiencia: "Todos los residentes", estado: "Publicado",
        publicadoPor: "Administrador",
        resumen: "Durante la próxima semana se realizarán trabajos de pintura y mantenimiento en los espacios comunes del edificio.",
        adjunto: null,
    },
    {
        id: 5, titulo: "Recordatorio: Estacionamiento", resumenCorto: "Por favor recordar las normas de...",
        tipo: "Recordatorio", claseColor: "recordatorio", icon: Car,
        fecha: "02/05/2024 14:00", audiencia: "Todos los residentes", estado: "Borrador",
        publicadoPor: "Administrador",
        resumen: "Por favor recordar las normas de uso del estacionamiento: respetar las cocheras asignadas y no obstruir la circulación.",
        adjunto: null,
    },
    {
        id: 6, titulo: "Nuevas mejoras en el edificio", resumenCorto: "Nos complace informarles sobre las...",
        tipo: "Novedad", claseColor: "novedad", icon: Star,
        fecha: "28/04/2024 12:30", audiencia: "Todos los residentes", estado: "Programado",
        publicadoPor: "Administrador",
        resumen: "Nos complace informarles sobre las nuevas mejoras que se incorporarán próximamente al edificio y sus espacios comunes.",
        adjunto: null,
    },
];

const totalComunicados = 57;
const paginas = [1, 2, 3, 4, 5];

function estadoBadgeClase(estado) {
    if (estado === "Publicado") return "comunicados-badge-publicado";
    if (estado === "Programado") return "comunicados-badge-programado";
    return "comunicados-badge-borrador";
}

function Comunicados() {

    const [seleccionado, setSeleccionado] = useState(comunicados[0]);
    const [detalleAbierto, setDetalleAbierto] = useState(true);

    useEffect(() => {
        document.title = "Habita | Comunicados";
    }, []);

    function abrirDetalle(comunicado) {
        setSeleccionado(comunicado);
        setDetalleAbierto(true);
    }

    return (
        <main className="comunicados">

            {/* FILTROS */}

            <div className="comunicados-filtros">
                <button className="comunicados-filtro">
                    <Calendar size={15} />
                    Todos los períodos
                    <ChevronDown size={15} />
                </button>

                <button className="comunicados-filtro">
                    Todos los estados
                    <ChevronDown size={15} />
                </button>

                <div className="comunicados-buscador">
                    <Search size={16} />
                    <input type="text" placeholder="Buscar comunicado..." />
                </div>

                <button className="comunicados-btn-nuevo">
                    <Plus size={16} />
                    Nuevo comunicado
                </button>
            </div>

            {/* CONTENIDO */}

            <div className={`comunicados-contenido ${detalleAbierto ? "" : "sin-detalle"}`}>

                <section className="comunicados-listado">

                    <div className="comunicados-tabla-card">
                        <div className="comunicados-tabla-header">
                            <span>Título</span>
                            <span>Tipo</span>
                            <span className="comunicados-th-fecha">
                                Fecha de publicación
                                <ArrowDown size={13} />
                            </span>
                            <span>Audiencia</span>
                            <span>Estado</span>
                            <span>Acciones</span>
                        </div>

                        <div className="comunicados-tabla-body">
                            {comunicados.map((item) => {
                                const Icono = item.icon;
                                const seleccionadaFila = seleccionado.id === item.id;

                                return (
                                    <button
                                        key={item.id}
                                        className={`comunicados-tabla-fila ${seleccionadaFila && detalleAbierto ? "seleccionada" : ""}`}
                                        onClick={() => abrirDetalle(item)}
                                    >
                                        <span className="comunicados-titulo-celda">
                                            <span className={`comunicados-icono ${item.claseColor}`}>
                                                <Icono size={17} />
                                            </span>
                                            <span className="comunicados-titulo-texto">
                                                <strong>{item.titulo}</strong>
                                                <small>{item.resumenCorto}</small>
                                            </span>
                                        </span>

                                        <span className={`comunicados-tipo-badge ${item.claseColor}`}>
                                            {item.tipo}
                                        </span>

                                        <span className="comunicados-fecha-celda">
                                            <span>{item.fecha}</span>
                                            <small>por Admin</small>
                                        </span>

                                        <span>{item.audiencia}</span>

                                        <span className={`comunicados-badge ${estadoBadgeClase(item.estado)}`}>
                                            {item.estado}
                                        </span>

                                        <span className="comunicados-tabla-acciones">
                                            <span aria-label="Ver comunicado">
                                                <Eye size={16} />
                                            </span>
                                            <span aria-label="Editar comunicado">
                                                <Pencil size={16} />
                                            </span>
                                            <span aria-label="Más opciones">
                                                <MoreVertical size={16} />
                                            </span>
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="comunicados-paginacion">
                        <button className="comunicados-pagina-flecha" aria-label="Página anterior">
                            <ChevronLeft size={16} />
                        </button>

                        {paginas.map((pagina) => (
                            <button
                                key={pagina}
                                className={`comunicados-pagina ${pagina === 1 ? "activa" : ""}`}
                            >
                                {pagina}
                            </button>
                        ))}

                        <span className="comunicados-pagina-puntos">...</span>

                        <button className="comunicados-pagina">10</button>

                        <button className="comunicados-pagina-flecha" aria-label="Página siguiente">
                            <ChevronRight size={16} />
                        </button>

                        <span className="comunicados-paginacion-info">
                            Mostrando 1 a {comunicados.length} de {totalComunicados} comunicados
                        </span>
                    </div>

                </section>

                {/* DETALLE */}

                {detalleAbierto && (
                    <aside className="comunicados-detalle">

                        <div className="comunicados-detalle-header">
                            <h2>Detalle del comunicado</h2>
                            <button
                                className="comunicados-detalle-cerrar"
                                onClick={() => setDetalleAbierto(false)}
                                aria-label="Cerrar detalle"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <span className={`comunicados-badge ${estadoBadgeClase(seleccionado.estado)}`}>
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
                        <p className="comunicados-resumen-texto">{seleccionado.resumen}</p>

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
                            <p className="comunicados-sin-adjunto">Sin archivos adjuntos.</p>
                        )}

                        <button className="comunicados-btn-editar">
                            <Pencil size={15} />
                            Editar comunicado
                        </button>

                    </aside>
                )}

            </div>

        </main>
    );
}

export default Comunicados;
