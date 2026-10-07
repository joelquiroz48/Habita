import { useEffect, useState } from "react";
import {
    Calendar,
    DollarSign,
    Users,
    PiggyBank,
    Download,
} from "lucide-react";

import "./Expensas.css";
import Panel from "../../../components/Panel/Panel";
import TarjetaResumen from "../../../components/TarjetaResumen/TarjetaResumen";
import Tabla from "../../../components/Tabla/Tabla";
import Navegador from "../../../components/Navegador/Navegador";

{/* =========================
       DATOS EJEMPLO
========================== */}

const expensas = [
    {
        periodo: "Agosto 2026",
        vencimiento: "10/09/2026",
        importe: 5450230,
        recaudado: 4251200,
        porcentaje: 78,
        estado: "En curso",
        conceptos: [
            { nombre: "Mantenimiento", monto: 2200000 },
            { nombre: "Limpieza", monto: 850000 },
            { nombre: "Seguridad", monto: 920000 },
            { nombre: "Servicios", monto: 900000 },
            { nombre: "Fondo de reserva", monto: 430230 },
        ],
    },
    {
        periodo: "Julio 2026",
        vencimiento: "10/08/2026",
        importe: 5284500,
        recaudado: 5284500,
        porcentaje: 100,
        estado: "Cerrada",
        conceptos: [
            { nombre: "Mantenimiento", monto: 2150000 },
            { nombre: "Limpieza", monto: 820000 },
            { nombre: "Seguridad", monto: 900000 },
            { nombre: "Servicios", monto: 890000 },
            { nombre: "Fondo de reserva", monto: 524500 },
        ],
    },
    {
        periodo: "Junio 2026",
        vencimiento: "10/07/2026",
        importe: 5123000,
        recaudado: 5123000,
        porcentaje: 100,
        estado: "Cerrada",
        conceptos: [
            { nombre: "Mantenimiento", monto: 2080000 },
            { nombre: "Limpieza", monto: 800000 },
            { nombre: "Seguridad", monto: 880000 },
            { nombre: "Servicios", monto: 860000 },
            { nombre: "Fondo de reserva", monto: 503000 },
        ],
    },
    {
        periodo: "Mayo 2026",
        vencimiento: "10/06/2026",
        importe: 4987500,
        recaudado: 4987500,
        porcentaje: 100,
        estado: "Cerrada",
        conceptos: [
            { nombre: "Mantenimiento", monto: 2020000 },
            { nombre: "Limpieza", monto: 780000 },
            { nombre: "Seguridad", monto: 850000 },
            { nombre: "Servicios", monto: 840000 },
            { nombre: "Fondo de reserva", monto: 497500 },
        ],
    },
    {
        periodo: "Abril 2026",
        vencimiento: "10/05/2026",
        importe: 4862000,
        recaudado: 4862000,
        porcentaje: 100,
        estado: "Cerrada",
        conceptos: [
            { nombre: "Mantenimiento", monto: 1980000 },
            { nombre: "Limpieza", monto: 760000 },
            { nombre: "Seguridad", monto: 830000 },
            { nombre: "Servicios", monto: 820000 },
            { nombre: "Fondo de reserva", monto: 472000 },
        ],
    },
];

const totalUnidadesConExpensa = 96;

function formatearMonto(numero) {
    return `$ ${numero.toLocaleString("es-AR")}`;
}

function badgeClase(estado) {
    return estado === "En curso" ? "expensas-badge-curso" : "expensas-badge-cerrada";
}

function Expensas() {

    const [periodoSeleccionado, setPeriodoSeleccionado] = useState(expensas[0].periodo);
    const [expensasListado, setExpensasListado] = useState(expensas);

    useEffect(() => {
        document.title = "Habita | Expensas";
    }, []);

    const expensaActual = expensas[0];

    {/* =========================
            TARJETAS RESUMEN
    ========================== */}

    const resumenTarjetas = [
        {
            icono: Calendar,
            titulo: "Expensa actual",
            valor: expensaActual.periodo,
            contenido: <span>Período vigente</span>,
        },
        {
            icono: DollarSign,
            titulo: "Importe total",
            valor: formatearMonto(expensaActual.importe),
            contenido: <span>Total a recaudar</span>,
        },
        {
            icono: Users,
            titulo: "Unidades",
            valor: totalUnidadesConExpensa,
            contenido: <span>Con expensa</span>,
        },
        {
            icono: PiggyBank,
            titulo: "Recaudado",
            valor: formatearMonto(expensaActual.recaudado),
            contenido: (
                <>
                    <div className="expensas-progreso">
                        <div
                            className="expensas-progreso-relleno"
                            style={{ width: `${expensaActual.porcentaje}%` }}
                        />
                    </div>
                    <span>{expensaActual.porcentaje}% del total</span>
                </>
            ),
        },
    ];

    const detalle = expensas.find((e) => e.periodo === periodoSeleccionado);
    
    const pendiente = detalle.importe - detalle.recaudado;
    
    const columnas = [
        {
            clave: "periodo",
            titulo: "Período",
            ancho: "1fr",
            clase: "expensas-periodo",
        },
        {
            clave: "vencimiento",
            titulo: "Vencimiento",
            ancho: "1fr",
        },
        {
            clave: "importe",
            titulo: "Importe total",
            ancho: "1fr",
            render: (item) => formatearMonto(item.importe),
        },
        {
            clave: "recaudado",
            titulo: "Recaudado",
            ancho: "1.3fr",
            render: (item) => `${formatearMonto(item.recaudado)} (${item.porcentaje}%)`,
        },
        {
            clave: "estado",
            titulo: "Estado",
            ancho: "0.8fr",
            render: (item) => (
                <span className={`expensas-badge ${badgeClase(item.estado)}`}>
                    {item.estado}
                </span>
            ),
        },
    ];

    return (
        <main className="expensas pagina-administrador">

            {/* =========================
                  RESUMEN SUPERIOR
            ========================= */}

            <section className="expensas-resumen">
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

            {/* =========================
                CONTENIDO PRINCIPAL
            ========================= */}

            <div className="expensas-tabs">
                <button className="expensas-tab activo">Expensas</button>
                <button className="expensas-tab">Residentes</button>
            </div>

            {/* LISTADO */}

            <Navegador
                data={expensasListado}
                searchKey="periodo"
                searchPlaceholder="Buscar periodo..."
            >
                {(expensasFiltrados) => (
                    <Tabla
                        columnas={columnas}
                        datos={expensasFiltrados}
                        etiqueta="períodos"
                        className="expensas-tabla"
                        onFilaClick={(item) => setPeriodoSeleccionado(item.periodo)}
                        seleccionable
                        filaSeleccionada={detalle}
                    />
                        )}
            </Navegador>

            

            {/* DETALLE */}

            <Panel
                className="expensas-detalle"
                titulo={`Detalle de ${detalle.periodo}`}
                accion={
                    <span className={`expensas-badge ${badgeClase(detalle.estado)}`}>
                        {detalle.estado}
                    </span>
                }
            >

                <p className="expensas-detalle-linea">
                    Vencimiento: <strong>{detalle.vencimiento}</strong>
                </p>
                <p className="expensas-detalle-linea">
                    Estado: <strong>{detalle.estado}</strong>
                </p>

                <div className="expensas-detalle-columnas">
                    <section className="expensas-detalle-seccion">
                        <h3>Resumen</h3>
                        <div className="expensas-resumen-fila">
                            <span>Importe total</span>
                            <span>{formatearMonto(detalle.importe)}</span>
                        </div>
                        <div className="expensas-resumen-fila">
                            <span>Recaudado</span>
                            <span>{formatearMonto(detalle.recaudado)}</span>
                        </div>
                        <div className="expensas-resumen-fila">
                            <span>Pendiente</span>
                            <span className="expensas-pendiente">{formatearMonto(pendiente)}</span>
                        </div>
                        <div className="expensas-resumen-fila">
                            <span>Porcentaje recaudado</span>
                            <span className="expensas-porcentaje">{detalle.porcentaje}%</span>
                        </div>
                    </section>

                    <section className="expensas-detalle-seccion">
                        <h3>Conceptos</h3>
                        {detalle.conceptos.map((concepto) => (
                            <div className="expensas-resumen-fila" key={concepto.nombre}>
                                <span>{concepto.nombre}</span>
                                <span>{formatearMonto(concepto.monto)}</span>
                            </div>
                        ))}
                    </section>
                </div>

                <section className="expensas-detalle-acciones">
                    <h3>Acciones</h3>
                    <div className="expensas-acciones-lista">
                        <button className="expensas-btn-accion secundario">
                            <Download size={15} />
                            Descargar boleta
                        </button>
                    </div>
                </section>

            </Panel>


        </main>
    );
}

export default Expensas;
