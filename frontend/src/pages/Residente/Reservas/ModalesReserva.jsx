import { useState } from "react";

import Modal from "../../../components/Modal/Modal";
import {
    ESTADOS,
    formatearFecha,
    formatearHora,
    formatearRango,
    hoyISO,
    horasHastaInicio,
    opcionesDesde,
    opcionesHasta,
} from "./reservasUtils";
import { cancelarReserva, modificarSolicitud } from "../../../services/reservasService";

import "./Reservas.css";

/* =========================================================
   VER DETALLE
   Título, descripción, ambientes, lugar, permisos,
   reglas y restricciones, capacidad y horarios.
========================================================= */

export function ModalDetalleReserva({ reserva, onClose }) {
    const { espacio } = reserva;
    const estado = ESTADOS[reserva.estado];

    return (
        <Modal
            titulo={espacio.nombre}
            onClose={onClose}
            ancho={560}
            pie={
                <button type="button" className="modal-boton" onClick={onClose}>
                    Cerrar
                </button>
            }
        >
            <span className={`etiqueta-estado ${estado.clase}`}>{estado.etiqueta}</span>

            <dl className="detalle-lista">
                <div>
                    <dt>Fecha</dt>
                    <dd>{formatearFecha(reserva.fecha)}</dd>
                </div>

                <div>
                    <dt>Horario reservado</dt>
                    <dd>{formatearRango(reserva.hora_inicio, reserva.hora_fin)}</dd>
                </div>

                {reserva.asunto && (
                    <div className="ancho-completo">
                        <dt>Asunto</dt>
                        <dd>{reserva.asunto}</dd>
                    </div>
                )}
            </dl>

            <h3 className="detalle-subtitulo">Sobre el espacio</h3>

            {espacio.descripcion && (
                <p className="detalle-descripcion">{espacio.descripcion}</p>
            )}

            <dl className="detalle-lista">
                {espacio.ambientes && (
                    <div className="ancho-completo">
                        <dt>Ambientes</dt>
                        <dd>{espacio.ambientes}</dd>
                    </div>
                )}

                <div>
                    <dt>Lugar</dt>
                    <dd>{espacio.lugar}</dd>
                </div>

                <div>
                    <dt>Capacidad</dt>
                    <dd>{espacio.capacidad} personas</dd>
                </div>

                <div>
                    <dt>Horarios disponibles</dt>
                    <dd>
                        {formatearRango(espacio.hora_apertura, espacio.hora_cierre)}
                        {espacio.duracion_turno_min
                            ? ` · Turnos de ${espacio.duracion_turno_min} min`
                            : ""}
                    </dd>
                </div>

                {espacio.permisos && (
                    <div>
                        <dt>Permisos</dt>
                        <dd>{espacio.permisos}</dd>
                    </div>
                )}
            </dl>

            {espacio.reglas?.length > 0 && (
                <>
                    <h3 className="detalle-subtitulo">Reglas y restricciones</h3>
                    <ul className="detalle-reglas">
                        {espacio.reglas.map((regla) => (
                            <li key={regla}>{regla}</li>
                        ))}
                    </ul>
                </>
            )}
        </Modal>
    );
}


/* =========================================================
   CANCELAR UNA RESERVA CONFIRMADA
   El motivo es opcional.
========================================================= */

export function ModalCancelarReserva({ reserva, onClose, onCancelada }) {
    const [motivo, setMotivo] = useState("");
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState("");

    const faltanMenosDe24h = horasHastaInicio(reserva.fecha, reserva.hora_inicio) < 24;

    async function confirmar() {
        setEnviando(true);
        setError("");
        try {
            await cancelarReserva(reserva.id, motivo);
            onCancelada();
        } catch (e) {
            setError(e.message);
            setEnviando(false);
        }
    }

    return (
        <Modal
            titulo="Cancelar reserva"
            onClose={onClose}
            pie={
                <>
                    <button type="button" className="modal-boton" onClick={onClose}>
                        Volver
                    </button>

                    <button
                        type="button"
                        className="modal-boton peligro"
                        onClick={confirmar}
                        disabled={enviando || faltanMenosDe24h}
                    >
                        {enviando ? "Cancelando..." : "Cancelar reserva"}
                    </button>
                </>
            }
        >
            <p className="modal-texto">
                Vas a cancelar tu reserva de <strong>{reserva.espacio.nombre}</strong> del{" "}
                <strong>{formatearFecha(reserva.fecha)}</strong> de{" "}
                <strong>{formatearRango(reserva.hora_inicio, reserva.hora_fin)}</strong>.
            </p>

            {faltanMenosDe24h && (
                <p className="mensaje-error">
                    Las reservas se cancelan con 24 h de anticipación, por lo que esta
                    reserva ya no se puede cancelar desde acá.
                </p>
            )}

            <div className="campo-reserva">
                <label htmlFor="motivo-cancelacion">Motivo de la cancelación (opcional)</label>
                <textarea
                    id="motivo-cancelacion"
                    rows={3}
                    maxLength={300}
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    placeholder="Contanos por qué cancelás la reserva"
                    disabled={faltanMenosDe24h}
                />
            </div>

            {error && <p className="mensaje-error">{error}</p>}
        </Modal>
    );
}


/* =========================================================
   MODIFICAR UNA SOLICITUD PENDIENTE
   Permite editar los datos o cancelar la solicitud.
========================================================= */

export function ModalModificarSolicitud({ reserva, onClose, onGuardada, onCancelada }) {
    const { espacio } = reserva;

    const [asunto, setAsunto] = useState(reserva.asunto ?? "");
    const [fecha, setFecha] = useState(reserva.fecha);
    const [desde, setDesde] = useState(formatearHora(reserva.hora_inicio));
    const [hasta, setHasta] = useState(formatearHora(reserva.hora_fin));
    const [confirmandoCancelacion, setConfirmandoCancelacion] = useState(false);
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState("");

    const opcionesInicio = opcionesDesde(espacio);
    const opcionesFin = opcionesHasta(espacio, desde);

    // Espacios por turnos (ej: Laundry): igual que al reservar, no se pide
    // asunto ni horario de fin. El fin se calcula solo: inicio + duración del turno.
    const esPorTurnos = Boolean(espacio.duracion_turno_min);
    const horaFin = esPorTurnos ? (opcionesFin[0] ?? "") : hasta;

    function cambiarDesde(nuevoDesde) {
        setDesde(nuevoDesde);
        const nuevasOpciones = opcionesHasta(espacio, nuevoDesde);
        if (!nuevasOpciones.includes(hasta)) setHasta(nuevasOpciones[0] ?? "");
    }

    async function guardar(evento) {
        evento.preventDefault();
        setError("");

        if (!fecha || !desde || !horaFin) {
            setError(
                esPorTurnos
                    ? "Completá el día y el horario de tu turno."
                    : "Completá la fecha y el horario."
            );
            return;
        }

        setEnviando(true);
        try {
            await modificarSolicitud(reserva.id, {
                asunto: esPorTurnos ? `Uso de ${espacio.nombre}` : asunto,
                fecha,
                horaInicio: desde,
                horaFin,
            });
            onGuardada();
        } catch (e) {
            setError(e.message);
            setEnviando(false);
        }
    }

    async function cancelarSolicitud() {
        setEnviando(true);
        setError("");
        try {
            await cancelarReserva(reserva.id, "");
            onCancelada();
        } catch (e) {
            setError(e.message);
            setEnviando(false);
        }
    }

    return (
        <Modal
            titulo={`Modificar solicitud · ${espacio.nombre}`}
            onClose={onClose}
            pie={
                confirmandoCancelacion ? (
                    <>
                        <span className="modal-aviso-pie">
                            ¿Cancelar esta solicitud? No se puede deshacer.
                        </span>

                        <button
                            type="button"
                            className="modal-boton"
                            onClick={() => setConfirmandoCancelacion(false)}
                            disabled={enviando}
                        >
                            No
                        </button>

                        <button
                            type="button"
                            className="modal-boton peligro"
                            onClick={cancelarSolicitud}
                            disabled={enviando}
                        >
                            Sí, cancelar solicitud
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            type="button"
                            className="modal-boton contorno-peligro"
                            onClick={() => setConfirmandoCancelacion(true)}
                            disabled={enviando}
                        >
                            Cancelar solicitud
                        </button>

                        <button
                            type="submit"
                            form="form-modificar-solicitud"
                            className="modal-boton principal"
                            disabled={enviando}
                        >
                            {enviando ? "Guardando..." : "Guardar cambios"}
                        </button>
                    </>
                )
            }
        >
            <form id="form-modificar-solicitud" className="form-reserva" onSubmit={guardar}>
                {!esPorTurnos && (
                    <div className="campo-reserva">
                        <label htmlFor="mod-asunto">Asunto</label>
                        <input
                            id="mod-asunto"
                            type="text"
                            maxLength={120}
                            value={asunto}
                            onChange={(e) => setAsunto(e.target.value)}
                            placeholder="Ej: Cumpleaños, reunión..."
                        />
                    </div>
                )}

                <div className="campo-reserva">
                    <label htmlFor="mod-fecha">Fecha</label>
                    <input
                        id="mod-fecha"
                        type="date"
                        min={hoyISO()}
                        value={fecha}
                        onChange={(e) => setFecha(e.target.value)}
                    />
                </div>

                <div className={esPorTurnos ? "fila-doble fila-unica" : "fila-doble"}>
                    <div className="campo-reserva">
                        <label htmlFor="mod-desde">Desde</label>
                        <select
                            id="mod-desde"
                            value={desde}
                            onChange={(e) => cambiarDesde(e.target.value)}
                        >
                            {opcionesInicio.map((hora) => (
                                <option key={hora} value={hora}>{hora}</option>
                            ))}
                        </select>
                    </div>

                    {!esPorTurnos && (
                        <div className="campo-reserva">
                            <label htmlFor="mod-hasta">Hasta</label>
                            <select
                                id="mod-hasta"
                                value={hasta}
                                onChange={(e) => setHasta(e.target.value)}
                            >
                                {opcionesFin.map((hora) => (
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

                <p className="texto-ayuda">
                    {espacio.nombre} está disponible de{" "}
                    {formatearRango(espacio.hora_apertura, espacio.hora_cierre)}.
                </p>

                {error && <p className="mensaje-error">{error}</p>}
            </form>
        </Modal>
    );
}
