import { useEffect, useState } from "react";
import {Pencil} from "lucide-react";

import "./Unidades.css";
import Tabla from "../../../components/Tabla/Tabla";

import Navegador from "../../../components/Navegador/Navegador";

const unidades = [
    { unidad: "1A", torre: "Torre A", piso: 1, tipo: "3 amb.", responsable: "Martín Gómez", estado: "Activa" },
    { unidad: "1B", torre: "Torre A", piso: 1, tipo: "2 amb.", responsable: "Carla Romero", estado: "Activa" },
    { unidad: "2A", torre: "Torre A", piso: 2, tipo: "3 amb.", responsable: "Juan López", estado: "Activa" },
    { unidad: "2B", torre: "Torre A", piso: 2, tipo: "2 amb.", responsable: "---", estado: "Disponible" },
    { unidad: "2C", torre: "Torre A", piso: 2, tipo: "3 amb.", responsable: "Pedro Martínez", estado: "Activa" },
    { unidad: "5B", torre: "Torre B", piso: 5, tipo: "2 amb.", responsable: "Nicolás Paz", estado: "Activa" },
    { unidad: "3A", torre: "Torre A", piso: 3, tipo: "4 amb.", responsable: "Lucía Fernández", estado: "Activa" },
    { unidad: "3B", torre: "Torre B", piso: 3, tipo: "2 amb.", responsable: "---", estado: "Disponible" },
    { unidad: "4A", torre: "Torre B", piso: 4, tipo: "3 amb.", responsable: "Sofía Díaz", estado: "Activa" },
    { unidad: "1C", torre: "Torre C", piso: 1, tipo: "2 amb.", responsable: "---", estado: "Disponible" },
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
        render: (unidad) => `${unidad.torre} - Piso ${unidad.piso}`,
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
];

const filtros=[
    {
        key: "torre",
        label: "Todas las torres",
        options: ["Torre A", "Torre B", "Torre C"],
    },
    {
        key: "estado",
        label: "Todos los estados",
        options: ["Activa", "Disponible"],
    },
];

function badgeClase(estado) {
    return estado === "Activa" ? "unidades-badge-activa" : "unidades-badge-disponible";
}

function Unidades() {
    const [unidadesListado, setUnidadesListado] = useState(unidades);

    useEffect(() => {
        document.title = "Habita | Unidades";
    }, []);

    return (
        <main className="unidades">
            <Navegador
                data={unidadesListado}
                searchKey="unidad"
                searchPlaceholder="Buscar por unidad..."
                filters={filtros}
                onNew={() => {}}
                newButtonText="Agregar unidad"
            >
                {(unidadesFiltradas) => (
                    <Tabla
                        columnas={columnas}
                        datos={unidadesFiltradas}
                        etiqueta="unidades"
                        className="unidades-tabla"
                        mostrarAcciones
                        opcionesAcciones={[
                            { label: "Editar", icon: Pencil },
                        ]}
                    />
                )}
            </Navegador>
        </main>
    );
}

export default Unidades;
