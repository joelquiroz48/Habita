import { useEffect } from "react";
import {
    Search,
    Folder,
    Calendar,
    SlidersHorizontal,
    Upload,
    ArrowDown,
    ChevronDown,
    Download,
    MoreVertical,
    ChevronLeft,
    ChevronRight,
    HardDrive,
    FolderPlus,
    FileText,
} from "lucide-react";

import "./Documentos.css";

// =========================
// DATOS DE EJEMPLO
// =========================

const documentos = [
    { icon: "pdf", nombre: "Reglamento de copropiedad", subtitulo: "Versión actualizada - Enero 2024", categoria: "Reglamentos", clase: "reglamentos", subidoPor: "Admin", rol: "Administrador", iniciales: "AR", avatar: "a", fecha: "15/01/2024", tamano: "2.4 MB" },
    { icon: "pdf", nombre: "Acta de asamblea ordinaria 2024", subtitulo: "Asamblea del 20/04/2024", categoria: "Actas", clase: "actas", subidoPor: "Admin", rol: "Administrador", iniciales: "AR", avatar: "a", fecha: "22/04/2024", tamano: "1.8 MB" },
    { icon: "xlsx", nombre: "Presupuesto anual 2024", subtitulo: "Detalle de ingresos y egresos", categoria: "Finanzas", clase: "finanzas", subidoPor: "Nicolás Paz", rol: "Tesorero", iniciales: "NM", avatar: "b", fecha: "05/01/2024", tamano: "452 KB" },
    { icon: "pdf", nombre: "Estados contables 2023", subtitulo: "Informe anual auditado", categoria: "Finanzas", clase: "finanzas", subidoPor: "Nicolás Paz", rol: "Tesorero", iniciales: "NM", avatar: "b", fecha: "10/02/2024", tamano: "3.1 MB" },
    { icon: "docx", nombre: "Contrato de limpieza", subtitulo: "Contratación servicio de limpieza", categoria: "Contratos", clase: "contratos", subidoPor: "Admin", rol: "Administrador", iniciales: "AR", avatar: "a", fecha: "12/03/2024", tamano: "890 KB" },
    { icon: "pdf", nombre: "Plan de mantenimiento anual", subtitulo: "Cronograma y tareas programadas", categoria: "Mantenimiento", clase: "mantenimiento", subidoPor: "Juan Sánchez", rol: "Encargado", iniciales: "JS", avatar: "c", fecha: "18/03/2024", tamano: "1.2 MB" },
    { icon: "pdf", nombre: "Seguro del edificio", subtitulo: "Póliza vigente", categoria: "Seguros", clase: "seguros", subidoPor: "Admin", rol: "Administrador", iniciales: "AR", avatar: "a", fecha: "01/04/2024", tamano: "756 KB" },
    { icon: "jpg", nombre: "Plano de evacuación", subtitulo: "Planta baja y salidas de emergencia", categoria: "Planos", clase: "planos", subidoPor: "Juan Sánchez", rol: "Encargado", iniciales: "JS", avatar: "c", fecha: "08/04/2024", tamano: "1.5 MB" },
];

const totalDocumentos = 62;
const paginas = [1, 2, 3, 4, 5];

const categorias = [
    { nombre: "Reglamentos", cantidad: 6, clase: "reglamentos" },
    { nombre: "Actas", cantidad: 12, clase: "actas" },
    { nombre: "Finanzas", cantidad: 18, clase: "finanzas" },
    { nombre: "Contratos", cantidad: 9, clase: "contratos" },
    { nombre: "Mantenimiento", cantidad: 11, clase: "mantenimiento" },
    { nombre: "Seguros", cantidad: 4, clase: "seguros" },
    { nombre: "Planos", cantidad: 5, clase: "planos" },
    { nombre: "Otros", cantidad: 7, clase: "otros" },
];

const almacenamiento = { usado: "2.4 GB", total: "10 GB", porcentaje: 24 };

const accionesRapidas = [
    { icon: Upload, label: "Subir documento" },
    { icon: FolderPlus, label: "Nueva carpeta" },
    { icon: FileText, label: "Solicitar documento" },
];

function Documentos() {

    useEffect(() => {
        document.title = "Habita | Documentos";
    }, []);

    return (
        <main className="documentos">

            {/* CABECERA */}

            <div className="documentos-cabecera">
                <div className="documentos-filtros">
                    <div className="documentos-buscador">
                        <Search size={16} />
                        <input type="text" placeholder="Buscar documentos..." />
                    </div>

                    <button className="documentos-filtro">
                        <Folder size={15} />
                        Todas las categorías
                        <ChevronDown size={15} />
                    </button>

                    <button className="documentos-filtro">
                        <Calendar size={15} />
                        Todos los períodos
                        <ChevronDown size={15} />
                    </button>

                    <button className="documentos-filtro">
                        <SlidersHorizontal size={15} />
                        Filtros
                    </button>
                </div>

                <button className="documentos-btn-subir">
                    <Upload size={16} />
                    Subir documento
                </button>
            </div>

            {/* CONTENIDO */}

            <div className="documentos-contenido">

                <section className="documentos-listado">

                    <div className="documentos-tabla-card">
                        <div className="documentos-tabla-header">
                            <span className="documentos-th-nombre">
                                Nombre
                                <ArrowDown size={13} />
                            </span>
                            <span>Categoría</span>
                            <span>Subido por</span>
                            <span>Fecha</span>
                            <span>Tamaño</span>
                            <span>Acciones</span>
                        </div>

                        <div className="documentos-tabla-body">
                            {documentos.map((doc, index) => (
                                <div className="documentos-tabla-fila" key={index}>
                                    <span className="documentos-nombre-celda">
                                        <span className={`documentos-icono-archivo ${doc.icon}`}>
                                            {doc.icon.toUpperCase()}
                                        </span>
                                        <span className="documentos-nombre-texto">
                                            <strong>{doc.nombre}</strong>
                                            <small>{doc.subtitulo}</small>
                                        </span>
                                    </span>

                                    <span className={`documentos-badge ${doc.clase}`}>
                                        {doc.categoria}
                                    </span>

                                    <span className="documentos-subido-celda">
                                        <span className={`documentos-avatar ${doc.avatar}`}>
                                            {doc.iniciales}
                                        </span>
                                        <span>
                                            <strong>{doc.subidoPor}</strong>
                                            <small>{doc.rol}</small>
                                        </span>
                                    </span>

                                    <span className="documentos-fecha">{doc.fecha}</span>
                                    <span className="documentos-tamano">{doc.tamano}</span>

                                    <span className="documentos-tabla-acciones">
                                        <button aria-label="Descargar">
                                            <Download size={16} />
                                        </button>
                                        <button aria-label="Más opciones">
                                            <MoreVertical size={16} />
                                        </button>
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="documentos-paginacion">
                        <button className="documentos-pagina-flecha" aria-label="Página anterior">
                            <ChevronLeft size={16} />
                        </button>

                        {paginas.map((pagina) => (
                            <button
                                key={pagina}
                                className={`documentos-pagina ${pagina === 1 ? "activa" : ""}`}
                            >
                                {pagina}
                            </button>
                        ))}

                        <span className="documentos-pagina-puntos">...</span>

                        <button className="documentos-pagina">8</button>

                        <button className="documentos-pagina-flecha" aria-label="Página siguiente">
                            <ChevronRight size={16} />
                        </button>

                        <span className="documentos-paginacion-info">
                            Mostrando 1 a {documentos.length} de {totalDocumentos} documentos
                        </span>
                    </div>

                </section>

                {/* COLUMNA LATERAL */}

                <aside className="documentos-lateral">

                    <div className="documentos-panel-card">
                        <h2>Categorías</h2>

                        <div className="documentos-categorias-lista">
                            {categorias.map((cat) => (
                                <div className="documentos-categoria-fila" key={cat.nombre}>
                                    <span className={`documentos-carpeta-icon ${cat.clase}`}>
                                        <Folder size={15} />
                                    </span>
                                    <span className="documentos-categoria-nombre">{cat.nombre}</span>
                                    <span className="documentos-categoria-valor">{cat.cantidad}</span>
                                </div>
                            ))}
                        </div>

                        <button className="documentos-btn-ver-todas">
                            Ver todas las categorías
                            <ChevronRight size={14} />
                        </button>
                    </div>

                    <div className="documentos-panel-card">
                        <h2>Almacenamiento</h2>

                        <div className="documentos-almacenamiento-info">
                            <span>Utilizado</span>
                            <strong>{almacenamiento.usado} de {almacenamiento.total}</strong>
                        </div>

                        <div className="documentos-progreso">
                            <div
                                className="documentos-progreso-relleno"
                                style={{ width: `${almacenamiento.porcentaje}%` }}
                            />
                        </div>
                        <span className="documentos-progreso-porcentaje">{almacenamiento.porcentaje}%</span>

                        <button className="documentos-btn-gestionar">
                            <HardDrive size={15} />
                            Gestionar almacenamiento
                            <ChevronRight size={14} />
                        </button>
                    </div>

                    <div className="documentos-panel-card">
                        <h2>Acciones rápidas</h2>

                        <div className="documentos-acciones-lista">
                            {accionesRapidas.map((accion) => {
                                const Icono = accion.icon;
                                return (
                                    <button className="documentos-accion-fila" key={accion.label}>
                                        <Icono size={16} />
                                        {accion.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                </aside>

            </div>

        </main>
    );
}

export default Documentos;
