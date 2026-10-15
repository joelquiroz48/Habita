import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    WalletCards,
    CalendarDays,
    CalendarCheck,
    Megaphone,
    Clock3,
    MapPin,
    CircleAlert,
    Wrench,
    Users,
    Sparkles,
    Building2,
} from "lucide-react";

import imagenPredeterminada from "../../../assets/img/imagen-predeterminada.png";
import "./Inicio.css";
import "./InicioNuevo.css";
import TarjetaResumen from "../../../components/TarjetaResumen/TarjetaResumen";
import Panel from "../../../components/Panel/Panel";
import { usePerfil } from "../../../context/PerfilContext";
import { cargarInicio } from "../../../services/inicioService";
import { diasHasta } from "../../../utils/formatos";
import {
    ESTADOS,
    fotoPrincipal,
    formatearFecha,
    formatearFechaCorta,
    formatearHora,
    formatearRango,
    partesDeFecha,
} from "../Reservas/reservasUtils";

/* Ruta del calendario comunitario */
const RUTA_CALENDARIO = "/calendario";

const ICONO_EVENTO = {
    REUNION: Users,
    MANTENIMIENTO: Wrench,
    SOCIAL: Sparkles,
    OTRO: CalendarDays,
};

const CLASE_ESTADO_EXPENSA = {
    Pagada: "ini-estado-verde",
    Pendiente: "ini-estado-amarillo",
    Vencida: "ini-estado-rojo",
};

function saludo() {
    const hora = Number(new Intl.DateTimeFormat("es-AR", {
        hour: "numeric", hour12: false, timeZone: "America/Argentina/Buenos_Aires",
    }).format(new Date()));
    if (hora < 6) return "Buenas noches";
    if (hora < 13) return "Buen día";
    if (hora < 20) return "Buenas tardes";
    return "Buenas noches";
}

function fechaDeHoy() {
    const texto = new Intl.DateTimeFormat("es-AR", {
        weekday: "long", day: "numeric", month: "long", timeZone: "America/Argentina/Buenos_Aires",
    }).format(new Date());
    return texto.charAt(0).toLocaleUpperCase("es-AR") + texto.slice(1);
}

function textoDias(dias) {
    if (dias === 0) return "hoy";
    if (dias === 1) return "mañana";
    return `en ${dias} días`;
}

function horarioEvento(evento) {
    if (!evento.horaInicio) return "Todo el día";
    return evento.horaFin
        ? formatearRango(evento.horaInicio, evento.horaFin)
        : `${formatearHora(evento.horaInicio)} h`;
}

/* Alertas que conviene ver apenas se entra */
function armarAlertas(datos) {
    const alertas = [];
    const expensa = datos?.expensas?.datos;

    if (expensa && !expensa.alDia && expensa.expensa) {
        const dias = diasHasta(expensa.expensa.vencimientoISO);
        if (expensa.expensa.estado === "Vencida") {
            alertas.push({
                tono: "rojo",
                texto: `Tu expensa de ${expensa.expensa.periodo} está vencida (venció el ${expensa.expensa.vencimiento}).`,
                enlace: { texto: "Pagar ahora", to: "/expensas" },
            });
        } else if (dias !== null && dias <= 5) {
            alertas.push({
                tono: "amarillo",
                texto: `Tu expensa de ${expensa.expensa.periodo} vence ${textoDias(dias)} (${expensa.expensa.vencimiento}).`,
                enlace: { texto: "Ver expensa", to: "/expensas" },
            });
        }
    }

    const avisos = datos?.avisos?.datos;
    if (avisos?.importantesSinLeer > 0) {
        alertas.push({
            tono: "azul",
            texto: avisos.importantesSinLeer === 1
                ? "Tenés 1 aviso importante sin leer."
                : `Tenés ${avisos.importantesSinLeer} avisos importantes sin leer.`,
            enlace: { texto: "Ver avisos", to: "/avisos" },
        });
    }

    return alertas;
}

/* Contenido de un panel según cargue, falle o venga vacío */
function Estado({ seccion, vacio, hayDatos, children }) {
    if (!seccion) return <p className="ini-mensaje">Cargando...</p>;
    if (seccion.error) return <p className="ini-mensaje ini-mensaje-error">No pudimos cargar esta sección. Probá de nuevo más tarde.</p>;
    if (!hayDatos) return <p className="ini-mensaje">{vacio}</p>;
    return children;
}

function Inicio() {
    const { perfil } = usePerfil();
    const [datos, setDatos] = useState(null);

    useEffect(() => {
        document.title = "Habita | Inicio";
    }, []);

    useEffect(() => {
        let cancelado = false;
        cargarInicio()
            .then((resultado) => { if (!cancelado) setDatos(resultado); })
            .catch((err) => {
                console.error("No se pudo cargar el inicio", err);
                if (!cancelado) {
                    setDatos({
                        expensas: { error: true }, reservas: { error: true }, avisos: { error: true },
                        reclamos: { error: true }, eventos: { error: true },
                    });
                }
            });
        return () => { cancelado = true; };
    }, []);

    const nombre = perfil?.nombre?.trim().split(/\s+/)[0] ?? "";
    const alertas = armarAlertas(datos);

    /* ---------- Tarjetas superiores ---------- */
    const expensas = datos?.expensas;
    const reservas = datos?.reservas;
    const avisos = datos?.avisos;
    const eventos = datos?.eventos;

    const tarjetaExpensas = (() => {
        if (!expensas) return { valor: "...", contenido: null };
        if (expensas.error) return { valor: "—", contenido: <span className="resumen-info">No pudimos cargarlas</span> };
        const { expensa, alDia } = expensas.datos;
        if (!expensa) return { valor: "—", contenido: <span className="resumen-info">Todavía no hay expensas</span> };
        if (alDia) {
            return {
                valor: "Al día",
                contenido: (
                    <>
                        <span className="resumen-info">Última: {expensa.periodo}</span>
                        <span className={`ini-estado ${CLASE_ESTADO_EXPENSA.Pagada}`}>Pagada</span>
                    </>
                ),
            };
        }
        return {
            valor: expensa.importe,
            contenido: (
                <>
                    <span className={expensa.estado === "Vencida" ? "ini-vencida" : "vencimiento"}>
                        {expensa.estado === "Vencida" ? "Venció" : "Vence"} el {expensa.vencimiento}
                    </span>
                    <span className={`ini-estado ${CLASE_ESTADO_EXPENSA[expensa.estado]}`}>{expensa.estado}</span>
                </>
            ),
        };
    })();

    const tarjetaReunion = (() => {
        if (!eventos) return { valor: "...", contenido: null };
        if (eventos.error) return { valor: "—", contenido: <span className="resumen-info">No pudimos cargarla</span> };
        const reunion = eventos.datos.proximaReunion;
        if (!reunion) return { valor: "—", contenido: <span className="resumen-info">Sin reuniones programadas</span> };
        return {
            valor: formatearFecha(reunion.fecha),
            contenido: (
                <>
                    <span className="resumen-info">{reunion.titulo}</span>
                    <span className="resumen-info">
                        {horarioEvento(reunion)}{reunion.lugar ? ` · ${reunion.lugar}` : ""}
                    </span>
                </>
            ),
        };
    })();

    const tarjetaReservas = (() => {
        if (!reservas) return { valor: "...", contenido: null };
        if (reservas.error) return { valor: "—", contenido: <span className="resumen-info">No pudimos cargarlas</span> };
        const lista = reservas.datos;
        if (lista.length === 0) return { valor: 0, contenido: <span className="resumen-info">Todavía no tenés reservas próximas</span> };
        const proxima = lista[0];
        return {
            valor: lista.length,
            contenido: (
                <>
                    <span className="resumen-info">Próxima: {proxima.espacio.nombre}</span>
                    <span className="resumen-info">
                        {formatearFechaCorta(proxima.fecha).slice(0, 5)} · {formatearRango(proxima.hora_inicio, proxima.hora_fin)}
                    </span>
                </>
            ),
        };
    })();

    const tarjetaAvisos = (() => {
        if (!avisos) return { valor: "...", contenido: null };
        if (avisos.error) return { valor: "—", contenido: <span className="resumen-info">No pudimos cargarlos</span> };
        const { sinLeer } = avisos.datos;
        return {
            valor: sinLeer,
            contenido: <span className="resumen-info">{sinLeer === 0 ? "Estás al día con los avisos" : "Sin leer"}</span>,
        };
    })();

    const tarjetas = [
        { icono: WalletCards, titulo: "Expensas", ...tarjetaExpensas, enlace: { texto: "Ver expensas", to: "/expensas" } },
        { icono: CalendarDays, titulo: "Próxima reunión", ...tarjetaReunion, enlace: { texto: "Ver calendario", to: RUTA_CALENDARIO } },
        { icono: CalendarCheck, titulo: "Reservas activas", ...tarjetaReservas, enlace: { texto: "Ver reservas", to: "/reservas" } },
        { icono: Megaphone, titulo: "Avisos nuevos", ...tarjetaAvisos, enlace: { texto: "Ver avisos", to: "/avisos" } },
    ];

    return (
        <main className="inicio">

            {/* =========================
                   BIENVENIDA
            ========================= */}

            <section className="ini-saludo">
                <div>
                    <h2>{saludo()}{nombre ? `, ${nombre}` : ""}</h2>
                    <p>{fechaDeHoy()}</p>
                </div>

                {perfil?.edificio && (
                    <div className="ini-saludo-edificio">
                        <Building2 aria-hidden="true" />
                        <div>
                            <strong>{perfil.edificio.nombre}</strong>
                            <span>
                                {perfil.unidad ? `Unidad ${perfil.unidad.numero}${perfil.unidad.piso ? ` · Piso ${perfil.unidad.piso}` : ""}` : perfil.edificio.direccion}
                            </span>
                        </div>
                    </div>
                )}
            </section>

            {alertas.length > 0 && (
                <section className="ini-alertas" aria-label="Alertas">
                    {alertas.map((alerta) => (
                        <div className={`ini-alerta ini-alerta-${alerta.tono}`} key={alerta.texto} role="status">
                            <CircleAlert aria-hidden="true" />
                            <span>{alerta.texto}</span>
                            <Link to={alerta.enlace.to}>{alerta.enlace.texto}</Link>
                        </div>
                    ))}
                </section>
            )}

            {/* =========================
                  RESUMEN SUPERIOR
            ========================= */}

            <section className="inicio-resumen">
                {tarjetas.map((item) => {
                    const Icono = item.icono;
                    return (
                        <TarjetaResumen
                            key={item.titulo}
                            icono={<Icono />}
                            titulo={item.titulo}
                            valor={item.valor}
                            contenido={item.contenido}
                            enlace={item.enlace}
                        />
                    );
                })}
            </section>

            {/* =========================
                CONTENIDO PRINCIPAL
            ========================= */}

            <section className="ini-contenido">

                <div className="ini-columna">

                    {/* PRÓXIMAS RESERVAS */}
                    <Panel titulo="Próximas reservas" accion={<Link to="/reservas">Ver todas</Link>}>
                        <Estado
                            seccion={reservas}
                            hayDatos={reservas?.datos?.length > 0}
                            vacio={<>Todavía no tenés reservas. <Link to="/reservas">Reservá un espacio</Link>.</>}
                        >
                            <div className="reservas-list">
                                {reservas?.datos?.slice(0, 3).map((reserva) => {
                                    const estado = ESTADOS[reserva.estado];
                                    return (
                                        <div className="reserva-item" key={reserva.id}>
                                            <div className="reserva-imagen">
                                                <img src={fotoPrincipal(reserva.espacio, imagenPredeterminada)} alt={reserva.espacio.nombre} />
                                            </div>

                                            <div className="reserva-info">
                                                <strong>{reserva.espacio.nombre}</strong>

                                                <span>
                                                    <CalendarDays />
                                                    {formatearFecha(reserva.fecha)}
                                                </span>

                                                <span>
                                                    <Clock3 />
                                                    {formatearRango(reserva.hora_inicio, reserva.hora_fin)}
                                                </span>

                                                <small className={estado.clase}>{estado.etiqueta}</small>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </Estado>
                    </Panel>

                    {/* MIS RECLAMOS */}
                    <Panel titulo="Mis reclamos" accion={<Link to="/reclamos">Ver todos</Link>}>
                        <Estado
                            seccion={datos?.reclamos}
                            hayDatos={datos?.reclamos?.datos?.ultimos?.length > 0}
                            vacio={<>No tenés reclamos. Si algo no anda bien, <Link to="/reclamos">avisanos</Link>.</>}
                        >
                            <p className="ini-resumen-linea">
                                <strong>{datos?.reclamos?.datos?.abiertos}</strong>{" "}
                                {datos?.reclamos?.datos?.abiertos === 1 ? "reclamo abierto" : "reclamos abiertos"}
                            </p>
                            <ul className="ini-lista">
                                {datos?.reclamos?.datos?.ultimos?.map((reclamo) => (
                                    <li key={reclamo.id}>
                                        <div className="ini-lista-texto">
                                            <strong>{reclamo.titulo}</strong>
                                            <span>{reclamo.categoria} · {reclamo.fecha}</span>
                                        </div>
                                        <small className={`ini-estado ${reclamo.estado === "Resuelto" ? "ini-estado-verde" : reclamo.estado === "En proceso" ? "ini-estado-azul" : "ini-estado-amarillo"}`}>
                                            {reclamo.estado}
                                        </small>
                                    </li>
                                ))}
                            </ul>
                        </Estado>
                    </Panel>
                </div>

                <div className="ini-columna">

                    {/* ÚLTIMOS AVISOS */}
                    <Panel titulo="Últimos avisos" accion={<Link to="/avisos">Ver todos</Link>}>
                        <Estado
                            seccion={avisos}
                            hayDatos={avisos?.datos?.ultimos?.length > 0}
                            vacio="Todavía no hay avisos publicados en tu edificio."
                        >
                            <ul className="ini-lista">
                                {avisos?.datos?.ultimos?.map((aviso) => (
                                    <li key={aviso.id}>
                                        <span className={`ini-punto ${aviso.leido ? "" : "sin-leer"}`} aria-label={aviso.leido ? "Leído" : "Sin leer"} />
                                        <div className="ini-lista-texto">
                                            <strong>{aviso.titulo}</strong>
                                            <span>{aviso.categoria} · {aviso.fecha}</span>
                                        </div>
                                        {aviso.importancia === "Importante" && (
                                            <small className="ini-estado ini-estado-rojo">Importante</small>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </Estado>
                    </Panel>

                    {/* PRÓXIMOS EVENTOS */}
                    <Panel titulo="Próximos eventos del edificio" accion={<Link to={RUTA_CALENDARIO}>Ver calendario</Link>}>
                        <Estado
                            seccion={eventos}
                            hayDatos={eventos?.datos?.proximos?.length > 0}
                            vacio="No hay eventos programados por ahora."
                        >
                            <ul className="ini-eventos">
                                {eventos?.datos?.proximos?.map((evento) => {
                                    const { dia, numero } = partesDeFecha(evento.fecha);
                                    const Icono = ICONO_EVENTO[evento.tipo];
                                    return (
                                        <li key={evento.id}>
                                            <Link to={`${RUTA_CALENDARIO}?mes=${evento.fecha.slice(0, 7)}&evento=${evento.id}`}>
                                                <span className="ini-evento-fecha">
                                                    <span>{dia}</span>
                                                    <strong>{numero}</strong>
                                                </span>
                                                <span className="ini-lista-texto">
                                                    <strong>{evento.titulo}</strong>
                                                    <span>
                                                        <Clock3 aria-hidden="true" /> {horarioEvento(evento)}
                                                        {evento.lugar && <><MapPin aria-hidden="true" /> {evento.lugar}</>}
                                                    </span>
                                                </span>
                                                <small className={`ini-tipo ${evento.clase}`}>
                                                    <Icono aria-hidden="true" /> {evento.tipoEtiqueta}
                                                </small>
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </Estado>
                    </Panel>
                </div>

            </section>
        </main>
    );
}

export default Inicio;
