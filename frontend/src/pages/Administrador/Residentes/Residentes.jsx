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

import "./Residentes.css";

// =========================
// DATOS DE EJEMPLO
// =========================

const residentes = [
    { nombre: "Nicolás Paz", unidad: "5B", email: "nicolas.paz@email.com", telefono: "11 2345 6789", estado: "Activo" },
    { nombre: "María Gómez", unidad: "3A", email: "maria.gomez@email.com", telefono: "11 3456 7890", estado: "Activo" },
    { nombre: "Juan López", unidad: "7C", email: "juan.lopez@email.com", telefono: "11 4567 8901", estado: "Activo" },
    { nombre: "Carla Romero", unidad: "1B", email: "carla.romero@email.com", telefono: "11 5678 9012", estado: "Activo" },
    { nombre: "Pedro Martínez", unidad: "2D", email: "pedro.martinez@email.com", telefono: "11 6789 0123", estado: "Activo" },
];

const totalResidentes = 128;
const paginas = [1, 2, 3, 4, 5];
const paginaActiva = 1;

function badgeClase(estado) {
    return estado === "Activo" ? "residentes-badge-activo" : "residentes-badge-invitado";
}

function Residentes() {

    useEffect(() => {
        document.title = "Habita | Residentes";
    }, []);

    return (
        <main className="residentes">

            {/* BARRA DE ACCIONES */}

            <section className="residentes-acciones">
                <div className="residentes-buscador">
                    <Search size={17} />
                    <input type="text" placeholder="Buscar residente..." />
                </div>

                <button className="residentes-filtro">
                    Todos los estados
                    <ChevronDown size={15} />
                </button>

                <button className="residentes-filtro">
                    Todas las unidades
                    <ChevronDown size={15} />
                </button>

                <button className="residentes-btn-nuevo">
                    <Plus size={16} />
                    Nuevo residente
                </button>
            </section>

            {/* TABLA */}

            <section className="residentes-tabla-card">
                <div className="residentes-tabla-header">
                    <span>Nombre</span>
                    <span>Unidad</span>
                    <span>Email</span>
                    <span>Teléfono</span>
                    <span>Estado</span>
                    <span>Acciones</span>
                </div>

                <div className="residentes-tabla-body">
                    {residentes.map((residente, index) => (
                        <div className="residentes-tabla-fila" key={index}>
                            <span className="residentes-nombre">{residente.nombre}</span>
                            <span>{residente.unidad}</span>
                            <span className="residentes-email">{residente.email}</span>
                            <span>{residente.telefono}</span>

                            <span className={`residentes-badge ${badgeClase(residente.estado)}`}>
                                {residente.estado}
                            </span>

                            <span className="residentes-tabla-acciones">
                                <button aria-label="Editar residente">
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

            <section className="residentes-paginacion">
                <button className="residentes-pagina-flecha" aria-label="Página anterior">
                    <ChevronLeft size={16} />
                </button>

                {paginas.map((pagina) => (
                    <button
                        key={pagina}
                        className={`residentes-pagina ${pagina === paginaActiva ? "activa" : ""}`}
                    >
                        {pagina}
                    </button>
                ))}

                <button className="residentes-pagina-flecha" aria-label="Página siguiente">
                    <ChevronRight size={16} />
                </button>

                <span className="residentes-paginacion-info">
                    Mostrando 1 a {residentes.length} de {totalResidentes} residentes
                </span>
            </section>

        </main>
    );
}

export default Residentes;
