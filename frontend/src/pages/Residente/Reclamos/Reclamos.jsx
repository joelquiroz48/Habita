import { useEffect, useState } from "react";
import {
    ChevronDown,
    MousePointer2,
    Paperclip,
    Info,
    SquarePen,
    X,
} from "lucide-react";

import "./Reclamos.css";
import Panel from "../../../components/Panel/Panel";
import Tabla from "../../../components/Tabla/Tabla";
import Navegador from "../../../components/Navegador/Navegador";

const categorias = [
    "Mantenimiento",
    "Limpieza",
    "Ascensores",
    "Iluminación",
    "Seguridad",
    "Espacios comunes",
    "Otros",
];

const reclamosIniciales = [
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
const filtros=[
    {
        key: "categoria",
        label: "Todas las categorías",
        options: ["Ascensores","Espacios comunes","Iluminación","Limpieza","Mantenimiento","Seguridad","Otros"],
    },
     {
        key: "estado",
        label: "Todos los estados",
        options: ["En revisión", "Respondido", "Resuelto"],
    },

];

const columnasReclamos = [
    {
        clave: "titulo",
        titulo: "Reclamo",
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

];

function Reclamos() {
    const [reclamos, setReclamos] = useState(reclamosIniciales);
    const [archivoAdjunto, setArchivoAdjunto] = useState("");

    useEffect(() => {
        document.title = "Habita | Reclamos";
    }, []);

    const [reclamosSeleccionado, setReclamosSeleccionado] = useState(reclamos[0]);
    const [detalleAbierto, setDetalleAbierto] = useState(false);
    
    function abrirDetalle(reclamo) {
        setReclamosSeleccionado(reclamo);
        setDetalleAbierto(true);
    }

    const enviarReclamo = (event) => {
        event.preventDefault();

        const datos = new FormData(event.currentTarget);
        const fecha = new Date().toLocaleDateString("es-AR", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
        }).replaceAll("/", "-");

        setReclamos((actuales) => [
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
                 
                 {/* RECLAMOS */}
                <Navegador
                    data={reclamos}
                    searchKey="titulo"
                    searchPlaceholder="Buscar reclamo..."
                    filters={filtros}
                >
                    {(ReclamosFiltrados) => (
                        <Tabla
                            columnas={columnasReclamos}
                            datos={ReclamosFiltrados}
                            etiqueta="reclamos"
                            className="reclamos-reclamos-tabla"
                            onFilaClick={abrirDetalle}
                            seleccionable
                            filaSeleccionada={detalleAbierto ? reclamosSeleccionado : null}
                        />
                            )}
                </Navegador>
                
                {/* DETALLE */}

                {detalleAbierto && (
                    <Panel
                        className="reclamos-detalle"
                        titulo={reclamosSeleccionado.titulo}
                        tituloComplemento={
                            <div className={`reclamos-badge ${claseEstado(reclamosSeleccionado.estado)}`}>
                                {reclamosSeleccionado.estado}
                            </div>
                        }
                        accion={
                            <button
                                className="reclamos-detalle-cerrar"
                                onClick={() => setDetalleAbierto(false)}
                                aria-label="Cerrar detalle"
                            >
                                <X size={18} />
                            </button>
                        }
                    >

                        {/* =========== FILAS =========== */}

                        <div className="reclamos-detalle-fila">
                            <span>Categoría</span>
                            <strong>{reclamosSeleccionado.categoria}</strong>
                        </div>

                        <div className="reclamos-detalle-fila">
                            <span>Fecha</span>
                            <strong>{reclamosSeleccionado.fecha}</strong>
                        </div>
                        
                    </Panel>
                )}
                <section className="reclamos-residente-principal">
                    <Panel titulo="Crear nuevo reclamo" icono={<SquarePen />} className="crear-reclamo-panel">
                        <form className="form-reclamo" onSubmit={enviarReclamo}>
                            <label className="campo-reclamo">
                                <span>Asunto</span>
                                <input
                                    name="asunto"
                                    type="text"
                                    placeholder="Escribí un asunto breve"
                                    maxLength={100}
                                    required
                                />
                            </label>

                            <label className="campo-reclamo">
                                <span>Categoría</span>
                                <span className="select-reclamo-wrap">
                                    <select name="categoria" defaultValue="" required>
                                        <option value="" disabled>Selecciona una categoría</option>
                                        {categorias.map((categoria) => (
                                            <option key={categoria} value={categoria}>{categoria}</option>
                                        ))}
                                    </select>
                                    <ChevronDown aria-hidden="true" />
                                </span>
                            </label>

                            <label className="campo-reclamo campo-descripcion">
                                <span>Descripción</span>
                                <textarea
                                    name="descripcion"
                                    placeholder="Contanos con detalle cuál es el inconveniente"
                                    rows={4}
                                    required
                                />
                            </label>

                            <div className="reclamo-formulario-acciones">
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
                                <button className="enviar-reclamo" type="submit">
                                    <MousePointer2 aria-hidden="true" />
                                    Enviar reclamo
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
                </aside>
            </div>
        </main>
    );
}

export default Reclamos;