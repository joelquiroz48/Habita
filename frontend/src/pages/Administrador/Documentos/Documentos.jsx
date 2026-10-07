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
    ChevronRight,
    HardDrive,
    FolderPlus,
    FileText,
} from "lucide-react";

import "./Documentos.css";
import Panel from "../../../components/Panel/Panel";
import Tabla from "../../../components/Tabla/Tabla";

{/* =========================
       DATOS EJEMPLOS
========================== */}

const documentos = [
    {
        icon: "pdf",
        nombre: "Reglamento de Copropiedad",
        subtitulo: "Normas y reglamentos del edificio",
        categoria: "Reglamentos",
        clase: "reglamentos",
        subidoPor: "Admin",
        rol: "Administrador",
        iniciales: "AR",
        avatar: "a",
        fecha: "12/08/2026",
        tamano: "2.4 MB",
    },
    {
        icon: "pdf",
        nombre: "Acta Asamblea Ordinaria 08/2026",
        subtitulo: "Acta de la asamblea ordinaria",
        categoria: "Asambleas",
        clase: "asambleas",
        subidoPor: "Admin",
        rol: "Administrador",
        iniciales: "AR",
        avatar: "a",
        fecha: "10/08/2026",
        tamano: "1.8 MB",
    },
    {
        icon: "pdf",
        nombre: "Recibo expensas 08/2026",
        subtitulo: "Comprobante de expensas - Agosto 2026",
        categoria: "Otros",
        clase: "otros",
        subidoPor: "Admin",
        rol: "Administrador",
        iniciales: "AR",
        avatar: "a",
        fecha: "10/08/2026",
        tamano: "245 KB",
    },
    {
        icon: "pdf",
        nombre: "Plan de Obras 2026",
        subtitulo: "Proyectos y mejoras del edificio",
        categoria: "Obras y mejoras",
        clase: "obras",
        subidoPor: "Admin",
        rol: "Administrador",
        iniciales: "AR",
        avatar: "a",
        fecha: "05/08/2026",
        tamano: "1.6 MB",
    },
    {
        icon: "pdf",
        nombre: "Informe de Mantenimiento - Julio 2026",
        subtitulo: "Informe de tareas de mantenimiento",
        categoria: "Otros",
        clase: "otros",
        subidoPor: "Juan Sánchez",
        rol: "Encargado",
        iniciales: "JS",
        avatar: "c",
        fecha: "31/07/2026",
        tamano: "1.2 MB",
    },
    {
        icon: "xlsx",
        nombre: "Presupuesto anual 2026",
        subtitulo: "Detalle de ingresos y egresos",
        categoria: "Estados contables",
        clase: "estados",
        subidoPor: "Nicolás Paz",
        rol: "Tesorero",
        iniciales: "NP",
        avatar: "b",
        fecha: "05/08/2026",
        tamano: "452 KB",
    },
    {
        icon: "pdf",
        nombre: "Estados contables 2025",
        subtitulo: "Informe anual del consorcio",
        categoria: "Estados contables",
        clase: "estados",
        subidoPor: "Nicolás Paz",
        rol: "Tesorero",
        iniciales: "NP",
        avatar: "b",
        fecha: "10/07/2026",
        tamano: "3.1 MB",
    },
    {
        icon: "docx",
        nombre: "Contrato de limpieza",
        subtitulo: "Contrato vigente del servicio de limpieza",
        categoria: "Otros",
        clase: "otros",
        subidoPor: "Admin",
        rol: "Administrador",
        iniciales: "AR",
        avatar: "a",
        fecha: "12/06/2026",
        tamano: "890 KB",
    },
];

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

const columnas = [
    {
        clave: "nombre",
        titulo: "Nombre",
        ancho: "2fr",
        render: (doc) => (
            <span className="documentos-nombre-celda">
                <span className="documentos-nombre-texto">
                    <strong>{doc.nombre}</strong>
                    <small>{doc.subtitulo}</small>
                </span>
            </span>
        ),
    },
    {
        clave: "categoria",
        titulo: "Categoría",
        ancho: "1fr",
        render: (doc) => (
            <span className={`documentos-badge ${doc.clase}`}>
                {doc.categoria}
            </span>
        ),
    },
    { clave: "fecha", titulo: "Fecha", ancho: "0.8fr", clase: "documentos-fecha" },
    {
        clave: "acciones",
        titulo: "Acciones",
        ancho: "0.7fr",
        render: () => (
            <span className="documentos-tabla-acciones">
                <button aria-label="Más opciones">
                    <MoreVertical size={16} />
                </button>
            </span>
        ),
    },
];

function Documentos() {

    useEffect(() => {
        document.title = "Habita | Documentos";
    }, []);

    return (
        <main className="documentos pagina-administrador">

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

                    <Tabla
                        columnas={columnas}
                        datos={documentos}
                        etiqueta="documentos"
                        className="documentos-tabla"
                    />

                </section>

            </div>

        </main>
    );
}

export default Documentos;
