import { useEffect } from "react";
import {
    Search,
    ChevronDown,
    Plus,
    Pencil,
    MoreVertical,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

import "./Unidades.css";

// =========================
// DATOS DE EJEMPLO
// =========================

const unidades = [
    { unidad: "1A", torrePiso: "Torre A - Piso 1", tipo: "3 amb.", responsable: "Martín Gómez", estado: "Activa" },
    { unidad: "1B", torrePiso: "Torre A - Piso 1", tipo: "2 amb.", responsable: "Carla Romero", estado: "Activa" },
    { unidad: "2A", torrePiso: "Torre A - Piso 2", tipo: "3 amb.", responsable: "Juan López", estado: "Activa" },
    { unidad: "2B", torrePiso: "Torre A - Piso 2", tipo: "2 amb.", responsable: "---", estado: "Disponible" },
    { unidad: "2C", torrePiso: "Torre A - Piso 2", tipo: "3 amb.", responsable: "Pedro Martínez", estado: "Activa" },
    { unidad: "5B", torrePiso: "Torre B - Piso 5", tipo: "2 amb.", responsable: "Nicolás Paz", estado: "Activa" },
];

const totalUnidades = 96;
const paginas = [1, 2, 3, 4, 5];
const paginaActiva = 1;

function badgeClase(estado) {
    return estado === "Activa" ? "unidades-badge-activa" : "unidades-badge-disponible";
}

function Unidades() {

    useEffect(() => {
        document.title = "Habita | Unidades";
    }, []);

    return (
        <main className="unidades">

            {/* BARRA DE ACCIONES */}

            <section className="unidades-acciones">
                <div className="unidades-buscador">
                    <Search size={17} />
                    <input type="text" placeholder="Buscar unidad..." />
                </div>

                <button className="unidades-filtro">
                    Todos los torres
                    <ChevronDown size={15} />
                </button>

                <button className="unidades-filtro">
                    Todos los estados
                    <ChevronDown size={15} />
                </button>

                <button className="unidades-btn-nuevo">
                    <Plus size={16} />
                    Nueva unidad
                </button>
            </section>

            {/* TABLA */}

            <section className="unidades-tabla-card">
                <div className="unidades-tabla-header">
                    <span>Unidad</span>
                    <span>Torre / Piso</span>
                    <span>Tipo</span>
                    <span>Propietario / Responsable</span>
                    <span>Estado</span>
                    <span>Acciones</span>
                </div>

                <div className="unidades-tabla-body">
                    {unidades.map((unidad, index) => (
                        <div className="unidades-tabla-fila" key={index}>
                            <span className="unidades-nombre">{unidad.unidad}</span>
                            <span>{unidad.torrePiso}</span>
                            <span>{unidad.tipo}</span>
                            <span className="unidades-responsable">{unidad.responsable}</span>

                            <span className={`unidades-badge ${badgeClase(unidad.estado)}`}>
                                {unidad.estado}
                            </span>

                            <span className="unidades-tabla-acciones">
                                <button aria-label="Editar unidad">
                                    <Pencil size={16} />
                                </button>
                                <button aria-label="Más opciones">
                                    <MoreVertical size={16} />
                                </button>
                            </span>
                        </div>
                    ))}
                </div>
            </section>

            {/* PAGINACION */}

            <section className="unidades-paginacion">
                <button className="unidades-pagina-flecha" aria-label="Página anterior">
                    <ChevronLeft size={16} />
                </button>

                {paginas.map((pagina) => (
                    <button
                        key={pagina}
                        className={`unidades-pagina ${pagina === paginaActiva ? "activa" : ""}`}
                    >
                        {pagina}
                    </button>
                ))}

                <button className="unidades-pagina-flecha" aria-label="Página siguiente">
                    <ChevronRight size={16} />
                </button>

                <span className="unidades-paginacion-info">
                    Mostrando 1 a {unidades.length} de {totalUnidades} unidades
                </span>
            </section>

        </main>
    );
}

export default Unidades;
