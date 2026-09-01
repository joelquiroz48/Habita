import { useEffect } from "react";
import {
    CalendarDays,
    Megaphone,
    Bell,
    AlertTriangle,
    Users,
    TreePine,
    FileText,
    Droplets,
    Wrench,
    Shield,
    ChevronRight,
    Search,
} from "lucide-react";

import "./Avisos.css";

// =========================
// DATOS DE EJEMPLO
// =========================

const resumen = {
    noLeidos: 4,
    esteMes: 7,
    importantes: 3,
};

const avisosDestacados = [
    {
        titulo: "Asamblea ordinaria",
        descripcion:
            "El próximo martes 15/09 se realizará la asamblea ordinaria del consorcio a las 20:00 h en el SUM.",
        fecha: "01/09/2026",
        autor: "Administración",
        tipo: "Importante",
        clase: "importante",
        icon: <Users size={18} />,
    },
    {
        titulo: "Corte de luz programado",
        descripcion:
            "El martes 8/09 de 9:00 a 13:00 habrá un corte de luz por tareas de EDENOR.",
        fecha: "01/09/2026",
        autor: "Administración",
        tipo: "Importante",
        clase: "importante",
        icon: <AlertTriangle size={18} />,
    },
    {
        titulo: "Poda de árboles en espacios comunes",
        descripcion:
            "El próximo martes 15/09 se realizará la poda de árboles en el jardín del frente.",
        fecha: "31/08/2026",
        autor: "Administración",
        tipo: "Importante",
        clase: "importante",
        icon: <TreePine size={18} />,
    },
];

const avisos = [
    {
        titulo: "Asamblea ordinaria",
        descripcion:
            "El próximo martes 15/09 se realizará la asamblea ordinaria del consorcio a las 20:00 h en el SUM.",
        fecha: "01/09/2026",
        clase: "violeta",
        icon: <Users size={17} />,
        categoria: "Eventos",
        leido: false,
    },
    {
        titulo: "Corte de luz programado",
        descripcion:
            "El martes 8/09 de 9:00 a 13:00 habrá un corte de luz por tareas de EDENOR.",
        fecha: "01/09/2026",
        clase: "rojo",
        icon: <AlertTriangle size={17} />,
        categoria: "Mantenimiento",
        leido: false,
    },
    {
        titulo: "Poda de árboles en espacios comunes",
        descripcion:
            "El próximo martes 15/09 se realizará la poda de árboles en el jardín del frente.",
        fecha: "31/08/2026",
        clase: "verde",
        icon: <TreePine size={17} />,
        categoria: "Mantenimiento",
        leido: false,
    },
    {
        titulo: "Ahorro de agua",
        descripcion:
            "Recordamos la importancia del uso responsable del agua en todo el edificio.",
        fecha: "27/08/2026",
        clase: "celeste",
        icon: <Droplets size={17} />,
        categoria: "Servicios",
        leido: true,
    },    
    {
        titulo: "Recepción de paquetes",
        descripcion:
            "Recordamos que los paquetes se pueden recibir en la administración durante el horario de atención.",
        fecha: "25/08/2026",
        clase: "violeta",
        icon: <FileText size={17} />,
        categoria: "Servicios",
        leido: false,
    },
    {
        titulo: "Revisión de matafuegos",
        descripcion:
            "El próximo miércoles se realizará la revisión y mantenimiento de los matafuegos de los espacios comunes.",
        fecha: "21/08/2026",
        clase: "naranja",
        icon: <Wrench size={17} />,
        categoria: "Mantenimiento",
        leido: true,
    },
    {
        titulo: "Recordatorio de seguridad",
        descripcion:
            "Recordamos mantener cerrada la puerta de acceso al edificio y no permitir el ingreso de personas desconocidas.",
        fecha: "19/08/2026",
        clase: "rojo",
        icon: <Shield size={17} />,
        categoria: "Seguridad",
        leido: true,
    },
];

const categorias = [
    { nombre: "Mantenimiento", cantidad: 4 },
    { nombre: "Administración", cantidad: 3 },
    { nombre: "Seguridad", cantidad: 2 },
    { nombre: "Eventos", cantidad: 3 },
    { nombre: "Servicios", cantidad: 1 },
];

function Avisos() {
    useEffect(() => {
        document.title = "Habita | Avisos";
    }, []);

    return (
        <main className="avisos">

            {/* =========================
                    RESUMEN SUPERIOR
            ========================= */}

            <section className="avisos-resumen">

                <article className="aviso-resumen-card">
                    <div className="aviso-resumen-icon verde">
                        <Bell size={20} />
                    </div>

                    <div>
                        <span className="aviso-resumen-label">
                            Avisos no leídos
                        </span>

                        <strong>{resumen.noLeidos}</strong>

                        <span className="aviso-resumen-link">
                            Ver todos
                        </span>
                    </div>
                </article>

                <article className="aviso-resumen-card">
                    <div className="aviso-resumen-icon violeta">
                        <CalendarDays size={20} />
                    </div>

                    <div>
                        <span className="aviso-resumen-label">
                            Avisos este mes
                        </span>

                        <strong>{resumen.esteMes}</strong>

                        <span className="aviso-resumen-link">
                            Ver todos
                        </span>
                    </div>
                </article>

                <article className="aviso-resumen-card">
                    <div className="aviso-resumen-icon naranja">
                        <Bell size={20} />
                    </div>

                    <div>
                        <span className="aviso-resumen-label">
                            Importantes
                        </span>

                        <strong>{resumen.importantes}</strong>

                        <span className="aviso-resumen-link">
                            Ver todos
                        </span>
                    </div>
                </article>

            </section>

            {/* =========================
                    CONTENIDO PRINCIPAL
            ========================= */}

            <section className="avisos-grid">

                {/* =========================
                        COLUMNA PRINCIPAL
                ========================= */}

                <div className="avisos-principal">

                    {/* DESTACADOS */}

                    <section className="avisos-seccion">

                        <div className="avisos-seccion-titulo">
                            <Megaphone size={14} />
                            <h2>Avisos destacados</h2>
                        </div>

                        <div className="avisos-destacados">

                            {avisosDestacados.map((aviso, index) => (
                                <article
                                    className={`aviso-destacado ${aviso.clase}`}
                                    key={index}
                                >
                                    <div className="aviso-destacado-icon">
                                        {aviso.icon}
                                    </div>

                                    <div className="aviso-destacado-contenido">

                                        <div className="aviso-destacado-header">
                                            <span className="aviso-tipo">
                                                {aviso.tipo}
                                            </span>

                                            <span className="aviso-punto" />
                                        </div>

                                        <h3>{aviso.titulo}</h3>

                                        <p>{aviso.descripcion}</p>

                                        <div className="aviso-meta">
                                            <span>
                                                <CalendarDays size={12} />
                                                {aviso.fecha}
                                            </span>

                                            <span>
                                                {aviso.autor}
                                            </span>
                                        </div>

                                    </div>

                                    <button className="aviso-ver-mas">
                                        Ver más
                                        <ChevronRight size={15} />
                                    </button>

                                </article>
                            ))}

                        </div>

                    </section>

                    {/* TODOS LOS AVISOS */}

                    <section className="avisos-seccion todos-avisos">

                        <div className="avisos-seccion-header">
                            <h2>Todos los avisos</h2>

                            <span className="avisos-contador">
                                {avisos.length} avisos
                            </span>
                        </div>

                        <div className="avisos-lista">

                            {avisos.map((aviso, index) => (
                                <article
                                    className={`aviso-lista-item ${
                                        !aviso.leido ? "no-leido" : ""
                                    }`}
                                    key={index}
                                >

                                    <div
                                        className={`aviso-lista-icon ${aviso.clase}`}
                                    >
                                        {aviso.icon}
                                    </div>

                                    <div className="aviso-lista-contenido">

                                        <div className="aviso-lista-header">
                                            <h3>{aviso.titulo}</h3>

                                            <span>
                                                {aviso.fecha}
                                            </span>
                                        </div>

                                        <p>{aviso.descripcion}</p>

                                        <small>
                                            {aviso.categoria}
                                        </small>

                                    </div>

                                    {!aviso.leido && (
                                        <span className="aviso-no-leido" />
                                    )}

                                    <ChevronRight
                                        className="aviso-chevron"
                                        size={17}
                                    />

                                </article>
                            ))}

                        </div>

                    </section>

                </div>

                {/* =========================
                        COLUMNA LATERAL
                ========================= */}

                <aside className="avisos-lateral">

                    {/* FILTROS */}

                    <section className="avisos-panel">

                        <h2>Filtrar avisos</h2>

                        <div className="buscador-avisos">
                            <input
                                type="text"
                                placeholder="Buscar avisos..."
                            />

                            <Search size={15} />
                        </div>

                        <div className="filtros-lista">

                            <button className="filtro-activo">
                                Todos
                            </button>

                            <button>
                                No leídos
                                <span className="filtro-punto verde" />
                            </button>

                            <button>
                                Importantes
                                <span className="filtro-punto rojo" />
                            </button>

                            <button>
                                Recordatorios
                                <span className="filtro-punto amarillo" />
                            </button>

                            <button>
                                Informativos
                                <span className="filtro-punto azul" />
                            </button>

                        </div>

                    </section>

                    {/* CATEGORÍAS */}

                    <section className="avisos-panel categorias-panel">

                        <h2>Categorías</h2>

                        <div className="categorias-lista">

                            {categorias.map((categoria, index) => (
                                <button key={index}>
                                    <span>{categoria.nombre}</span>
                                    <small>{categoria.cantidad}</small>
                                </button>
                            ))}

                        </div>

                    </section>

                </aside>

            </section>

        </main>
    );
}

export default Avisos;