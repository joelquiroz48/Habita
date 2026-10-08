import { useEffect, useState } from "react";
import {
    Wallet,
    Download,
    Clock,
    CheckCircle2,
    X,
} from "lucide-react";

import "./Pagos.css";
import Panel from "../../../components/Panel/Panel";
import TarjetaResumen from "../../../components/TarjetaResumen/TarjetaResumen";
import Tabla from "../../../components/Tabla/Tabla";
import Navegador from "../../../components/Navegador/Navegador";

{/* =========================
       DATOS EJEMPLOS
========================== */}

const kpis = {
    totalRecaudado: 4251200,
    pagosRealizados: 78,
    pendientes: 12,
    tasaExito: 89,
};

const pagos = [
    {
        fecha: "01/09/2026", hora: "10:24 hs", residente: "Nicolás Paz", unidad: "5B",
        periodo: "Agosto 2026", importe: 45230, metodo: "tarjeta", metodoLabel: "Tarjeta •••• 4242",
        estado: "Confirmado", transaccion: "MP-8457293847",
    },
    {
        fecha: "01/09/2026", hora: "09:10 hs", residente: "María Gómez", unidad: "3A",
        periodo: "Agosto 2026", importe: 45230, metodo: "billetera", metodoLabel: "Mercado Pago",
        estado: "Confirmado", transaccion: "MP-8457293848",
    },
    {
        fecha: "31/08/2026", hora: "16:45 hs", residente: "Juan López", unidad: "7C",
        periodo: "Agosto 2026", importe: 45230, metodo: "transferencia", metodoLabel: "Transferencia",
        metodoSub: "Banco Galicia", estado: "Confirmado", transaccion: "MP-8457293849",
    },
    {
        fecha: "31/08/2026", hora: "08:30 hs", residente: "Carla Romero", unidad: "1B",
        periodo: "Agosto 2026", importe: 45230, metodo: "tarjeta", metodoLabel: "Tarjeta •••• 1234",
        estado: "Pendiente", transaccion: "MP-8457293850",
    },
    {
        fecha: "30/08/2026", hora: "14:20 hs", residente: "Pedro Martínez", unidad: "2D",
        periodo: "Agosto 2026", importe: 45230, metodo: "billetera", metodoLabel: "Rapipago",
        estado: "Confirmado", transaccion: "MP-8457293851",
    },
    {
        fecha: "29/08/2026", hora: "11:05 hs", residente: "Laura Sánchez", unidad: "4A",
        periodo: "Agosto 2026", importe: 45230, metodo: "efectivo", metodoLabel: "Efectivo",
        estado: "Confirmado", transaccion: "MP-8457293852",
    },
    {
        fecha: "28/08/2026", hora: "17:50 hs", residente: "Diego Fernández", unidad: "6E",
        periodo: "Agosto 2026", importe: 45230, metodo: "transferencia", metodoLabel: "Transferencia",
        metodoSub: "Banco BBVA", estado: "Rechazado", transaccion: "MP-8457293853",
    },
];

{/* =========================
       TARJETAS RESUMEN
========================== */}

const resumenTarjetas = [
    {
        icono: Wallet,
        titulo: "Total recaudado",
        valor: formatearMonto(kpis.totalRecaudado),
        contenido: <span>Este mes</span>,
    },
    {
        icono: Download,
        titulo: "Pagos realizados",
        valor: kpis.pagosRealizados,
        contenido: <span>Este mes</span>,
    },
    {
        icono: Clock,
        titulo: "Pendientes",
        valor: kpis.pendientes,
        contenido: <span>Este mes</span>,
    },
    {
        icono: CheckCircle2,
        titulo: "Pagos confirmados",
        valor: `${kpis.tasaExito}%`,
        contenido: (
            <>
                <div className="pagos-progreso">
                    <div
                        className="pagos-progreso-relleno"
                        style={{ width: `${kpis.tasaExito}%` }}
                    />
                </div>
                <span>Tasa de éxito</span>
            </>
        ),
    },
];

const filtros=[
    {
        key: "estado",
        label: "Todos los estados",
        options: ["Confirmado", "Pendiente", "Para confirmar", "Rechazado"],
    },
    {
        key: "periodo",
        label: "Todos los periodos",
        options: ["Enero", "Febrero", "Julio", "Agosto", "Septiebre"],
    },
];

function formatearMonto(numero) {
    return `$ ${numero.toLocaleString("es-AR")}`;
}

function estadoBadgeClase(estado) {
    if (estado === "Confirmado") return "pagos-badge-confirmado";
    if (estado === "Pendiente") return "pagos-badge-pendiente";
    return "pagos-badge-rechazado";
}

function Pagos() {

    const [pagoSeleccionado, setPagoSeleccionado] = useState(pagos[0]);
    const [detalleAbierto, setDetalleAbierto] = useState(false);

    const [pagosListado, setPagosListado] = useState(pagos);

    useEffect(() => {
        document.title = "Habita | Pagos";
    }, []);

    function abrirDetalle(pago) {
        setPagoSeleccionado(pago);
        setDetalleAbierto(true);
    }

    const columnas = [
        { clave: "fecha", titulo: "Fecha", ancho: "0.9fr" },
        { clave: "residente", titulo: "Residente", ancho: "1.1fr", clase: "pagos-residente" },
        { clave: "unidad", titulo: "Unidad", ancho: "0.6fr" },
        { clave: "periodo", titulo: "Período", ancho: "0.9fr" },
        {
            clave: "importe",
            titulo: "Importe",
            ancho: "0.9fr",
            render: (pago) => formatearMonto(pago.importe),
        },
        {
            clave: "estado",
            titulo: "Estado",
            ancho: "0.9fr",
            render: (pago) => (
                <span className={`pagos-badge ${estadoBadgeClase(pago.estado)}`}>
                    {pago.estado}
                </span>
            ),
        },
    ];

    return (
        <main className="pagos">

            {/* =========================
                  RESUMEN SUPERIOR
            ========================= */}

            <section className="pagos-resumen">
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

            {/* CONTENIDO */}
            
            <Navegador
                data={pagosListado}
                searchKey="residente"
                searchPlaceholder="Buscar pago..."
                filters={filtros}
            >
                {(PagosFiltrados) => (
                    <Tabla
                        columnas={columnas}
                        datos={PagosFiltrados}
                        etiqueta="pagos"
                        className="pagos-tabla"
                        onFilaClick={abrirDetalle}
                        seleccionable
                        filaSeleccionada={detalleAbierto ? pagoSeleccionado : null}
                    />
                        )}
            </Navegador>

            {/* DETALLE */}

            {detalleAbierto && (
                <Panel
                    className="pagos-detalle"
                    titulo="Detalle del pago"
                    tituloComplemento={
                        <div className={`pagos-badge ${estadoBadgeClase(pagoSeleccionado.estado)}`}>
                            {pagoSeleccionado.estado}
                        </div>
                    }
                    accion={
                        <button
                            className="pagos-detalle-cerrar"
                            onClick={() => setDetalleAbierto(false)}
                            aria-label="Cerrar detalle"
                        >
                            <X size={18} />
                        </button>
                    }
                >

                    {/* =========== FILAS =========== */}

                    <div className="pagos-detalle-fila">
                        <span>Residente</span>
                        <strong>{pagoSeleccionado.residente}</strong>
                    </div>

                    <div className="pagos-detalle-fila">
                        <span>Unidad</span>
                        <strong>{pagoSeleccionado.unidad}</strong>
                    </div>

                    <div className="pagos-detalle-fila">
                        <span>Período</span>
                        <strong>{pagoSeleccionado.periodo}</strong>
                    </div>

                    <div className="pagos-detalle-fila">
                        <span>Importe</span>
                        <strong>{formatearMonto(pagoSeleccionado.importe)}</strong>
                    </div>

                    <div className="pagos-detalle-fila">
                        <span>Fecha de pago</span>
                        <strong>{pagoSeleccionado.fecha} - {pagoSeleccionado.hora}</strong>
                    </div>

                    <p className="pagos-detalle-subtitulo">N° de transacción</p>

                    <p className="pagos-detalle-transaccion">
                        {pagoSeleccionado.transaccion}
                    </p>
                    
                    {/* =========== COMPROBANTE =========== */}

                    <h3>Comprobante</h3>

                    <button className="pagos-btn-comprobante">
                        <Download size={15} />
                        Descargar comprobante
                    </button>

                    <span className="pagos-detalle-archivo">
                        PDF - 124 KB
                    </span>
                </Panel>
            )}

        </main>
    );
}

export default Pagos;
