import { useEffect, useState } from "react";
import {
    Calendar,
    Clock,
    CheckCircle2,
    XCircle,
    Plus,
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
    { fecha: "25/05/2024", horario: "18:00 - 22:00", espacio: "SUM", ubicacion: "Planta baja", residente: "María Gómez", unidad: "3A", estado: "Confirmada", creada: "20/05/2024 10:15" },
    { fecha: "24/05/2024", horario: "14:00 - 18:00", espacio: "Parrilla", ubicacion: "Área común", residente: "Juan López", unidad: "7C", estado: "Pendiente", creada: "19/05/2024 16:40" },
    { fecha: "23/05/2024", horario: "19:00 - 23:00", espacio: "SUM", ubicacion: "Planta baja", residente: "Carla Romero", unidad: "1B", estado: "Confirmada", creada: "18/05/2024 11:20" },
    { fecha: "22/05/2024", horario: "09:00 - 13:00", espacio: "Gimnasio", ubicacion: "1° piso", residente: "Pedro Martínez", unidad: "2D", estado: "Cancelada", creada: "17/05/2024 09:30" },
    { fecha: "21/05/2024", horario: "15:00 - 19:00", espacio: "Sala de reuniones", ubicacion: "1° piso", residente: "Laura Sánchez", unidad: "4A", estado: "Confirmada", creada: "16/05/2024 14:10" },
    { fecha: "20/05/2024", horario: "18:00 - 22:00", espacio: "Parrilla", ubicacion: "Área común", residente: "Diego Fernández", unidad: "6E", estado: "Confirmada", creada: "15/05/2024 12:05" },
];

const totalReservas = 28;
const paginas = [1, 2, 3, 4];

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

function badgeClase(estado) {
    if (estado === "Confirmada") return "reservas-badge-confirmada";
    if (estado === "Pendiente") return "reservas-badge-pendiente";
    return "reservas-badge-cancelada";
}

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

            {/* CABECERA CON BOTON */}

            <div className="reservas-cabecera">
                <section className="reservas-kpi-grid">

                    <article className="reservas-kpi-card">
                        <div className="reservas-kpi-icon verde">
                            <Calendar />
                        </div>
                        <div>
                            <span className="reservas-kpi-label">Reservas este mes</span>
                            <strong>{kpis.reservasMes}</strong>
                            <span className="reservas-tendencia">↑ {kpis.tendencia}</span>
                        </div>
                    </article>

                    <article className="reservas-kpi-card">
                        <div className="reservas-kpi-icon amarillo">
                            <Clock />
                        </div>
                        <div>
                            <span className="reservas-kpi-label">Pendientes</span>
                            <strong>{kpis.pendientes}</strong>
                            <span className="reservas-kpi-info">Por confirmar</span>
                        </div>
                    </article>

                    <article className="reservas-kpi-card">
                        <div className="reservas-kpi-icon azul">
                            <CheckCircle2 />
                        </div>
                        <div>
                            <span className="reservas-kpi-label">Confirmadas</span>
                            <strong>{kpis.confirmadas}</strong>
                            <span className="reservas-kpi-info">Este mes</span>
                        </div>
                    </article>

                    <article className="reservas-kpi-card">
                        <div className="reservas-kpi-icon purpura">
                            <XCircle />
                        </div>
                        <div>
                            <span className="reservas-kpi-label">Canceladas</span>
                            <strong>{kpis.canceladas}</strong>
                            <span className="reservas-kpi-info">Este mes</span>
                        </div>
                    </article>

                </section>

                <button className="reservas-btn-nuevo">
                    <Plus size={16} />
                    Nueva reserva
                </button>
            </div>

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

                    <div className="reservas-tabla-card">
                        <div className="reservas-tabla-header">
                            <span>Fecha y hora</span>
                            <span>Espacio</span>
                            <span>Residente</span>
                            <span>Unidad</span>
                            <span>Estado</span>
                            <span>Creada el</span>
                            <span>Acciones</span>
                        </div>

                        <div className="reservas-tabla-body">
                            {reservasFiltradas.map((reserva, index) => {
                                const Icono = iconosEspacio[reserva.espacio];

                                return (
                                    <div className="reservas-tabla-fila" key={index}>
                                        <span className="reservas-fecha-celda">
                                            <Calendar size={14} />
                                            <span>
                                                {reserva.fecha}
                                                <small>{reserva.horario}</small>
                                            </span>
                                        </span>

                                        <span className="reservas-espacio-celda">
                                            <span className={`reservas-icono ${claseEspacio[reserva.espacio]}`}>
                                                <Icono size={16} />
                                            </span>
                                            <span>
                                                <strong>{reserva.espacio}</strong>
                                                <small>{reserva.ubicacion}</small>
                                            </span>
                                        </span>

                                        <span>{reserva.residente}</span>
                                        <span>{reserva.unidad}</span>

                                        <span className={`reservas-badge ${badgeClase(reserva.estado)}`}>
                                            {reserva.estado}
                                        </span>

                                        <span className="reservas-creada">{reserva.creada}</span>

                                        <span className="reservas-tabla-acciones">
                                            <button aria-label="Ver reserva">
                                                <Eye size={16} />
                                            </button>
                                            <button aria-label="Más opciones">
                                                <MoreVertical size={16} />
                                            </button>
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="reservas-paginacion">
                        <button className="reservas-pagina-flecha" aria-label="Página anterior">
                            <ChevronLeft size={16} />
                        </button>

                        {paginas.map((pagina) => (
                            <button
                                key={pagina}
                                className={`reservas-pagina ${pagina === 1 ? "activa" : ""}`}
                            >
                                {pagina}
                            </button>
                        ))}

                        <span className="reservas-pagina-puntos">...</span>

                        <button className="reservas-pagina">6</button>

                        <button className="reservas-pagina-flecha" aria-label="Página siguiente">
                            <ChevronRight size={16} />
                        </button>

                        <span className="reservas-paginacion-info">
                            Mostrando 1 a {reservas.length} de {totalReservas} reservas
                        </span>
                    </div>

                </section>

                {/* COLUMNA LATERAL */}

                <aside className="reservas-lateral">

                    {/* CALENDARIO */}

                    <div className="reservas-panel-card">
                        <div className="reservas-calendario-header">
                            <h2>Calendario de reservas</h2>
                        </div>

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
                                        className={`reservas-calendario-dia ${celda.fuera ? "fuera" : ""} ${celda.destacado ? "destacado" : ""}`}
                                    >
                                        {celda.dia}
                                    </span>
                                ))}
                            </div>
                        ))}
                    </div>

                    {/* PROXIMA RESERVA */}

                    <div className="reservas-panel-card">
                        <h2>Próxima reserva</h2>

                        <div className="reservas-proxima">
                            <span className={`reservas-icono ${claseEspacio[proximaReserva.espacio]}`}>
                                <Armchair size={18} />
                            </span>

                            <div className="reservas-proxima-info">
                                <strong>{proximaReserva.espacio} - {proximaReserva.ubicacion}</strong>

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

                        <button className="reservas-btn-detalle">Ver detalle</button>
                    </div>

                    {/* ESPACIOS MAS RESERVADOS */}

                    <div className="reservas-panel-card">
                        <h2>Espacios más reservados</h2>

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
                                            style={{ width: `${(espacio.cantidad / maxReservasEspacio) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <a href="#" className="reservas-link-reporte">
                            Ver reporte completo
                            <ChevronRight size={14} />
                        </a>
                    </div>

                </aside>

            </div>

        </main>
    );
}

export default Reservas;
