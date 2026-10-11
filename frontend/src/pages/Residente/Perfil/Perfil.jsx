import { useEffect, useState } from "react";

import iconPerfil from "../../../assets/img/foto-perfil.png";

import {
    UserRound,
    Building2,
    Mail,
    Phone,
    Pencil,
    ShieldCheck,
    X,
} from "lucide-react";

import "./Perfil.css";
import Panel from "../../../components/Panel/Panel";

function Perfil() {

    useEffect(() => {
        document.title = "Habita | Mi perfil";
    }, []);

    const [nombreUsuario, setNombreUsuario] = useState("Nombre_usuario");
    const [fotoPerfil, setFotoPerfil] = useState(iconPerfil);
    const [modalEdicionAbierto, setModalEdicionAbierto] = useState(false);
    const [nombreBorrador, setNombreBorrador] = useState(nombreUsuario);
    const [fotoBorrador, setFotoBorrador] = useState(null);
    const [errorFoto, setErrorFoto] = useState("");

    useEffect(() => {
        if (!modalEdicionAbierto) return;

        const cerrarConEscape = (event) => {
            if (event.key === "Escape") setModalEdicionAbierto(false);
        };

        window.addEventListener("keydown", cerrarConEscape);
        return () => window.removeEventListener("keydown", cerrarConEscape);
    }, [modalEdicionAbierto]);

    const abrirEdicionPerfil = () => {
        setNombreBorrador(nombreUsuario);
        setFotoBorrador(null);
        setErrorFoto("");
        setModalEdicionAbierto(true);
    };

    const seleccionarFoto = (event) => {
        const archivo = event.target.files?.[0];
        if (!archivo) return;

        const lector = new FileReader();
        lector.onload = () => {
            if (typeof lector.result === "string") {
                setFotoBorrador(lector.result);
                setErrorFoto("");
            }
        };
        lector.onerror = () => {
            setErrorFoto("No se pudo cargar la imagen. Intentá con otro archivo.");
        };
        lector.readAsDataURL(archivo);
    };

    const guardarPerfil = (event) => {
        event.preventDefault();
        setNombreUsuario(nombreBorrador.trim() || nombreUsuario);
        if (fotoBorrador) setFotoPerfil(fotoBorrador);
        setModalEdicionAbierto(false);
    };

    return (
        <main className="perfil">

            {/* =========================
                  FILA SUPERIOR
            ========================= */}

            <section className="perfil-fila">

                {/* PERFIL DEL RESIDENTE */}

                <Panel
                    titulo="Perfil del residente"
                    icono={<UserRound />}
                    accion={
                        <button className="btn-editar" onClick={abrirEdicionPerfil}>
                            <Pencil />
                            Editar
                        </button>
                    }
                    className="residente-card"
                >
                    <div className="residente-contenido">
                        <div className="avatar-residente">
                            <img src={fotoPerfil} alt="Imagen de perfil"/>
                        </div>

                        <div className="residente-datos">
                            <h3>{nombreUsuario}</h3>

                            <span>
                                <Mail />
                                ejemplo@gmail.com
                            </span>

                            <span>
                                <Phone />
                                +54 11 1234 5678
                            </span>

                            <span>
                                <UserRound />
                                Residente
                            </span>
                        </div>
                    </div>
                </Panel>

                {/* INFORMACIÓN DE LA UNIDAD */}

                <Panel titulo="Información de la unidad" icono={<Building2 />} className="unidad-card">
                    <div className="unidad-contenido">
                        <div className="unidad-icono"><Building2 /></div>

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
                                <span>Dirección</span>
                                <strong>Av. del Libertador 1234, 5B, CABA, Argentina</strong>
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

            <section className="perfil-fila">

                {/* DATOS DE CONTACTO */}

                <Panel
                    titulo="Datos de contacto"
                    icono={<Mail />}
                    accion={
                        <button className="btn-editar">
                            <Pencil />
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

                    </div>
                    <p className="texto-ayuda">Estos datos se utilizarán para comunicarnos con vos.</p>
                </Panel>

                {/* SEGURIDAD */}

                <Panel
                    titulo="Seguridad de la cuenta"
                    icono={<ShieldCheck />}
                    className="seguridad-card"
                >
                    <div className="seguridad-contenido">
                        <div className="seguridad-bloque">
                            <strong>Contraseña</strong>

                            <span className="password">••••••••••</span>

                            <small>Última actualización: 03/05/2026</small>

                            <button className="btn-seguridad">Cambiar contraseña</button>
                        </div>
                    </div>
                </Panel>

            </section>

            {modalEdicionAbierto && (
                <div
                    className="perfil-modal-fondo"
                    onClick={() => setModalEdicionAbierto(false)}
                >
                    <section
                        className="perfil-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="perfil-modal-titulo"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="perfil-modal-header">
                            <h2 id="perfil-modal-titulo">Editar perfil</h2>
                            <button
                                className="perfil-modal-cerrar"
                                type="button"
                                aria-label="Cerrar"
                                onClick={() => setModalEdicionAbierto(false)}
                            >
                                <X />
                            </button>
                        </div>

                        <form onSubmit={guardarPerfil}>
                            <div className="perfil-modal-foto">
                                <img
                                    src={fotoBorrador || fotoPerfil}
                                    alt="Vista previa de la foto de perfil"
                                />
                                <label htmlFor="foto-perfil-input">Foto de perfil</label>
                                <input
                                    id="foto-perfil-input"
                                    type="file"
                                    accept="image/*"
                                    onChange={seleccionarFoto}
                                />
                                {errorFoto && (
                                    <span className="perfil-modal-error" role="alert">
                                        {errorFoto}
                                    </span>
                                )}
                            </div>

                            <div className="campo-perfil perfil-modal-nombre">
                                <label htmlFor="nombre-perfil-input">Nombre de usuario</label>
                                <input
                                    id="nombre-perfil-input"
                                    type="text"
                                    value={nombreBorrador}
                                    onChange={(event) => setNombreBorrador(event.target.value)}
                                    required
                                />
                            </div>

                            <div className="perfil-modal-acciones">
                                <button
                                    className="perfil-modal-cancelar"
                                    type="button"
                                    onClick={() => setModalEdicionAbierto(false)}
                                >
                                    Cancelar
                                </button>
                                <button className="btn-editar" type="submit">
                                    Guardar cambios
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            )}

        </main>
    );
}

export default Perfil;