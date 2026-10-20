import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { WalletCards, CalendarDays, Tag, Download, BanknoteArrowDown, ChevronRight, CircleHelp, FileText, CheckCircle2, Clock, AlertCircle } from "lucide-react";

import "./Expensas.css";
import TarjetaResumen from "../../../components/TarjetaResumen/TarjetaResumen";
import Panel from "../../../components/Panel/Panel";
import Modal from "../../../components/Modal/Modal";
import Tabla from "../../../components/Tabla/Tabla";
import Navegador from "../../../components/Navegador/Navegador";
import { usePerfil } from "../../../context/PerfilContext";
import { obtenerExpensasResidente, ESTADOS_EXPENSA } from "../../../services/expensasService";
import { descargarBoleta } from "../../../utils/boletaPdf";
import { iniciarPago, confirmarPago, sincronizarPago } from "../../../services/pagosService";

/* Cuando el residente toca "Pagar ahora" anotamos qué expensa estaba pagando.
   Así, cuando vuelve a Habita (por el botón de Mercado Pago o abriendo la página a mano),
   buscamos ese pago en Mercado Pago y la expensa pasa a Pagada. */
const CLAVE_PAGO = "habita:pago-en-curso";
const VIGENCIA_PAGO_MS = 24 * 60 * 60 * 1000;

function leerPagoEnCurso() {
    try {
        const dato = JSON.parse(localStorage.getItem(CLAVE_PAGO) || "null");
        if (dato && Date.now() - dato.ts < VIGENCIA_PAGO_MS) return dato;
        localStorage.removeItem(CLAVE_PAGO);
    } catch { /* sin almacenamiento: no pasa nada */ }
    return null;
}
function guardarPagoEnCurso(expensaId) {
    try { localStorage.setItem(CLAVE_PAGO, JSON.stringify({ expensaId, ts: Date.now() })); } catch { /* idem */ }
}
function borrarPagoEnCurso() {
    try { localStorage.removeItem(CLAVE_PAGO); } catch { /* idem */ }
}
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
    const [pagando, setPagando] = useState(false);
    const [errorPago, setErrorPago] = useState("");
    const [avisoPago, setAvisoPago] = useState(null); // { tipo: "ok" | "pendiente" | "error" | "cargando", texto }
    const [parametros, setParametros] = useSearchParams();
    const vueltaProcesada = useRef(false);
    const [pagoEnCurso, setPagoEnCurso] = useState(() => leerPagoEnCurso());

    useEffect(() => {
        document.title = "Habita | Mis expensas";
    }, []);

    const cargarExpensas = useCallback(async () => {
        try {
            setExpensas(await obtenerExpensasResidente());
            setError("");
        } catch (err) {
            console.error("No se pudieron cargar las expensas", err);
            setError("No pudimos cargar tus expensas. Probá de nuevo en unos minutos.");
        } finally {
            setCargando(false);
        }
    }, []);

    useEffect(() => {
        cargarExpensas();
    }, [cargarExpensas]);

    /* =========================
       VUELTA DESDE MERCADO PAGO
       Mercado Pago nos devuelve a /expensas?pago=exito&payment_id=123...
       Le pedimos al backend que verifique ese pago y lo registre.
    ========================= */
    useEffect(() => {
        const resultado = parametros.get("pago");
        const pagoId = parametros.get("payment_id") || parametros.get("collection_id");
        if ((!resultado && !pagoId) || vueltaProcesada.current) return;
        vueltaProcesada.current = true;

        // Limpiamos la dirección para que al recargar no se repita
        setParametros({}, { replace: true });

        if (!pagoId) {
            if (resultado === "error") {
                setAvisoPago({ tipo: "error", texto: "El pago no se completó. No se te cobró nada: podés intentarlo de nuevo cuando quieras." });
            } else {
                setAvisoPago({ tipo: "pendiente", texto: "Si ya pagaste, puede tardar unos minutos en reflejarse. Volvé a cargar la página en un rato." });
                cargarExpensas();
            }
            return;
        }

        setAvisoPago({ tipo: "cargando", texto: "Estamos confirmando tu pago con Mercado Pago..." });
        confirmarPago(pagoId)
            .then((r) => {
                if (r.estado_mp === "approved") {
                    borrarPagoEnCurso();
                    setPagoEnCurso(null);
                    setAvisoPago({ tipo: "ok", texto: "¡Pago acreditado! Tu expensa figura como paga. Gracias." });
                } else if (["pending", "in_process", "authorized", "in_mediation"].includes(r.estado_mp)) {
                    setAvisoPago({ tipo: "pendiente", texto: "Tu pago está pendiente de acreditación. Cuando Mercado Pago lo confirme, la expensa pasa a Pagada automáticamente." });
                } else {
                    setAvisoPago({ tipo: "error", texto: "Mercado Pago no aprobó el pago. Podés intentarlo de nuevo con otro medio de pago." });
                }
            })
            .catch((err) => setAvisoPago({
                tipo: "error",
                texto: `No pudimos confirmar tu pago ahora (${err.message}). Si pagaste, no te preocupes: se va a registrar solo en unos minutos.`,
            }))
            .finally(cargarExpensas);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    /* Busca en Mercado Pago el pago que el residente dejó en curso (sin depender del webhook). */
    const verificarPago = useCallback(async (manual = false) => {
        const enCurso = leerPagoEnCurso();
        if (!enCurso) { setPagoEnCurso(null); return; }
        if (manual) setAvisoPago({ tipo: "cargando", texto: "Buscando tu pago en Mercado Pago..." });
        try {
            const r = await sincronizarPago(enCurso.expensaId);
            if (r.estado_mp === "approved") {
                borrarPagoEnCurso();
                setPagoEnCurso(null);
                setAvisoPago({ tipo: "ok", texto: "¡Pago acreditado! Tu expensa figura como paga. Gracias." });
                await cargarExpensas();
            } else if (r.estado_mp === "pending") {
                setAvisoPago({ tipo: "pendiente", texto: "Tu pago está pendiente de acreditación. Cuando Mercado Pago lo confirme, la expensa pasa a Pagada." });
            } else if (r.estado_mp === "rejected") {
                borrarPagoEnCurso();
                setPagoEnCurso(null);
                setAvisoPago({ tipo: "error", texto: "Mercado Pago no aprobó el pago. Podés intentarlo de nuevo con otro medio de pago." });
            } else if (manual) {
                setAvisoPago({ tipo: "pendiente", texto: "Todavía no vemos ningún pago. Si recién pagaste, esperá unos segundos y volvé a probar." });
            } else {
                setAvisoPago(null);
            }
        } catch (err) {
            if (manual) setAvisoPago({ tipo: "error", texto: `No pudimos verificar tu pago ahora (${err.message}). Probá de nuevo en un momento.` });
            else setAvisoPago((a) => (a?.tipo === "cargando" ? null : a));
        }
    }, [cargarExpensas]);

    // Al abrir la página (sin venir de Mercado Pago) y cada vez que el residente vuelve a esta pestaña
    useEffect(() => {
        if (!vueltaProcesada.current && leerPagoEnCurso()) verificarPago(false);
        const alVolver = () => { if (document.visibilityState === "visible" && leerPagoEnCurso()) verificarPago(false); };
        document.addEventListener("visibilitychange", alVolver);
        return () => document.removeEventListener("visibilitychange", alVolver);
    }, [verificarPago]);

    async function pagar(expensa) {
        if (!expensa || pagando) return;
        setPagando(true);
        setErrorPago("");
        try {
            const { url } = await iniciarPago(expensa.id);
            guardarPagoEnCurso(expensa.id);
            window.location.assign(url); // nos vamos a Mercado Pago
        } catch (err) {
            console.error("No se pudo iniciar el pago", err);
            setErrorPago(err.message);
            setPagando(false);
        }
    }

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
        setErrorPago("");
    }

    function cerrarDetalle() {
        setDetalleAbierto(false);
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
                    {actual.estado !== "Pagada" && (
                        <button type="button" className="exp-pagar-rapido" onClick={() => pagar(actual)} disabled={pagando}>
                            <BanknoteArrowDown size={15} aria-hidden="true" />
                            {pagando ? "Abriendo Mercado Pago..." : "Pagar ahora"}
                        </button>
                    )}
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

            {avisoPago && (
                <p className={`expensas-pago-aviso expensas-pago-${avisoPago.tipo}`} role="status">
                    {avisoPago.tipo === "ok" && <CheckCircle2 size={18} aria-hidden="true" />}
                    {(avisoPago.tipo === "pendiente" || avisoPago.tipo === "cargando") && <Clock size={18} aria-hidden="true" />}
                    {avisoPago.tipo === "error" && <AlertCircle size={18} aria-hidden="true" />}
                    <span>{avisoPago.texto}</span>
                    {avisoPago.tipo !== "cargando" && (
                        <button type="button" onClick={() => setAvisoPago(null)} aria-label="Cerrar aviso">×</button>
                    )}
                </p>
            )}
            {pagoEnCurso && actual?.estado !== "Pagada" && avisoPago?.tipo !== "cargando" && (
                <p className="expensas-pago-aviso expensas-pago-pendiente">
                    <Clock size={18} aria-hidden="true" />
                    <span>¿Ya pagaste en Mercado Pago y no ves el cambio?</span>
                    <button type="button" className="exp-verificar" onClick={() => verificarPago(true)}>Verificar mi pago</button>
                </p>
            )}
            {errorPago && !detalleAbierto && <p className="expensas-aviso expensas-aviso-error" role="alert">{errorPago}</p>}

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
                <Panel
                    className="expensas-historial"
                    titulo="Historial de expensas"
                    descripcion="Tocá un período para ver su detalle."
                >
                    <Navegador
                        data={expensas}
                        searchKey="periodo"
                        searchPlaceholder="Buscar período..."
                        filters={filtros}
                    >
                        {(historialExpensasFiltradas) => (
                            <Tabla
                                columnas={columnasHistorialExpensas}
                                datos={historialExpensasFiltradas}
                                etiqueta="expensas"
                                onFilaClick={abrirDetalle}
                            />
                        )}
                    </Navegador>
                </Panel>
            )}

            {!cargando && !error && expensas.length === 0 && (
                <p className="expensas-aviso">
                    Todavía no se generó ninguna expensa para tu unidad. Se crean automáticamente el día 1 de cada mes.
                </p>
            )}

            {detalleAbierto && seleccionada && (
                <Modal
                    titulo="Detalle de expensa"
                    onClose={cerrarDetalle}
                    ancho={720}
                    pie={
                        <>
                            <button type="button" className="modal-boton exp-boton-icono" onClick={bajarBoleta}>
                                <Download size={16} aria-hidden="true" />
                                Descargar boleta
                            </button>
                            {seleccionada.estado !== "Pagada" && (
                                <button
                                    type="button"
                                    className="modal-boton principal exp-boton-icono"
                                    onClick={() => pagar(seleccionada)}
                                    disabled={pagando}
                                >
                                    <BanknoteArrowDown size={16} aria-hidden="true" />
                                    {pagando ? "Abriendo Mercado Pago..." : "Pagar ahora"}
                                </button>
                            )}
                        </>
                    }
                >
                    <div className="exp-detalle">
                        {errorPago && <p className="expensas-aviso expensas-aviso-error" role="alert">{errorPago}</p>}
                        <div className="exp-detalle-cabecera">
                            <h3>{seleccionada.periodo}</h3>
                            <span className={`badge-expensa ${estadoBadgeClase(seleccionada.estado)}`}>
                                {seleccionada.estado}
                            </span>
                        </div>

                        <div className="exp-detalle-columnas">
                            <section className="exp-detalle-seccion">
                                <h4>Resumen</h4>
                                <div className="exp-detalle-fila">
                                    <span>Importe total</span>
                                    <strong>{seleccionada.importe}</strong>
                                </div>
                                <div className="exp-detalle-fila">
                                    <span>Período</span>
                                    <strong>{seleccionada.periodo}</strong>
                                </div>
                                <div className="exp-detalle-fila">
                                    <span>Vencimiento</span>
                                    <strong>{seleccionada.vencimiento}</strong>
                                </div>
                                <div className="exp-detalle-fila">
                                    <span>Pagado el</span>
                                    <strong>{seleccionada.fecha}</strong>
                                </div>
                            </section>

                            <section className="exp-detalle-seccion">
                                <h4>Detalle de la expensa</h4>

                                {seleccionada.conceptos.length === 0 && (
                                    <p className="exp-detalle-vacio">
                                        Esta expensa no tiene el detalle por concepto cargado.
                                    </p>
                                )}

                                {seleccionada.conceptos.map((item) => (
                                    <div className="exp-detalle-fila" key={item.concepto}>
                                        <span>{item.concepto}</span>
                                        <strong>{item.montoTexto}</strong>
                                    </div>
                                ))}

                                <div className="exp-detalle-total">
                                    <strong>Total</strong>
                                    <strong>{seleccionada.importe}</strong>
                                </div>
                            </section>
                        </div>

                        {descargaError && (
                            <p className="exp-detalle-error" role="alert">{descargaError}</p>
                        )}
                    </div>
                </Modal>
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
