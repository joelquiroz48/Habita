import { useEffect, useMemo, useState } from "react";
import { WalletCards, CalendarDays, Tag, Download, BanknoteArrowDown, ChevronRight, CircleHelp, FileText, X } from "lucide-react";

import "./Expensas.css";
import TarjetaResumen from "../../../components/TarjetaResumen/TarjetaResumen";
import Panel from "../../../components/Panel/Panel";
import Tabla from "../../../components/Tabla/Tabla";
import Navegador from "../../../components/Navegador/Navegador";
import { usePerfil } from "../../../context/PerfilContext";
import { obtenerExpensasResidente, ESTADOS_EXPENSA } from "../../../services/expensasService";
import { descargarBoleta } from "../../../utils/boletaPdf";
import { diasHasta } from "../../../utils/formatos";

/* =========================
        TABLA Y FILTROS
========================= */

function estadoBadgeClase(estado) {
    if (estado === "Pagada") return "expensas-badge-pagado";
    if (estado === "Vencida") return "expensas-badge-vencida";
    return "expensas-badge-pendiente";
}

const columnasHistorialExpensas = [
    { clave: "periodo", titulo: "Período", ancho: "1.2fr" },
    { clave: "importe", titulo: "Importe", ancho: "1fr" },
    { clave: "fecha", titulo: "Pagado el", ancho: "1fr" },
    { clave: "vencimiento", titulo: "Vencimiento", ancho: "1.2fr" },
    {
        clave: "estado",
        titulo: "Estado",
        ancho: "1fr",
        render: (expensa) => (
            <small className={`badge-expensa ${estadoBadgeClase(expensa.estado)}`}>
                {expensa.estado}
            </small>
        ),
    },
];

const filtros = [
    {
        key: "estado",
        label: "Todos los estados",
        options: ESTADOS_EXPENSA,
    },
];

/* =========================
        PREGUNTAS DE AYUDA
========================= */

const preguntasAyuda = [
    {
        id: "calculo",
        icono: CircleHelp,
        pregunta: "¿Cómo se calculan las expensas?",
        resumen: "Entendé qué incluye tu expensa mensual.",
        respuesta: (
            <>
                <p>
                    Tu expensa es la suma de los gastos comunes del edificio que define la
                    administración: por ejemplo mantenimiento, limpieza, seguridad, servicios
                    (luz, agua, gas) y fondo de reserva.
                </p>
                <p>
                    Para ver cuánto corresponde a cada concepto, tocá un período en la tabla
                    de arriba y se abre el detalle. La expensa de cada mes se emite
                    automáticamente el día 1 y la fecha de vencimiento figura en la boleta.
                </p>
            </>
        ),
    },
    {
        id: "problema",
        icono: FileText,
        pregunta: "¿Tenés un problema con tu pago?",
        resumen: "Te ayudamos a resolverlo.",
        respuesta: (
            <>
                <p>El pago se hace con Mercado Pago y puede tardar unos minutos en reflejarse. Si ya pagaste:</p>
                <ul>
                    <li>Esperá unos minutos y volvé a cargar esta página.</li>
                    <li>Si sigue figurando como pendiente, guardá el comprobante de Mercado Pago.</li>
                    <li>
                        Cargá un reclamo desde la sección <strong>Reclamos</strong> adjuntando
                        el comprobante, o comunicate con la administración del edificio.
                    </li>
                </ul>
            </>
        ),
    },
];

function Expensas() {
    const { perfil } = usePerfil();

    const [expensas, setExpensas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [seleccionadaId, setSeleccionadaId] = useState(null);
    const [detalleAbierto, setDetalleAbierto] = useState(false);
    const [descargaError, setDescargaError] = useState("");
    const [preguntaAbierta, setPreguntaAbierta] = useState(null);

    useEffect(() => {
        document.title = "Habita | Mis expensas";
    }, []);

    useEffect(() => {
        let cancelado = false;

        obtenerExpensasResidente()
            .then((lista) => { if (!cancelado) setExpensas(lista); })
            .catch((err) => {
                console.error("No se pudieron cargar las expensas", err);
                if (!cancelado) setError("No pudimos cargar tus expensas. Probá de nuevo en unos minutos.");
            })
            .finally(() => { if (!cancelado) setCargando(false); });

        return () => { cancelado = true; };
    }, []);

    const seleccionada = useMemo(
        () => expensas.find((e) => e.id === seleccionadaId) ?? null,
        [expensas, seleccionadaId]
    );

    // La expensa "actual" es la impaga mas antigua (la mas urgente);
    // si esta todo pagado, la mas reciente.
    const actual = useMemo(() => {
        const impagas = expensas.filter((e) => e.estado !== "Pagada");
        return impagas[impagas.length - 1] ?? expensas[0] ?? null;
    }, [expensas]);

    function abrirDetalle(expensa) {
        setSeleccionadaId(expensa.id);
        setDetalleAbierto(true);
        setDescargaError("");
    }

    function bajarBoleta() {
        if (!seleccionada) return;
        try {
            setDescargaError("");
            descargarBoleta(seleccionada, { residente: perfil?.nombre ?? "" });
        } catch (err) {
            console.error("No se pudo generar la boleta", err);
            setDescargaError("No pudimos generar la boleta. Probá de nuevo.");
        }
    }

    /* =========================
           TARJETAS RESUMEN
    ========================= */

    function textoVencimiento(expensa) {
        if (!expensa) return "";
        if (expensa.estado === "Pagada") return expensa.fecha === "--" ? "Pagada" : `Pagada el ${expensa.fecha}`;
        const dias = diasHasta(expensa.vencimientoISO);
        if (dias === null) return "";
        if (dias < 0) return `Venció hace ${-dias} ${-dias === 1 ? "día" : "días"}`;
        if (dias === 0) return "Vence hoy";
        return `En ${dias} ${dias === 1 ? "día" : "días"}`;
    }

    const mensajeEstado = {
        Pagada: "Tu expensa ya está paga. ¡Gracias!",
        Pendiente: "Tu expensa aún no fue pagada.",
        Vencida: "Tu expensa está vencida.",
    };

    const sinDatos = !cargando && !error && expensas.length === 0;

    const resumenExpensas = [
        {
            icono: WalletCards,
            titulo: "Expensa actual",
            valor: actual?.importe ?? "--",
            contenido: <small>{actual?.periodo ?? (sinDatos ? "Sin expensas" : "")}</small>,
        },
        {
            icono: CalendarDays,
            titulo: "Vencimiento",
            valor: actual?.vencimiento ?? "--",
            contenido: <small>{textoVencimiento(actual)}</small>,
        },
        {
            icono: Tag,
            titulo: "Estado",
            contenido: actual ? (
                <>
                    <em className={`badge-expensa ${estadoBadgeClase(actual.estado)}`}>
                        {actual.estado}
                    </em>
                    <small>{mensajeEstado[actual.estado]}</small>
                </>
            ) : (
                <small>{sinDatos ? "Todavía no hay expensas para tu unidad." : ""}</small>
            ),
        },
    ];

    return (
        <main className="expensas">

            {/* =========================
                    RESUMEN SUPERIOR
            ========================= */}

            <section className="expensas-resumen">
                {resumenExpensas.map((item) => {
                    const Icono = item.icono;
                    return (
                        <TarjetaResumen
                            key={item.titulo}
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

            {cargando && <p className="expensas-aviso" role="status">Cargando tus expensas...</p>}
            {error && <p className="expensas-aviso expensas-aviso-error" role="alert">{error}</p>}

            {/* HISTORIAL */}
            {!cargando && !error && (
                <Navegador
                    data={expensas}
                    searchKey="periodo"
                    searchPlaceholder="Buscar periodo..."
                    filters={filtros}
                    alinear="derecha"
                >
                    {(historialExpensasFiltradas) => (
                        <Tabla
                            columnas={columnasHistorialExpensas}
                            datos={historialExpensasFiltradas}
                            filasPorPagina={5}
                            etiqueta="expensas"
                            onFilaClick={abrirDetalle}
                            seleccionable
                            filaSeleccionada={detalleAbierto ? seleccionada : null}
                        />
                    )}
                </Navegador>
            )}

            {!cargando && !error && expensas.length === 0 && (
                <p className="expensas-aviso">
                    Todavía no se generó ninguna expensa para tu unidad. Se crean automáticamente el día 1 de cada mes.
                </p>
            )}

            {detalleAbierto && seleccionada && (
                <Panel
                    className="expensas-residente-detalle"
                    titulo="Detalle de expensa"
                    tituloComplemento={
                        <div className={`badge-expensa ${estadoBadgeClase(seleccionada.estado)}`}>
                            {seleccionada.estado}
                        </div>
                    }
                    accion={
                        <button
                            type="button"
                            onClick={() => setDetalleAbierto(false)}
                            aria-label="Cerrar detalle"
                        >
                            <X size={18} />
                        </button>
                    }
                >

                    {/* =========== COLUMNAS =========== */}

                    <div className="expensas-residente-detalle-columnas">

                        {/* =========== FILAS =========== */}

                        <section className="expensas-residente-detalle-seccion">
                            <h3>Resumen</h3>
                            <div className="expensas-residente-detalle-fila">
                                <span>Importe total</span>
                                <span>{seleccionada.importe}</span>
                            </div>
                            <div className="expensas-residente-detalle-fila">
                                <span>Periodo</span>
                                <span>{seleccionada.periodo}</span>
                            </div>
                            <div className="expensas-residente-detalle-fila">
                                <span>Vencimiento</span>
                                <span>{seleccionada.vencimiento}</span>
                            </div>
                            <div className="expensas-residente-detalle-fila">
                                <span>Pagado el</span>
                                <span>{seleccionada.fecha}</span>
                            </div>
                        </section>

                        {/* =========== FILAS =========== */}

                        <section className="expensas-residente-detalle-seccion">
                            <h3>Detalle de la expensa</h3>

                            {seleccionada.conceptos.length === 0 && (
                                <p className="expensas-sin-detalle">
                                    Esta expensa no tiene el detalle por concepto cargado.
                                </p>
                            )}

                            {seleccionada.conceptos.map((item) => (
                                <div className="detalle-item" key={item.concepto}>
                                    <div>
                                        <CircleHelp />
                                        <span>{item.concepto}</span>
                                    </div>

                                    <strong>{item.montoTexto}</strong>
                                </div>
                            ))}

                            <div className="detalle-total">
                                <strong>Total</strong>

                                <strong>{seleccionada.importe}</strong>
                            </div>
                        </section>
                    </div>

                    {/* =========== COMPROBANTE =========== */}

                    <div className="expensas-residente-detalle-acciones">
                        <button type="button" className="expensas-residente-detalle-boton expensas-residente-detalle-boton-principal">
                            <BanknoteArrowDown size={16} />
                            Pagar ahora
                        </button>
                        <button
                            type="button"
                            className="expensas-residente-detalle-boton"
                            onClick={bajarBoleta}
                        >
                            <Download size={16} />
                            Descargar boleta
                        </button>
                    </div>
                    {descargaError && (
                        <p className="expensas-aviso expensas-aviso-error" role="alert">{descargaError}</p>
                    )}
                </Panel>
            )}

            {/* AYUDA */}
            <section className="expensas-ayuda-grid">
                <Panel titulo="Ayuda sobre expensas" className="ayuda-expensas">
                    {preguntasAyuda.map((item) => {
                        const Icono = item.icono;
                        const abierta = preguntaAbierta === item.id;

                        return (
                            <div className={`ayuda-item ${abierta ? "abierta" : ""}`} key={item.id}>
                                <button
                                    type="button"
                                    className="ayuda-item-cabecera"
                                    aria-expanded={abierta}
                                    aria-controls={`ayuda-expensas-${item.id}`}
                                    onClick={() => setPreguntaAbierta(abierta ? null : item.id)}
                                >
                                    <span className="ayuda-icon"><Icono /></span>

                                    <span className="ayuda-item-textos">
                                        <strong>{item.pregunta}</strong>
                                        <span>{item.resumen}</span>
                                    </span>

                                    <ChevronRight className="ayuda-item-flecha" />
                                </button>

                                {abierta && (
                                    <div className="ayuda-item-respuesta" id={`ayuda-expensas-${item.id}`}>
                                        {item.respuesta}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </Panel>
            </section>

        </main>
    );
}

export default Expensas;
