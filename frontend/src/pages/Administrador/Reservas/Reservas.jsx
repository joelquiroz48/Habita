import { useEffect, useState } from "react";
import {
    Calendar,
    Clock,
    CheckCircle2,
    XCircle,
    ChevronRight,
    X,
} from "lucide-react";

import "./Reservas.css";
import Panel from "../../../components/Panel/Panel";
import TarjetaResumen from "../../../components/TarjetaResumen/TarjetaResumen";
import Tabla from "../../../components/Tabla/Tabla";
import Navegador from "../../../components/Navegador/Navegador";

{/* =========================
       DATOS EJEMPLOS
========================== */}

const kpis = {
    reservasMes: 28,
    tendencia: "+12% vs. mes anterior",
    pendientes: 5,
    confirmadas: 21,
    canceladas: 2,
};

const reservas = [
    {
        fecha: "18/09/2026",
        horario: "18:00 - 22:00",
        espacio: "SUM",
        ubicacion: "Planta baja",
        residente: "María Gómez",
        unidad: "3A",
        estado: "Confirmada",
        creada: "01/09/2026 10:15",
    },
    {
        fecha: "25/09/2026",
        horario: "14:00 - 18:00",
        espacio: "Parrilla",
        ubicacion: "Área común",
        residente: "Juan López",
        unidad: "7C",
        estado: "Pendiente",
        creada: "31/08/2026 16:40",
    },
    {
        fecha: "20/09/2026",
        horario: "19:00 - 23:00",
        espacio: "SUM",
        ubicacion: "Planta baja",
        residente: "Carla Romero",
        unidad: "1B",
        estado: "Confirmada",
        creada: "30/08/2026 11:20",
    },
    {
        fecha: "02/09/2026",
        horario: "09:00 - 13:00",
        espacio: "Gimnasio",
        ubicacion: "1° piso",
        residente: "Pedro Martínez",
        unidad: "2D",
        estado: "Cancelada",
        creada: "29/08/2026 09:30",
    },
    {
        fecha: "22/09/2026",
        horario: "15:00 - 19:00",
        espacio: "Sala de reuniones",
        ubicacion: "1° piso",
        residente: "Laura Sánchez",
        unidad: "4A",
        estado: "Confirmada",
        creada: "28/08/2026 14:10",
    },
    {
        fecha: "27/09/2026",
        horario: "18:00 - 22:00",
        espacio: "Parrilla",
        ubicacion: "Área común",
        residente: "Diego Fernández",
        unidad: "6E",
        estado: "Confirmada",
        creada: "27/08/2026 12:05",
    },
];

const espaciosMasReservados = [
    { nombre: "SUM", cantidad: 12 },
    { nombre: "Parrilla", cantidad: 8 },
    { nombre: "Gimnasio", cantidad: 5 },
    { nombre: "Sala de reuniones", cantidad: 3 },
];
const maxReservasEspacio = Math.max(...espaciosMasReservados.map((e) => e.cantidad));

{/* =========================
       TARJETAS RESUMEN
========================== */}

const resumenTarjetas = [
    {
        icono: Calendar,
        titulo: "Reservas este mes",
        valor: kpis.reservasMes,
        contenido: <span className="reservas-tendencia">↑ {kpis.tendencia}</span>,
    },
    {
        icono: Clock,
        titulo: "Pendientes",
        valor: kpis.pendientes,
        contenido: <span>Por confirmar</span>,
    },
    {
        icono: CheckCircle2,
        titulo: "Confirmadas",
        valor: kpis.confirmadas,
        contenido: <span>Este mes</span>,
    },
    {
        icono: XCircle,
        titulo: "Canceladas",
        valor: kpis.canceladas,
        contenido: <span>Este mes</span>,
    },
];

function estadoBadgeClase(estado) {
    if (estado === "Confirmada") return "reservas-badge-confirmada";
    if (estado === "Pendiente") return "reservas-badge-pendiente";
    if (estado === "Cancelada") return "reservas-badge-cancelada";
    if (estado === "Rechazada") return "reservas-badge-rechazada";
    return "reservas-badge-finalizada";
}

const columnas = [
    {
        clave: "fecha",
        titulo: "Fecha y hora",
        ancho: "1fr",
        render: (reserva) => (
            <span className="reservas-fecha-celda">
                <span>
                    {reserva.fecha}
                    <small>{reserva.horario}</small>
                </span>
            </span>
        ),
    },
    {
        clave: "espacio",
        titulo: "Espacio",
        ancho: "1.2fr",
        render: (reserva) => {
            return (
                <span className="reservas-espacio-celda">
                    <span>
                        <strong>{reserva.espacio}</strong>
                        <small>{reserva.ubicacion}</small>
                    </span>
                </span>
            );
        },
    },
    { clave: "residente", titulo: "Residente", ancho: "1fr" },
    { clave: "unidad", titulo: "Unidad", ancho: "0.6fr" },
    {
        clave: "estado",
        titulo: "Estado",
        ancho: "0.9fr",
        render: (reserva) => (
            <span className={`reservas-badge ${estadoBadgeClase(reserva.estado)}`}>
                {reserva.estado}
            </span>
        ),
    },
    { clave: "creada", titulo: "Creada el", ancho: "1fr", clase: "reservas-creada" },
];

const filtros=[
    {
        key: "estado",
        label: "Todos los estados",
        options: ["Confirmada", "Pendiente", "Cancelada", "Rechazada", "Finalizada"],
    },
    {
        key: "espacio",
        label: "Todos los espacios",
        options: ["Sum", "Parrilla", "Gimnasio", "Sala de reuniones"],
    },
    {
        key: "fecha",
        label: "Todos los periodos",
        options: ["Enero", "Febrero"],
    },
];

function Reservas() {

    const [seleccionado, setSeleccionado] = useState(reservas[0]);
    const [detalleAbierto, setDetalleAbierto] = useState(false);

    useEffect(() => {
        document.title = "Habita | Reservas";
    }, []);

    function abrirDetalle(comunicado) {
    setSeleccionado(comunicado);
    setDetalleAbierto(true);
    }

    return (
        <main className="reservas pagina-administrador">

            {/* =========================
                  RESUMEN SUPERIOR
            ========================= */}

            <section className="reservas-resumen">
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

            <Navegador
                data={reservas}
                searchKey="espacio"
                searchPlaceholder="Buscar reserva..."
                filters={filtros}
            >
                {(ReservasFiltradas) => (
                    <Tabla
                        columnas={columnas}
                        datos={ReservasFiltradas}
                        etiqueta="reservas"
                        className="reservas-tabla"
                        onFilaClick={abrirDetalle}
                        seleccionable
                        filaSeleccionada={detalleAbierto ? seleccionado : null}
                    />
                        )}
            </Navegador>      

            {detalleAbierto && (
                <Panel
                    className="reservas-detalle"
                    titulo={seleccionado.espacio}
                    tituloComplemento={
                        <div className={`reservas-badge ${estadoBadgeClase(seleccionado.estado)}`}>
                            {seleccionado.estado}
                        </div>
                    }
                    accion={
                        <button
                            className="reservas-detalle-cerrar"
                            onClick={() => setDetalleAbierto(false)}
                            aria-label="Cerrar detalle"
                        >
                            <X size={18} />
                        </button>
                    }
                >
                    
                    {/* =========== FILAS =========== */}

                    <div className="reservas-detalle-fila">
                        <span>Ubicación</span>
                        <strong>{seleccionado.ubicacion}</strong>
                    </div>

                    <div className="reservas-detalle-fila">
                        <span>Solicitado por</span>
                        <strong>{seleccionado.residente}</strong>
                    </div>

                    <div className="reservas-detalle-fila">
                        <span>Unidad</span>
                        <strong>{seleccionado.unidad}</strong>
                    </div>

                    <div className="reservas-detalle-fila">
                        <span>Fecha y horario solicitado</span>
                        <strong>{seleccionado.fecha} {seleccionado.horario}</strong>
                    </div>

                    {/* =========== OPCIONES =========== */}

                    <button className="comunicados-btn-editar">
                        Cancelar reserva
                    </button>
                </Panel>
            )}

            <Panel titulo="Espacios más reservados" className="reservas-panel">
                <div className="reservas-barras-lista">
                    {espaciosMasReservados.map((espacio) => (
                        <div className="reservas-barra-fila" key={espacio.nombre}>
                            <div className="reservas-barra-header">
                                <span>{espacio.nombre}</span>
                                <strong>{espacio.cantidad}</strong>
                            </div>

                            <div className="reservas-barra-pista">
                                <div
                                    className="reservas-barra-relleno"
                                    style={{
                                        width: `${
                                            (espacio.cantidad / maxReservasEspacio) * 100
                                        }%`
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <a href="#" className="reservas-link-reporte">
                    Ver reporte completo
                    <ChevronRight size={14} />
                </a>
            </Panel>      

        </main>
    );
}

export default Reservas;
