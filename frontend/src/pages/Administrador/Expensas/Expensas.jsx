import { useEffect, useState } from "react";
import {
    Calendar,
    DollarSign,
    Users,
    PiggyBank,
    Download,
    X,
    Pencil,
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

const residentesExpensas = [
    {
        id: 1,
        nombre: "Nicolás Paz",
        periodo: expensas[0].periodo,
        vencimiento: expensas[0].vencimiento,
        importe: 56770,
        estado: "Pendiente",
    },
    {
        id: 2,
        nombre: "María Gómez",
        periodo: expensas[0].periodo,
        vencimiento: expensas[0].vencimiento,
        importe: null,
        estado: "Pendiente",
    },
    {
        id: 3,
        nombre: "Juan López",
        periodo: expensas[0].periodo,
        vencimiento: expensas[0].vencimiento,
        importe: 54990,
        estado: "Pendiente",
    },
    {
        id: 4,
        nombre: "Carla Romero",
        periodo: expensas[1].periodo,
        vencimiento: expensas[1].vencimiento,
        importe: 54940,
        estado: "Pagado",
    },
    {
        id: 5,
        nombre: "Pedro Martínez",
        periodo: expensas[1].periodo,
        vencimiento: expensas[1].vencimiento,
        importe: 54940,
        estado: "Pagado",
    },
    {
        id: 6,
        nombre: "Laura Sánchez",
        periodo: expensas[1].periodo,
        vencimiento: expensas[1].vencimiento,
        importe: 54940,
        estado: "Sin pagar",
    },
];

const filtrosResidentes=[
    {
        key: "estado",
        label: "Todos los estados",
        options: ["Pagado", "Pendiente", "Sin pagar"],
    },
]

function formatearMonto(numero) {
    return `$ ${numero.toLocaleString("es-AR")}`;
}

function formatearImporteResidente(importe) {
    return importe == null ? "--" : formatearMonto(importe);
}

function estadoBadgeClase(estado) {
    return estado === "En curso" ? "expensas-badge-curso" : "expensas-badge-cerrada";
}

function claseEstadoResidente(estado) {
    if (estado === "Pagado") return "expensas-residente-pagado";
    if (estado === "Pendiente") return "expensas-residente-pendiente";
    return "expensas-residente-sin-pagar";
}

function Expensas() {

    const [seleccionado, setSeleccionado] = useState(expensas[0]);
    const [residenteSeleccionado, setResidenteSeleccionado] = useState(null);

    const [detalleAbierto, setDetalleAbierto] = useState(false);
    const [tabActivo, setTabActivo] = useState("expensas");

    useEffect(() => {
        document.title = "Habita | Expensas";
    }, []);

    const expensaActual = expensas[0]


    function abrirDetalle(comunicado) {
        setSeleccionado(comunicado);
        setResidenteSeleccionado(null);
        setDetalleAbierto(true);
    }

    function abrirDetalleResidente(residente) {
        setResidenteSeleccionado(residente);
        setDetalleAbierto(true);
    }

    function cambiarTab(tab) {
        setTabActivo(tab);
        setDetalleAbierto(false);
        setResidenteSeleccionado(null);
    }

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

    const detalle = expensas.find((e) => e.periodo === seleccionado.periodo);
    
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
                <span className={`expensas-badge ${estadoBadgeClase(item.estado)}`}>
                    {item.estado}
                </span>
            ),
        },
    ];

    const columnasResidentes = [
        {
            clave: "nombre",
            titulo: "Residente",
            ancho: "minmax(150px, 1.2fr)",
        },
        {
            clave: "vencimiento",
            titulo: "Vencimiento",
            ancho: "minmax(110px, 1fr)",
        },
        {
            clave: "periodo",
            titulo: "Período",
            ancho: "minmax(120px, 1fr)",
        },
        {
            clave: "importe",
            titulo: "Importe",
            ancho: "minmax(100px, 1fr)",
            render: (residente) => formatearImporteResidente(residente.importe),
        },
        {
            clave: "estado",
            titulo: "Estado",
            ancho: "minmax(100px, 0.8fr)",
            render: (residente) => (
                <span className={`expensas-badge ${claseEstadoResidente(residente.estado)}`}>
                    {residente.estado}
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

            <div className="expensas-tabs" role="tablist" aria-label="Secciones de expensas">
                <button
                    type="button"
                    id="tab-expensas"
                    role="tab"
                    aria-selected={tabActivo === "expensas"}
                    aria-controls="panel-expensas"
                    className={`expensas-tab ${tabActivo === "expensas" ? "activo" : ""}`}
                    onClick={() => cambiarTab("expensas")}
                >
                    Expensas
                </button>
                <button
                    type="button"
                    id="tab-residentes"
                    role="tab"
                    aria-selected={tabActivo === "residentes"}
                    aria-controls="panel-residentes"
                    className={`expensas-tab ${tabActivo === "residentes" ? "activo" : ""}`}
                    onClick={() => cambiarTab("residentes")}
                >
                    Residentes
                </button>
            </div>

            {tabActivo === "expensas" ? (
                <div id="panel-expensas" role="tabpanel" aria-labelledby="tab-expensas">
                    <Navegador
                        key="navegador-expensas"
                        data={expensas}
                        searchKey="periodo"
                        searchPlaceholder="Buscar periodo..."
                    >
                        {(expensasFiltrados) => (
                            <Tabla
                                columnas={columnas}
                                datos={expensasFiltrados}
                                etiqueta="períodos"
                                className="expensas-tabla"
                                onFilaClick={abrirDetalle}
                                seleccionable
                                filaSeleccionada={detalleAbierto ? seleccionado : null}
                            />
                        )}
                    </Navegador>
                </div>
            ) : (
                <div id="panel-residentes" role="tabpanel" aria-labelledby="tab-residentes">
                    <Navegador
                        key="navegador-residentes"
                        data={residentesExpensas}
                        searchKey="nombre"
                        searchPlaceholder="Buscar residente..."
                        filters={filtrosResidentes}
                    >
                        {(residentesFiltrados) => (
                            <Tabla
                                columnas={columnasResidentes}
                                datos={residentesFiltrados}
                                etiqueta="residentes"
                                className="expensas-tabla"
                                onFilaClick={abrirDetalleResidente}
                                seleccionable
                                filaSeleccionada={detalleAbierto ? residenteSeleccionado : null}
                            />
                        )}
                    </Navegador>
                </div>
            )}

            {/* DETALLE */}

            {tabActivo === "expensas" && detalleAbierto && (
                <Panel
                    className="expensas-detalle"
                    titulo={`Detalle de ${detalle.periodo}`}
                    tituloComplemento={
                        <div className={`expensas-badge ${estadoBadgeClase(detalle.estado)}`}>
                            {detalle.estado}
                        </div>
                    }
                    accion={
                        <button
                            className="expensas-detalle-cerrar"
                            onClick={() => setDetalleAbierto(false)}
                            aria-label="Cerrar detalle"
                        >
                            <X size={18} />
                        </button>
                    }
                >

                    {/* =========== DETALLES =========== */}

                    <p className="expensas-detalle-linea">
                        Vencimiento: <strong>{detalle.vencimiento}</strong>
                    </p>
                    
                    {/* =========== COLUMNAS =========== */}

                    <div className="expensas-detalle-columnas">
                        
                        {/* =========== FILAS =========== */}

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

                        {/* =========== FILAS =========== */}

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

                    {/* =========== BOLETA =========== */}

                    <button className="expensas-btn-detalles">
                        <Pencil size={15} />
                        Editar expensa
                    </button>

                    <button className="expensas-btn-detalles">
                        <Download size={15} />
                        Descargar boleta
                    </button>

                </Panel>
            )}

            {tabActivo === "residentes" && detalleAbierto && residenteSeleccionado && (
                <Panel
                    className="expensas-detalle"
                    titulo={`Detalle de ${residenteSeleccionado.nombre}`}
                    tituloComplemento={
                        <div className={`expensas-badge ${claseEstadoResidente(residenteSeleccionado.estado)}`}>
                            {residenteSeleccionado.estado}
                        </div>
                    }
                    accion={
                        <button
                            type="button"
                            className="expensas-detalle-cerrar"
                            onClick={() => setDetalleAbierto(false)}
                            aria-label="Cerrar detalle del residente"
                        >
                            <X size={18} />
                        </button>
                    }
                >
                    
                    {/* =========== DETALLES =========== */}

                    <p className="expensas-detalle-linea">
                        Período: <strong>{residenteSeleccionado.periodo}</strong>
                    </p>
                    <p className="expensas-detalle-linea">
                        Vencimiento: <strong>{residenteSeleccionado.vencimiento}</strong>
                    </p>
                    <section className="expensas-detalle-seccion">

                        {/* =========== FILAS =========== */}

                        <h3>Resumen de expensa</h3>
                        <div className="expensas-resumen-fila">
                            <span>Residente</span>
                            <span>{residenteSeleccionado.nombre}</span>
                        </div>
                        <div className="expensas-resumen-fila">
                            <span>Importe</span>
                            <span>{formatearImporteResidente(residenteSeleccionado.importe)}</span>
                        </div>
                        <div className="expensas-resumen-fila">
                            <span>Estado</span>
                            <span className={`expensas-residente-estado ${claseEstadoResidente(residenteSeleccionado.estado)}`}>
                                {residenteSeleccionado.estado}
                            </span>
                        </div>
                        
                        {/* =========== EDITAR IMPORTE =========== */}

                        <button className="expensas-btn-detalles">
                            <Pencil size={15} />
                            Editar importe
                        </button>
                    </section>
                </Panel>
            )}

        </main>
    );
}

export default Expensas;
