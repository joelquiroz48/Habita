import { useEffect } from "react";
import {
    BookOpen,
    Users,
    BarChart3,
    Wrench,
    MoreHorizontal,
    FileText,
    FileSpreadsheet,
    CircleDollarSign,
    Download,
    Eye,
    Search,
    MessageCircle,
    CircleHelp,
    Info,
    SlidersHorizontal,
} from "lucide-react";

import "./Documentos.css";
import Panel from "../../../components/Panel/Panel";

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
        nombre: "Reglamento de Copropiedad",
        categoria: "Reglamentos",
        fecha: "12/08/2026",
        tipo: "pdf",
    },
    {
        nombre: "Acta Asamblea Ordinaria 08/2026",
        categoria: "Asambleas",
        fecha: "10/08/2026",
        tipo: "word",
    },
    {
        nombre: "Recibo expensas 08/2026",
        categoria: "Otros",
        fecha: "10/08/2026",
        tipo: "money",
    },
    {
        nombre: "Plan de Obras 2026",
        categoria: "Obras y mejoras",
        fecha: "05/08/2026",
        tipo: "word",
    },
    {
        nombre: "Informe de Mantenimiento - Julio 2026",
        categoria: "Otros",
        fecha: "31/07/2026",
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

                {/* =========================
                      COLUMNA IZQUIERDA
                ========================= */}

                <section className="documentos-columna">

                    {/* DOCUMENTOS RECIENTES*/}

                    <Panel
                        titulo="Documentos recientes"
                        accion={
                            <button className="link-documentos">Ver todos</button>
                        }
                        className="recientes-documentos"
                    >
                        <div className="tabla-documentos">
                            <div className="tabla-documentos-header">
                                <span>Documento</span>
                                <span>Categoría</span>
                                <span>Fecha</span>
                                <span>Acciones</span>
                            </div>

                            {documentosRecientes.map((documento, index) => (
                                <div className="tabla-documento-fila" key={index}>
                                    {/* DOCUMENTO */}
                                    <div className="documento-nombre">
                                        <div className={`documento-tipo ${documento.tipo}`}>
                                            {documento.tipo === "pdf" && (
                                                <span>PDF</span>
                                            )}

                                            {documento.tipo === "excel" && (
                                                <FileSpreadsheet />
                                            )}

                                            {documento.tipo === "word" && (
                                                <FileText />
                                            )}

                                            {documento.tipo === "money" && (
                                                <CircleDollarSign />
                                            )}
                                        </div>

                                        <span>{documento.nombre}</span>
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
                                    <span className="fecha-documento">{documento.fecha}</span>

                                    {/* ACCIONES */}
                                    <div className="acciones-documento">
                                        <button title="Descargar"><Download /></button>

                                        <button title="Ver documento"><Eye /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Panel>

                    {/* EXPLORAR POR CATEGORÍA */}

                    <Panel
                        titulo="Explorar por categoría"
                        accion={
                            <button className="link-documentos">
                                Ver todas las categorías
                            </button>
                        }
                        className="explorar-documentos"
                    >
                        <div className="explorar-grid">
                            {categoriasExplorar.map((categoria, index) => {
                                const Icono = categoria.icono;

                                return (
                                    <article className="categoria-explorar" key={index}>
                                        <div className={`explorar-icono ${categoria.clase}`}><Icono /></div>

                                        <strong>{categoria.nombre}</strong>

                                        <p>{categoria.descripcion}</p>

                                        <span>{categoria.cantidad}</span>
                                    </article>
                                );
                            })}
                        </div>
                    </Panel>

                </section>

                {/* =========================
                      COLUMNA DERECHA
                ========================= */}

                <section className="documentos-columna">

                    {/* INFORMACIÓN IMPORTANTE */}

                    <Panel titulo="Información importante" icono={<Info />} className="informacion-documentos">
                        <ul>
                            <li>Los documentos se actualizan periódicamente.</li>
                            <li>Podés descargar o visualizar cada archivo.</li>
                            <li>Ante cualquier duda, podés contactar con la administración.</li>
                        </ul>
                    </Panel>

                    {/* BÚSQUEDA RÁPIDA */}

                    <Panel titulo="Búsqueda rápida" icono={<Search />} className="busqueda-documentos">
                        <div className="buscador-documentos">
                            <input type="text" placeholder="Buscar documento..."/>

                            <button><Search /></button>
                        </div>
                    </Panel>

                    {/* FILTROS */}

                    <Panel titulo="Filtros" icono={<SlidersHorizontal />} className="filtros-documentos">
                        <div className="filtro-documento">
                            <select>
                                <option>Todas las categorías</option>
                                <option>Reglamentos</option>
                                <option>Asambleas</option>
                                <option>Estados contables</option>
                                <option>Obras y mejoras</option>
                                <option>Otros</option>
                            </select>
                        </div>

                        <div className="filtro-documento">
                            <select>
                                <option>Más recientes</option>
                                <option>Más antiguos</option>
                            </select>
                        </div>
                    </Panel>

                    {/* AYUDA */}

                    <Panel titulo="¿Necesitás ayuda?" icono={<CircleHelp />} className="ayuda-documentos">
                        <p>Nuestro asistente puede ayudarte a encontrar el documento que necesitás.</p>

                        <button className="btn-consultar">
                            <MessageCircle />
                            Chatear a Habita
                        </button>
                    </Panel>

                </section>

            </section>

        </main>
    );
}

export default Documentos;