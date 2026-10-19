import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
    Users,
    Building2,
    DollarSign,
    MessageSquare,
    ChevronDown,
    CheckCircle2,
    AlertCircle,
    Calendar,
    Megaphone,
    Download,
    FileText,
    FileSpreadsheet,
    BellRing,
    Wallet,
    CalendarDays,
    ArrowUp,
    ArrowDown,
    RefreshCw,
} from "lucide-react";

import "./inicio.css";
import Panel from "../../../components/Panel/Panel";
import TarjetaResumen from "../../../components/TarjetaResumen/TarjetaResumen";
import { GraficoColumnas, BarraApilada, BarrasHorizontales } from "./graficos";
import { obtenerDashboardAdmin, CODIGO_SIN_EDIFICIO } from "../../../services/dashboardAdminService";
import { descargarReportePdf, descargarReporteCsv } from "../../../utils/reporteAdmin";
import { formatearMoneda } from "../../../utils/formatos";

/* =========================
        CONFIGURACION
========================== */

// Metricas que se pueden ver en el grafico mensual
const METRICAS = [
    {
        clave: "recaudacion",
        pestana: "Cobranza",
        titulo: "Cobranza",
        descripcion: "Pagos recibidos en el mes",
        valorDe: (fila) => fila.recaudacion,
        formatear: (n) => formatearMoneda(n),
        lineasCartel: (fila) => [`${fila.pagos} ${fila.pagos === 1 ? "pago" : "pagos"}`],
    },
    {
        clave: "pagos",
        pestana: "Pagos",
        titulo: "Pagos recibidos",
        descripcion: "Cantidad de pagos confirmados",
        valorDe: (fila) => fila.pagos,
        formatear: (n) => `${n} ${n === 1 ? "pago" : "pagos"}`,
    },
    {
        clave: "reclamos",
        pestana: "Reclamos",
        titulo: "Reclamos recibidos",
        descripcion: "Reclamos cargados por los residentes",
        valorDe: (fila) => fila.reclamos,
        formatear: (n) => `${n} ${n === 1 ? "reclamo" : "reclamos"}`,
        lineasCartel: (fila) => [`${fila.resueltos} resueltos`],
    },
    {
        clave: "reservas",
        pestana: "Reservas",
        titulo: "Reservas confirmadas",
        descripcion: "Espacios comunes reservados",
        valorDe: (fila) => fila.reservas,
        formatear: (n) => `${n} ${n === 1 ? "reserva" : "reservas"}`,
    },
];

const RANGOS = [
    { meses: 6, texto: "6 meses" },
    { meses: 12, texto: "12 meses" },
];

const ICONOS_ACTIVIDAD = {
    pago: { icono: CheckCircle2, clase: "verde" },
    reclamo: { icono: AlertCircle, clase: "amarillo" },
    comunicado: { icono: Megaphone, clase: "azul" },
    reserva: { icono: Calendar, clase: "teal" },
};

/** "hace 5 min", "hace 3 h", "ayer" o la fecha */
function haceCuanto(iso) {
    const fecha = new Date(iso);
    if (Number.isNaN(fecha.getTime())) return "";
    const minutos = Math.round((Date.now() - fecha.getTime()) / 60000);
    if (minutos < 1) return "Recién";
    if (minutos < 60) return `Hace ${minutos} min`;
    const horas = Math.round(minutos / 60);
    if (horas < 24) return `Hace ${horas} h`;
    const dias = Math.round(horas / 24);
    if (dias === 1) return "Ayer";
    if (dias < 7) return `Hace ${dias} días`;
    return new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "America/Argentina/Buenos_Aires" }).format(fecha);
}

function fechaCompleta(iso) {
    const fecha = new Date(iso);
    if (Number.isNaN(fecha.getTime())) return "";
    return new Intl.DateTimeFormat("es-AR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Argentina/Buenos_Aires" }).format(fecha);
}

/** Variacion entre el ultimo mes y el anterior (null si no hay base para comparar). */
function variacion(serie, valorDe) {
    if (serie.length < 2) return null;
    const actual = valorDe(serie.at(-1));
    const anterior = valorDe(serie.at(-2));
    if (anterior === 0) return null;
    const porcentaje = ((actual - anterior) / anterior) * 100;
    return { porcentaje: Math.abs(porcentaje), sube: porcentaje >= 0, igual: Math.round(porcentaje) === 0 };
}

/* =========================
     MENU EXPORTAR REPORTE
========================== */

function MenuExportar({ datos }) {
    const [abierto, setAbierto] = useState(false);
    const [error, setError] = useState("");
    const contenedorRef = useRef(null);

    useEffect(() => {
        if (!abierto) return undefined;
        const alHacerClick = (evento) => {
            if (!contenedorRef.current?.contains(evento.target)) setAbierto(false);
        };
        const alPresionar = (evento) => { if (evento.key === "Escape") setAbierto(false); };
        document.addEventListener("pointerdown", alHacerClick);
        document.addEventListener("keydown", alPresionar);
        return () => {
            document.removeEventListener("pointerdown", alHacerClick);
            document.removeEventListener("keydown", alPresionar);
        };
    }, [abierto]);

    function exportar(accion) {
        try {
            setError("");
            accion(datos);
            setAbierto(false);
        } catch (err) {
            console.error("No se pudo generar el reporte", err);
            setError("No pudimos generar el reporte. Probá de nuevo.");
        }
    }

    return (
        <div className="adm-exportar" ref={contenedorRef}>
            <button
                type="button"
                className="reportes-btn-exportar"
                aria-haspopup="menu"
                aria-expanded={abierto}
                disabled={!datos}
                onClick={() => setAbierto((v) => !v)}
            >
                <Download size={15} aria-hidden="true" />
                Exportar reporte
                <ChevronDown size={14} aria-hidden="true" />
            </button>

            {abierto && (
                <div className="adm-exportar-menu" role="menu">
                    <button type="button" role="menuitem" onClick={() => exportar(descargarReportePdf)}>
                        <FileText size={18} aria-hidden="true" />
                        <span>
                            <strong>PDF</strong>
                            <small>Resumen de una página para imprimir o enviar</small>
                        </span>
                    </button>
                    <button type="button" role="menuitem" onClick={() => exportar(descargarReporteCsv)}>
                        <FileSpreadsheet size={18} aria-hidden="true" />
                        <span>
                            <strong>Excel (CSV)</strong>
                            <small>Todas las tablas para trabajar los datos</small>
                        </span>
                    </button>
                    {error && <p className="adm-exportar-error" role="alert">{error}</p>}
                </div>
            )}
        </div>
    );
}

/* =========================
      EVOLUCION MENSUAL
========================== */

function PanelEvolucion({ serie }) {
    const [claveMetrica, setClaveMetrica] = useState("recaudacion");
    const [meses, setMeses] = useState(12);
    const [verTabla, setVerTabla] = useState(false);

    const metrica = METRICAS.find((m) => m.clave === claveMetrica);
    const datos = serie.slice(-meses);
    const actual = serie.at(-1);
    const cambio = variacion(serie, metrica.valorDe);

    return (
        <Panel
            className="adm-evolucion"
            titulo={metrica.titulo}
            descripcion={metrica.descripcion}
            accion={
                <div className="adm-controles">
                    <div className="adm-segmentado" role="group" aria-label="Rango de meses">
                        {RANGOS.map((r) => (
                            <button
                                key={r.meses}
                                type="button"
                                className={meses === r.meses ? "activo" : ""}
                                aria-pressed={meses === r.meses}
                                onClick={() => setMeses(r.meses)}
                            >
                                {r.texto}
                            </button>
                        ))}
                    </div>
                    <button type="button" className="adm-boton-texto" onClick={() => setVerTabla((v) => !v)}>
                        {verTabla ? "Ver gráfico" : "Ver tabla"}
                    </button>
                </div>
            }
        >
            <div className="adm-pestanas" role="tablist" aria-label="Métrica del gráfico">
                {METRICAS.map((m) => (
                    <button
                        key={m.clave}
                        type="button"
                        role="tab"
                        aria-selected={claveMetrica === m.clave}
                        className={claveMetrica === m.clave ? "activa" : ""}
                        onClick={() => setClaveMetrica(m.clave)}
                    >
                        {m.pestana}
                    </button>
                ))}
            </div>

            {actual && (
                <div className="adm-destacado">
                    <strong>{metrica.formatear(metrica.valorDe(actual))}</strong>
                    <span>en {actual.mesLargo}</span>
                    {cambio && (
                        <em className={`adm-variacion ${cambio.igual ? "" : cambio.sube ? "sube" : "baja"}`}>
                            {cambio.igual ? null : cambio.sube ? <ArrowUp size={12} aria-hidden="true" /> : <ArrowDown size={12} aria-hidden="true" />}
                            {cambio.igual ? "Igual que el mes anterior" : `${cambio.porcentaje.toFixed(1).replace(".", ",")}% vs. mes anterior`}
                        </em>
                    )}
                </div>
            )}

            {verTabla ? (
                <div className="adm-tabla-envoltorio">
                    <table className="adm-tabla">
                        <thead>
                            <tr>
                                <th scope="col">Mes</th>
                                <th scope="col">Cobranza</th>
                                <th scope="col">Pagos</th>
                                <th scope="col">Reclamos</th>
                                <th scope="col">Resueltos</th>
                                <th scope="col">Reservas</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...datos].reverse().map((fila) => (
                                <tr key={fila.periodo}>
                                    <th scope="row">{fila.mesLargo}</th>
                                    <td>{formatearMoneda(fila.recaudacion)}</td>
                                    <td>{fila.pagos}</td>
                                    <td>{fila.reclamos}</td>
                                    <td>{fila.resueltos}</td>
                                    <td>{fila.reservas}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <GraficoColumnas
                    datos={datos}
                    valorDe={metrica.valorDe}
                    formatear={metrica.formatear}
                    formatearEje={claveMetrica === "recaudacion" ? undefined : (n) => String(n)}
                    entero={claveMetrica !== "recaudacion"}
                    lineasCartel={metrica.lineasCartel}
                    descripcion={`${metrica.titulo} de los últimos ${meses} meses`}
                />
            )}
        </Panel>
    );
}

/* =========================
     REQUIERE TU ATENCION
========================== */

function PanelAtencion({ atencion }) {
    const filas = [
        {
            clave: "sin-atender",
            icono: BellRing,
            cantidad: atencion.reclamosSinAtender,
            titulo: atencion.reclamosSinAtender === 1 ? "Reclamo sin atender" : "Reclamos sin atender",
            detalle: atencion.reclamosSinAtender > 0
                ? `El más antiguo lleva ${atencion.reclamosSinAtenderDias} ${atencion.reclamosSinAtenderDias === 1 ? "día" : "días"} esperando`
                : "No hay reclamos esperando respuesta",
            ruta: "/administrador/reclamos",
            urgente: atencion.reclamosSinAtender > 0,
        },
        {
            clave: "en-proceso",
            icono: MessageSquare,
            cantidad: atencion.reclamosEnProceso,
            titulo: "Reclamos en proceso",
            detalle: atencion.reclamosEnProceso > 0 ? "Pendientes de resolver" : "Ninguno en curso",
            ruta: "/administrador/reclamos",
        },
        {
            clave: "vencidas",
            icono: Wallet,
            cantidad: atencion.expensasVencidas,
            titulo: atencion.expensasVencidas === 1 ? "Expensa vencida" : "Expensas vencidas",
            detalle: atencion.expensasVencidas > 0
                ? `${formatearMoneda(atencion.expensasVencidasMonto)} sin cobrar`
                : "Todas las expensas están al día",
            ruta: "/administrador/expensas",
            urgente: atencion.expensasVencidas > 0,
        },
        {
            clave: "reservas",
            icono: CalendarDays,
            cantidad: atencion.reservasPendientes,
            titulo: atencion.reservasPendientes === 1 ? "Reserva por aprobar" : "Reservas por aprobar",
            detalle: atencion.reservasPendientes > 0 ? "Esperan tu confirmación" : "No hay solicitudes pendientes",
            ruta: "/administrador/reservas",
        },
    ];

    return (
        <Panel className="adm-atencion" titulo="Requiere tu atención" descripcion="Lo que hoy espera una respuesta tuya">
            <ul className="adm-atencion-lista">
                {filas.map((fila) => {
                    const Icono = fila.icono;
                    const alDia = fila.cantidad === 0;
                    return (
                        <li key={fila.clave}>
                            <Link to={fila.ruta} className={`adm-atencion-fila ${fila.urgente ? "urgente" : ""} ${alDia ? "al-dia" : ""}`}>
                                <span className="adm-atencion-icono"><Icono size={18} aria-hidden="true" /></span>
                                <span className="adm-atencion-texto">
                                    <strong>{fila.titulo}</strong>
                                    <small>{fila.detalle}</small>
                                </span>
                                <span className="adm-atencion-cantidad" aria-label={`${fila.cantidad}`}>
                                    {alDia ? <CheckCircle2 size={18} aria-label="Al día" /> : fila.cantidad}
                                </span>
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </Panel>
    );
}

/* =========================
          RECLAMOS
========================== */

const COLOR_ESTADO = {
    Pendiente: "var(--color-aviso-amarillo)",
    "En proceso": "var(--color-aviso-azul)",
    Resuelto: "var(--color-aviso-verde)",
};

function PanelReclamos({ porEstado, porCategoria }) {
    const segmentos = ["Pendiente", "En proceso", "Resuelto"].map((nombre) => ({
        nombre,
        cantidad: porEstado.find((e) => e.nombre === nombre)?.cantidad ?? 0,
        color: COLOR_ESTADO[nombre],
    }));
    const total = segmentos.reduce((suma, s) => suma + s.cantidad, 0);

    return (
        <Panel className="adm-reclamos" titulo="Reclamos" descripcion="Últimos 12 meses">
            {total === 0 ? (
                <p className="adm-vacio">Todavía no se cargaron reclamos en este edificio.</p>
            ) : (
                <>
                    <div className="adm-reclamos-total">
                        <strong>{total}</strong>
                        <span>{total === 1 ? "reclamo en total" : "reclamos en total"}</span>
                    </div>
                    <BarraApilada segmentos={segmentos} etiqueta="Reclamos por estado" />

                    <h3 className="adm-subtitulo">Por categoría</h3>
                    <BarrasHorizontales datos={porCategoria} etiqueta="Reclamos por categoría" />
                </>
            )}
        </Panel>
    );
}

/* =========================
      ACTIVIDAD RECIENTE
========================== */

function PanelActividad({ actividad }) {
    return (
        <Panel className="adm-actividad" titulo="Actividad reciente" descripcion="Lo último que pasó en el edificio">
            {actividad.length === 0 ? (
                <p className="adm-vacio">Todavía no hay movimientos para mostrar.</p>
            ) : (
                <ul className="adm-actividad-lista">
                    {actividad.slice(0, 8).map((item) => {
                        const { icono: Icono, clase } = ICONOS_ACTIVIDAD[item.tipo] ?? ICONOS_ACTIVIDAD.reserva;
                        return (
                            <li key={item.id} className="adm-actividad-item">
                                <span className={`adm-actividad-icono ${clase}`}><Icono size={16} aria-hidden="true" /></span>
                                <span className="adm-actividad-texto">
                                    <strong>{item.titulo}</strong>
                                    <small>{item.detalle}</small>
                                </span>
                                <span className="adm-actividad-meta">
                                    <time dateTime={item.fecha} title={fechaCompleta(item.fecha)}>{haceCuanto(item.fecha)}</time>
                                    <Link to={item.ruta}>Ir a {item.seccion.toLowerCase()}</Link>
                                </span>
                            </li>
                        );
                    })}
                </ul>
            )}
        </Panel>
    );
}

/* =========================
         PANTALLA
========================== */

function Dashboard() {
    const [datos, setDatos] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        document.title = "Habita | Dashboard";
    }, []);

    const cargar = useCallback(async () => {
        setCargando(true);
        setError("");
        try {
            setDatos(await obtenerDashboardAdmin());
        } catch (err) {
            console.error("No se pudo cargar el dashboard", err);
            setError(
                err?.code === CODIGO_SIN_EDIFICIO
                    ? "Tu cuenta todavía no administra ningún edificio, por eso no hay datos para mostrar."
                    : "No pudimos cargar el panel. Probá de nuevo en unos minutos."
            );
        } finally {
            setCargando(false);
        }
    }, []);

    useEffect(() => {
        let cancelado = false;
        Promise.resolve().then(() => { if (!cancelado) cargar(); });
        return () => { cancelado = true; };
    }, [cargar]);

    if (cargando && !datos) {
        return (
            <main className="admin-dashboard">
                <p className="adm-estado" role="status">Cargando el resumen del consorcio...</p>
            </main>
        );
    }

    if (error && !datos) {
        return (
            <main className="admin-dashboard">
                <div className="adm-estado adm-estado-error" role="alert">
                    <p>{error}</p>
                    <button type="button" className="adm-boton-texto" onClick={cargar}>
                        <RefreshCw size={14} aria-hidden="true" /> Reintentar
                    </button>
                </div>
            </main>
        );
    }

    const k = datos.kpis;
    const ocupacion = k.unidadesTotal > 0 ? Math.round((k.unidadesOcupadas / k.unidadesTotal) * 100) : 0;
    const diferenciaReclamos = k.reclamosNuevosMes - k.reclamosNuevosMesAnterior;

    const tarjetas = [
        {
            icono: Users,
            titulo: "Residentes",
            valor: k.residentesActivos,
            contenido: (
                <>
                    <span className="admin-info">Activos</span>
                    <span className={`admin-tendencia ${k.residentesNuevosMes > 0 ? "positiva" : ""}`}>
                        {k.residentesNuevosMes > 0 ? `+${k.residentesNuevosMes} este mes` : "Sin altas este mes"}
                    </span>
                </>
            ),
        },
        {
            icono: Building2,
            titulo: "Unidades",
            valor: k.unidadesTotal,
            contenido: (
                <>
                    <span className="admin-info">Registradas</span>
                    <span className="admin-tendencia">{k.unidadesOcupadas} ocupadas ({ocupacion}%)</span>
                </>
            ),
        },
        {
            icono: DollarSign,
            titulo: `Expensas de ${datos.periodoNombre}`,
            valor: formatearMoneda(k.importeCobrado),
            contenido: (
                <>
                    <span className="admin-info">Cobrado de {formatearMoneda(k.importeEmitido)}</span>
                    <div
                        className="admin-progreso"
                        role="progressbar"
                        aria-valuenow={k.porcentajeCobrado}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label="Porcentaje cobrado"
                    >
                        <div className="admin-progreso-relleno" style={{ width: `${k.porcentajeCobrado}%` }} />
                    </div>
                    <span className="admin-info">
                        {k.porcentajeCobrado}% · {k.expensasPagadas} de {k.expensasEmitidas} pagadas
                    </span>
                </>
            ),
        },
        {
            icono: MessageSquare,
            titulo: "Reclamos abiertos",
            valor: k.reclamosAbiertos,
            contenido: (
                <>
                    <span className="admin-info">Pendientes o en proceso</span>
                    <span className="admin-tendencia">
                        {k.reclamosNuevosMes} {k.reclamosNuevosMes === 1 ? "nuevo" : "nuevos"} este mes
                        {diferenciaReclamos !== 0 && ` (${diferenciaReclamos > 0 ? "+" : ""}${diferenciaReclamos} vs. mes anterior)`}
                    </span>
                </>
            ),
        },
    ];

    return (
        <main className="admin-dashboard">

            {/* =========================
                 EDIFICIO + EXPORTAR
            ========================= */}

            <div className="adm-barra-superior">
                <p className="adm-edificio">
                    <Building2 size={16} aria-hidden="true" />
                    <strong>{datos.edificio?.nombre}</strong>
                    {datos.edificio?.direccion && <span>{datos.edificio.direccion}</span>}
                </p>
                <MenuExportar datos={datos} />
            </div>

            {error && <p className="adm-estado-error-linea" role="alert">{error}</p>}

            {/* =========================
                  RESUMEN SUPERIOR
            ========================= */}

            <section className="admin-resumen" aria-label="Resumen del consorcio">
                {tarjetas.map((item) => {
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
                 GRAFICO + ATENCION
            ========================= */}

            <section className="adm-fila-principal">
                <PanelEvolucion serie={datos.serie} />
                <PanelAtencion atencion={datos.atencion} />
            </section>

            {/* =========================
                RECLAMOS + ACTIVIDAD
            ========================= */}

            <section className="adm-fila-secundaria">
                <PanelReclamos porEstado={datos.reclamosPorEstado} porCategoria={datos.reclamosPorCategoria} />
                <PanelActividad actividad={datos.actividad} />
            </section>
        </main>
    );
}

export default Dashboard;
