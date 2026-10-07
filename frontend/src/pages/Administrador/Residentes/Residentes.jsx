import { useEffect } from "react";
import {Search, ChevronDown, Plus, Pencil, MoreVertical} from "lucide-react";

import "./Residentes.css";
import Tabla from "../../../components/Tabla/Tabla";

{/* =========================
       DATOS EJEMPLO
========================== */}

const residentes = [
    { nombre: "Nicolás Paz", unidad: "5B", email: "nicolas.paz@email.com", telefono: "11 2345 6789", estado: "Activo" },
    { nombre: "María Gómez", unidad: "3A", email: "maria.gomez@email.com", telefono: "11 3456 7890", estado: "Activo" },
    { nombre: "Juan López", unidad: "7C", email: "juan.lopez@email.com", telefono: "11 4567 8901", estado: "Activo" },
    { nombre: "Carla Romero", unidad: "1B", email: "carla.romero@email.com", telefono: "11 5678 9012", estado: "Activo" },
    { nombre: "Pedro Martínez", unidad: "2D", email: "pedro.martinez@email.com", telefono: "11 6789 0123", estado: "Activo" },
];

const columnas = [
    {
        clave: "nombre",
        titulo: "Nombre",
        ancho: "minmax(140px, 1.2fr)",
        clase: "residentes-nombre"
    },
    {
        clave: "unidad",
        titulo: "Unidad",
        ancho: "minmax(80px, 0.7fr)"
    },
    {
        clave: "email",
        titulo: "Email",
        ancho: "minmax(180px, 1.5fr)",
        clase: "residentes-email"
    },
    {
        clave: "telefono",
        titulo: "Teléfono",
        ancho: "minmax(120px, 1fr)"
    },
    {
        clave: "estado",
        titulo: "Estado",
        ancho: "minmax(110px, 0.8fr)",
        render: (residente) => (
            <span className={`residentes-badge ${badgeClase(residente.estado)}`}>
                {residente.estado}
            </span>
        )
    },
    {
        clave: "acciones",
        titulo: "Acciones",
        ancho: "90px",
        render: (residente) => (
            <div className="residentes-tabla-acciones">
                <button
                    aria-label={`Más opciones para ${residente.nombre}`}
                    onClick={() => abrirOpciones(residente)}
                >
                    <MoreVertical size={16} />
                </button>
            </div>
        )
    }
];


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

            <Tabla
                columnas={columnas}
                datos={residentes}
                etiqueta="residentes"
                className="residentes-tabla"
            />

        </main>
    );
}

export default Residentes;
