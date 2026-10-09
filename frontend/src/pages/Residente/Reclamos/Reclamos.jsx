import { useEffect, useState } from "react";
import {
    ChevronDown,
    EllipsisVertical,
    Eye,
    MousePointer2,
    Paperclip,
    Info,
    SquarePen,
} from "lucide-react";

import ChatWidget from "../../../components/Layout/ChatWidget/ChatWidget";
import "./Reclamos.css";
import Panel from "../../../components/Panel/Panel";
import Tabla from "../../../components/Tabla/Tabla";

const categorias = [
    "Mantenimiento",
    "Limpieza",
    "Ascensores",
    "Iluminación",
    "Seguridad",
    "Espacios comunes",
    "Otros",
];

const solicitudesEjemplo = [
    { id: 1, titulo: "Filtración debajo de la pileta", categoria: "Mantenimiento", estado: "En revisión", fecha: "02-10-26" },
    { id: 2, titulo: "El ascensor principal hace ruido", categoria: "Ascensores", estado: "Respondido", fecha: "28-09-26" },
    { id: 3, titulo: "Luces apagadas en la cochera", categoria: "Iluminación", estado: "Resuelto", fecha: "24-09-26" },
    { id: 4, titulo: "La puerta de acceso no cierra", categoria: "Seguridad", estado: "En revisión", fecha: "19-09-26" },
    { id: 5, titulo: "Limpieza pendiente en la escalera", categoria: "Limpieza", estado: "Respondido", fecha: "12-09-26" },
    { id: 6, titulo: "Canilla pierde en el lavadero común", categoria: "Espacios comunes", estado: "Resuelto", fecha: "05-09-26" },
];

const consejos = [
    "Elegí un asunto breve que describa el problema.",
    "Indicá el lugar exacto donde ocurre.",
    "Agregá cuándo comenzó y si sucede con frecuencia.",
    "Adjuntá una foto si ayuda a entender el inconveniente.",
];

function claseEstado(estado) {
    if (estado === "En revisión") return "en-revision";
    if (estado === "Respondido") return "respondido";
    return "resuelto";
}

const columnasSolicitudes = [
    {
        clave: "titulo",
        titulo: "Solicitud",
        ancho: "2fr",
        render: (solicitud) => (
            <strong className="solicitud-titulo">{solicitud.titulo}</strong>
        ),
    },
    { clave: "categoria", titulo: "Categoría", ancho: "1.2fr" },
    {
        clave: "estado",
        titulo: "Estado",
        ancho: "1.1fr",
        render: (solicitud) => (
            <small className={`solicitud-estado ${claseEstado(solicitud.estado)}`}>
                {solicitud.estado}
            </small>
        ),
    },
    { clave: "fecha", titulo: "Fecha", ancho: "0.9fr" },
    {
        clave: "acciones",
        titulo: "Acciones",
        ancho: "0.7fr",
        render: () => (
            <span className="solicitud-acciones">
                <button type="button" title="Ver solicitud" aria-label="Ver solicitud">
                    <Eye />
                </button>
                <button type="button" title="Más opciones" aria-label="Más opciones">
                    <EllipsisVertical />
                </button>
            </span>
        ),
    },
];

function Reclamos({ onAbrirChat }) {
    const [solicitudes, setSolicitudes] = useState(solicitudesEjemplo);
    const [archivoAdjunto, setArchivoAdjunto] = useState("");

    useEffect(() => {
        document.title = "Habita | Reclamos";
    }, []);

    const enviarSolicitud = (event) => {
        event.preventDefault();

        const datos = new FormData(event.currentTarget);
        const fecha = new Date().toLocaleDateString("es-AR", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
        }).replaceAll("/", "-");

        setSolicitudes((actuales) => [
            {
                id: Date.now(),
                titulo: datos.get("asunto").toString(),
                categoria: datos.get("categoria").toString(),
                descripcion: datos.get("descripcion").toString(),
                estado: "En revisión",
                fecha,
            },
            ...actuales,
        ]);
        setArchivoAdjunto("");
        event.currentTarget.reset();
    };

    return (
        <main className="reclamos-residente">
            <div className="reclamos-residente-layout">
                <Tabla
                    columnas={columnasSolicitudes}
                    datos={solicitudes}
                    etiqueta="solicitudes"
                    className="reclamos-solicitudes-tabla"
                />
                <section className="reclamos-residente-principal">
                    <Panel titulo="Crear nueva solicitud" icono={<SquarePen />} className="crear-solicitud-panel">
                        <form className="form-solicitud" onSubmit={enviarSolicitud}>
                            <label className="campo-solicitud">
                                <span>Asunto</span>
                                <input
                                    name="asunto"
                                    type="text"
                                    placeholder="Escribí un asunto breve"
                                    maxLength={100}
                                    required
                                />
                            </label>

                            <label className="campo-solicitud">
                                <span>Categoría</span>
                                <span className="select-solicitud-wrap">
                                    <select name="categoria" defaultValue="" required>
                                        <option value="" disabled>Selecciona una categoría</option>
                                        {categorias.map((categoria) => (
                                            <option key={categoria} value={categoria}>{categoria}</option>
                                        ))}
                                    </select>
                                    <ChevronDown aria-hidden="true" />
                                </span>
                            </label>

                            <label className="campo-solicitud campo-descripcion">
                                <span>Descripción</span>
                                <textarea
                                    name="descripcion"
                                    placeholder="Contanos con detalle cuál es el inconveniente"
                                    rows={4}
                                    required
                                />
                            </label>

                            <div className="solicitud-formulario-acciones">
                                <label className="adjuntar-archivo" htmlFor="archivo-solicitud">
                                    <Paperclip aria-hidden="true" />
                                    <span>{archivoAdjunto || "Adjuntar archivo"}</span>
                                    <input
                                        id="archivo-solicitud"
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                        onChange={(event) => setArchivoAdjunto(event.target.files[0]?.name || "")}
                                    />
                                </label>
                                <button className="enviar-solicitud" type="submit">
                                    <MousePointer2 aria-hidden="true" />
                                    Enviar solicitud
                                </button>
                            </div>
                        </form>
                    </Panel>
                </section>

                <aside className="reclamos-residente-lateral">
                    <Panel titulo="Consejos para reportar" icono={<Info />} className="consejos-reclamos">
                        <ul>
                            {consejos.map((consejo) => (
                                <li key={consejo}>{consejo}</li>
                            ))}
                        </ul>
                    </Panel>

                    <article className="panel-card asistente-card">
                        <div className="panel-header">
                            <h2>Asistente Habita</h2>
                        </div>

                        <ChatWidget onAbrir={onAbrirChat} />
                    </article>
                </aside>
            </div>
        </main>
    );
}

export default Reclamos;