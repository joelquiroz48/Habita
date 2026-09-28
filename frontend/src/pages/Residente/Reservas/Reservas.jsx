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
    ChevronLeft,
    CircleHelp,
    Info,
} from "lucide-react";

import imagenPredeterminada from "../../../assets/img/imagen-predeterminada.png";

import "./Reservas.css";
import TarjetaResumen from "../../../components/TarjetaResumen/TarjetaResumen";
import Panel from "../../../components/Panel/Panel";

/* =========================
        DATOS DE EJEMPLO
========================= */

const resumenReservas = [
    {
        titulo: "Reservas activas",
        valor: "3",
        detalle: "2 confirmada · 1 pendiente",
        icono: CalendarDays,
    },
    {
        titulo: "Próxima reserva",
        valor: "18/09/26",
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
        fecha: "18/09/2026",
        horario: "18:00 a 22:00",
        estado: "Confirmada",
        imagen: imagenPredeterminada,
        numero: "#7842",
    },
    {
        nombre: "Parrilla 2",
        fecha: "25/09/2026",
        horario: "12:00 a 16:00",
        estado: "Confirmada",
        imagen: imagenPredeterminada,
        numero: "#7849",
    },
    {
        nombre: "Laundry",
        fecha: "12/09/2026",
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
        numero: "5",
        horario: "18:00 a 22:00",
        espacio: "SUM",
        estado: "Confirmada",
    },
    {
        dia: "LUN",
        numero: "7",
        horario: "08:00 a 10:00",
        espacio: "Poda de árboles",
        estado: "Confirmada",
    },
    {
        dia: "JUE",
        numero: "10",
        horario: "09:00 a 13:00",
        espacio: "Corte de luz programado",
        estado: "Confirmada",
    },
    {
        dia: "SÁB",
        numero: "12",
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
                        <TarjetaResumen
                            key={index}
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
                        accion={
                            <button className="btn-nueva-reserva">
                                <Plus />
                                Nueva reserva
                            </button>
                        }
                        className="mis-reservas"
                    >
                        <div className="reservas-lista">
                            {reservasActivas.map((reserva) => (
                                <div className="reserva-card" key={reserva.id}>
                                    <div className="reserva-card-imagen">
                                        <img src={reserva.imagen} alt={reserva.nombre}/>
                                    </div>

                                    <div className="reserva-card-info">

                                        <div className="reserva-card-titulo">
                                            <strong>{reserva.nombre}</strong>

                                            <small className={
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
                                                <CalendarDays />
                                                {reserva.fecha}
                                            </span>

                                            <span>
                                                <Clock3 />
                                                {reserva.horario}
                                            </span>
                                        </div>

                                        <small className="numero-reserva">Reserva {reserva.numero}</small>

                                    </div>

                                    <div className="reserva-card-acciones">
                                        <button>
                                            <Eye />
                                            Ver detalle
                                        </button>

                                        {reserva.estado === "Confirmada" && (
                                            <button>
                                                <Pencil />
                                                Modificar
                                            </button>
                                        )}

                                        {reserva.estado === "Pendiente" && (
                                            <button className="btn-cancelar">
                                                <X />
                                                Cancelar
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Panel>

                    {/* ESPACIOS DISPONIBLES */}

                    <Panel titulo="Espacios comunes disponibles" descripcion="Elegí un espacio para realizar una reserva" className="espacios-disponibles">
                        <div className="espacios-grid">
                            {espaciosDisponibles.map((espacio) => (
                                <div className="espacio-card" key={espacio.id}>
                                    <div className="espacio-imagen">
                                        <img src={espacio.imagen} alt={espacio.nombre}/>
                                    </div>

                                    <div className="espacio-info">
                                        <strong>{espacio.nombre}</strong>

                                        <span>{espacio.capacidad}</span>

                                        <button>Reservar</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Panel>

                    {/* AYUDA */}

                    <Panel titulo="Ayuda sobre reservas" descripcion="Información útil para reservar espacios" className="ayuda-reservas">
                        <div className="ayuda-reserva-item">
                            <div className="ayuda-reserva-icon"><CircleHelp /></div>

                            <div>
                                <strong>¿Cómo reservo el SUM?</strong>

                                <span>Conocé el proceso para realizar una reserva.</span>
                            </div>

                            <ChevronRight />
                        </div>

                        <div className="ayuda-reserva-item">
                            <div className="ayuda-reserva-icon"><CalendarDays /></div>

                            <div>
                                <strong>Políticas de cancelación</strong>

                                <span>Consultá cuándo podés cancelar una reserva.</span>
                            </div>

                            <ChevronRight  />
                        </div>

                        <div className="ayuda-reserva-item">
                            <div className="ayuda-reserva-icon"><Info /></div>

                            <div>
                                <strong>Espacios y horarios disponibles</strong>

                                <span>Revisá las condiciones de cada espacio.</span>
                            </div>

                            <ChevronRight />
                        </div>
                    </Panel>

                </section>

                {/* =========================
                      COLUMNA DERECHA
                ========================= */}

                <section className="reservas-columna">

                    {/* NUEVA RESERVA */}

                    <Panel titulo="Nueva reserva" descripcion="Completá los datos para reservar un espacio" className="nueva-reserva">
                        <form className="form-reserva">
                            <div className="campo-reserva">
                                <label>Espacio</label>
                                <select>
                                    <option>SUM</option>
                                    <option>Parrilla 1</option>
                                    <option>Parrilla 2</option>
                                    <option>Laundry</option>
                                    <option>Sala de reuniones</option>
                                </select>
                            </div>

                            <div className="campo-reserva">
                                <label>Fecha</label>
                                <div className="input-icono">
                                    <input type="date" defaultValue="2026-09-03"/>
                                </div>
                            </div>

                            <div className="campo-reserva">
                                <label>Horario</label>
                                <select>
                                    <option>18:00 a 22:00</option>
                                    <option>12:00 a 16:00</option>
                                    <option>10:00 a 11:00</option>
                                    <option>08:00 a 10:00</option>
                                </select>
                            </div>

                            <div className="campo-reserva">
                                <label>Cantidad de invitados</label>
                                <select>
                                    <option>20</option>
                                    <option>10</option>
                                    <option>5</option>
                                    <option>2</option>
                                </select>
                            </div>

                            <button type="button" className="btn-solicitar">Solicitar reserva</button>

                            <button type="button" className="btn-limpiar">Ver reglamento</button>
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

                    <Panel titulo="Calendario de reservas" descripcion="Próximas actividades y reservas" className="calendario-reservas">
                        <div className="calendario-mes">
                            <button><ChevronLeft /></button>

                            <strong>Septiembre 2026</strong>

                            <button><ChevronRight /></button>
                        </div>

                        <div className="eventos-reservas">
                            {eventos.map((evento) => (
                                <div className="evento-reserva" key={evento.id}>
                                    <div className="evento-fecha-reserva">
                                        <span>{evento.dia}</span>
                                        <strong>{evento.numero}</strong>
                                    </div>

                                    <div className="evento-info-reserva">
                                        <span>{evento.horario}</span>
                                        <strong>{evento.espacio}</strong>
                                    </div>

                                    <small className={
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
                            <ChevronRight />
                        </button>
                    </Panel>

                </section>

            </section>

        </main>
    );
}


export default Reservas;
