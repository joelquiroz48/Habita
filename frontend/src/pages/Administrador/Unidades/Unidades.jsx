import { useEffect } from "react";
import {Search, ChevronDown, Plus, Pencil, MoreVertical} from "lucide-react";

import "./Unidades.css";
import Tabla from "../../../components/Tabla/Tabla";

{/* =========================
       DATOS EJEMPLO
========================== */}

const unidades = [
    { unidad: "1A", torrePiso: "Torre A - Piso 1", tipo: "3 amb.", responsable: "Martín Gómez", estado: "Activa" },
    { unidad: "1B", torrePiso: "Torre A - Piso 1", tipo: "2 amb.", responsable: "Carla Romero", estado: "Activa" },
    { unidad: "2A", torrePiso: "Torre A - Piso 2", tipo: "3 amb.", responsable: "Juan López", estado: "Activa" },
    { unidad: "2B", torrePiso: "Torre A - Piso 2", tipo: "2 amb.", responsable: "---", estado: "Disponible" },
    { unidad: "2C", torrePiso: "Torre A - Piso 2", tipo: "3 amb.", responsable: "Pedro Martínez", estado: "Activa" },
    { unidad: "5B", torrePiso: "Torre B - Piso 5", tipo: "2 amb.", responsable: "Nicolás Paz", estado: "Activa" },
];

const columnas = [
    {
        clave: "unidad",
        titulo: "Unidad",
        ancho: "0.7fr",
        clase: "unidades-nombre",
    },
    {
        clave: "torrePiso",
        titulo: "Torre / Piso",
        ancho: "1.2fr",
    },
    {
        clave: "tipo",
        titulo: "Tipo",
        ancho: "0.8fr",
    },
    {
        clave: "responsable",
        titulo: "Propietario / Responsable",
        ancho: "1.4fr",
        clase: "unidades-responsable",
    },
    {
        clave: "estado",
        titulo: "Estado",
        ancho: "0.9fr",
        render: (unidad) => (
            <span className={`unidades-badge ${badgeClase(unidad.estado)}`}>
                {unidad.estado}
            </span>
        ),
    },
    {
        clave: "acciones",
        titulo: "Acciones",
        ancho: "0.8fr",
        render: (unidad) => (
            <div className="unidades-tabla-acciones">
                <button aria-label={`Editar unidad ${unidad.unidad}`}>
                    <Pencil size={16} />
                </button>
                <button aria-label={`Más opciones para ${unidad.unidad}`}>
                    <MoreVertical size={16} />
                </button>
            </div>
        ),
    },
];


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

            <Tabla
                columnas={columnas}
                datos={unidades}
                etiqueta="unidades"
                className="unidades-tabla"
            />

        </main>
    );
}

export default Unidades;
