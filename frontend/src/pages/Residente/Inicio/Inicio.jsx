import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
    WalletCards,
    CalendarDays,
    CalendarCheck,
    Megaphone,
    FileText,
    Download,
    TreePine,
    Lightbulb,
    Droplets,
    MessageCircle,
    ChevronRight,
    Clock3,
    CircleDollarSign,
} from "lucide-react";

import imagenPredeterminada from "../../../assets/img/imagen-predeterminada.png";
import "./Inicio.css";

// =========================
// DATOS DE EJEMPLO
// =========================

const resumen = {
    expensas: {
        monto: "$ 45.230",
        vencimiento: "Vence el 10/09/2026",
        estado: "Pendiente",
    },
    reunion: {
        dia: "15",
        mes: "SEPT",
        titulo: "Asamblea ordinaria",
        horario: "20:00 h · SUM",
    },
    reservas: {
        cantidad: 2,
        proxima: "Próxima: SUM",
        horario: "18/09 · 18:00 a 22:00",
    },
    avisos: {
        cantidad: 3,
        descripcion: "Desde tu última visita",
    },
};

const reservas = [
    {
        nombre: "Laundry",
        fecha: "12/09/2026",
        horario: "10:00 a 11:00",
        estado: "Pendiente",
        imagen: imagenPredeterminada,
    },
    {
        nombre: "SUM",
        fecha: "18/09/2026",
        horario: "18:00 a 22:00",
        estado: "Confirmada",
        imagen: imagenPredeterminada,
    },
    {
        nombre: "Parrilla 2",
        fecha: "25/09/2026",
        horario: "12:00 a 16:00",
        estado: "Confirmada",
        imagen: imagenPredeterminada,
    },
];

const avisos = [
    {
        titulo: "Corte de luz programado",
        descripcion:
            "El martes 8/09 de 9:00 a 13:00 habrá un corte de luz por tareas de EDENOR.",
        fecha: "31/08",
        icon: <Lightbulb />,
        clase: "amarillo",
    },
    {
        titulo: "Poda de árboles en espacios comunes",
        descripcion:
            "El próximo martes 15/09 se realizará la poda de árboles en el jardín del frente.",
        fecha: "Hoy",
        icon: <TreePine />,
        clase: "verde",
    },
    {
        titulo: "Ahorro de agua",
        descripcion:
            "Recordamos la importancia del uso responsable del agua en todo el edificio.",
        fecha: "27/08",
        icon: <Droplets />,
        clase: "azul",
    },
];

const documentos = [
    {
        nombre: "Reglamento de Copropiedad",
        tipo: "PDF",
        fecha: "Actualizado 12/08/2026",
        icon: "pdf",
    },
    {
        nombre: "Acta Asamblea Ordinaria 08/2026",
        tipo: "PDF",
        fecha: "10/08/2026",
        icon: "doc",
    },
    {
        nombre: "Recibo expensas 08/2026",
        tipo: "PDF",
        fecha: "10/08/2026",
        icon: "money",
    },
];

const eventos = [
    {
        dia: "5",
        mes: "SEPT",
        titulo: "SUM",
        info: "18:00 a 22:00 h · Reserva",
    },
    {
        dia: "7",
        mes: "SEPT",
        titulo: "Poda de árboles",
        info: "08:00 a 10:00 h · Espacios comunes",
    },
    {
        dia: "15",
        mes: "SEPT",
        titulo: "Asamblea ordinaria",
        info: "20:00 h · SUM",
    },
];

function Inicio() {

    useEffect(() => {
        document.title = "Habita | Inicio";
    }, []);

    return (
        <main className="inicio">

            {/* TARJETAS SUPERIORES */}

            <section className="resumen-grid">

                <article className="resumen-card">
                    <div className="resumen-icon">
                        <WalletCards />
                    </div>

                    <div>
                        <span className="resumen-label">
                            Expensas del mes
                        </span>

                        <strong>{resumen.expensas.monto}</strong>

                        <span className="vencimiento">
                            {resumen.expensas.vencimiento}
                        </span>

                        <span className="badge badge-pendiente">
                            {resumen.expensas.estado}
                        </span>
                    </div>
                </article>

                <article className="resumen-card">
                    <div className="resumen-icon">
                        <CalendarDays />
                    </div>

                    <div>
                        <span className="resumen-label">
                            Próxima reunión
                        </span>

                        <strong>
                            {resumen.reunion.dia}{" "}
                            <small>{resumen.reunion.mes}</small>
                        </strong>

                        <span className="resumen-info">
                            {resumen.reunion.titulo}
                        </span>

                        <span className="resumen-info">
                            {resumen.reunion.horario}
                        </span>
                    </div>
                </article>

                <article className="resumen-card">
                    <div className="resumen-icon">
                        <CalendarCheck />
                    </div>

                    <div>
                        <span className="resumen-label">
                            Reservas activas
                        </span>

                        <strong>{resumen.reservas.cantidad}</strong>

                        <span className="resumen-info">
                            {resumen.reservas.proxima}
                        </span>

                        <span className="resumen-info">
                            {resumen.reservas.horario}
                        </span>
                    </div>
                </article>

                <article className="resumen-card">
                    <div className="resumen-icon">
                        <Megaphone />
                    </div>

                    <div>
                        <span className="resumen-label">
                            Avisos nuevos
                        </span>

                        <strong>{resumen.avisos.cantidad}</strong>

                        <span className="resumen-info">
                            {resumen.avisos.descripcion}
                        </span>

                        <Link to="/avisos">Ver avisos</Link>
                    </div>
                </article>

            </section>

            {/* CONTENIDO CENTRAL */}

            <section className="contenido-grid">

                {/* EXPENSAS */}

                <article className="panel-card expensas-card">
                    <div className="panel-header">
                        <div className="panel-title">
                            <span className="panel-icon">
                                <FileText size={18} />
                            </span>

                            <h2>Estado de expensas</h2>

                            <span className="badge badge-pendiente">
                                Pendiente
                            </span>
                        </div>
                    </div>

                    <div className="expensas-content">
                        <span className="expensas-periodo">
                            Expensas ordinarias - Agosto 2026
                        </span>

                        <strong className="expensas-precio">
                            {resumen.expensas.monto}
                        </strong>

                        <div className="expensas-row">
                            <span>Vencimiento</span>
                            <span>10/9/2026</span>
                        </div>

                        <div className="expensas-row">
                            <span>Período</span>
                            <span>08/2026</span>
                        </div>

                        <div className="expensas-row">
                            <span>Estado</span>

                            <span className="texto-pendiente-expensa">
                                {resumen.expensas.estado} de pago
                            </span>
                        </div>

                        <button className="btn-principal">
                            Pagar ahora
                        </button>

                        <Link to="/expensas" className="btn-secundario">
                            <FileText size={16} />
                            Ver detalle de expensas
                        </Link>
                    </div>
                </article>

                {/* RESERVAS */}

                <article className="panel-card">
                    <div className="panel-header">
                        <h2>Próximas reservas</h2>
                        <Link to="/reservas">Ver todas</Link>
                    </div>

                    <div className="reservas-list">
                        {reservas.map((reserva, index) => (
                            <div className="reserva-item" key={index}>
                                <div className="reserva-imagen">
                                    <img
                                        src={reserva.imagen}
                                        alt={reserva.nombre}
                                    />
                                </div>

                                <div className="reserva-info">
                                    <strong>{reserva.nombre}</strong>

                                    <span>
                                        <CalendarDays size={12} />
                                        {reserva.fecha}
                                    </span>

                                    <span>
                                        <Clock3 size={12} />
                                        {reserva.horario}
                                    </span>

                                    <small
                                        className={
                                            reserva.estado === "Pendiente"
                                                ? "estado-pendiente"
                                                : "estado-confirmada"
                                        }
                                    >
                                        {reserva.estado}
                                    </small>
                                </div>
                            </div>
                        ))}
                    </div>

                    <Link className="link-abajo" to="/reservas">
                        Ir a mis reservas
                        <ChevronRight size={17} />
                    </Link>
                </article>

                {/* AVISOS */}

                <article className="panel-card">
                    <div className="panel-header">
                        <h2>Avisos del consorcio</h2>
                        <Link to="/avisos">Ver todos</Link>
                    </div>

                    <div className="avisos-list">
                        {avisos.map((aviso, index) => (
                            <div className="aviso-item" key={index}>
                                <div
                                    className={`aviso-icon ${aviso.clase}`}
                                >
                                    {aviso.icon}
                                </div>

                                <div className="aviso-info">
                                    <div>
                                        <strong>{aviso.titulo}</strong>
                                        <small>{aviso.fecha}</small>
                                    </div>

                                    <p>{aviso.descripcion}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <Link className="link-abajo" to="/avisos">
                        Ver todos los avisos
                        <ChevronRight size={17} />
                    </Link>
                </article>

                {/* DOCUMENTOS */}

                <article className="panel-card">
                    <div className="panel-header">
                        <h2>Documentos recientes</h2>
                        <Link to="/documentos">Ver todos</Link>
                    </div>

                    <div className="documentos-list">
                        {documentos.map((documento, index) => (
                            <div className="documento-item" key={index}>
                                <div
                                    className={`documento-icon ${documento.icon}`}
                                >
                                    {documento.icon === "pdf" && "PDF"}
                                    {documento.icon === "doc" && (
                                        <FileText size={17} />
                                    )}
                                    {documento.icon === "money" && (
                                        <CircleDollarSign size={17} />
                                    )}
                                </div>

                                <div>
                                    <strong>{documento.nombre}</strong>

                                    <span>
                                        {documento.tipo} · {documento.fecha}
                                    </span>
                                </div>

                                <button>
                                    <Download size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </article>

                {/* CALENDARIO */}

                <article className="panel-card">
                    <div className="panel-header">
                        <h2>Calendario comunitario</h2>
                        <a href="#">Ver calendario</a>
                    </div>

                    <div className="eventos-list">
                        {eventos.map((evento, index) => (
                            <div className="evento-item" key={index}>
                                <div className="evento-fecha">
                                    <span>{evento.mes}</span>
                                    <strong>{evento.dia}</strong>
                                </div>

                                <div>
                                    <strong>{evento.titulo}</strong>
                                    <span>{evento.info}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </article>

                {/* ASISTENTE */}

                <article className="panel-card asistente-card">
                    <div className="panel-header">
                        <h2>Asistente Habita</h2>
                    </div>

                    <p>
                        Tu asistente inteligente siempre
                        disponible para ayudarte.
                    </p>

                    <div className="preguntas">
                        <button>¿Cómo reservo el SUM?</button>
                        <button>¿Dónde veo mis expensas?</button>
                        <button>Quiero reportar un problema</button>
                    </div>

                    <button className="btn-asistente">
                        <MessageCircle size={17} />
                        Chatear con Habita
                    </button>
                </article>

            </section>
        </main>
    );
}

export default Inicio;