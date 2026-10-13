import { useEffect } from "react";
import { Download, Eye, Info } from "lucide-react";

import ChatWidget from "../../../components/Layout/ChatWidget/ChatWidget";
import "./Documentos.css";
import Panel from "../../../components/Panel/Panel";
import Tabla from "../../../components/Tabla/Tabla";
import Navegador from "../../../components/Navegador/Navegador";
import { obtenerOpcionesPeriodo, obtenerPeriodoFecha } from "../../../utils/periodos";

/* =========================
        DATOS DE EJEMPLO
========================= */

const documentos = [
    {
        nombre: "Reglamento de Copropiedad",
        categoria: "Reglamentos",
        fecha: "12/08/2026",
    },
    {
        nombre: "Acta Asamblea Ordinaria 08/2026",
        categoria: "Asambleas",
        fecha: "10/08/2026",
    },
    {
        nombre: "Recibo expensas 08/2026",
        categoria: "Otros",
        fecha: "10/08/2026",
    },
    {
        nombre: "Plan de Obras 2026",
        categoria: "Obras y mejoras",
        fecha: "05/08/2026",
    },
    {
        nombre: "Informe de Mantenimiento - Julio 2026",
        categoria: "Otros",
        fecha: "31/07/2026",
    },
].map((documento) => ({
    ...documento,
    periodoFecha: obtenerPeriodoFecha(documento.fecha),
}));

const columnasDocumentos = [
    {
        clave: "nombre",
        titulo: "Documento",
        ancho: "1.5fr",
    },
    {
        clave: "categoria",
        titulo: "Categoría",
        ancho: "1fr",
        render: (documento) => (
            <small
                className={`categoria-badge ${documento.categoria
                    .toLowerCase()
                    .replaceAll(" ", "-")}`}
            >
                {documento.categoria}
            </small>
        ),
    },
    {
        clave: "fecha",
        titulo: "Fecha",
        ancho: "1fr",
        clase: "fecha-documento",
    },
];

const filtros = [
    {
        key: "categoria",
        label: "Todas las categorías",
        options: ["Asambleas", "Obras y mejoras", "Reglamentos", "Otros"],
    },
    {
        key: "periodoFecha",
        label: "Todos los períodos",
        options: obtenerOpcionesPeriodo(documentos),
    },
];

function Documentos({ onAbrirChat }) {

    useEffect(() => {
        document.title = "Habita | Documentos";
    }, []);

    return (
        <main className="documentos">

            {/* =========================
                CONTENIDO PRINCIPAL
            ========================= */}

            {/* DOCUMENTOS */}
            <Navegador
                data={documentos}
                searchKey="nombre"
                searchPlaceholder="Buscar documento..."
                filters={filtros}
            >
                {(DocumentosFiltrados) => (
                    <Tabla
                        columnas={columnasDocumentos}
                        datos={DocumentosFiltrados}
                        etiqueta="documentos"
                        className="documentos-tabla"
                        mostrarAcciones
                        opcionesAcciones={[
                            { label: "Vista Previa", icon: Eye },
                            { label: "Descargar", icon: Download },
                        ]}
                    />
                        )}
            </Navegador>
            
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

                    <article className="panel-card asistente-card">
                        <div className="panel-header">
                            <h2>Asistente Habita</h2>
                        </div>

                        <ChatWidget onAbrir={onAbrirChat} />
                    </article>

                </section>

            </section>
        </main>
    );
}

export default Documentos;