import { useCallback, useEffect, useMemo, useState } from "react";
import { Wallet, Download, Clock, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

import "./Pagos.css";
import TarjetaResumen from "../../../components/TarjetaResumen/TarjetaResumen";
import Tabla from "../../../components/Tabla/Tabla";
import Navegador from "../../../components/Navegador/Navegador";
import Modal from "../../../components/Modal/Modal";
import { formatearMoneda } from "../../../utils/formatos";
import { descargarComprobante } from "../../../utils/comprobantePago";
import { obtenerPagosAdmin } from "../../../services/pagosAdminService";

const CLASE_ESTADO = {
    Confirmado: "pagos-badge-confirmado",
    Pendiente: "pagos-badge-pendiente",
    "Para confirmar": "pagos-badge-pendiente",
    Rechazado: "pagos-badge-rechazado",
};

function Badge({ estado }) {
    return <span className={`pagos-badge ${CLASE_ESTADO[estado] ?? "pagos-badge-pendiente"}`}>{estado}</span>;
}

function Fila({ etiqueta, children }) {
    return (
        <div className="pagos-fila">
            <span>{etiqueta}</span>
            <strong>{children}</strong>
        </div>
    );
}

function ModalPago({ pago, onClose }) {
    const confirmado = pago.estado === "Confirmado";
    return (
        <Modal
            titulo="Detalle del pago"
            onClose={onClose}
            ancho={560}
            pie={
                <>
                    <button type="button" className="modal-boton" onClick={onClose}>Cerrar</button>
                    <button type="button" className="modal-boton principal pagos-boton-descarga" onClick={() => descargarComprobante(pago)} disabled={!confirmado} title={confirmado ? "" : "Solo los pagos confirmados tienen comprobante"}>
                        <Download size={14} /> Descargar comprobante
                    </button>
                </>
            }
        >
            <div className="pagos-modal-cabecera">
                <div>
                    <h3>{pago.importe}</h3>
                    <span>{pago.periodo}</span>
                </div>
                <Badge estado={pago.estado} />
            </div>

            <Fila etiqueta="Residente">{pago.residente}</Fila>
            <Fila etiqueta="Unidad">{pago.unidad}{pago.edificio ? ` · ${pago.edificio}` : ""}</Fila>
            <Fila etiqueta="Período">{pago.periodo}</Fila>
            <Fila etiqueta="Importe">{pago.importe}</Fila>
            <Fila etiqueta="Medio de pago">{pago.metodo}</Fila>
            <Fila etiqueta="Fecha de pago">{pago.fecha} - {pago.hora}</Fila>
            <Fila etiqueta="N° de transacción">{pago.referencia}</Fila>

            {!confirmado && (
                <p className="pagos-nota">
                    {pago.estado === "Rechazado"
                        ? "Este pago fue rechazado: la expensa sigue impaga y no hay comprobante."
                        : "Este pago todavía no está confirmado. El comprobante estará disponible cuando se confirme."}
                </p>
            )}
        </Modal>
    );
}

function Pagos() {
    const [datos, setDatos] = useState(null);
    const [error, setError] = useState("");
    const [abierto, setAbierto] = useState(null);

    const cargar = useCallback(async () => {
        try {
            setDatos(await obtenerPagosAdmin());
            setError("");
        } catch (e) {
            setError(e.message);
        }
    }, []);

    useEffect(() => {
        document.title = "Habita | Pagos";
        cargar();
    }, [cargar]);

    const pagos = datos?.pagos ?? [];
    const r = datos?.resumen;

    const filtros = useMemo(() => [
        { key: "periodo", label: "Todos los períodos", options: [...new Set(pagos.map((p) => p.periodo))] },
        { key: "metodo", label: "Todos los medios", options: [...new Set(pagos.map((p) => p.metodo).filter((m) => m !== "--"))] },
        { key: "estado", label: "Todos los estados", options: ["Confirmado", "Pendiente", "Rechazado"] },
    ], [pagos]);

    const columnas = useMemo(() => [
        { clave: "fecha", titulo: "Fecha de pago", ancho: "0.9fr" },
        { clave: "residente", titulo: "Residente", ancho: "1.2fr", clase: "pagos-residente" },
        { clave: "periodo", titulo: "Período", ancho: "0.9fr" },
        { clave: "unidad", titulo: "Unidad", ancho: "0.6fr" },
        { clave: "importe", titulo: "Importe", ancho: "0.9fr" },
        { clave: "estado", titulo: "Estado", ancho: "0.9fr", render: (p) => <Badge estado={p.estado} /> },
    ], []);

    if (error && !datos) {
        return (
            <main className="pagos">
                <div className="pagos-vacio">
                    <AlertCircle size={28} />
                    <h2>{error}</h2>
                    <button type="button" className="modal-boton principal" onClick={cargar}><RefreshCw size={13} /> Reintentar</button>
                </div>
            </main>
        );
    }
    if (!datos) return <main className="pagos"><p className="pagos-cargando">Cargando pagos...</p></main>;

    const seleccionado = pagos.find((p) => p.id === abierto) ?? null;

    return (
        <main className="pagos">
            <section className="pagos-resumen">
                <TarjetaResumen icono={<Wallet />} titulo="Total recaudado" valor={formatearMoneda(r.recaudado)} contenido={<span>{r.mesNombre}</span>} />
                <TarjetaResumen icono={<Download />} titulo="Pagos realizados" valor={r.realizados} contenido={<span>{r.mesNombre}</span>} />
                <TarjetaResumen icono={<Clock />} titulo="Por cobrar" valor={r.porCobrar} contenido={<span>Expensas impagas del mes</span>} />
                <TarjetaResumen
                    icono={<CheckCircle2 />}
                    titulo="Pagos confirmados"
                    valor={`${r.tasa}%`}
                    contenido={
                        <>
                            <div className="pagos-progreso"><div className="pagos-progreso-relleno" style={{ width: `${r.tasa}%` }} /></div>
                            <span>Tasa de éxito del mes</span>
                        </>
                    }
                />
            </section>

            <Navegador data={pagos} searchKey="busqueda" searchPlaceholder="Buscar residente o unidad..." filters={filtros}>
                {(filtrados) => (
                    <Tabla
                        columnas={columnas}
                        datos={filtrados}
                        etiqueta="pagos"
                        className="pagos-tabla"
                        onFilaClick={(p) => setAbierto(p.id)}
                    />
                )}
            </Navegador>

            {seleccionado && <ModalPago pago={seleccionado} onClose={() => setAbierto(null)} />}
        </main>
    );
}

export default Pagos;
