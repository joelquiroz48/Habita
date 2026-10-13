import { useEffect } from "react";
import { Settings2 } from "lucide-react";

import "./Unidades.css";
import Tabla from "../../../components/Tabla/Tabla";

import Navegador from "../../../components/Navegador/Navegador";

const unidades = [
    { unidad: "1A", torre: "Torre A", piso: "1", tipo: "3", responsable: "Martín Gómez", estado: "Activa" },
    { unidad: "1B", torre: "Torre A", piso: "1", tipo: "2", responsable: "Carla Romero", estado: "Activa" },
    { unidad: "2A", torre: "Torre A", piso: "2", tipo: "3", responsable: "Juan López", estado: "Activa" },
    { unidad: "2B", torre: "Torre A", piso: "2", tipo: "2", responsable: "---", estado: "Disponible" },
    { unidad: "2C", torre: "Torre A", piso: "2", tipo: "3", responsable: "Pedro Martínez", estado: "Activa" },
    { unidad: "5B", torre: "Torre B", piso: "5", tipo: "2", responsable: "Nicolás Paz", estado: "Activa" },
    { unidad: "3A", torre: "Torre A", piso: "3", tipo: "4", responsable: "Lucía Fernández", estado: "Activa" },
    { unidad: "3B", torre: "Torre B", piso: "3", tipo: "2", responsable: "---", estado: "Disponible" },
    { unidad: "4A", torre: "Torre B", piso: "4", tipo: "3", responsable: "Sofía Díaz", estado: "Activa" },
    { unidad: "1C", torre: "Torre C", piso: "1", tipo: "2", responsable: "---", estado: "Disponible" },
];

const columnas = [
    {
        clave: "unidad",
        titulo: "Unidad",
        ancho: "1fr",
        clase: "unidades-nombre",
    },
    {
        clave: "torre",
        titulo: "Torre",
        ancho: "1fr",
    },
    {
        clave: "piso",
        titulo: "Piso",
        ancho: "1fr",
    },
    {
        clave: "tipo",
        titulo: "Tipo",
        ancho: "1fr",
        render: (unidad) => `${unidad.tipo} amb.`,
    },
    {
        clave: "responsable",
        titulo: "Propietario / Responsable",
        ancho: "2fr",
        clase: "unidades-responsable",
    },
    {
        clave: "estado",
        titulo: "Estado",
        ancho: "1fr",
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
        key: "piso",
        label: "Todos los pisos",
        options: ["1", "2", "3", "4", "5"],
    },
    {
        key: "tipo",
        label: "Todos los ambientes",
        options: ["1", "2", "3", "4"],
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

    useEffect(() => {
        document.title = "Habita | Unidades";
    }, []);

    return (
        <main className="unidades">
            <Navegador
                data={unidades}
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
                            { label: "Administrar", icon: Settings2 },
                        ]}
                    />
                )}
            </Navegador>
        </main>
    );
}

export default Unidades;
