import { useEffect, useState } from "react";
import {
    Download,
    Eye,
} from "lucide-react";

import "./Documentos.css";
import Tabla from "../../../components/Tabla/Tabla";
import Navegador from "../../../components/Navegador/Navegador";

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
];

const filtros=[
    {
        key: "categoria",
        label: "Todos las categorias",
        options: ["Reglamentos", "Asambleas", "Obras y mejoras", "Finanzas", "Actas", "Seguros", "Otros"],
    },
    {
        key: "fecha",
        label: "Todos los periodos",
        options: ["Enero", "Febrero", "Marzo"],
    },
];

function Documentos() {
    
    const [documentosListado, setDocumentosdListado] = useState(documentos);

    useEffect(() => {
        document.title = "Habita | Documentos";
    }, []);

    return (
        <main className="documentos pagina-administrador">

            <Navegador
                data={documentosListado}
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
                        ]}
                    />
                        )}
            </Navegador>

        </main>
    );
}

export default Documentos;
