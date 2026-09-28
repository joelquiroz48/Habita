import { useEffect, useState } from "react";

import iconPerfil from "../../../assets/img/foto-perfil.png";

import {
    UserRound,
    Building2,
    Mail,
    Phone,
    Pencil,
    Bell,
    ShieldCheck,
    Smartphone,
    Monitor,
} from "lucide-react";

import "./Perfil.css";
import Panel from "../../../components/Panel/Panel";

const preferencias = [
    {
        clave: "avisos",
        titulo: "Avisos",
        descripcion: "Recibí avisos importantes del consorcio",
    },
    {
        clave: "expensas",
        titulo: "Expensas",
        descripcion: "Recordatorios y novedades de expensas",
    },
    {
        clave: "reservas",
        titulo: "Reservas",
        descripcion: "Confirmaciones y recordatorios de reservas",
    },
];

function Perfil() {

    useEffect(() => {
        document.title = "Habita | Mi perfil";
    }, []);

    const [notificaciones, setNotificaciones] = useState({
        avisos: false,
        expensas: false,
        reservas: false,
    });

    const cambiarNotificacion = (tipo) => {
        setNotificaciones({
            ...notificaciones,
            [tipo]: !notificaciones[tipo],
        });
    };

    return (
        <main className="perfil">

            {/* =========================
                FILA SUPERIOR
            ========================= */}

            <section className="perfil-grid-superior">

                {/* PERFIL DEL RESIDENTE */}
                <Panel titulo="Perfil del residente" icono={<UserRound size={18} />} className="residente-card">
                    <div className="residente-contenido">
                        <div className="avatar-residente">
                            <img src={iconPerfil} alt="Imagen de perfil"/>
                        </div>

                        <div className="residente-datos">
                            <h3>Nombre_usuario</h3>

                            <span>
                                <Mail size={13} />
                                ejemplo@gmail.com
                            </span>

                            <span>
                                <Phone size={13} />
                                +54 11 1234 5678
                            </span>

                            <span>
                                <UserRound size={13} />
                                Residente
                            </span>
                        </div>
                    </div>
                </Panel>


                {/* INFORMACIÓN DE LA UNIDAD */}
                <Panel titulo="Información de la unidad" icono={<Building2 size={18} />} className="unidad-card">
                    <div className="unidad-contenido">
                        <div className="unidad-icono"><Building2 size={38} /></div>

                        <div className="unidad-datos">
                            <div>
                                <span>Edificio</span>
                                <strong>Torres del Parque</strong>
                            </div>

                            <div>
                                <span>Unidad</span>
                                <strong>5B</strong>
                            </div>

                            <div>
                                <span>Piso</span>
                                <strong>5</strong>
                            </div>

                            <div>
                                <span>Estado</span>
                                <small className="badge-residente">Inquilino</small>
                            </div>
                        </div>
                    </div>
                </Panel>
            </section>
            {/* =========================
                FILA CENTRAL
            ========================= */}

            <section className="perfil-grid-central">

                {/* DATOS DE CONTACTO */}
                <Panel
                    titulo="Datos de contacto"
                    icono={<Mail size={12} />}
                    accion={
                        <button className="btn-editar">
                            <Pencil size={12} />
                            Editar
                        </button>
                    }
                    className="contacto-card"
                >
                    <div className="contacto-form">
                        <div className="campo-perfil">
                            <label>Email</label>
                            <input type="text" value="ejemplo@gmail.com"/>
                        </div>

                        <div className="campo-perfil">
                            <label>Teléfono</label>
                            <input type="text" value="+54 11 1234 5678"/>
                        </div>

                        <div className="campo-perfil">
                            <label>Teléfono alternativo</label>
                            <input type="text" value="+54 11 9876 5432"/>
                        </div>

                        <div className="campo-perfil">
                            <label>Dirección de notificación</label>
                            <input type="text" value="Av. del Libertador 1234, 5B, CABA, Argentina"/>
                        </div>
                    </div>

                    <p className="texto-ayuda">Estos datos se utilizarán para comunicarnos con vos.</p>
                </Panel>


                {/* PREFERENCIAS */}
                <Panel
                    titulo="Preferencias de notificación"
                    icono={<Bell size={12} />}
                    accion={
                        <button className="btn-editar">
                            <Pencil size={12} />
                            Editar
                        </button>
                    }
                    className="preferencias-card"
                >
                    <div className="preferencias-lista">
                        {preferencias.map((preferencia) => (
                            <div className="preferencia" key={preferencia.clave}>
                                <div>
                                    <strong>{preferencia.titulo}</strong>
                                    <span>{preferencia.descripcion}</span>
                                </div>

                                <button className={`switch ${
                                        notificaciones[preferencia.clave] ? "activo" : ""
                                    }`}
                                    onClick={() => cambiarNotificacion(preferencia.clave)}
                                >
                                    <span></span>
                                </button>
                            </div>
                        ))}
                    </div>
                </Panel>

            </section>


            {/* =========================
                FILA INFERIOR
            ========================= */}

            <section className="perfil-inferior">

                {/* SEGURIDAD */}
                <Panel
                    titulo="Seguridad de la cuenta"
                    icono={<ShieldCheck size={18} />}
                    className="seguridad-card"
                >
                    <div className="seguridad-contenido">

                        {/* CONTRASEÑA */}
                        <div className="seguridad-bloque">
                            <strong>Contraseña</strong>

                            <span className="password">••••••••••</span>

                            <small>Última actualización: 03/05/2026</small>

                            <button className="btn-seguridad">Cambiar contraseña</button>
                        </div>

                        {/* DOS PASOS */}
                        <div className="seguridad-bloque">
                            <div className="seguridad-titulo">
                                <strong>Verificación en dos pasos</strong>

                                <span className="badge-activa">Activada</span>
                            </div>

                            <p>Tu cuenta está protegida con verificación en dos pasos.</p>

                            <button className="btn-seguridad">Administrar</button>
                        </div>

                        {/* SESIONES */}
                        <div className="seguridad-bloque sesiones">
                            <div className="sesiones-header">
                                <strong>Sesiones activas</strong>

                                <button>Ver todas (2)</button>
                            </div>

                            <div className="sesion">
                                <Monitor size={16} />

                                <div>
                                    <strong>Chrome en Windows</strong>
                                    <span>Buenos Aires, Argentina</span>
                                </div>

                                <small className="badge-actual">Actual</small>
                            </div>

                            <div className="sesion">
                                <Smartphone size={16} />

                                <div>
                                    <strong>iPhone 14 en iOS</strong>
                                    <span>Buenos Aires, Argentina · 08/05/2026, 10:32</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </Panel>

            </section>

        </main>
    );
}

export default Perfil;