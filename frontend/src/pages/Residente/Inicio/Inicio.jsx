import ChatWidget from "../../../components/Layout/ChatWidget/ChatWidget";

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
    Clock3,
    CircleDollarSign,
} from "lucide-react";

import imagenPredeterminada from "../../../assets/img/imagen-predeterminada.png";
import "./Inicio.css";
import TarjetaResumen from "../../../components/TarjetaResumen/TarjetaResumen";
import Panel from "../../../components/Panel/Panel";

{/* =========================
       DATOS EJEMPLO
========================== */}

const resumen = {
    expensas: {
        monto: "$ 45.230",
        vencimiento: "Vence el 10/09/2026",
        estado: "Pendiente",
    },
    reunion: {
        fecha: "05/09/2026",
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

{/* =========================
       TARJETAS RESUMEN
========================== */}

const resumenTarjetas = [
    {
        icono: WalletCards,
        titulo: "Expensas",
        valor: "$ 45.230",
        contenido: (
            <>
                <span className="vencimiento">
                    {resumen.expensas.vencimiento}
                </span>
                <span className="badge badge-pendiente">
                    {resumen.expensas.estado}
                </span>
            </>
        ),
    },
    {
        icono: CalendarDays,
        titulo: "Próxima reunión",
        valor: (
            <>
                {resumen.reunion.fecha}
            </>
        ),
        contenido: (
            <>
                <span className="resumen-info">
                    {resumen.reunion.titulo}
                </span>
                <span className="resumen-info">
                    {resumen.reunion.horario}
                </span>
            </>
        ),
    },
    {
        icono: CalendarCheck,
        titulo: "Reservas activas",
        valor: resumen.reservas.cantidad,
        contenido: (
            <>
                <span className="resumen-info">
                    {resumen.reservas.proxima}
                </span>
                <span className="resumen-info">
                    {resumen.reservas.horario}
                </span>
            </>
        ),
    },
    {
        icono: Megaphone,
        titulo: "Avisos nuevos",
        valor: resumen.avisos.cantidad,
        contenido: (
            <>
                <span className="resumen-info">
                    {resumen.avisos.descripcion}
                </span>
                <Link to="/avisos">Ver avisos</Link>
            </>
        ),
    },
];


function Inicio({ onAbrirChat }) {

    useEffect(() => {
        document.title = "Habita | Inicio";
    }, []);

    return (
        <main className="inicio">

            {/* =========================
                  RESUMEN SUPERIOR
            ========================= */}

            <section className="inicio-resumen">
                {resumenTarjetas.map((item, index) => {
                    const Icono = item.icono;
                    return (
                        <TarjetaResumen
                            key={index}
                            icono={<Icono />}
                            titulo={item.titulo}
                            valor={item.valor}
                            contenido={item.contenido}
                        />
                    );
                })}
            </section>

            {/* =========================
                CONTENIDO PRINCIPAL
            ========================= */}

            <section className="inicio-contenido">

                {/* EXPENSAS */}

                <Panel titulo="Estado de expensas" accion={<Link to="/expensas">Ver detalles</Link>}>
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
                            <span>{resumen.expensas.estado} de pago</span>
                        </div>

                        <button className="btn-principal">Pagar ahora</button>

                    </div>
                </Panel>

                {/* RESERVAS */}

                <Panel titulo="Próximas reservas" accion={<Link to="/reservas">Ver todas</Link>}>
                    <div className="reservas-list">
                        {reservas.map((reserva) => (
                            <div className="reserva-item" key={reserva.id}>

                                <div className="reserva-imagen">
                                    <img src={reserva.imagen} alt={reserva.nombre}/>
                                </div>

                                <div className="reserva-info">
                                    <strong>{reserva.nombre}</strong>

                                    <span>
                                        <CalendarDays />
                                        {reserva.fecha}
                                    </span>

                                    <span>
                                        <Clock3 />
                                        {reserva.horario}
                                    </span>

                                    <small className={
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
                </Panel>

                {/* AVISOS */}

                <Panel titulo="Avisos del consorcio" accion={<Link to="/avisos">Ver todos</Link>}>
                    <div className="avisos-list">
                        {avisos.map((aviso) => (
                            <div className="aviso-item" key={aviso.id}>

                                <div className={`aviso-icon ${aviso.clase}`}>
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
                </Panel>

                {/* DOCUMENTOS */}

                <Panel titulo="Documentos recientes" accion={<Link to="/documentos">Ver todos</Link>}>
                    <div className="documentos-list">
                        {documentos.map((documento) => (
                            <div className="documento-item" key={documento.id}>
                                <div className={`documento-icon ${documento.icon}`}>
                                    {documento.icon === "pdf" && "PDF"}

                                    {documento.icon === "doc" && (
                                        <FileText />
                                    )}

                                    {documento.icon === "money" && (
                                        <CircleDollarSign />
                                    )}
                                </div>

                                <div>
                                    <strong>{documento.nombre}</strong>
                                    <span>
                                        {documento.tipo} · {documento.fecha}
                                    </span>
                                </div>

                                <button>
                                    <Download />
                                </button>
                            </div>
                        ))}
                    </div>
                </Panel>

                {/* CALENDARIO */}

                <Panel titulo="Calendario comunitario" accion={<Link to="/calendario">Ver calendario</Link>}>
                    <div className="eventos-list">
                        {eventos.map((evento) => (
                            <div className="evento-item" key={evento.id}>
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
                </Panel>

                {/* ASISTENTE */}
                <article className="panel-card asistente-card">
                    <div className="panel-header">
                        <h2>Asistente Habita</h2>
                    </div>

                    {/* Al hacer clic en el botón, abre el Chat Flotante del Layout */}
                    <ChatWidget onAbrir={onAbrirChat} />
                </article>
            </section>
        </main>
    );
}

export default Inicio;