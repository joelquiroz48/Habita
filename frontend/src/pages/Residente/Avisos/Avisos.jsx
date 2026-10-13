import { useEffect, useMemo, useState } from "react";
import { X, Image, Eye } from "lucide-react";

import "./Avisos.css";
import Panel from "../../../components/Panel/Panel";
import Tabla from "../../../components/Tabla/Tabla";
import Navegador from "../../../components/Navegador/Navegador";
import { obtenerOpcionesPeriodo, obtenerPeriodoFecha } from "../../../utils/periodos";

const avisosIniciales = [
    {
        id: 1,
        titulo: "Asamblea ordinaria",
        descripcion: "El próximo martes 15/09 se realizará la asamblea ordinaria del consorcio a las 20:00 h en el SUM.",
        fecha: "01/09/2026",
        importancia: "Importante",
        categoria: "Eventos",
        leido: false,
        adjunto: { nombre: "foto1.png", tamano: "245 KB" },
    },
    {
        id: 2,
        titulo: "Corte de luz programado",
        descripcion: "El martes 8/09 de 9:00 a 13:00 habrá un corte de luz por tareas de EDENOR.",
        fecha: "01/09/2026",
        importancia: "Importante",
        categoria: "Mantenimiento",
        leido: false,
    },
    {
        id: 3,
        titulo: "Poda de árboles en espacios comunes",
        descripcion: "El próximo martes 15/09 se realizará la poda de árboles en el jardín del frente.",
        fecha: "31/08/2026",
        importancia: "Importante",
        categoria: "Mantenimiento",
        leido: false,
        adjunto: { nombre: "foto1.png", tamano: "245 KB" },
    },
    {
        id: 4,
        titulo: "Ahorro de agua",
        descripcion: "Recordamos la importancia del uso responsable del agua en todo el edificio.",
        fecha: "27/08/2026",
        importancia: "Normal",
        categoria: "Servicios",
        leido: true,
        adjunto: { nombre: "foto1.png", tamano: "245 KB" },
    },
    {
        id: 5,
        titulo: "Recepción de paquetes",
        descripcion: "Recordamos que los paquetes se pueden recibir en la administración durante el horario de atención.",
        fecha: "25/08/2026",
        importancia: "Normal",
        categoria: "Servicios",
        leido: false,
    },
    {
        id: 6,
        titulo: "Revisión de matafuegos",
        descripcion: "El próximo miércoles se realizará la revisión y mantenimiento de los matafuegos de los espacios comunes.",
        fecha: "21/08/2026",
        importancia: "Normal",
        categoria: "Mantenimiento",
        leido: true,
    },
    {
        id: 7,
        titulo: "Recordatorio de seguridad",
        descripcion: "Recordamos mantener cerrada la puerta de acceso al edificio y no permitir el ingreso de personas desconocidas.",
        fecha: "19/08/2026",
        importancia: "Normal",
        categoria: "Seguridad",
        leido: true,
    },
].map((aviso) => ({
    ...aviso,
    periodoFecha: obtenerPeriodoFecha(aviso.fecha),
    estadoLectura: aviso.leido ? "Leído" : "Sin leer",
}));

const columnasAvisos = [
    {
        clave: "titulo",
        titulo: "Asunto",
        ancho: "1.5fr",
    },
    {
        clave: "importancia",
        titulo: "Importante",
        ancho: "1fr",
        render: (aviso) => (
            <small className={`aviso-tabla-importancia ${aviso.importancia === "Importante" ? "importante" : "normal"}`}>
                {aviso.importancia}
            </small>
        ),
    },
    { clave: "categoria", titulo: "Categoría", ancho: "1fr" },
    {
        clave: "leido",
        titulo: "Estado",
        ancho: "0.9fr",
        render: (aviso) => (
            <small className={`aviso-tabla-estado ${aviso.leido ? "leido" : "sin-leer"}`}>
                {aviso.leido ? "Leído" : "Sin leer"}
            </small>
        ),
    },
    { clave: "fecha", titulo: "Fecha de publicación", ancho: "1.2fr" },
];

function Avisos() {
    const [avisos, setAvisos] = useState(avisosIniciales);
    const [avisoSeleccionado, setAvisoSeleccionado] = useState(null);
    const [detalleAbierto, setDetalleAbierto] = useState(false);

    const filtros = useMemo(() => [
        {
            key: "categoria",
            label: "Todas las categorías",
            options: [...new Set(avisos.map((aviso) => aviso.categoria))],
        },
        {
            key: "importancia",
            label: "Cualquier importancia",
            options: ["Importante", "Normal"],
        },
        {
            key: "estadoLectura",
            label: "Todos los estados",
            options: ["Sin leer", "Leído"],
        },
        {
            key: "periodoFecha",
            label: "Todos los períodos",
            options: obtenerOpcionesPeriodo(avisos),
        },
    ], [avisos]);

    useEffect(() => {
        document.title = "Habita | Avisos";
    }, []);

    function abrirDetalle(aviso) {
        const avisoActualizado = aviso.leido
            ? aviso
            : { ...aviso, leido: true, estadoLectura: "Leído" };

        if (!aviso.leido) {
            setAvisos((actuales) => actuales.map((item) => (
                item.id === aviso.id ? avisoActualizado : item
            )));
        }

        setAvisoSeleccionado(avisoActualizado);
        setDetalleAbierto(true);
    }

    return (
        <main className="avisos">

            <Navegador
                data={avisos}
                searchKey="titulo"
                searchPlaceholder="Buscar aviso..."
                filters={filtros}
            >
                {(avisosFiltrados) => (
                    <Tabla
                        columnas={columnasAvisos}
                        datos={avisosFiltrados}
                        etiqueta="avisos"
                        onFilaClick={abrirDetalle}
                        seleccionable
                        filaSeleccionada={detalleAbierto ? avisoSeleccionado : null}
                    />
                )}
            </Navegador>

            {detalleAbierto && avisoSeleccionado && (
                <Panel
                    className="aviso-detalle"
                    titulo={avisoSeleccionado.titulo}
                    tituloComplemento={
                        <span className={`aviso-tabla-estado ${avisoSeleccionado.leido ? "leido" : "sin-leer"}`}>
                            {avisoSeleccionado.leido ? "Leído" : "Sin leer"}
                        </span>
                    }
                    accion={
                        <button
                            type="button"
                            className="aviso-detalle-cerrar"
                            onClick={() => setDetalleAbierto(false)}
                            aria-label="Cerrar detalle del aviso"
                        >
                            <X size={18} />
                        </button>
                    }
                >
                    <div className="aviso-detalle-fila">
                        <span>Importancia</span>
                        <strong>{avisoSeleccionado.importancia}</strong>
                    </div>
                    <div className="aviso-detalle-fila">
                        <span>Categoría</span>
                        <strong>{avisoSeleccionado.categoria}</strong>
                    </div>
                    <div className="aviso-detalle-fila">
                        <span>Fecha de publicación</span>
                        <strong>{avisoSeleccionado.fecha}</strong>
                    </div>

                    <h3 className="aviso-detalle-subtitulo">Descripción</h3>
                    <p className="aviso-detalle-descripcion">{avisoSeleccionado.descripcion}</p>

                    <h3 className="aviso-detalle-subtitulo">Adjuntos</h3>

                    {avisoSeleccionado.adjunto ? (
                        <div className="avisos-adjunto">
                            <Image size={16} />

                            <div className="avisos-adjunto-info">
                                <strong>{avisoSeleccionado.adjunto.nombre}</strong>
                                <span>Tamaño - {avisoSeleccionado.adjunto.tamano}</span>
                            </div>

                            <button aria-label="Descargar adjunto">
                                <Eye size={16} />
                            </button>
                        </div>
                    ) : (
                        <p className="avisos-sin-adjunto">
                            Sin archivos adjuntos.
                        </p>
                    )}
                </Panel>
            )}
        </main>
    );
}

export default Avisos;
