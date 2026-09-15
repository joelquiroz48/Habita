import { useEffect } from "react";
import { Link } from "react-router-dom";
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
    SlidersHorizontal,
    Tag,
} from "lucide-react";

import "./Avisos.css";
import TarjetaResumen from "../../../components/TarjetaResumen/TarjetaResumen";


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

const resumenAvisos = [
    {
        icono: Bell,
        titulo: "Avisos no leídos",
        valor: resumen.noLeidos,
        contenido: (
            <Link to="/avisos" className="aviso-resumen-link">
                Ver todos
            </Link>
        ),
    },
    {
        icono: CalendarDays,
        titulo: "Avisos este mes",
        valor: resumen.esteMes,
        contenido: (
            <Link to="/avisos" className="aviso-resumen-link">
                Ver todos
            </Link>
        ),
    },
    {
        icono: Bell,
        titulo: "Importantes",
        valor: resumen.importantes,
        contenido: (
            <Link to="/avisos" className="aviso-resumen-link">
                Ver todos
            </Link>
        ),
    },
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
                {resumenAvisos.map((item, index) => {
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

            <section className="avisos-grid">

                {/* =========================
                        COLUMNA PRINCIPAL
                ========================= */}

                <div className="avisos-principal">

                    {/* DESTACADOS */}

                    <section className="panel">

                        <div className="panel-header panel-header-junto">
                            <Megaphone />
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

                    <section className="panel">

                        <div className="panel-header">
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

                    <section className="panel">

                        <div className="panel-header panel-header-junto">
                            <SlidersHorizontal size={14} />
                            <h2>Filtros</h2>
                        </div>

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

                    <section className="panel">

                        <div className="panel-header panel-header-junto">
                            <Tag size={14} />
                            <h2>Categorias</h2>
                        </div>

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