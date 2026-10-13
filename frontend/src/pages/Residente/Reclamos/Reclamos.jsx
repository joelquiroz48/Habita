import { useEffect, useMemo, useState } from "react";
import { ChevronDown, MousePointer2, Paperclip, Info, SquarePen, X, Image, Eye } from "lucide-react";

import ChatWidget from "../../../components/Layout/ChatWidget/ChatWidget";
import "./Reclamos.css";
import Panel from "../../../components/Panel/Panel";
import Tabla from "../../../components/Tabla/Tabla";
import Navegador from "../../../components/Navegador/Navegador";
import { obtenerOpcionesPeriodo, obtenerPeriodoFecha } from "../../../utils/periodos";

function obtenerPeriodoReclamo(fecha) {
    const [dia, mes, anio] = fecha.split(/[/-]/);
    const anioCompleto = anio?.length === 2 ? `20${anio}` : anio;

    return obtenerPeriodoFecha(`${dia}/${mes}/${anioCompleto}`);
}

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
    { id: 1, titulo: "Filtración debajo de la pileta", categoria: "Mantenimiento", estado: "En revisión", fecha: "02/10/26", adjunto: { nombre: "foto1.png", tamano: "245 KB" }, descripcion: "Hay una pérdida constante debajo de la pileta de la cocina. El agua se acumula dentro del mueble y ya está mojando el piso." },
    { id: 2, titulo: "El ascensor principal hace ruido", categoria: "Ascensores", estado: "Respondido", fecha: "28/09/26", descripcion: "Al subir, el ascensor principal hace un ruido metálico entre el tercer y cuarto piso. El viaje continúa con normalidad, pero el sonido se repite." },
    { id: 3, titulo: "Luces apagadas en la cochera", categoria: "Iluminación", estado: "Resuelto", fecha: "24/09/26", adjunto: { nombre: "foto1.png", tamano: "245 KB" }, descripcion: "Hay dos luminarias apagadas en el sector de cocheras cercano a la rampa de salida, lo que deja esa zona con poca visibilidad." },
    { id: 4, titulo: "La puerta de acceso no cierra", categoria: "Seguridad", estado: "En revisión", fecha: "19/09/26", descripcion: "La puerta de entrada queda entreabierta después de que alguien ingresa. Parece que el mecanismo de cierre no está encastrando correctamente." },
    { id: 5, titulo: "Limpieza pendiente en la escalera", categoria: "Limpieza", estado: "Respondido", fecha: "12/09/26", descripcion: "La escalera entre los pisos cuarto y quinto está sucia desde hace varios días. También hay marcas en la pared junto al descanso." },
    { id: 6, titulo: "Canilla pierde en el lavadero común", categoria: "Espacios comunes", estado: "Resuelto", fecha: "05/09/26", descripcion: "La canilla del lavadero común gotea incluso cuando está cerrada. El agua cae dentro de la pileta y el desagüe funciona correctamente." },
].map((reclamo) => ({
    ...reclamo,
    periodoFecha: obtenerPeriodoReclamo(reclamo.fecha),
}));

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
const columnasReclamos = [
    {
        clave: "titulo",
        titulo: "Reclamo",
        ancho: "1.5fr",
    },
    { clave: "categoria", titulo: "Categoría", ancho: "1fr" },
    {
        clave: "estado",
        titulo: "Estado",
        ancho: "1fr",
        render: (solicitud) => (
            <small className={`reclamos-badge ${claseEstado(solicitud.estado)}`}>
                {solicitud.estado}
            </small>
        ),
    },
    { clave: "fecha", titulo: "Fecha de publicación", ancho: "1fr" },

];

function Reclamos({ onAbrirChat }) {
    const [reclamos, setReclamos] = useState(reclamosIniciales);
    const [archivoAdjunto, setArchivoAdjunto] = useState("");
    const filtros = useMemo(() => [
        {
            key: "categoria",
            label: "Todas las categorías",
            options: ["Ascensores", "Espacios comunes", "Iluminación", "Limpieza", "Mantenimiento", "Seguridad", "Otros"],
        },
        {
            key: "estado",
            label: "Todos los estados",
            options: ["En revisión", "Respondido", "Resuelto"],
        },
        {
            key: "periodoFecha",
            label: "Todos los períodos",
            options: obtenerOpcionesPeriodo(reclamos),
        },
    ], [reclamos]);

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

        const nuevoReclamo = {
            id: Date.now(),
            titulo: datos.get("asunto").toString(),
            categoria: datos.get("categoria").toString(),
            descripcion: datos.get("descripcion").toString(),
            estado: "En revisión",
            fecha,
            periodoFecha: obtenerPeriodoReclamo(fecha),
        };

        setReclamos((actuales) => [nuevoReclamo, ...actuales]);
        setArchivoAdjunto("");
        event.currentTarget.reset();
    };

    return (
        <main className="reclamos-residente">
                 
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
                            <span>Fecha de publicación</span>
                            <strong>{reclamosSeleccionado.fecha}</strong>
                        </div>

                        <h3>Descripción</h3>

                        <p className="reclamos-resumen-texto">
                            {reclamosSeleccionado.descripcion}
                        </p>

                        <h3>Adjuntos</h3>

                        {reclamosSeleccionado.adjunto ? (
                            <div className="reclamos-adjunto">
                                <Image size={16} />

                                <div className="reclamos-adjunto-info">
                                    <strong>{reclamosSeleccionado.adjunto.nombre}</strong>
                                    <span>Tamaño - {reclamosSeleccionado.adjunto.tamano}</span>
                                </div>

                                <button aria-label="Descargar adjunto">
                                    <Eye size={16} />
                                </button>
                            </div>
                        ) : (
                            <p className="reclamos-sin-adjunto">
                                Sin archivos adjuntos.
                            </p>
                        )}

                        <button className="reclamos-btn-editar">
                            Seguimiento
                        </button>
                    </Panel>
                )}

                <section className="reclamos-residente-principal">
                    <Panel titulo="Crear nuevo reclamo" icono={<SquarePen />}>
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

                        <ChatWidget
                            onAbrir={onAbrirChat}
                            mensajeContextual="¿Necesitás hacer un reclamo? Te ayudo"
                        />
                    </article>
                </aside>
            </section>
        </main>
    );
}

export default Reclamos;