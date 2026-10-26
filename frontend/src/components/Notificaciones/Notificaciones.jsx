import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Calendar, CheckCheck, Megaphone, MessageSquareWarning, Wallet } from "lucide-react";
import {
    NotificacionesNoDisponibles,
    marcarLeida,
    marcarTodasLeidas,
    obtenerNotificaciones,
    tiempoRelativo,
} from "../../services/notificacionesService";
import "./Notificaciones.css";

const ICONO_POR_TIPO = {
    comunicado: Megaphone,
    expensa: Wallet,
    pago: Wallet,
    pago_admin: Wallet,
    reclamo: MessageSquareWarning,
    reclamo_admin: MessageSquareWarning,
    reserva: Calendar,
    reserva_admin: Calendar,
};

const CADA_CUANTO_ACTUALIZAR_MS = 60 * 1000;

/* La campanita de la cabecera (sirve para residente y administrador). */
function Notificaciones() {
    const navigate = useNavigate();
    const contenedor = useRef(null);

    const [abierto, setAbierto] = useState(false);
    const [items, setItems] = useState([]);
    const [noLeidas, setNoLeidas] = useState(0);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [noDisponible, setNoDisponible] = useState(false);

    const cargar = useCallback(async () => {
        try {
            const r = await obtenerNotificaciones(30);
            setItems(r.items);
            setNoLeidas(r.noLeidas);
            setError(null);
            setNoDisponible(false);
        } catch (e) {
            if (e instanceof NotificacionesNoDisponibles) setNoDisponible(true);
            else setError(e.message);
        } finally {
            setCargando(false);
        }
    }, []);

    // Carga inicial, cada minuto y al volver a la pestaña
    useEffect(() => {
        cargar();
        const timer = setInterval(() => {
            if (document.visibilityState === "visible") cargar();
        }, CADA_CUANTO_ACTUALIZAR_MS);
        const alVolver = () => {
            if (document.visibilityState === "visible") cargar();
        };
        document.addEventListener("visibilitychange", alVolver);
        return () => {
            clearInterval(timer);
            document.removeEventListener("visibilitychange", alVolver);
        };
    }, [cargar]);

    // Se cierra al tocar afuera o con Esc
    useEffect(() => {
        if (!abierto) return undefined;
        const afuera = (e) => {
            if (contenedor.current && !contenedor.current.contains(e.target)) setAbierto(false);
        };
        const tecla = (e) => {
            if (e.key === "Escape") setAbierto(false);
        };
        document.addEventListener("mousedown", afuera);
        document.addEventListener("keydown", tecla);
        return () => {
            document.removeEventListener("mousedown", afuera);
            document.removeEventListener("keydown", tecla);
        };
    }, [abierto]);

    const alternar = () => {
        setAbierto((a) => !a);
        if (!abierto) cargar();
    };

    const abrirNotificacion = async (n) => {
        setAbierto(false);
        if (!n.leida) {
            // Se ve leída al instante; si la base falla, la próxima carga la corrige
            setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, leida: true } : x)));
            setNoLeidas((c) => Math.max(0, c - 1));
            try {
                await marcarLeida(n.id);
            } catch {
                cargar();
            }
        }
        if (n.enlace) navigate(n.enlace);
    };

    const marcarTodas = async () => {
        setItems((prev) => prev.map((x) => ({ ...x, leida: true })));
        setNoLeidas(0);
        try {
            await marcarTodasLeidas();
        } catch {
            cargar();
        }
    };

    const etiquetaBoton = noLeidas > 0
        ? `Notificaciones, ${noLeidas} sin leer`
        : "Notificaciones";

    return (
        <div className="header-notificaciones notificaciones" ref={contenedor}>
            <button
                type="button"
                className="notificaciones-boton"
                onClick={alternar}
                aria-label={etiquetaBoton}
                aria-expanded={abierto}
                aria-haspopup="true"
            >
                <Bell />
                {noLeidas > 0 && (
                    <span className="notificaciones-contador" aria-hidden="true">
                        {noLeidas > 99 ? "99+" : noLeidas}
                    </span>
                )}
            </button>

            {abierto && (
                <div className="notificaciones-panel" role="dialog" aria-label="Notificaciones">
                    <div className="notificaciones-cabecera">
                        <strong>Notificaciones</strong>
                        {noLeidas > 0 && (
                            <button type="button" className="notificaciones-todas" onClick={marcarTodas}>
                                <CheckCheck size={15} aria-hidden="true" /> Marcar todas como leídas
                            </button>
                        )}
                    </div>

                    <div className="notificaciones-lista">
                        {cargando && <p className="notificaciones-vacio">Cargando...</p>}

                        {!cargando && noDisponible && (
                            <p className="notificaciones-vacio">Las notificaciones todavía no están disponibles.</p>
                        )}

                        {!cargando && !noDisponible && error && (
                            <p className="notificaciones-vacio">
                                {error}{" "}
                                <button type="button" className="notificaciones-reintentar" onClick={cargar}>
                                    Reintentar
                                </button>
                            </p>
                        )}

                        {!cargando && !noDisponible && !error && items.length === 0 && (
                            <p className="notificaciones-vacio">No tenés notificaciones por ahora.</p>
                        )}

                        {!noDisponible && items.map((n) => {
                            const Icono = ICONO_POR_TIPO[n.tipo] ?? Bell;
                            return (
                                <button
                                    type="button"
                                    key={n.id}
                                    className={`notificaciones-item ${n.leida ? "" : "sin-leer"}`}
                                    onClick={() => abrirNotificacion(n)}
                                >
                                    <span className="notificaciones-icono"><Icono size={18} aria-hidden="true" /></span>
                                    <span className="notificaciones-texto">
                                        <strong>{n.titulo}</strong>
                                        {n.cuerpo && <span>{n.cuerpo}</span>}
                                        <small>{tiempoRelativo(n.creadaEn)}</small>
                                    </span>
                                    {!n.leida && <span className="notificaciones-punto" aria-label="Sin leer" />}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Notificaciones;
