import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { CalendarDays, ChevronLeft, ChevronRight, Clock3, MapPin, Users } from "lucide-react";

import "../Reservas.css";
import "./CalendarioReservas.css";
import Panel from "../../../../components/Panel/Panel";
import {
    listarReservasDelMes,
    obtenerUsuarioId,
} from "../../../../services/reservasService";
import {
    ESTADOS,
    formatearFecha,
    formatearHora,
    formatearRango,
    moverMes,
    nombreDeMes,
} from "../reservasUtils";

const DIAS_SEMANA = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const dosDigitos = (n) => String(n).padStart(2, "0");

/* Arma las celdas del mes: huecos vacíos al principio + un día por celda */
function celdasDelMes(anio, mes) {
    const primerDia = new Date(anio, mes, 1).getDay(); // 0 = domingo
    const huecos = (primerDia + 6) % 7;                // la semana empieza el lunes
    const dias = new Date(anio, mes + 1, 0).getDate();

    return [
        ...Array.from({ length: huecos }, () => null),
        ...Array.from({ length: dias }, (_, i) => i + 1),
    ];
}

function CalendarioReservas() {

    const navigate = useNavigate();
    const [parametros] = useSearchParams();

    // /reservas/calendario?mes=2026-09&reserva=ID
    const [mes, setMes] = useState(() => {
        const [a, m] = (parametros.get("mes") ?? "").split("-").map(Number);
        if (a && m >= 1 && m <= 12) return { anio: a, mes: m - 1 };

        const hoy = new Date();
        return { anio: hoy.getFullYear(), mes: hoy.getMonth() };
    });

    const [reservas, setReservas] = useState([]);
    const [seleccionadaId, setSeleccionadaId] = useState(parametros.get("reserva"));
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        document.title = "Habita | Calendario de reservas";
    }, []);

    useEffect(() => {
        let activo = true;
        setCargando(true);

        async function cargar() {
            try {
                const usuarioId = await obtenerUsuarioId();
                const lista = usuarioId
                    ? await listarReservasDelMes(usuarioId, mes.anio, mes.mes)
                    : [];
                if (activo) {
                    setReservas(lista);
                    setError("");
                }
            } catch (e) {
                if (activo) setError(e.message);
            } finally {
                if (activo) setCargando(false);
            }
        }

        cargar();
        return () => { activo = false; };
    }, [mes]);

    const seleccionada = reservas.find((r) => r.id === seleccionadaId) ?? null;
    const hoy = new Date();
    const hoyISO = `${hoy.getFullYear()}-${dosDigitos(hoy.getMonth() + 1)}-${dosDigitos(hoy.getDate())}`;

    function cambiarMes(cantidad) {
        setMes((actual) => moverMes(actual, cantidad));
        setSeleccionadaId(null);
    }

    function irAHoy() {
        setMes({ anio: hoy.getFullYear(), mes: hoy.getMonth() });
        setSeleccionadaId(null);
    }

    const celdas = celdasDelMes(mes.anio, mes.mes);

    return (
        <main className="calendario-pagina">

            <button type="button" className="espacio-volver" onClick={() => navigate("/reservas")}>
                <ChevronLeft />
                Volver a reservas
            </button>

            {error && <p className="mensaje-error">{error}</p>}

            <section className="calendario-contenido">

                {/* =========================
                    CALENDARIO DEL MES
                ========================= */}

                <Panel titulo="Calendario de reservas" descripcion="Consultá tus reservas de cada mes" className="calendario-completo">

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

                    <div className="calendario-grilla">
                        {DIAS_SEMANA.map((dia) => (
                            <div className="calendario-dia-semana" key={dia}>{dia}</div>
                        ))}

                        {celdas.map((dia, indice) => {
                            if (dia === null) {
                                return <div className="calendario-celda vacia" key={`vacia-${indice}`} />;
                            }

                            const fecha = `${mes.anio}-${dosDigitos(mes.mes + 1)}-${dosDigitos(dia)}`;
                            const delDia = reservas.filter((r) => r.fecha === fecha);

                            return (
                                <div
                                    className={`calendario-celda ${fecha === hoyISO ? "hoy" : ""}`}
                                    key={fecha}
                                >
                                    <span className="calendario-numero">{dia}</span>

                                    {delDia.slice(0, 2).map((reserva) => (
                                        <button
                                            type="button"
                                            key={reserva.id}
                                            className={`calendario-reserva ${ESTADOS[reserva.estado].clase} ${reserva.id === seleccionadaId ? "activa" : ""}`}
                                            onClick={() => setSeleccionadaId(reserva.id)}
                                            title={`${reserva.espacio.nombre} · ${formatearRango(reserva.hora_inicio, reserva.hora_fin)}`}
                                        >
                                            <b>{formatearHora(reserva.hora_inicio)}</b> {reserva.espacio.nombre}
                                        </button>
                                    ))}

                                    {delDia.length > 2 && (
                                        <button
                                            type="button"
                                            className="calendario-mas"
                                            onClick={() => setSeleccionadaId(delDia[2].id)}
                                        >
                                            +{delDia.length - 2} más
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {!cargando && reservas.length === 0 && (
                        <p className="reservas-vacio">No tenés reservas en este mes.</p>
                    )}
                </Panel>

                {/* =========================
                    DETALLE DE LA RESERVA
                ========================= */}

                <Panel titulo="Detalle de la reserva" descripcion="Elegí una reserva del calendario" className="calendario-detalle">

                    {!seleccionada ? (
                        <p className="reservas-vacio">
                            Seleccioná una reserva para ver su estado, capacidad, fecha y horario.
                        </p>
                    ) : (
                        <div className="detalle-reserva">
                            <h3>{seleccionada.espacio.nombre}</h3>

                            <span className={`etiqueta-estado ${ESTADOS[seleccionada.estado].clase}`}>
                                {ESTADOS[seleccionada.estado].etiqueta}
                            </span>

                            <dl>
                                <div>
                                    <dt><Users /> Capacidad</dt>
                                    <dd>{seleccionada.espacio.capacidad} personas</dd>
                                </div>

                                <div>
                                    <dt><CalendarDays /> Fecha</dt>
                                    <dd>{formatearFecha(seleccionada.fecha)}</dd>
                                </div>

                                <div>
                                    <dt><Clock3 /> Horario registrado</dt>
                                    <dd>{formatearRango(seleccionada.hora_inicio, seleccionada.hora_fin)}</dd>
                                </div>

                                <div>
                                    <dt><MapPin /> Lugar</dt>
                                    <dd>{seleccionada.espacio.lugar}</dd>
                                </div>
                            </dl>
                        </div>
                    )}
                </Panel>

            </section>

        </main>
    );
}

export default CalendarioReservas;
