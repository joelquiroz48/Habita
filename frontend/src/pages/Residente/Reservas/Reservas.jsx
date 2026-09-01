import { useEffect } from "react";

import {
    CalendarDays,
    Clock3,
    Users,
    Plus,
    Eye,
    Pencil,
    X,
    ChevronRight,
    CircleHelp,
    Info,
} from "lucide-react";

import imagenPredeterminada from "../../../assets/img/imagen-predeterminada.png";

import "./Reservas.css";


/* =========================
        DATOS DE EJEMPLO
========================= */

const resumenReservas = [
    {
        titulo: "Reservas activas",
        valor: "2",
        detalle: "1 confirmada · 1 pendiente",
        icono: CalendarDays,
    },
    {
        titulo: "Próxima reserva",
        valor: "18 MAY",
        detalle: "SUM · 18:00 a 22:00",
        icono: CalendarDays,
    },
    {
        titulo: "Espacios disponibles hoy",
        valor: "4",
        detalle: "SUM, Parrilla, Laundry, Sala de reuniones",
        icono: Users,
    },
    {
        titulo: "Historial del mes",
        valor: "5",
        detalle: "Reservas realizadas",
        icono: Clock3,
    },
];


const reservasActivas = [
    {
        nombre: "SUM",
        fecha: "18/05/2024",
        horario: "18:00 a 22:00",
        estado: "Confirmada",
        imagen: imagenPredeterminada,
        numero: "#7842",
    },
    {
        nombre: "Parrilla 2",
        fecha: "25/05/2024",
        horario: "12:00 a 16:00",
        estado: "Confirmada",
        imagen: imagenPredeterminada,
        numero: "#7849",
    },
    {
        nombre: "Laundry",
        fecha: "02/06/2024",
        horario: "10:00 a 11:00",
        estado: "Pendiente",
        imagen: imagenPredeterminada,
        numero: "#7860",
    },
];


const espaciosDisponibles = [
    {
        nombre: "SUM",
        capacidad: "Capacidad 40 personas",
        imagen: imagenPredeterminada,
    },
    {
        nombre: "Parrilla 2",
        capacidad: "Capacidad 12 personas",
        imagen: imagenPredeterminada,
    },
    {
        nombre: "Laundry",
        capacidad: "Turnos de 1 hora",
        imagen: imagenPredeterminada,
    },
    {
        nombre: "Sala de reuniones",
        capacidad: "Capacidad 8 personas",
        imagen: imagenPredeterminada,
    },
];


const eventos = [
    {
        dia: "SÁB",
        numero: "18",
        horario: "18:00 a 22:00",
        espacio: "SUM",
        estado: "Confirmada",
    },
    {
        dia: "LUN",
        numero: "20",
        horario: "08:00 a 10:00",
        espacio: "Poda de árboles",
        estado: "Confirmada",
    },
    {
        dia: "JUE",
        numero: "22",
        horario: "09:00 a 13:00",
        espacio: "Corte de luz programado",
        estado: "Confirmada",
    },
    {
        dia: "SÁB",
        numero: "25",
        horario: "12:00 a 16:00",
        espacio: "Parrilla 2",
        estado: "Pendiente",
    },
];


/* =========================
          COMPONENTE
========================= */

function Reservas() {

    useEffect(() => {
        document.title = "Habita | Reservas";
    }, []);


    return (
        <main className="reservas">

            {/* =========================
                RESUMEN SUPERIOR
            ========================= */}

            <section className="reservas-resumen">

                {resumenReservas.map((item, index) => {

                    const Icono = item.icono;

                    return (
                        <article
                            className="reserva-resumen-card"
                            key={index}
                        >
                            <div className="reserva-resumen-icon">
                                <Icono />
                            </div>

                            <div>
                                <span>{item.titulo}</span>

                                <strong>
                                    {item.valor}
                                </strong>

                                <small>
                                    {item.detalle}
                                </small>
                            </div>
                        </article>
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


                <div className="reservas-columna reservas-columna-izquierda">


                    {/* =========================
                        MIS RESERVAS
                    ========================= */}

                    <article className="panel-reservas mis-reservas">

                        <div className="panel-reservas-header">

                            <div>
                                <h2>Mis reservas activas</h2>

                                <span>
                                    Consultá y administrá tus próximas reservas
                                </span>
                            </div>

                            <button className="btn-nueva-reserva">
                                <Plus size={15} />
                                Nueva reserva
                            </button>

                        </div>


                        <div className="reservas-lista">

                            {reservasActivas.map((reserva, index) => (

                                <div
                                    className="reserva-card"
                                    key={index}
                                >

                                    <div className="reserva-card-imagen">

                                        <img
                                            src={reserva.imagen}
                                            alt={reserva.nombre}
                                        />

                                    </div>


                                    <div className="reserva-card-info">

                                        <div className="reserva-card-titulo">

                                            <strong>
                                                {reserva.nombre}
                                            </strong>

                                            <small
                                                className={
                                                    reserva.estado === "Confirmada"
                                                        ? "estado-confirmada"
                                                        : "estado-pendiente"
                                                }
                                            >
                                                {reserva.estado}
                                            </small>

                                        </div>


                                        <div className="reserva-card-datos">

                                            <span>
                                                <CalendarDays size={12} />
                                                {reserva.fecha}
                                            </span>

                                            <span>
                                                <Clock3 size={12} />
                                                {reserva.horario}
                                            </span>

                                        </div>


                                        <small className="numero-reserva">
                                            Reserva {reserva.numero}
                                        </small>

                                    </div>


                                    <div className="reserva-card-acciones">

                                        <button>
                                            <Eye size={13} />
                                            Ver detalle
                                        </button>

                                        {reserva.estado === "Confirmada" && (

                                            <button>
                                                <Pencil size={13} />
                                                Modificar
                                            </button>

                                        )}

                                        {reserva.estado === "Pendiente" && (

                                            <button className="btn-cancelar">
                                                <X size={13} />
                                                Cancelar
                                            </button>

                                        )}

                                    </div>

                                </div>

                            ))}

                        </div>

                    </article>


                    {/* =========================
                        ESPACIOS DISPONIBLES
                    ========================= */}

                    <article className="panel-reservas espacios-disponibles">

                        <div className="panel-reservas-header">

                            <div>
                                <h2>Espacios comunes disponibles</h2>

                                <span>
                                    Elegí un espacio para realizar una reserva
                                </span>
                            </div>

                        </div>


                        <div className="espacios-grid">

                            {espaciosDisponibles.map((espacio, index) => (

                                <div
                                    className="espacio-card"
                                    key={index}
                                >

                                    <div className="espacio-imagen">

                                        <img
                                            src={espacio.imagen}
                                            alt={espacio.nombre}
                                        />

                                    </div>


                                    <div className="espacio-info">

                                        <strong>
                                            {espacio.nombre}
                                        </strong>

                                        <span>
                                            {espacio.capacidad}
                                        </span>

                                        <button>
                                            Reservar
                                        </button>

                                    </div>

                                </div>

                            ))}

                        </div>

                    </article>


                    {/* =========================
                        AYUDA
                    ========================= */}

                    <article className="panel-reservas ayuda-reservas">

                        <div className="panel-reservas-header">

                            <div>
                                <h2>Ayuda sobre reservas</h2>

                                <span>
                                    Información útil para reservar espacios
                                </span>
                            </div>

                        </div>


                        <div className="ayuda-reserva-item">

                            <div className="ayuda-reserva-icon">
                                <CircleHelp size={14} />
                            </div>

                            <div>
                                <strong>
                                    ¿Cómo reservo el SUM?
                                </strong>

                                <span>
                                    Conocé el proceso para realizar una reserva.
                                </span>
                            </div>

                            <ChevronRight size={14} />

                        </div>


                        <div className="ayuda-reserva-item">

                            <div className="ayuda-reserva-icon">
                                <CalendarDays size={14} />
                            </div>

                            <div>
                                <strong>
                                    Políticas de cancelación
                                </strong>

                                <span>
                                    Consultá cuándo podés cancelar una reserva.
                                </span>
                            </div>

                            <ChevronRight size={14} />

                        </div>


                        <div className="ayuda-reserva-item">

                            <div className="ayuda-reserva-icon">
                                <Info size={14} />
                            </div>

                            <div>
                                <strong>
                                    Espacios y horarios disponibles
                                </strong>

                                <span>
                                    Revisá las condiciones de cada espacio.
                                </span>
                            </div>

                            <ChevronRight size={14} />

                        </div>

                    </article>

                </div>


                {/* =========================
                    COLUMNA DERECHA
                ========================= */}

                <div className="reservas-columna reservas-columna-derecha">


                    {/* =========================
                        NUEVA RESERVA
                    ========================= */}

                    <article className="panel-reservas nueva-reserva">

                        <div className="panel-reservas-header">

                            <div>
                                <h2>Nueva reserva</h2>

                                <span>
                                    Completá los datos para reservar un espacio
                                </span>
                            </div>

                        </div>


                        <form className="form-reserva">

                            <div className="campo-reserva">

                                <label>
                                    Espacio
                                </label>

                                <select>
                                    <option>SUM</option>
                                    <option>Parrilla 1</option>
                                    <option>Parrilla 2</option>
                                    <option>Laundry</option>
                                    <option>Sala de reuniones</option>
                                </select>

                            </div>


                            <div className="campo-reserva">

                                <label>
                                    Fecha
                                </label>

                                <div className="input-icono">

                                    <input
                                        type="date"
                                        defaultValue="2024-05-18"
                                    />

                                </div>

                            </div>


                            <div className="campo-reserva">

                                <label>
                                    Horario
                                </label>

                                <select>
                                    <option>18:00 a 22:00</option>
                                    <option>12:00 a 16:00</option>
                                    <option>10:00 a 11:00</option>
                                    <option>08:00 a 10:00</option>
                                </select>

                            </div>


                            <div className="campo-reserva">

                                <label>
                                    Cantidad de invitados
                                </label>

                                <select>
                                    <option>20</option>
                                    <option>10</option>
                                    <option>5</option>
                                    <option>2</option>
                                </select>

                            </div>


                            <button
                                type="button"
                                className="btn-solicitar"
                            >
                                Solicitar reserva
                            </button>


                            <button
                                type="button"
                                className="btn-limpiar"
                            >
                                Ver reglamento
                            </button>

                        </form>


                        <div className="reglas-reserva">

                            <div className="reglas-icono">
                                <Info size={15} />
                            </div>

                            <div>

                                <strong>
                                    Reglas de uso
                                </strong>

                                <ul>

                                    <li>
                                        Respetar los horarios asignados.
                                    </li>

                                    <li>
                                        Dejar el espacio en condiciones.
                                    </li>

                                    <li>
                                        Las reservas se cancelan con 24 h de anticipación.
                                    </li>

                                </ul>

                            </div>

                        </div>

                    </article>


                    {/* =========================
                        CALENDARIO
                    ========================= */}

                    <article className="panel-reservas calendario-reservas">

                        <div className="panel-reservas-header">

                            <div>

                                <h2>
                                    Calendario de reservas
                                </h2>

                                <span>
                                    Próximas actividades y reservas
                                </span>

                            </div>


                            <div className="calendario-mes">

                                <button>
                                    ‹
                                </button>

                                <strong>
                                    Mayo 2024
                                </strong>

                                <button>
                                    ›
                                </button>

                            </div>

                        </div>


                        <div className="eventos-reservas">

                            {eventos.map((evento, index) => (

                                <div
                                    className="evento-reserva"
                                    key={index}
                                >

                                    <div className="evento-fecha-reserva">

                                        <span>
                                            {evento.dia}
                                        </span>

                                        <strong>
                                            {evento.numero}
                                        </strong>

                                    </div>


                                    <div className="evento-info-reserva">

                                        <span>
                                            {evento.horario}
                                        </span>

                                        <strong>
                                            {evento.espacio}
                                        </strong>

                                    </div>


                                    <small
                                        className={
                                            evento.estado === "Confirmada"
                                                ? "evento-confirmado"
                                                : "evento-pendiente"
                                        }
                                    >
                                        {evento.estado}
                                    </small>

                                </div>

                            ))}

                        </div>


                        <button className="link-calendario">

                            Ver calendario completo

                            <ChevronRight size={14} />

                        </button>

                    </article>

                </div>

            </section>

        </main>
    );
}


export default Reservas;
