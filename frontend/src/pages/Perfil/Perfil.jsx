import { useEffect, useState } from "react";

import iconPerfil from "../../assets/img/foto-perfil.png";

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

function Perfil() {

    useEffect(() => {
        document.title = "Habita | Mi perfil";
    }, []);

    // Estados de las preferencias de notificación
    const [notificaciones, setNotificaciones] = useState({
        avisos: true,
        expensas: true,
        reservas: true,
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
                <article className="perfil-card residente-card">

                    <div className="perfil-card-header">
                        <div className="perfil-titulo">
                            <UserRound size={18} />
                            <h2>Perfil del residente</h2>
                        </div>
                    </div>

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

                </article>


                {/* INFORMACIÓN DE LA UNIDAD */}
                <article className="perfil-card unidad-card">

                    <div className="perfil-card-header">
                        <div className="perfil-titulo">
                            <Building2 size={18} />
                            <h2>Información de la unidad</h2>
                        </div>
                    </div>

                    <div className="unidad-contenido">

                        <div className="unidad-icono">
                            <Building2 size={38} />
                        </div>

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
                                <small className="badge-residente">
                                    Inquilino
                                </small>
                            </div>

                        </div>

                    </div>

                </article>

            </section>
            {/* =========================
                FILA CENTRAL
            ========================= */}

            <section className="perfil-grid-central">

                {/* DATOS DE CONTACTO */}
                <article className="perfil-card contacto-card">

                    <div className="perfil-card-header">

                        <div className="perfil-titulo">
                            <Mail size={18} />
                            <h2>Datos de contacto</h2>
                        </div>

                        <button className="btn-editar">
                            <Pencil size={12} />
                            Editar
                        </button>

                    </div>


                    <div className="contacto-form">

                        <div className="campo-perfil">
                            <label>Email</label>
                            <input
                                type="text"
                                value="ejemplo@gmail.com"
                                readOnly
                            />
                        </div>

                        <div className="campo-perfil">
                            <label>Teléfono</label>
                            <input
                                type="text"
                                value="+54 11 1234 5678"
                                readOnly
                            />
                        </div>

                        <div className="campo-perfil">
                            <label>Teléfono alternativo</label>
                            <input
                                type="text"
                                value="+54 11 9876 5432"
                                readOnly
                            />
                        </div>

                        <div className="campo-perfil">
                            <label>Dirección de notificación</label>
                            <input
                                type="text"
                                value="Av. del Libertador 1234, 5B, CABA, Argentina"
                                readOnly
                            />
                        </div>

                    </div>

                    <p className="texto-ayuda">
                        Estos datos se utilizarán para comunicarnos con vos.
                    </p>

                </article>


                {/* PREFERENCIAS */}
                <article className="perfil-card preferencias-card">

                    <div className="perfil-card-header">

                        <div className="perfil-titulo">
                            <Bell size={18} />
                            <h2>Preferencias de notificación</h2>
                        </div>

                        <button className="btn-editar">
                            <Pencil size={12} />
                            Editar
                        </button>

                    </div>


                    <div className="preferencias-lista">

                        <div className="preferencia">
                            <div>
                                <strong>Avisos</strong>
                                <span>Recibí avisos importantes del consorcio</span>
                            </div>

                            <button
                                className={`switch ${
                                    notificaciones.avisos ? "activo" : ""
                                }`}
                                onClick={() =>
                                    cambiarNotificacion("avisos")
                                }
                            >
                                <span></span>
                            </button>
                        </div>


                        <div className="preferencia">
                            <div>
                                <strong>Expensas</strong>
                                <span>Recordatorios y novedades de expensas</span>
                            </div>

                            <button
                                className={`switch ${
                                    notificaciones.expensas ? "activo" : ""
                                }`}
                                onClick={() =>
                                    cambiarNotificacion("expensas")
                                }
                            >
                                <span></span>
                            </button>
                        </div>


                        <div className="preferencia">
                            <div>
                                <strong>Reservas</strong>
                                <span>Confirmaciones y recordatorios de reservas</span>
                            </div>

                            <button
                                className={`switch ${
                                    notificaciones.reservas ? "activo" : ""
                                }`}
                                onClick={() =>
                                    cambiarNotificacion("reservas")
                                }
                            >
                                <span></span>
                            </button>
                        </div>

                    </div>

                </article>

            </section>


            {/* =========================
                FILA INFERIOR
            ========================= */}

            <section className="perfil-inferior">

                {/* SEGURIDAD */}
                <article className="perfil-card seguridad-card">

                    <div className="perfil-card-header">

                        <div className="perfil-titulo">
                            <ShieldCheck size={18} />
                            <h2>Seguridad de la cuenta</h2>
                        </div>

                    </div>


                    <div className="seguridad-contenido">

                        {/* CONTRASEÑA */}
                        <div className="seguridad-bloque">

                            <strong>Contraseña</strong>

                            <span className="password">
                                ••••••••••
                            </span>

                            <small>
                                Última actualización: 03/05/2024
                            </small>

                            <button className="btn-seguridad">
                                Cambiar contraseña
                            </button>

                        </div>


                        {/* DOS PASOS */}
                        <div className="seguridad-bloque">

                            <div className="seguridad-titulo">
                                <strong>Verificación en dos pasos</strong>

                                <span className="badge-activa">
                                    Activada
                                </span>
                            </div>

                            <p>
                                Tu cuenta está protegida con verificación
                                en dos pasos.
                            </p>

                            <button className="btn-seguridad">
                                Administrar
                            </button>

                        </div>


                        {/* SESIONES */}
                        <div className="seguridad-bloque sesiones">

                            <div className="sesiones-header">
                                <strong>Sesiones activas</strong>

                                <button>
                                    Ver todas (2)
                                </button>
                            </div>


                            <div className="sesion">

                                <Monitor size={16} />

                                <div>
                                    <strong>Chrome en Windows</strong>

                                    <span>
                                        Buenos Aires, Argentina
                                    </span>
                                </div>

                                <small className="badge-actual">
                                    Actual
                                </small>

                            </div>


                            <div className="sesion">

                                <Smartphone size={16} />

                                <div>
                                    <strong>iPhone 14 en iOS</strong>

                                    <span>
                                        Buenos Aires, Argentina · 08/05/2024, 10:32
                                    </span>
                                </div>

                            </div>

                        </div>

                    </div>

                </article>

            </section>

        </main>
    );
}

export default Perfil;