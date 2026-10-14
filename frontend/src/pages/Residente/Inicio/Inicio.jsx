import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
    WalletCards,
    CalendarDays,
    CalendarCheck,
    Megaphone,
    Clock3,
} from "lucide-react";

import imagenPredeterminada from "../../../assets/img/imagen-predeterminada.png";
import "./Inicio.css";
import TarjetaResumen from "../../../components/TarjetaResumen/TarjetaResumen";
import Panel from "../../../components/Panel/Panel";

/* Ruta del calendario comunitario (todavía no existe esa pantalla en App.jsx) */
const RUTA_CALENDARIO = "/calendario";

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
        id: 1,
        nombre: "Laundry",
        fecha: "12/09/2026",
        horario: "10:00 a 11:00",
        estado: "Pendiente",
        imagen: imagenPredeterminada,
    },
    {
        id: 2,
        nombre: "SUM",
        fecha: "18/09/2026",
        horario: "18:00 a 22:00",
        estado: "Confirmada",
        imagen: imagenPredeterminada,
    },
    {
        id: 3,
        nombre: "Parrilla 2",
        fecha: "25/09/2026",
        horario: "12:00 a 16:00",
        estado: "Confirmada",
        imagen: imagenPredeterminada,
    },
];

{/* =========================
       TARJETAS RESUMEN
========================== */}

const resumenTarjetas = [
    {
        icono: WalletCards,
        titulo: "Expensas",
        valor: resumen.expensas.monto,
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
        enlace: { texto: "Ver expensas", to: "/expensas" },
    },
    {
        icono: CalendarDays,
        titulo: "Próxima reunión",
        valor: resumen.reunion.fecha,
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
        enlace: { texto: "Ver calendario", to: RUTA_CALENDARIO },
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
        enlace: { texto: "Ver reservas", to: "/reservas" },
    },
    {
        icono: Megaphone,
        titulo: "Avisos nuevos",
        valor: resumen.avisos.cantidad,
        contenido: (
            <span className="resumen-info">
                {resumen.avisos.descripcion}
            </span>
        ),
        enlace: { texto: "Ver avisos", to: "/avisos" },
    },
];


function Inicio() {

    useEffect(() => {
        document.title = "Habita | Inicio";
    }, []);

    return (
        <main className="inicio">

            {/* =========================
                  RESUMEN SUPERIOR
            ========================= */}

            <section className="inicio-resumen">
                {resumenTarjetas.map((item) => {
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

            <section className="inicio-contenido">

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

            </section>
        </main>
    );
}

export default Inicio;
