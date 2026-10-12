import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import {
    CalendarDays,
    CircleCheck,
    ChevronLeft,
    ChevronRight,
    Clock3,
    Images,
    Info,
    MapPin,
    Users,
} from "lucide-react";

import imagenPredeterminada from "../../../../assets/img/imagen-predeterminada.png";

import "../Reservas.css";
import "./EspacioReserva.css";
import Panel from "../../../../components/Panel/Panel";
import Modal from "../../../../components/Modal/Modal";
import {
    crearSolicitud,
    listarReservasRegistradas,
    obtenerEspacio,
} from "../../../../services/reservasService";
import {
    formatearFecha,
    formatearRango,
    hoyISO,
    opcionesDesde,
    opcionesHasta,
    seSuperponen,
    todasLasFotos,
} from "../reservasUtils";

/* =========================================================
   GALERÍA DE FOTOS (se abre al hacer clic en el banner)
========================================================= */

function Galeria({ fotos, inicial, titulo, onClose }) {
    const [indice, setIndice] = useState(inicial);

    const anterior = () => setIndice((i) => (i - 1 + fotos.length) % fotos.length);
    const siguiente = () => setIndice((i) => (i + 1) % fotos.length);

    useEffect(() => {
        const alPresionar = (evento) => {
            if (evento.key === "ArrowLeft") setIndice((i) => (i - 1 + fotos.length) % fotos.length);
            if (evento.key === "ArrowRight") setIndice((i) => (i + 1) % fotos.length);
        };

        document.addEventListener("keydown", alPresionar);
        return () => document.removeEventListener("keydown", alPresionar);
    }, [fotos.length]);

    return (
        <Modal titulo={titulo} onClose={onClose} ancho={900}>
            <div className="galeria">
                <button type="button" className="galeria-flecha izquierda" onClick={anterior} aria-label="Foto anterior">
                    <ChevronLeft />
                </button>

                <img src={fotos[indice]} alt={`${titulo} (foto ${indice + 1})`} />

                <button type="button" className="galeria-flecha derecha" onClick={siguiente} aria-label="Foto siguiente">
                    <ChevronRight />
                </button>
            </div>

            <p className="galeria-contador">
                {indice + 1} / {fotos.length}
            </p>
        </Modal>
    );
}


/* =========================================================
   PANTALLA DE UN ESPACIO + SOLICITUD DE RESERVA
========================================================= */

function EspacioReserva() {

    const { id } = useParams();
    const navigate = useNavigate();
    const { state } = useLocation(); // filtros elegidos en la pantalla anterior

    const [espacio, setEspacio] = useState(null);
    const [registradas, setRegistradas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [errorCarga, setErrorCarga] = useState("");

    const [asunto, setAsunto] = useState("");
    const [fecha, setFecha] = useState(state?.fecha ?? "");
    const [desde, setDesde] = useState(state?.desde ?? "");
    const [hasta, setHasta] = useState(state?.hasta ?? "");
    const [entendido, setEntendido] = useState(false);

    const [enviando, setEnviando] = useState(false);
    const [errorEnvio, setErrorEnvio] = useState("");
    const [enviada, setEnviada] = useState(false);

    const [galeriaAbierta, setGaleriaAbierta] = useState(false);

    /* ---------- Carga del espacio y sus reservas registradas ---------- */

    useEffect(() => {
        let activo = true;

        async function cargar() {
            try {
                const [datosEspacio, datosRegistradas] = await Promise.all([
                    obtenerEspacio(id),
                    listarReservasRegistradas(id),
                ]);
                if (!activo) return;

                setEspacio(datosEspacio);
                setRegistradas(datosRegistradas);

                if (datosEspacio) {
                    document.title = `Habita | ${datosEspacio.nombre}`;

                    // Si el horario que venía del filtro no sirve para este espacio, se descarta
                    const inicios = opcionesDesde(datosEspacio);
                    setDesde((actual) => (inicios.includes(actual) ? actual : ""));
                    setHasta((actual) =>
                        opcionesHasta(datosEspacio, state?.desde).includes(actual) ? actual : ""
                    );
                }
            } catch (e) {
                if (activo) setErrorCarga(e.message);
            } finally {
                if (activo) setCargando(false);
            }
        }

        cargar();
        return () => { activo = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);


    /* ---------- Estados de carga ---------- */

    if (cargando) {
        return <main className="espacio-reserva"><p className="reservas-vacio">Cargando espacio...</p></main>;
    }

    if (errorCarga || !espacio) {
        return (
            <main className="espacio-reserva">
                <p className="mensaje-error">{errorCarga || "No encontramos este espacio."}</p>
                <button type="button" className="espacio-volver" onClick={() => navigate("/reservas")}>
                    <ChevronLeft /> Volver a reservas
                </button>
            </main>
        );
    }


    /* ---------- Datos calculados ---------- */

    const fotos = todasLasFotos(espacio, imagenPredeterminada);
    const inicios = opcionesDesde(espacio);
    const finales = opcionesHasta(espacio, desde);

    // Espacios por turnos (ej: Laundry): no se pide asunto ni horario de fin.
    // El fin se calcula solo: inicio + duración del turno.
    const esPorTurnos = Boolean(espacio.duracion_turno_min);
    const horaFin = esPorTurnos ? (finales[0] ?? "") : hasta;

    const choque = registradas.some(
        (r) => fecha && desde && horaFin &&
            r.fecha === fecha &&
            seSuperponen(r.hora_inicio, r.hora_fin, desde, horaFin)
    );

    function cambiarDesde(nuevoDesde) {
        setDesde(nuevoDesde);
        const nuevasOpciones = opcionesHasta(espacio, nuevoDesde);
        if (!nuevasOpciones.includes(hasta)) setHasta(nuevasOpciones[0] ?? "");
    }

    async function enviar(evento) {
        evento.preventDefault();
        setErrorEnvio("");

        if (!fecha || !desde || !horaFin) {
            setErrorEnvio(
                esPorTurnos
                    ? "Completá el día y el horario de tu turno."
                    : "Completá la fecha y el horario de la reserva."
            );
            return;
        }
        if (choque) {
            setErrorEnvio("Ese horario ya está reservado. Elegí otro.");
            return;
        }
        if (!entendido) {
            setErrorEnvio("Confirmá que revisaste las reservas registradas antes de enviar.");
            return;
        }

        setEnviando(true);
        try {
            await crearSolicitud({
                espacioId: espacio.id,
                asunto: esPorTurnos ? `Uso de ${espacio.nombre}` : asunto,
                fecha,
                horaInicio: desde,
                horaFin,
            });
            setEnviada(true);
        } catch (e) {
            setErrorEnvio(e.message);
        } finally {
            setEnviando(false);
        }
    }


    return (
        <main className="espacio-reserva">

            <button type="button" className="espacio-volver" onClick={() => navigate("/reservas")}>
                <ChevronLeft />
                Volver a reservas
            </button>

            {/* =========================
                BANNER
            ========================= */}

            <section
                className={`espacio-banner ${fotos.length > 1 ? "con-galeria" : ""}`}
                onClick={() => fotos.length > 1 && setGaleriaAbierta(true)}
            >
                <img src={fotos[0]} alt={espacio.nombre} />

                <div className="espacio-banner-degradado" />

                <div className="espacio-banner-texto">
                    <h1>{espacio.nombre}</h1>

                    <span>
                        <MapPin />
                        {espacio.lugar}
                    </span>
                </div>

                {fotos.length > 1 && (
                    <button
                        type="button"
                        className="espacio-banner-fotos"
                        onClick={(e) => { e.stopPropagation(); setGaleriaAbierta(true); }}
                    >
                        <Images />
                        Ver {fotos.length} fotos
                    </button>
                )}
            </section>

            <section className="espacio-contenido">

                {/* =========================
                    COLUMNA PRINCIPAL
                ========================= */}

                <div className="espacio-columna">

                    <Panel titulo="Información del espacio" descripcion="Conocé el espacio antes de reservarlo">

                        {espacio.descripcion && (
                            <p className="espacio-descripcion">{espacio.descripcion}</p>
                        )}

                        <dl className="espacio-datos">
                            <div>
                                <dt><MapPin /> Lugar</dt>
                                <dd>{espacio.lugar}</dd>
                            </div>

                            <div>
                                <dt><Users /> Capacidad</dt>
                                <dd>{espacio.capacidad} personas</dd>
                            </div>

                            <div>
                                <dt><Clock3 /> Horarios disponibles</dt>
                                <dd>
                                    {formatearRango(espacio.hora_apertura, espacio.hora_cierre)}
                                    {espacio.duracion_turno_min
                                        ? ` · Turnos de ${espacio.duracion_turno_min} min`
                                        : ""}
                                </dd>
                            </div>

                            {espacio.ambientes && (
                                <div>
                                    <dt><Info /> Ambientes</dt>
                                    <dd>{espacio.ambientes}</dd>
                                </div>
                            )}
                        </dl>

                        {espacio.reglas?.length > 0 && (
                            <>
                                <h3 className="espacio-subtitulo">Reglas y restricciones</h3>

                                <ul className="espacio-reglas">
                                    {espacio.reglas.map((regla) => (
                                        <li key={regla}>{regla}</li>
                                    ))}
                                </ul>
                            </>
                        )}
                    </Panel>

                    <hr className="espacio-separador" />

                    {/* =========================
                        SOLICITUD DE RESERVA
                    ========================= */}

                    <Panel titulo="Solicitud de reserva" descripcion="Completá los datos y enviá tu solicitud a la administración">

                        {enviada ? (
                            <div className="solicitud-exito">
                                <CircleCheck />

                                <strong>¡Solicitud enviada!</strong>

                                <p>
                                    La administración la va a revisar y aceptar por orden de llegada.
                                    Mientras tanto vas a verla como <em>pendiente</em> en tus reservas.
                                </p>

                                <button type="button" className="btn-solicitar" onClick={() => navigate("/reservas")}>
                                    Volver a mis reservas
                                </button>
                            </div>
                        ) : (
                            <form className="form-reserva" onSubmit={enviar}>

                                {!esPorTurnos && (
                                    <div className="campo-reserva">
                                        <label htmlFor="sol-asunto">Asunto</label>
                                        <input
                                            id="sol-asunto"
                                            type="text"
                                            maxLength={120}
                                            placeholder="Ej: cumpleaños, reunión..."
                                            value={asunto}
                                            onChange={(e) => setAsunto(e.target.value)}
                                        />
                                    </div>
                                )}

                                <div className="campo-reserva">
                                    <label htmlFor="sol-fecha">{esPorTurnos ? "Día de uso" : "Fecha"}</label>
                                    <input
                                        id="sol-fecha"
                                        type="date"
                                        min={hoyISO()}
                                        value={fecha}
                                        onChange={(e) => setFecha(e.target.value)}
                                    />
                                </div>

                                <div className={esPorTurnos ? "" : "fila-doble"}>
                                    <div className="campo-reserva">
                                        <label htmlFor="sol-desde">
                                            {esPorTurnos ? "Horario de uso" : "Horario de inicio"}
                                        </label>
                                        <select
                                            id="sol-desde"
                                            value={desde}
                                            onChange={(e) => cambiarDesde(e.target.value)}
                                        >
                                            <option value="">Elegí un horario</option>
                                            {inicios.map((hora) => (
                                                <option key={hora} value={hora}>{hora}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {!esPorTurnos && (
                                        <div className="campo-reserva">
                                            <label htmlFor="sol-hasta">Horario de fin</label>
                                            <select
                                                id="sol-hasta"
                                                value={hasta}
                                                onChange={(e) => setHasta(e.target.value)}
                                                disabled={!desde}
                                            >
                                                <option value="">Elegí un horario</option>
                                                {finales.map((hora) => (
                                                    <option key={hora} value={hora}>{hora}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>

                                {esPorTurnos && (
                                    <p className="texto-turno">
                                        Cada turno dura {espacio.duracion_turno_min >= 60 && espacio.duracion_turno_min % 60 === 0
                                            ? `${espacio.duracion_turno_min / 60} h`
                                            : `${espacio.duracion_turno_min} min`}
                                        {desde && horaFin ? ` · Tu turno: ${desde} a ${horaFin}` : ""}
                                    </p>
                                )}

                                {choque && (
                                    <p className="mensaje-error">
                                        Ese horario se superpone con una reserva ya registrada. Elegí otro.
                                    </p>
                                )}

                                <label className="solicitud-confirmacion">
                                    <input
                                        type="checkbox"
                                        checked={entendido}
                                        onChange={(e) => setEntendido(e.target.checked)}
                                    />
                                    <span>
                                        Revisé las reservas registradas y entiendo que la administración
                                        no se hará cargo de rechazar solicitudes en horarios ya ocupados.
                                    </span>
                                </label>

                                {errorEnvio && <p className="mensaje-error">{errorEnvio}</p>}

                                <button type="submit" className="btn-solicitar" disabled={enviando}>
                                    {enviando ? "Enviando..." : "Enviar solicitud"}
                                </button>
                            </form>
                        )}
                    </Panel>
                </div>

                {/* =========================
                    COLUMNA LATERAL
                ========================= */}

                <aside className="espacio-columna">

                    <Panel titulo="Reservas registradas" descripcion="Horarios que ya están ocupados">
                        {registradas.length === 0 ? (
                            <p className="reservas-vacio">No hay reservas confirmadas próximas.</p>
                        ) : (
                            <ul className="registradas-lista">
                                {registradas.map((r) => {
                                    const coincide = fecha === r.fecha;

                                    return (
                                        <li
                                            key={`${r.fecha}-${r.hora_inicio}`}
                                            className={coincide ? "resaltada" : ""}
                                        >
                                            <span>
                                                <CalendarDays />
                                                {formatearFecha(r.fecha)}
                                            </span>

                                            <span>
                                                <Clock3 />
                                                {formatearRango(r.hora_inicio, r.hora_fin)}
                                            </span>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </Panel>

                    <Panel titulo="Reglas de uso" descripcion="Tenelas en cuenta al reservar">
                        <ul className="espacio-reglas">
                            <li>Respetar los horarios asignados.</li>
                            <li>Dejar el espacio en condiciones.</li>
                            <li>Las reservas se cancelan con 24 h de anticipación.</li>
                            <li>Las solicitudes se aceptan por orden de llegada.</li>
                        </ul>
                    </Panel>

                </aside>

            </section>

            {galeriaAbierta && (
                <Galeria
                    fotos={fotos}
                    inicial={0}
                    titulo={espacio.nombre}
                    onClose={() => setGaleriaAbierta(false)}
                />
            )}

        </main>
    );
}

export default EspacioReserva;
