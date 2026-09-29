import { useEffect, useState } from "react";
import {
    Calendar,
    Clock,
    CheckCircle2,
    XCircle,
    ChevronDown,
    Search,
    Eye,
    MoreVertical,
    ChevronLeft,
    ChevronRight,
    Armchair,
    Flame,
    Dumbbell,
    Users,
    Clock3,
    User,
} from "lucide-react";

import "./Reservas.css";
import Panel from "../../../components/Panel/Panel";
import TarjetaResumen from "../../../components/TarjetaResumen/TarjetaResumen";
import Tabla from "../../../components/Tabla/Tabla";

// =========================
// DATOS DE EJEMPLO
// =========================

const kpis = {
    reservasMes: 28,
    tendencia: "+12% vs. mes anterior",
    pendientes: 5,
    confirmadas: 21,
    canceladas: 2,
};

const iconosEspacio = {
    "SUM": Armchair,
    "Parrilla": Flame,
    "Gimnasio": Dumbbell,
    "Sala de reuniones": Users,
};

const claseEspacio = {
    "SUM": "sum",
    "Parrilla": "parrilla",
    "Gimnasio": "gimnasio",
    "Sala de reuniones": "sala",
};

const reservas = [
    {
        fecha: "18/09/2026",
        horario: "18:00 - 22:00",
        espacio: "SUM",
        ubicacion: "Planta baja",
        residente: "María Gómez",
        unidad: "3A",
        estado: "Confirmada",
        creada: "01/09/2026 10:15",
    },
    {
        fecha: "25/09/2026",
        horario: "14:00 - 18:00",
        espacio: "Parrilla",
        ubicacion: "Área común",
        residente: "Juan López",
        unidad: "7C",
        estado: "Pendiente",
        creada: "31/08/2026 16:40",
    },
    {
        fecha: "20/09/2026",
        horario: "19:00 - 23:00",
        espacio: "SUM",
        ubicacion: "Planta baja",
        residente: "Carla Romero",
        unidad: "1B",
        estado: "Confirmada",
        creada: "30/08/2026 11:20",
    },
    {
        fecha: "02/09/2026",
        horario: "09:00 - 13:00",
        espacio: "Gimnasio",
        ubicacion: "1° piso",
        residente: "Pedro Martínez",
        unidad: "2D",
        estado: "Cancelada",
        creada: "29/08/2026 09:30",
    },
    {
        fecha: "22/09/2026",
        horario: "15:00 - 19:00",
        espacio: "Sala de reuniones",
        ubicacion: "1° piso",
        residente: "Laura Sánchez",
        unidad: "4A",
        estado: "Confirmada",
        creada: "28/08/2026 14:10",
    },
    {
        fecha: "27/09/2026",
        horario: "18:00 - 22:00",
        espacio: "Parrilla",
        ubicacion: "Área común",
        residente: "Diego Fernández",
        unidad: "6E",
        estado: "Confirmada",
        creada: "27/08/2026 12:05",
    },
];

const tabs = ["Todas", "Pendientes", "Confirmadas", "Canceladas"];

const estadoPorTab = {
    "Pendientes": "Pendiente",
    "Confirmadas": "Confirmada",
    "Canceladas": "Cancelada",
};

// Calendario de Mayo 2024, armado a mano (estatico, no calcula el mes real)
const semanasCalendario = [
    [{ dia: 29, fuera: true }, { dia: 30, fuera: true }, { dia: 1 }, { dia: 2 }, { dia: 3 }, { dia: 4 }, { dia: 5 }],
    [{ dia: 6 }, { dia: 7 }, { dia: 8 }, { dia: 9 }, { dia: 10 }, { dia: 11 }, { dia: 12 }],
    [{ dia: 13 }, { dia: 14 }, { dia: 15 }, { dia: 16 }, { dia: 17 }, { dia: 18 }, { dia: 19 }],
    [{ dia: 20 }, { dia: 21 }, { dia: 22 }, { dia: 23 }, { dia: 24 }, { dia: 25, destacado: true }, { dia: 26 }],
    [{ dia: 27 }, { dia: 28 }, { dia: 29 }, { dia: 30 }, { dia: 31 }, { dia: 1, fuera: true }, { dia: 2, fuera: true }],
];

const proximaReserva = {
    espacio: "SUM", ubicacion: "Planta baja", fecha: "25/05/2024",
    horario: "18:00 - 22:00", residente: "María Gómez", unidad: "3A",
};

const espaciosMasReservados = [
    { nombre: "SUM", cantidad: 12 },
    { nombre: "Parrilla", cantidad: 8 },
    { nombre: "Gimnasio", cantidad: 5 },
    { nombre: "Sala de reuniones", cantidad: 3 },
];
const maxReservasEspacio = Math.max(...espaciosMasReservados.map((e) => e.cantidad));

const resumenTarjetas = [
    {
        icono: Calendar,
        titulo: "Reservas este mes",
        valor: kpis.reservasMes,
        contenido: <span className="reservas-tendencia">↑ {kpis.tendencia}</span>,
    },
    {
        icono: Clock,
        titulo: "Pendientes",
        valor: kpis.pendientes,
        contenido: <span>Por confirmar</span>,
    },
    {
        icono: CheckCircle2,
        titulo: "Confirmadas",
        valor: kpis.confirmadas,
        contenido: <span>Este mes</span>,
    },
    {
        icono: XCircle,
        titulo: "Canceladas",
        valor: kpis.canceladas,
        contenido: <span>Este mes</span>,
    },
];

function badgeClase(estado) {
    if (estado === "Confirmada") return "reservas-badge-confirmada";
    if (estado === "Pendiente") return "reservas-badge-pendiente";
    return "reservas-badge-cancelada";
}

const columnas = [
    {
        clave: "fecha",
        titulo: "Fecha y hora",
        ancho: "1fr",
        render: (reserva) => (
            <span className="reservas-fecha-celda">
                <span>
                    {reserva.fecha}
                    <small>{reserva.horario}</small>
                </span>
            </span>
        ),
    },
    {
        clave: "espacio",
        titulo: "Espacio",
        ancho: "1.2fr",
        render: (reserva) => {
            const Icono = iconosEspacio[reserva.espacio];

            return (
                <span className="reservas-espacio-celda">
                    <span className={`reservas-icono ${claseEspacio[reserva.espacio]}`}>
                        <Icono size={16} />
                    </span>
                    <span>
                        <strong>{reserva.espacio}</strong>
                        <small>{reserva.ubicacion}</small>
                    </span>
                </span>
            );
        },
    },
    { clave: "residente", titulo: "Residente", ancho: "1fr" },
    { clave: "unidad", titulo: "Unidad", ancho: "0.6fr" },
    {
        clave: "estado",
        titulo: "Estado",
        ancho: "0.9fr",
        render: (reserva) => (
            <span className={`reservas-badge ${badgeClase(reserva.estado)}`}>
                {reserva.estado}
            </span>
        ),
    },
    { clave: "creada", titulo: "Creada el", ancho: "1fr", clase: "reservas-creada" },
    {
        clave: "acciones",
        titulo: "Acciones",
        ancho: "0.7fr",
        render: () => (
            <span className="reservas-tabla-acciones">
                <button aria-label="Ver reserva">
                    <Eye size={16} />
                </button>
                <button aria-label="Más opciones">
                    <MoreVertical size={16} />
                </button>
            </span>
        ),
    },
];

function Reservas() {

    const [tabActiva, setTabActiva] = useState("Todas");

    useEffect(() => {
        document.title = "Habita | Reservas";
    }, []);

    const reservasFiltradas = tabActiva === "Todas"
        ? reservas
        : reservas.filter((r) => r.estado === estadoPorTab[tabActiva]);

    return (
        <main className="reservas">

            {/* =========================
                  RESUMEN SUPERIOR
            ========================= */}

            <section className="reservas-resumen">
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

            {/* FILTROS */}

            <div className="reservas-filtros">
                <button className="reservas-filtro">
                    Todos los espacios
                    <ChevronDown size={15} />
                </button>

                <button className="reservas-filtro">
                    Todos los estados
                    <ChevronDown size={15} />
                </button>

                <button className="reservas-filtro">
                    <Calendar size={15} />
                    01/05/2024 - 31/05/2024
                    <ChevronDown size={15} />
                </button>

                <div className="reservas-buscador">
                    <Search size={16} />
                    <input type="text" placeholder="Buscar reserva, residente o unidad..." />
                </div>
            </div>

            {/* CONTENIDO */}

            <div className="reservas-contenido">

                <section className="reservas-listado">

                    <div className="reservas-tabs">
                        {tabs.map((tab) => (
                            <button
                                key={tab}
                                className={`reservas-tab ${tab === tabActiva ? "activo" : ""}`}
                                onClick={() => setTabActiva(tab)}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <Tabla
                        columnas={columnas}
                        datos={reservasFiltradas}
                        etiqueta="reservas"
                        className="reservas-tabla"
                    />

                </section>

                {/* COLUMNA LATERAL */}

                <aside className="reservas-lateral">

                    {/* CALENDARIO */}

                    <Panel titulo="Calendario de reservas">
                        <div className="reservas-calendario-nav">
                            <button aria-label="Mes anterior">
                                <ChevronLeft size={16} />
                            </button>

                            <strong>Mayo 2024</strong>

                            <button aria-label="Mes siguiente">
                                <ChevronRight size={16} />
                            </button>
                        </div>

                        <div className="reservas-calendario-dias-nombre">
                            {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => (
                                <span key={d}>{d}</span>
                            ))}
                        </div>

                        {semanasCalendario.map((semana, i) => (
                            <div className="reservas-calendario-semana" key={i}>
                                {semana.map((celda, j) => (
                                    <span
                                        key={j}
                                        className={`reservas-calendario-dia ${
                                            celda.fuera ? "fuera" : ""
                                        } ${celda.destacado ? "destacado" : ""}`}
                                    >
                                        {celda.dia}
                                    </span>
                                ))}
                            </div>
                        ))}
                    </Panel>

                    {/* PROXIMA RESERVA */}

                    <Panel titulo="Próxima reserva">
                        <div className="reservas-proxima">
                            <span className={`reservas-icono ${claseEspacio[proximaReserva.espacio]}`}>
                                <Armchair size={18} />
                            </span>

                            <div className="reservas-proxima-info">
                                <strong>
                                    {proximaReserva.espacio} - {proximaReserva.ubicacion}
                                </strong>

                                <span>
                                    <Calendar size={13} />
                                    {proximaReserva.fecha}
                                </span>

                                <span>
                                    <Clock3 size={13} />
                                    {proximaReserva.horario}
                                </span>

                                <span>
                                    <User size={13} />
                                    {proximaReserva.residente} (Unidad {proximaReserva.unidad})
                                </span>
                            </div>
                        </div>

                        <button className="reservas-btn-detalle">
                            Ver detalle
                        </button>
                    </Panel>

                    {/* ESPACIOS MAS RESERVADOS */}

                    <Panel titulo="Espacios más reservados">
                        <div className="reservas-barras-lista">
                            {espaciosMasReservados.map((espacio) => (
                                <div className="reservas-barra-fila" key={espacio.nombre}>
                                    <div className="reservas-barra-header">
                                        <span>{espacio.nombre}</span>
                                        <strong>{espacio.cantidad}</strong>
                                    </div>

                                    <div className="reservas-barra-pista">
                                        <div
                                            className="reservas-barra-relleno"
                                            style={{
                                                width: `${
                                                    (espacio.cantidad / maxReservasEspacio) * 100
                                                }%`
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <a href="#" className="reservas-link-reporte">
                            Ver reporte completo
                            <ChevronRight size={14} />
                        </a>
                    </Panel>

                </aside>

            </div>

        </main>
    );
}

export default Reservas;
