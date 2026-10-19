import { useEffect, useMemo, useState } from "react";
import { Download, Info } from "lucide-react";

import "./Documentos.css";
import Tabla from "../../../components/Tabla/Tabla";
import Navegador from "../../../components/Navegador/Navegador";
import { obtenerOpcionesPeriodo } from "../../../utils/periodos";
import { listarDocumentos, descargarDocumentoArchivo } from "../../../services/documentosService";

const informacion = [
    "Los documentos se actualizan periódicamente.",
    "Podés descargar cada archivo con el botón de la derecha.",
    "Ante cualquier duda, podés contactar con la administración.",
];

function Documentos() {
    const [documentos, setDocumentos] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        document.title = "Habita | Documentos";
        listarDocumentos().then(setDocumentos).catch((e) => {
            console.error("No pudimos cargar los documentos", e);
            setError("No pudimos cargar los documentos. Probá de nuevo en unos minutos.");
        });
    }, []);

    const filtros = useMemo(() => [
        { key: "categoria", label: "Todas las categorías", options: [...new Set((documentos ?? []).map((d) => d.categoria))] },
        { key: "periodoFecha", label: "Todos los períodos", options: obtenerOpcionesPeriodo(documentos ?? []) },
    ], [documentos]);

    const columnasDocumentos = [
        { clave: "nombre", titulo: "Documento", ancho: "1.5fr" },
        {
            clave: "categoria",
            titulo: "Categoría",
            ancho: "1fr",
            render: (documento) => (
                <small className={`categoria-badge ${documento.categoria.toLowerCase().replaceAll(" ", "-")}`}>
                    {documento.categoria}
                </small>
            ),
        },
        { clave: "fecha", titulo: "Fecha", ancho: "1fr", clase: "fecha-documento" },
        {
            clave: "descargar",
            titulo: "Descargar",
            ancho: "0.7fr",
            render: (documento) => (
                <button
                    type="button"
                    className="documento-descargar"
                    aria-label={`Descargar ${documento.nombre}`}
                    title="Descargar"
                    onClick={(evento) => {
                        evento.stopPropagation();
                        descargarDocumentoArchivo(documento).catch((e) => setError(e.message));
                    }}
                >
                    <Download size={18} aria-hidden="true" />
                </button>
            ),
        },
    ];

    return (
        <main className="documentos">

            {/* INFORMACIÓN IMPORTANTE (arriba, bien visible) */}
            <section className="documentos-info" aria-labelledby="titulo-info-documentos">
                <div className="documentos-info-encabezado">
                    <span className="documentos-info-icono"><Info aria-hidden="true" /></span>
                    <h2 id="titulo-info-documentos">Información importante</h2>
                </div>

                <ul className="documentos-info-lista">
                    {informacion.map((texto) => (
                        <li key={texto}>{texto}</li>
                    ))}
                </ul>
            </section>

            {error && <p role="alert" className="documentos-error">{error}</p>}
            {!documentos && !error && <p className="documentos-cargando">Cargando documentos...</p>}

            {/* DOCUMENTOS */}
            {documentos && <Navegador
                data={documentos}
                searchKey="nombre"
                searchPlaceholder="Buscar documento..."
                filters={filtros}
            >
                {(documentosFiltrados) => (
                    <Tabla
                        columnas={columnasDocumentos}
                        datos={documentosFiltrados}
                        etiqueta="documentos"
                        className="documentos-tabla"
                    />
                )}
            </Navegador>}
        </main>
    );
}

export default Documentos;
