import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { CalendarDays, ChevronLeft, ChevronRight, Clock3, MapPin, FileText } from "lucide-react";

/* Se reutiliza el diseño del calendario de Reservas */
import "../Reservas/Reservas.css";
import "../Reservas/CalendarioReservas/CalendarioReservas.css";
import "./Calendario.css";
import Panel from "../../../components/Panel/Panel";
import { obtenerUsuarioId, listarReservasDelMes } from "../../../services/reservasService";
import { listarEventosDelMes } from "../../../services/eventosService";
import { obtenerExpensasResidente } from "../../../services/expensasService";
import {
    ESTADOS,
    formatearFecha,
    formatearHora,
    formatearRango,
    limitesDeMes,
    moverMes,
    nombreDeMes,
} from "../Reservas/reservasUtils";

const DIAS_SEMANA = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const FILTROS = [
    { clave: "todo", texto: "Todo" },
    { clave: "evento", texto: "Eventos del edificio" },
    { clave: "reserva", texto: "Mis reservas" },
    { clave: "vencimiento", texto: "Vencimientos" },
];

const dosDigitos = (n) => String(n).padStart(2, "0");

function celdasDelMes(anio, mes) {
    const primerDia = new Date(anio, mes, 1).getDay();
    const huecos = (primerDia + 6) % 7;
    const dias = new Date(anio, mes + 1, 0).getDate();

    return [
        ...Array.from({ length: huecos }, () => null),
        ...Array.from({ length: dias }, (_, i) => i + 1),
    ];
}

function horarioDe(item) {
    if (!item.horaInicio) return "Todo el día";
    return item.horaFin ? formatearRango(item.horaInicio, item.horaFin) : `${formatearHora(item.horaInicio)} h`;
}

/* Cada cosa del calendario se convierte a la misma forma para poder dibujarla igual */
function deEvento(evento) {
    return {
        clave: `evento-${evento.id}`, origen: "evento", id: String(evento.id),
        fecha: evento.fecha, horaInicio: evento.horaInicio, horaFin: evento.horaFin,
        titulo: evento.titulo, clase: evento.clase, etiqueta: evento.tipoEtiqueta,
        lugar: evento.lugar, descripcion: evento.descripcion,
    };
}

function deReserva(reserva) {
    const estado = ESTADOS[reserva.estado];
    return {
        clave: `reserva-${reserva.id}`, origen: "reserva", id: String(reserva.id),
        fecha: reserva.fecha, horaInicio: reserva.hora_inicio, horaFin: reserva.hora_fin,
        titulo: `Reserva: ${reserva.espacio.nombre}`, clase: estado.clase, etiqueta: estado.etiqueta,
        lugar: reserva.espacio.lugar ?? "", descripcion: reserva.asunto ?? "",
        enlace: { texto: "Ver en mis reservas", to: `/reservas/calendario?mes=${reserva.fecha.slice(0, 7)}&reserva=${reserva.id}` },
    };
}

function deVencimiento(expensa) {
    return {
        clave: `vencimiento-${expensa.id}`, origen: "vencimiento", id: String(expensa.id),
        fecha: expensa.vencimientoISO.slice(0, 10), horaInicio: null, horaFin: null,
        titulo: `Vence expensa ${expensa.periodo}`, clase: "cal-tipo-vencimiento", etiqueta: expensa.estado,
        lugar: "", descripcion: `Importe: ${expensa.importe}`,
        enlace: { texto: "Ir a Mis expensas", to: "/expensas" },
    };
}

function Calendario() {
    const navigate = useNavigate();
    const [parametros] = useSearchParams();

    // /calendario?mes=2026-10&evento=ID
    const [mes, setMes] = useState(() => {
        const [a, m] = (parametros.get("mes") ?? "").split("-").map(Number);
        if (a && m >= 1 && m <= 12) return { anio: a, mes: m - 1 };
        const hoy = new Date();
        return { anio: hoy.getFullYear(), mes: hoy.getMonth() };
    });

    const [eventos, setEventos] = useState([]);
    const [reservas, setReservas] = useState([]);
    const [expensas, setExpensas] = useState([]);
    const [filtro, setFiltro] = useState("todo");
    const [seleccionadaClave, setSeleccionadaClave] = useState(
        parametros.get("evento") ? `evento-${parametros.get("evento")}` : null
    );
    const [cargando, setCargando] = useState(true);
    const [avisoParcial, setAvisoParcial] = useState("");

    useEffect(() => {
        document.title = "Habita | Calendario";
    }, []);

    // Las expensas se piden una sola vez (traen todos los períodos)
    useEffect(() => {
        let activo = true;
        obtenerExpensasResidente()
            .then((lista) => { if (activo) setExpensas(lista); })
            .catch((e) => console.error("No se pudieron cargar los vencimientos", e));
        return () => { activo = false; };
    }, []);

    // Eventos y reservas: se piden al cambiar de mes
    useEffect(() => {
        let activo = true;
        setCargando(true);

        async function cargar() {
            const usuarioId = await obtenerUsuarioId();
            const [resEventos, resReservas] = await Promise.allSettled([
                listarEventosDelMes(mes.anio, mes.mes),
                usuarioId ? listarReservasDelMes(usuarioId, mes.anio, mes.mes) : Promise.resolve([]),
            ]);
            if (!activo) return;

            setEventos(resEventos.status === "fulfilled" ? resEventos.value : []);
            setReservas(resReservas.status === "fulfilled" ? resReservas.value : []);
            setAvisoParcial(
                resEventos.status === "rejected" || resReservas.status === "rejected"
                    ? "No pudimos cargar todo el calendario. Probá de nuevo en unos minutos."
                    : ""
            );
            setCargando(false);
        }

        cargar();
        return () => { activo = false; };
    }, [mes]);

    const items = useMemo(() => {
        const { desde, hasta } = limitesDeMes(mes.anio, mes.mes);
        const vencimientos = expensas
            .filter((e) => e.estado !== "Pagada" && e.vencimientoISO >= desde && e.vencimientoISO <= hasta)
            .map(deVencimiento);

        return [...eventos.map(deEvento), ...reservas.map(deReserva), ...vencimientos]
            .filter((item) => filtro === "todo" || item.origen === filtro)
            .sort((a, b) => `${a.fecha} ${a.horaInicio ?? ""}`.localeCompare(`${b.fecha} ${b.horaInicio ?? ""}`));
    }, [eventos, reservas, expensas, filtro, mes]);

    const seleccionada = items.find((i) => i.clave === seleccionadaClave) ?? null;

    const hoy = new Date();
    const hoyISO = `${hoy.getFullYear()}-${dosDigitos(hoy.getMonth() + 1)}-${dosDigitos(hoy.getDate())}`;

    function cambiarMes(cantidad) {
        setMes((actual) => moverMes(actual, cantidad));
        setSeleccionadaClave(null);
    }

    function irAHoy() {
        setMes({ anio: hoy.getFullYear(), mes: hoy.getMonth() });
        setSeleccionadaClave(null);
    }

    const celdas = celdasDelMes(mes.anio, mes.mes);

    return (
        <main className="calendario-pagina">

            <button type="button" className="espacio-volver" onClick={() => navigate("/inicio")}>
                <ChevronLeft />
                Volver al inicio
            </button>

            {avisoParcial && <p className="mensaje-error">{avisoParcial}</p>}

            <section className="calendario-contenido">

                <Panel titulo="Calendario del edificio" descripcion="Eventos, tus reservas y vencimientos de cada mes" className="calendario-completo">

                    <div className="calendario-barra">
                        <div className="calendario-navegacion">
                            <button type="button" onClick={() => cambiarMes(-1)} aria-label="Mes anterior">
                                <ChevronLeft />
                            </button>

                            <strong>{nombreDeMes(mes.anio, mes.mes)}</strong>

                            <button type="button" onClick={() => cambiarMes(1)} aria-label="Mes siguiente">
                                <ChevronRight />
                            </button>
                        </div>

                        <button type="button" className="calendario-hoy" onClick={irAHoy}>
                            Hoy
                        </button>
                    </div>

                    <div className="calendario-filtros" role="group" aria-label="Qué mostrar">
                        {FILTROS.map((f) => (
                            <button
                                type="button"
                                key={f.clave}
                                className={filtro === f.clave ? "activo" : ""}
                                aria-pressed={filtro === f.clave}
                                onClick={() => { setFiltro(f.clave); setSeleccionadaClave(null); }}
                            >
                                {f.texto}
                            </button>
                        ))}
                    </div>

                    <div className="calendario-grilla">
                        {DIAS_SEMANA.map((dia) => (
                            <div className="calendario-dia-semana" key={dia}>{dia}</div>
                        ))}

                        {celdas.map((dia, indice) => {
                            if (dia === null) {
                                return <div className="calendario-celda vacia" key={`vacia-${indice}`} />;
                            }

                            const fecha = `${mes.anio}-${dosDigitos(mes.mes + 1)}-${dosDigitos(dia)}`;
                            const delDia = items.filter((i) => i.fecha === fecha);

                            return (
                                <div className={`calendario-celda ${fecha === hoyISO ? "hoy" : ""}`} key={fecha}>
                                    <span className="calendario-numero">{dia}</span>

                                    {delDia.slice(0, 2).map((item) => (
                                        <button
                                            type="button"
                                            key={item.clave}
                                            className={`calendario-reserva ${item.clase} ${item.clave === seleccionadaClave ? "activa" : ""}`}
                                            onClick={() => setSeleccionadaClave(item.clave)}
                                            title={`${item.titulo} · ${horarioDe(item)}`}
                                        >
                                            {item.horaInicio && <b>{formatearHora(item.horaInicio)}</b>} {item.titulo}
                                        </button>
                                    ))}

                                    {delDia.length > 2 && (
                                        <button type="button" className="calendario-mas" onClick={() => setSeleccionadaClave(delDia[2].clave)}>
                                            +{delDia.length - 2} más
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {!cargando && items.length === 0 && (
                        <p className="reservas-vacio">No hay nada para mostrar en este mes.</p>
                    )}
                </Panel>

                <Panel titulo="Detalle" descripcion="Elegí algo del calendario" className="calendario-detalle">

                    {!seleccionada ? (
                        <p className="reservas-vacio">
                            Seleccioná un evento, una reserva o un vencimiento para ver su fecha, horario y lugar.
                        </p>
                    ) : (
                        <div className="detalle-reserva">
                            <h3>{seleccionada.titulo}</h3>

                            <span className={`etiqueta-estado ${seleccionada.clase}`}>{seleccionada.etiqueta}</span>

                            <dl>
                                <div>
                                    <dt><CalendarDays /> Fecha</dt>
                                    <dd>{formatearFecha(seleccionada.fecha)}</dd>
                                </div>

                                {seleccionada.origen !== "vencimiento" && (
                                    <div>
                                        <dt><Clock3 /> Horario</dt>
                                        <dd>{horarioDe(seleccionada)}</dd>
                                    </div>
                                )}

                                {seleccionada.lugar && (
                                    <div>
                                        <dt><MapPin /> Lugar</dt>
                                        <dd>{seleccionada.lugar}</dd>
                                    </div>
                                )}

                                {seleccionada.descripcion && (
                                    <div>
                                        <dt><FileText /> {seleccionada.origen === "evento" ? "Descripción" : "Detalle"}</dt>
                                        <dd className="calendario-descripcion">{seleccionada.descripcion}</dd>
                                    </div>
                                )}
                            </dl>

                            {seleccionada.enlace && (
                                <Link to={seleccionada.enlace.to} className="calendario-enlace">
                                    {seleccionada.enlace.texto} <ChevronRight />
                                </Link>
                            )}
                        </div>
                    )}
                </Panel>

            </section>

        </main>
    );
}

export default Calendario;
