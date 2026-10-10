import { useEffect } from "react";
import {
    FileText,
    FileSpreadsheet,
    CircleDollarSign,
    Download,
    Eye,
    Info,
} from "lucide-react";

import "./Documentos.css";
import Panel from "../../../components/Panel/Panel";
import Tabla from "../../../components/Tabla/Tabla";
import Navegador from "../../../components/Navegador/Navegador";

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
];

const columnasDocumentos = [
    {
        clave: "nombre",
        titulo: "Documento",
        ancho: "2fr",
    },
    {
        clave: "categoria",
        titulo: "Categoría",
        ancho: "1.1fr",
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
        ancho: "0.8fr",
        clase: "fecha-documento",
    },
];

const filtros=[
    {
        key: "categoria",
        label: "Todas las categorías",
        options: ["Asambleas","Obras y mejoras","Reglamentos","Otros"],
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


            {/* INFORMACIÓN IMPORTANTE */}

            <Panel titulo="Información importante" icono={<Info />} className="informacion-documentos">
                <ul>
                    <li>Los documentos se actualizan periódicamente.</li>
                    <li>Podés descargar o visualizar cada archivo.</li>
                    <li>Ante cualquier duda, podés contactar con la administración.</li>
                </ul>
            </Panel>

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

        </main>
    );
}

export default Documentos;