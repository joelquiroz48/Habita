import { useEffect } from "react";
import { Download, Info } from "lucide-react";

import "./Documentos.css";
import Tabla from "../../../components/Tabla/Tabla";
import Navegador from "../../../components/Navegador/Navegador";
import { usePerfil } from "../../../context/PerfilContext";
import { obtenerOpcionesPeriodo, obtenerPeriodoFecha } from "../../../utils/periodos";
import { descargarDocumento } from "../../../utils/documentoPdf";

/* =========================
        DATOS DE EJEMPLO
   (cuando la administración cargue documentos reales,
    esta lista pasa a venir de la base de datos)
========================= */

const documentos = [
    {
        nombre: "Reglamento de Copropiedad",
        categoria: "Reglamentos",
        fecha: "12/08/2026",
        descripcion: "Normas de convivencia y uso de las áreas comunes, derechos y obligaciones de los propietarios y residentes del edificio.",
    },
    {
        nombre: "Acta Asamblea Ordinaria 08/2026",
        categoria: "Asambleas",
        fecha: "10/08/2026",
        descripcion: "Registro de los temas tratados y las decisiones votadas en la asamblea ordinaria de agosto de 2026.",
    },
    {
        nombre: "Recibo expensas 08/2026",
        categoria: "Otros",
        fecha: "10/08/2026",
        descripcion: "Comprobante informativo de las expensas ordinarias correspondientes al período agosto de 2026.",
    },
    {
        nombre: "Plan de Obras 2026",
        categoria: "Obras y mejoras",
        fecha: "05/08/2026",
        descripcion: "Cronograma de obras y mejoras previstas para el edificio durante 2026, con prioridades y plazos estimados.",
    },
    {
        nombre: "Informe de Mantenimiento - Julio 2026",
        categoria: "Otros",
        fecha: "31/07/2026",
        descripcion: "Resumen de las tareas de mantenimiento realizadas durante julio de 2026 en ascensores, bombas y espacios comunes.",
    },
].map((documento, indice) => ({
    ...documento,
    id: indice + 1,
    periodoFecha: obtenerPeriodoFecha(documento.fecha),
}));

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

const informacion = [
    "Los documentos se actualizan periódicamente.",
    "Podés descargar cada archivo en formato PDF.",
    "Ante cualquier duda, podés contactar con la administración.",
];

function Documentos() {
    const { perfil } = usePerfil();

    useEffect(() => {
        document.title = "Habita | Documentos";
    }, []);

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
                    aria-label={`Descargar ${documento.nombre} en PDF`}
                    title="Descargar PDF"
                    onClick={(evento) => {
                        evento.stopPropagation();
                        descargarDocumento(documento, {
                            residente: perfil?.nombre ?? "",
                            edificio: perfil?.edificio?.nombre ?? "",
                        });
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

            {/* DOCUMENTOS */}
            <Navegador
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
            </Navegador>
        </main>
    );
}

export default Documentos;
