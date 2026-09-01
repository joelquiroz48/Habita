import { useEffect } from "react";
import {
    BookOpen,
    Users,
    BarChart3,
    Wrench,
    MoreHorizontal,
    FileText,
    FileSpreadsheet,
    Download,
    Eye,
    Search,
    MessageCircle,
    CircleHelp,
    Info,
    SlidersHorizontal,
} from "lucide-react";

import "./Documentos.css";


/* =========================
        DATOS DE EJEMPLO
========================= */

const categorias = [
    {
        nombre: "Reglamentos",
        cantidad: "3 documentos",
        icono: BookOpen,
        clase: "verde",
    },
    {
        nombre: "Asambleas",
        cantidad: "8 documentos",
        icono: Users,
        clase: "azul",
    },
    {
        nombre: "Estados contables",
        cantidad: "12 documentos",
        icono: BarChart3,
        clase: "violeta",
    },
    {
        nombre: "Obras y mejoras",
        cantidad: "5 documentos",
        icono: Wrench,
        clase: "naranja",
    },
    {
        nombre: "Otros",
        cantidad: "4 documentos",
        icono: MoreHorizontal,
        clase: "gris",
    },
];


const documentosRecientes = [
    {
        nombre: "Acta de Asamblea Ordinaria 2024",
        categoria: "Asambleas",
        fecha: "12/04/2024",
        tipo: "pdf",
    },
    {
        nombre: "Estado Contable - Abril 2024",
        categoria: "Estados contables",
        fecha: "10/04/2024",
        tipo: "excel",
    },
    {
        nombre: "Reglamento Interno del Edificio",
        categoria: "Reglamentos",
        fecha: "01/03/2024",
        tipo: "pdf",
    },
    {
        nombre: "Plan de Obras 2024",
        categoria: "Obras y mejoras",
        fecha: "20/02/2024",
        tipo: "word",
    },
    {
        nombre: "Informe de Mantenimiento - Marzo 2024",
        categoria: "Otros",
        fecha: "15/02/2024",
        tipo: "pdf",
    },
];


const categoriasExplorar = [
    {
        nombre: "Reglamentos",
        descripcion: "Normas y reglamentos que rigen la convivencia en el edificio.",
        cantidad: "3 documentos",
        icono: BookOpen,
        clase: "verde",
    },
    {
        nombre: "Asambleas",
        descripcion: "Actas y convocatorias de asambleas ordinarias y extraordinarias.",
        cantidad: "8 documentos",
        icono: Users,
        clase: "azul",
    },
    {
        nombre: "Estados contables",
        descripcion: "Balances, informes y estados contables del consorcio.",
        cantidad: "12 documentos",
        icono: BarChart3,
        clase: "violeta",
    },
    {
        nombre: "Obras y mejoras",
        descripcion: "Proyectos, presupuestos e informes de obras y mejoras.",
        cantidad: "5 documentos",
        icono: Wrench,
        clase: "naranja",
    },
    {
        nombre: "Otros",
        descripcion: "Documentación general y otros archivos importantes.",
        cantidad: "4 documentos",
        icono: MoreHorizontal,
        clase: "gris",
    },
];


/* =========================
          COMPONENTE
========================= */

function Documentos() {

    useEffect(() => {
        document.title = "Habita | Documentos";
    }, []);

    return (
        <main className="documentos">

            {/* =========================
                CONTENIDO PRINCIPAL
            ========================= */}

            <section className="documentos-contenido">

                <div className="documentos-principal">

                    {/* =========================
                        DOCUMENTOS RECIENTES
                    ========================= */}

                    <section className="panel-documentos recientes-documentos">

                        <div className="panel-documentos-header">

                            <div>
                                <h2>Documentos recientes</h2>
                            </div>

                            <button className="link-documentos">
                                Ver todos
                            </button>

                        </div>


                        <div className="tabla-documentos">

                            <div className="tabla-documentos-header">

                                <span>Documento</span>
                                <span>Categoría</span>
                                <span>Fecha</span>
                                <span>Acciones</span>

                            </div>


                            {documentosRecientes.map((documento, index) => (

                                <div
                                    className="tabla-documento-fila"
                                    key={index}
                                >

                                    {/* DOCUMENTO */}

                                    <div className="documento-nombre">

                                        <div
                                            className={`documento-tipo ${documento.tipo}`}
                                        >

                                            {documento.tipo === "pdf" && (
                                                <span>PDF</span>
                                            )}

                                            {documento.tipo === "excel" && (
                                                <FileSpreadsheet size={12} />
                                            )}

                                            {documento.tipo === "word" && (
                                                <FileText size={12} />
                                            )}

                                        </div>

                                        <span>
                                            {documento.nombre}
                                        </span>

                                    </div>


                                    {/* CATEGORÍA */}

                                    <span>

                                        <small
                                            className={`categoria-badge ${documento.categoria
                                                .toLowerCase()
                                                .replaceAll(" ", "-")}`}
                                        >
                                            {documento.categoria}
                                        </small>

                                    </span>


                                    {/* FECHA */}

                                    <span className="fecha-documento">
                                        {documento.fecha}
                                    </span>


                                    {/* ACCIONES */}

                                    <div className="acciones-documento">

                                        <button title="Descargar">
                                            <Download size={13} />
                                        </button>

                                        <button title="Ver documento">
                                            <Eye size={13} />
                                        </button>

                                    </div>

                                </div>

                            ))}

                        </div>

                    </section>


                    {/* =========================
                        EXPLORAR POR CATEGORÍA
                    ========================= */}

                    <section className="panel-documentos explorar-documentos">

                        <div className="panel-documentos-header">

                            <div>
                                <h2>Explorar por categoría</h2>
                            </div>

                            <button className="link-documentos">
                                Ver todas las categorías
                            </button>

                        </div>


                        <div className="explorar-grid">

                            {categoriasExplorar.map((categoria, index) => {

                                const Icono = categoria.icono;

                                return (
                                    <article
                                        className="categoria-explorar"
                                        key={index}
                                    >

                                        <div
                                            className={`explorar-icono ${categoria.clase}`}
                                        >
                                            <Icono size={17} />
                                        </div>


                                        <strong>
                                            {categoria.nombre}
                                        </strong>


                                        <p>
                                            {categoria.descripcion}
                                        </p>


                                        <span>
                                            {categoria.cantidad}
                                        </span>

                                    </article>
                                );

                            })}

                        </div>

                    </section>

                </div>


                {/* =========================
                    SIDEBAR
                ========================= */}

                <aside className="documentos-sidebar">

                    {/* =========================
                        INFORMACIÓN IMPORTANTE
                    ========================= */}

                    <article className="panel-documentos informacion-documentos">

                        <div className="sidebar-documentos-header">

                            <div className="sidebar-icono">
                                <Info size={14} />
                            </div>

                            <h2>Información importante</h2>

                        </div>


                        <ul>

                            <li>
                                Los documentos se actualizan
                                periódicamente.
                            </li>

                            <li>
                                Podés descargar o visualizar
                                cada archivo.
                            </li>

                            <li>
                                Ante cualquier duda, podés
                                contactar con la administración.
                            </li>

                        </ul>

                    </article>


                    {/* =========================
                        BÚSQUEDA RÁPIDA
                    ========================= */}

                    <article className="panel-documentos busqueda-documentos">

                        <div className="sidebar-documentos-header">

                            <div className="sidebar-icono">
                                <Search size={14} />
                            </div>

                            <h2>Búsqueda rápida</h2>

                        </div>


                        <div className="buscador-documentos">

                            <input
                                type="text"
                                placeholder="Buscar documento..."
                            />

                            <button>
                                <Search size={14} />
                            </button>

                        </div>

                    </article>


                    {/* =========================
                        FILTROS
                    ========================= */}

                    <article className="panel-documentos filtros-documentos">

                        <div className="sidebar-documentos-header">

                            <div className="sidebar-icono">
                                <SlidersHorizontal size={14} />
                            </div>

                            <h2>Filtros</h2>

                        </div>


                        <div className="filtro-documento">

                            <select>
                                <option>
                                    Todas las categorías
                                </option>

                                <option>
                                    Reglamentos
                                </option>

                                <option>
                                    Asambleas
                                </option>

                                <option>
                                    Estados contables
                                </option>

                                <option>
                                    Obras y mejoras
                                </option>

                                <option>
                                    Otros
                                </option>
                            </select>

                        </div>


                        <div className="filtro-documento">

                            <select>
                                <option>
                                    Más recientes
                                </option>

                                <option>
                                    Más antiguos
                                </option>
                            </select>

                        </div>

                    </article>

                    {/* =========================
                        AYUDA
                    ========================= */}

                    <article className="panel-documentos ayuda-documentos">

                        <div className="ayuda-documentos-icono">
                            <CircleHelp size={14} />
                        </div>

                        <strong>¿Necesitás ayuda?</strong>

                        <p>
                            Nuestro asistente puede ayudarte
                            a encontrar el documento que necesitás.
                        </p>

                        <button className="btn-consultar">
                            <MessageCircle size={17} />
                            Chatear a Habita
                        </button>

                    </article>


                </aside>

            </section>

        </main>
    );
}

export default Documentos;