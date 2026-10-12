import { useEffect } from "react";
import { Download, Eye, Trash } from "lucide-react";

import "./Documentos.css";
import Tabla from "../../../components/Tabla/Tabla";
import Navegador from "../../../components/Navegador/Navegador";
import { obtenerOpcionesPeriodo, obtenerPeriodoFecha } from "../../../utils/periodos";

{/* =========================
       DATOS EJEMPLOS
========================== */}

const documentos = [
    {
        nombre: "Reglamento de Copropiedad",
        subtitulo: "Normas y reglamentos del edificio",
        categoria: "Reglamentos",
        audiencia: "Todos los residentes",
        clase: "reglamentos",
        fecha: "12/08/2026",
    },
    {
        nombre: "Acta Asamblea Ordinaria 08/2026",
        subtitulo: "Acta de la asamblea ordinaria",
        categoria: "Asambleas",
        audiencia: "Todos los residentes",
        clase: "asambleas",
        fecha: "10/08/2026",
    },
    {
        nombre: "Recibo expensas 08/2026",
        subtitulo: "Comprobante de expensas - Agosto 2026",
        categoria: "Otros",
        audiencia: "Todos los residentes",
        clase: "otros",
        fecha: "10/08/2026",
    },
    {
        nombre: "Plan de Obras 2026",
        subtitulo: "Proyectos y mejoras del edificio",
        categoria: "Obras y mejoras",
        audiencia: "Todos los residentes",
        clase: "obras",
        fecha: "05/08/2026",
    },
    {
        nombre: "Informe de Mantenimiento - Julio 2026",
        subtitulo: "Informe de tareas de mantenimiento",
        categoria: "Otros",
        audiencia: "Todos los residentes",
        clase: "otros",
        fecha: "31/07/2026",
    },
    {
        nombre: "Presupuesto anual 2026",
        subtitulo: "Detalle de ingresos y egresos",
        categoria: "Estados contables",
        audiencia: "Todos los residentes",
        clase: "estados",
        fecha: "05/08/2026",
    },
    {
        nombre: "Estados contables 2025",
        subtitulo: "Informe anual del consorcio",
        categoria: "Estados contables",
        audiencia: "Todos los residentes",
        clase: "estados",
        fecha: "10/07/2026",
    },
    {
        nombre: "Contrato de limpieza",
        subtitulo: "Contrato vigente del servicio de limpieza",
        categoria: "Otros",
        audiencia: "Todos los residentes",
        clase: "otros",
        fecha: "12/06/2026",
    },
].map((documento) => ({
    ...documento,
    periodo: obtenerPeriodoFecha(documento.fecha),
}));

const columnas = [
    {
        clave: "nombre",
        titulo: "Nombre",
        ancho: "1.5fr",
        render: (doc) => (
            <span className="documentos-nombre-celda">
                <span className="documentos-nombre-texto">
                    <strong>{doc.nombre}</strong>
                    <small>{doc.subtitulo}</small>
                </span>
            </span>
        ),
    },
    { clave: "audiencia", titulo: "Audiencia", ancho: "0.9fr" },
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
    { clave: "fecha", titulo: "Fecha de publicación", ancho: "0.8fr", clase: "documentos-fecha" },
];

const filtros=[
    {
        key: "categoria",
        label: "Todos las categorias",
        options: ["Reglamentos", "Asambleas", "Obras y mejoras", "Finanzas", "Actas", "Seguros", "Otros"],
    },
    {
        key: "periodo",
        label: "Todos los periodos",
        options: obtenerOpcionesPeriodo(documentos, "periodo"),
    },
];

function Documentos() {

    useEffect(() => {
        document.title = "Habita | Documentos";
    }, []);

    return (
        <main className="documentos pagina-administrador">

            <Navegador
                data={documentos}
                searchKey="nombre"
                searchPlaceholder="Buscar documento..."
                filters={filtros}
                onNew={() => {}}
                newButtonText="Subir documento"
            >
                {(DocumentosFiltrados) => (
                    <Tabla
                        columnas={columnas}
                        datos={DocumentosFiltrados}
                        etiqueta="documentos"
                        className="documentos-tabla"
                        mostrarAcciones
                        opcionesAcciones={[
                            { label: "Vista previa", icon: Eye },
                            { label: "Descargar", icon: Download },
                            { label: "Borrar", icon: Trash },
                        ]}
                    />
                        )}
            </Navegador>

        </main>
    );
}

export default Documentos;
