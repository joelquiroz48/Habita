import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    CalendarDays,
    Clock3,
    Users,
    Eye,
    Pencil,
    X,
    ChevronRight,
    ChevronLeft,
    CircleHelp,
    Info,
    Search,
} from "lucide-react";

import imagenPredeterminada from "../../../assets/img/imagen-predeterminada.png";

import "./Reservas.css";
import TarjetaResumen from "../../../components/TarjetaResumen/TarjetaResumen";
import Panel from "../../../components/Panel/Panel";
import ChatWidget from "../../../components/Layout/ChatWidget/ChatWidget";
import {
    ModalCancelarReserva,
    ModalDetalleReserva,
    ModalModificarSolicitud,
} from "./ModalesReserva";
import {
    ESTADOS,
    fotoPrincipal,
    formatearFecha,
    formatearFechaCorta,
    formatearRango,
    hoyISO,
    horasHastaInicio,
    moverMes,
    nombreDeMes,
    opcionesDeHorario,
    partesDeFecha,
} from "./reservasUtils";
import {
    contarHistorialDelMes,
    listarEspaciosDisponibles,
    listarReservasActivas,
    listarReservasDelMes,
    obtenerUsuarioId,
} from "../../../services/reservasService";

const FILTRO_VACIO = { fecha: "", desde: "", hasta: "", capacidad: "" };
const HORARIOS = opcionesDeHorario("06:00", "23:30");

/* Preguntas frecuentes del panel "Ayuda sobre reservas" */
const PREGUNTAS = [
    {
        titulo: "¿Cómo reservo el SUM?",
        resumen: "Conocé el proceso para realizar una reserva.",
        icono: CircleHelp,
        respuesta: (
            <ol>
                <li>Buscá el espacio en <strong>"Espacios disponibles"</strong> (podés filtrar por fecha, horario y capacidad) y tocá <strong>Reservar</strong>.</li>
                <li>Completá el asunto, la fecha y el horario, y revisá las reservas ya registradas para no elegir un horario ocupado.</li>
                <li>Marcá la casilla de confirmación y enviá la solicitud.</li>
                <li>La administración la revisa y las acepta por orden de llegada. Mientras tanto la vas a ver como <strong>Pendiente</strong> en tus reservas.</li>
            </ol>
        ),
    },
    {
        titulo: "Políticas de cancelación",
        resumen: "Consultá cuándo podés cancelar una reserva.",
        icono: CalendarDays,
        respuesta: (
            <ul>
                <li>Una reserva <strong>confirmada</strong> se puede cancelar hasta <strong>24 horas antes</strong> de su inicio.</li>
                <li>Si faltan menos de 24 horas, ya no se puede cancelar desde la app: comunicate con la administración.</li>
                <li>Una solicitud <strong>pendiente</strong> se puede modificar o cancelar mientras la administración no la haya resuelto.</li>
                <li>Al cancelar, el horario queda libre para que otro vecino pueda pedirlo.</li>
            </ul>
        ),
    },
    {
        titulo: "Espacios y horarios disponibles",
        resumen: "Revisá las condiciones de cada espacio.",
        icono: Info,
        respuesta: (
            <ul>
                <li>Cada espacio tiene su propio <strong>horario de apertura y cierre</strong> y su <strong>capacidad máxima</strong>. Los ves en la tarjeta del espacio.</li>
                <li>Algunos espacios, como el Laundry, funcionan por <strong>turnos fijos</strong>: elegís el día y la hora de inicio, y el turno dura siempre lo mismo.</li>
                <li>No se pueden reservar fechas pasadas ni horarios que ya estén ocupados por una reserva confirmada.</li>
                <li>Cada espacio tiene además sus propias reglas de uso. Las encontrás al entrar a su pantalla.</li>
            </ul>
        ),
    },
];

function Reservas({ onAbrirChat }) {

    const navigate = useNavigate();
    const [preguntaAbierta, setPreguntaAbierta] = useState(null);

    /* ---------- Datos ---------- */
    const [reservasActivas, setReservasActivas] = useState([]);
    const [historialMes, setHistorialMes] = useState(0);
    const [espaciosHoy, setEspaciosHoy] = useState(0);
    const [espacios, setEspacios] = useState([]);
    const [reservasDelMes, setReservasDelMes] = useState([]);

    /* ---------- Filtro de espacios ---------- */
    const [filtro, setFiltro] = useState(FILTRO_VACIO);
    const [filtroAplicado, setFiltroAplicado] = useState(FILTRO_VACIO);
    const [errorFiltro, setErrorFiltro] = useState("");

    /* ---------- Calendario resumido ---------- */
    const [mesVisible, setMesVisible] = useState(() => {
        const hoy = new Date();
        return { anio: hoy.getFullYear(), mes: hoy.getMonth() };
    });

    /* ---------- Estado de la pantalla ---------- */
    const [usuarioId, setUsuarioId] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [errorEspacios, setErrorEspacios] = useState("");
    const [ventana, setVentana] = useState(null); // { tipo, reserva }

    useEffect(() => {
        document.title = "Habita | Reservas";
    }, []);


    /* =========================
        CARGA DE DATOS
    ========================= */

    const cargarReservas = useCallback(async () => {
        const id = await obtenerUsuarioId();
        setUsuarioId(id);

        if (!id) {
            setReservasActivas([]);
            setHistorialMes(0);
            return;
        }

        const hoy = hoyISO();
        const [activas, historial] = await Promise.all([
            listarReservasActivas(id, hoy),
            contarHistorialDelMes(id, hoy),
        ]);
        setReservasActivas(activas);
        setHistorialMes(historial);
    }, []);

    const cargarCalendario = useCallback(async () => {
        const id = await obtenerUsuarioId();
        if (!id) {
            setReservasDelMes([]);
            return;
        }
        setReservasDelMes(
            await listarReservasDelMes(id, mesVisible.anio, mesVisible.mes)
        );
    }, [mesVisible]);

    // Reservas del usuario + tarjetas superiores
    useEffect(() => {
        let activo = true;

        async function iniciar() {
            try {
                await cargarReservas();
                const disponiblesHoy = await listarEspaciosDisponibles({ fecha: hoyISO() });
                if (activo) setEspaciosHoy(disponiblesHoy.length);
            } catch (e) {
                if (activo) setError(e.message);
            } finally {
                if (activo) setCargando(false);
            }
        }

        iniciar();
        return () => { activo = false; };
    }, [cargarReservas]);

    // Calendario resumido (se recarga al cambiar de mes)
    useEffect(() => {
        let activo = true;

        cargarCalendario().catch((e) => {
            if (activo) setError(e.message);
        });

        return () => { activo = false; };
    }, [cargarCalendario]);

    // Espacios comunes (se recarga al aplicar el filtro)
    useEffect(() => {
        let activo = true;

        listarEspaciosDisponibles(filtroAplicado)
            .then((lista) => {
                if (activo) {
                    setEspacios(lista);
                    setErrorEspacios("");
                }
            })
            .catch((e) => {
                if (activo) setErrorEspacios(e.message);
            });

        return () => { activo = false; };
    }, [filtroAplicado]);


    /* =========================
        FILTRO DE ESPACIOS
    ========================= */

    function cambiarFiltro(campo, valor) {
        setFiltro((actual) => ({ ...actual, [campo]: valor }));
    }

    function aplicarFiltro(evento) {
        evento.preventDefault();
        setErrorFiltro("");

        const { fecha, desde, hasta } = filtro;

        if ((desde && !hasta) || (!desde && hasta)) {
            setErrorFiltro("Elegí el horario completo: desde y hasta.");
            return;
        }
        if (desde && hasta && hasta <= desde) {
            setErrorFiltro("El horario final tiene que ser posterior al inicial.");
            return;
        }
        if (desde && !fecha) {
            setErrorFiltro("Para filtrar por horario elegí también una fecha.");
            return;
        }

        setFiltroAplicado(filtro);
    }

    function limpiarFiltro() {
        setFiltro(FILTRO_VACIO);
        setFiltroAplicado(FILTRO_VACIO);
        setErrorFiltro("");
    }

    const hayFiltro = Object.values(filtroAplicado).some(Boolean);


    /* =========================
        ACCIONES SOBRE RESERVAS
    ========================= */

    function cerrarVentana() {
        setVentana(null);
    }

    async function alTerminarAccion() {
        setVentana(null);
        try {
            await Promise.all([cargarReservas(), cargarCalendario()]);
        } catch (e) {
            setError(e.message);
        }
    }

    function irAlEspacio(espacio) {
        navigate(`/reservas/espacio/${espacio.id}`, {
            state: {
                fecha: filtroAplicado.fecha,
                desde: filtroAplicado.desde,
                hasta: filtroAplicado.hasta,
            },
        });
    }

    function irAlCalendario(reserva) {
        const mes = reserva.fecha.slice(0, 7);
        navigate(`/reservas/calendario?mes=${mes}&reserva=${reserva.id}`);
    }


    /* =========================
        TARJETAS RESUMEN
    ========================= */

    const confirmadas = reservasActivas.filter((r) => r.estado === "confirmada");
    const pendientes = reservasActivas.filter((r) => r.estado === "pendiente");

    const proxima = confirmadas.find(
        (r) => horasHastaInicio(r.fecha, r.hora_inicio) >= 0
    );

    const resumenReservas = [
        {
            titulo: "Reservas activas",
            valor: String(reservasActivas.length),
            detalle: `${confirmadas.length} ${confirmadas.length === 1 ? "confirmada" : "confirmadas"} · ${pendientes.length} ${pendientes.length === 1 ? "pendiente" : "pendientes"}`,
            icono: CalendarDays,
        },
        {
            titulo: "Próxima reserva",
            valor: proxima ? formatearFechaCorta(proxima.fecha) : "—",
            detalle: proxima
                ? `${proxima.espacio.nombre} · ${formatearRango(proxima.hora_inicio, proxima.hora_fin)}`
                : "Sin reservas confirmadas",
            icono: CalendarDays,
        },
        {
            titulo: "Espacios disponibles hoy",
            valor: String(espaciosHoy),
            detalle: "Disponibles para reservar",
            icono: Users,
        },
        {
            titulo: "Historial del mes",
            valor: String(historialMes),
            detalle: "Reservas realizadas",
            icono: Clock3,
        },
    ];

    // Calendario resumido: solo las primeras 4 reservas del mes
    const reservasCalendario = reservasDelMes.slice(0, 4);


    return (
        <main className="reservas">

            {error && <p className="mensaje-error reservas-aviso">{error}</p>}

            {!cargando && !usuarioId && (
                <p className="reservas-aviso reservas-aviso-info">
                    No hay una sesión iniciada, por eso no se muestran tus reservas.
                </p>
            )}

            {/* =========================
                RESUMEN SUPERIOR
            ========================= */}

            <section className="reservas-resumen">
                {resumenReservas.map((item) => {
                    const Icono = item.icono;
                    return (
                        <TarjetaResumen
                            key={item.titulo}
                            icono={<Icono />}
                            titulo={item.titulo}
                            valor={item.valor}
                            contenido={
                                <span className="resumen-info">
                                    {item.detalle}
                                </span>
                            }
                        />
                    );
                })}
            </section>

            {/* =========================
                CONTENIDO PRINCIPAL
            ========================= */}

            <section className="reservas-contenido">

                {/* =========================
                    COLUMNA IZQUIERDA
                ========================= */}

                <section className="reservas-columna">

                    {/* MIS RESERVAS */}

                    <Panel
                        titulo="Mis reservas activas"
                        descripcion="Consultá y administrá tus próximas reservas"
                        className="mis-reservas"
                    >
                        <div className="reservas-lista">

                            {!cargando && reservasActivas.length === 0 && (
                                <p className="reservas-vacio">
                                    No tenés reservas activas. Elegí un espacio para enviar una solicitud.
                                </p>
                            )}

                            {reservasActivas.map((reserva) => {
                                const estado = ESTADOS[reserva.estado];

                                return (
                                    <div className="reserva-card" key={reserva.id}>
                                        <div className="reserva-card-imagen">
                                            <img
                                                src={fotoPrincipal(reserva.espacio, imagenPredeterminada)}
                                                alt={reserva.espacio.nombre}
                                            />
                                        </div>

                                        <div className="reserva-card-info">

                                            <div className="reserva-card-titulo">
                                                <strong>{reserva.espacio.nombre}</strong>

                                                <small className={estado.clase}>
                                                    {estado.etiqueta}
                                                </small>
                                            </div>

                                            <div className="reserva-card-datos">
                                                <span>
                                                    <CalendarDays />
                                                    {formatearFecha(reserva.fecha)}
                                                </span>

                                                <span>
                                                    <Clock3 />
                                                    {formatearRango(reserva.hora_inicio, reserva.hora_fin)}
                                                </span>
                                            </div>

                                        </div>

                                        <div className="reserva-card-acciones">
                                            <button
                                                type="button"
                                                onClick={() => setVentana({ tipo: "detalle", reserva })}
                                            >
                                                <Eye />
                                                Ver detalle
                                            </button>

                                            {/* Confirmada: solo se puede cancelar */}
                                            {reserva.estado === "confirmada" && (
                                                <button
                                                    type="button"
                                                    className="btn-cancelar"
                                                    onClick={() => setVentana({ tipo: "cancelar", reserva })}
                                                >
                                                    <X />
                                                    Cancelar
                                                </button>
                                            )}

                                            {/* Pendiente: se puede modificar (o cancelar desde ahí) */}
                                            {reserva.estado === "pendiente" && (
                                                <button
                                                    type="button"
                                                    onClick={() => setVentana({ tipo: "modificar", reserva })}
                                                >
                                                    <Pencil />
                                                    Modificar
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Panel>

                    {/* ESPACIOS DISPONIBLES */}

                    <Panel
                        titulo="Espacios comunes disponibles"
                        descripcion={
                            hayFiltro
                                ? "Espacios que cumplen con tu búsqueda"
                                : "Elegí un espacio para realizar una reserva"
                        }
                        className="espacios-disponibles"
                    >
                        {errorEspacios && <p className="mensaje-error">{errorEspacios}</p>}

                        {!errorEspacios && espacios.length === 0 && (
                            <p className="reservas-vacio">
                                {hayFiltro
                                    ? "No hay espacios disponibles con esos filtros. Probá con otra fecha u horario."
                                    : "Por ahora no hay espacios comunes cargados."}
                            </p>
                        )}

                        <div className="espacios-grid">
                            {espacios.map((espacio) => (
                                <div className="espacio-card" key={espacio.id}>
                                    <div className="espacio-imagen">
                                        <img
                                            src={fotoPrincipal(espacio, imagenPredeterminada)}
                                            alt={espacio.nombre}
                                        />
                                    </div>

                                    <div className="espacio-info">
                                        <strong>{espacio.nombre}</strong>

                                        <button type="button" onClick={() => irAlEspacio(espacio)}>
                                            Reservar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Panel>

                    {/* AYUDA */}

                    <Panel titulo="Ayuda sobre reservas" descripcion="Información útil para reservar espacios" className="ayuda-reservas">
                        {PREGUNTAS.map((pregunta, i) => {
                            const abierta = preguntaAbierta === i;
                            const Icono = pregunta.icono;

                            return (
                                <div key={pregunta.titulo} className={`ayuda-reserva-item ${abierta ? "abierta" : ""}`}>
                                    <button
                                        type="button"
                                        className="ayuda-reserva-cabecera"
                                        aria-expanded={abierta}
                                        onClick={() => setPreguntaAbierta(abierta ? null : i)}
                                    >
                                        <div className="ayuda-reserva-icon"><Icono /></div>

                                        <div className="ayuda-reserva-textos">
                                            <strong>{pregunta.titulo}</strong>
                                            <span>{pregunta.resumen}</span>
                                        </div>

                                        <ChevronRight className="ayuda-reserva-flecha" />
                                    </button>

                                    {abierta && (
                                        <div className="ayuda-reserva-respuesta">
                                            {pregunta.respuesta}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </Panel>

                </section>

                {/* =========================
                      COLUMNA DERECHA
                ========================= */}

                <section className="reservas-columna">

                    {/* FILTRO DE ESPACIOS */}

                    <Panel
                        titulo="Buscar espacio"
                        descripcion="Filtrá por fecha, horario y capacidad"
                        className="nueva-reserva"
                    >
                        <form className="form-reserva" onSubmit={aplicarFiltro}>
                            <div className="campo-reserva">
                                <label htmlFor="filtro-fecha">Fecha</label>
                                <input
                                    id="filtro-fecha"
                                    type="date"
                                    min={hoyISO()}
                                    value={filtro.fecha}
                                    onChange={(e) => cambiarFiltro("fecha", e.target.value)}
                                />
                            </div>

                            <div className="fila-doble">
                                <div className="campo-reserva">
                                    <label htmlFor="filtro-desde">Desde</label>
                                    <select
                                        id="filtro-desde"
                                        value={filtro.desde}
                                        onChange={(e) => cambiarFiltro("desde", e.target.value)}
                                    >
                                        <option value="">Cualquiera</option>
                                        {HORARIOS.map((hora) => (
                                            <option key={hora} value={hora}>{hora}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="campo-reserva">
                                    <label htmlFor="filtro-hasta">Hasta</label>
                                    <select
                                        id="filtro-hasta"
                                        value={filtro.hasta}
                                        onChange={(e) => cambiarFiltro("hasta", e.target.value)}
                                    >
                                        <option value="">Cualquiera</option>
                                        {HORARIOS.map((hora) => (
                                            <option key={hora} value={hora}>{hora}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="campo-reserva">
                                <label htmlFor="filtro-capacidad">Capacidad (personas)</label>
                                <input
                                    id="filtro-capacidad"
                                    type="number"
                                    min="1"
                                    placeholder="Cualquiera"
                                    value={filtro.capacidad}
                                    onChange={(e) => cambiarFiltro("capacidad", e.target.value)}
                                />
                            </div>

                            {errorFiltro && <p className="mensaje-error">{errorFiltro}</p>}

                            <button type="submit" className="btn-solicitar">
                                <Search />
                                Buscar espacios
                            </button>

                            <button type="button" className="btn-limpiar" onClick={limpiarFiltro}>
                                Limpiar filtros
                            </button>
                        </form>

                        <div className="reglas-reserva">
                            <div className="reglas-icono"><Info /></div>

                            <div>
                                <strong>Reglas de uso</strong>

                                <ul>
                                    <li>Respetar los horarios asignados.</li>
                                    <li>Dejar el espacio en condiciones.</li>
                                    <li>Las reservas se cancelan con 24 h de anticipación.</li>
                                </ul>
                            </div>
                        </div>
                    </Panel>

                    {/* CALENDARIO */}

                    <Panel titulo="Calendario de reservas" descripcion="Tus reservas de cada mes" className="calendario-reservas">
                        <div className="calendario-mes">
                            <button
                                type="button"
                                aria-label="Mes anterior"
                                onClick={() => setMesVisible((m) => moverMes(m, -1))}
                            >
                                <ChevronLeft />
                            </button>

                            <strong>{nombreDeMes(mesVisible.anio, mesVisible.mes)}</strong>

                            <button
                                type="button"
                                aria-label="Mes siguiente"
                                onClick={() => setMesVisible((m) => moverMes(m, 1))}
                            >
                                <ChevronRight />
                            </button>
                        </div>

                        <div className="eventos-reservas">
                            {reservasCalendario.length === 0 && (
                                <p className="reservas-vacio">No hay reservas en este mes.</p>
                            )}

                            {reservasCalendario.map((reserva) => {
                                const { dia, numero } = partesDeFecha(reserva.fecha);
                                const estado = ESTADOS[reserva.estado];

                                return (
                                    <button
                                        type="button"
                                        className="evento-reserva"
                                        key={reserva.id}
                                        onClick={() => irAlCalendario(reserva)}
                                    >
                                        <div className="evento-fecha-reserva">
                                            <span>{dia}</span>
                                            <strong>{numero}</strong>
                                        </div>

                                        <div className="evento-info-reserva">
                                            <span>{formatearRango(reserva.hora_inicio, reserva.hora_fin)}</span>
                                            <strong>{reserva.espacio.nombre}</strong>
                                        </div>

                                        <small className={estado.clase}>
                                            {estado.etiqueta}
                                        </small>
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            type="button"
                            className="link-calendario"
                            onClick={() =>
                                navigate(
                                    `/reservas/calendario?mes=${mesVisible.anio}-${String(mesVisible.mes + 1).padStart(2, "0")}`
                                )
                            }
                        >
                            Ver calendario completo
                            <ChevronRight />
                        </button>
                    </Panel>

                    <Panel titulo="Asistente Habita" className="asistente-reservas">
                        <ChatWidget onAbrir={onAbrirChat} />
                    </Panel>

                </section>

            </section>

            {/* =========================
                VENTANAS EMERGENTES
            ========================= */}

            {ventana?.tipo === "detalle" && (
                <ModalDetalleReserva reserva={ventana.reserva} onClose={cerrarVentana} />
            )}

            {ventana?.tipo === "cancelar" && (
                <ModalCancelarReserva
                    reserva={ventana.reserva}
                    onClose={cerrarVentana}
                    onCancelada={alTerminarAccion}
                />
            )}

            {ventana?.tipo === "modificar" && (
                <ModalModificarSolicitud
                    reserva={ventana.reserva}
                    onClose={cerrarVentana}
                    onGuardada={alTerminarAccion}
                    onCancelada={alTerminarAccion}
                />
            )}

        </main>
    );
}


export default Reservas;
