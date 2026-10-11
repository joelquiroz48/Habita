import { useEffect, useState } from "react";

import iconPerfil from "../../../assets/img/foto-perfil.png";

import {
    UserRound,
    Building2,
    Mail,
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
    const [contacto, setContacto] = useState({
        email: "ejemplo@gmail.com",
        telefono: "+54 11 1234 5678",
        telefonoAlternativo: "+54 11 9876 5432",
    });
    const [contactoBorrador, setContactoBorrador] = useState(contacto);
    const [erroresContacto, setErroresContacto] = useState({});
    const [editandoContacto, setEditandoContacto] = useState(false);
    const [contactoGuardado, setContactoGuardado] = useState(false);

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

    const abrirEdicionContacto = () => {
        setContactoBorrador({ ...contacto });
        setErroresContacto({});
        setContactoGuardado(false);
        setEditandoContacto(true);
    };

    const cambiarContacto = (campo, valor) => {
        setContactoBorrador((actual) => ({ ...actual, [campo]: valor }));
        setErroresContacto((actual) => ({ ...actual, [campo]: "" }));
        setContactoGuardado(false);
    };

    const validarTelefono = (valor) => {
        const telefono = valor.trim();
        if (!telefono) return "Este campo es obligatorio.";
        if (!/^\+?[0-9\s().-]+$/.test(telefono)) {
            return "Usá solo números, espacios, guiones, paréntesis y + al inicio.";
        }

        const cantidadDigitos = telefono.replace(/\D/g, "").length;
        if (cantidadDigitos < 8 || cantidadDigitos > 15) {
            return "El teléfono debe tener entre 8 y 15 dígitos.";
        }

        return "";
    };

    const guardarContacto = (event) => {
        event.preventDefault();

        const valores = {
            email: contactoBorrador.email.trim(),
            telefono: contactoBorrador.telefono.trim(),
            telefonoAlternativo: contactoBorrador.telefonoAlternativo.trim(),
        };
        const nuevosErrores = {};

        if (!valores.email) {
            nuevosErrores.email = "El email es obligatorio.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valores.email)) {
            nuevosErrores.email = "Ingresá un email válido.";
        }

        nuevosErrores.telefono = validarTelefono(valores.telefono);
        if (valores.telefonoAlternativo) {
            nuevosErrores.telefonoAlternativo = validarTelefono(valores.telefonoAlternativo);
        }

        const errores = Object.fromEntries(
            Object.entries(nuevosErrores).filter(([, mensaje]) => mensaje)
        );
        setErroresContacto(errores);
        if (Object.keys(errores).length > 0) return;

        setContacto(valores);
        setContactoBorrador(valores);
        setEditandoContacto(false);
        setContactoGuardado(true);
    };

    const cancelarEdicionContacto = () => {
        setContactoBorrador({ ...contacto });
        setErroresContacto({});
        setEditandoContacto(false);
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
                    accion={!editandoContacto && (
                        <button className="btn-editar" onClick={abrirEdicionContacto}>
                            <Pencil />
                            Editar
                        </button>
                    )}
                    className="contacto-card"
                >
                    {editandoContacto ? (
                        <form className="contacto-form" noValidate onSubmit={guardarContacto}>
                            <div className="campo-perfil">
                                <label htmlFor="contacto-email">Email</label>
                                <div className="contacto-campo">
                                    <input
                                        id="contacto-email"
                                        type="email"
                                        autoComplete="email"
                                        value={contactoBorrador.email}
                                        aria-invalid={Boolean(erroresContacto.email)}
                                        aria-describedby={erroresContacto.email ? "error-contacto-email" : undefined}
                                        onChange={(event) => cambiarContacto("email", event.target.value)}
                                    />
                                    {erroresContacto.email && (
                                        <small id="error-contacto-email" className="contacto-error" role="alert">
                                            {erroresContacto.email}
                                        </small>
                                    )}
                                </div>
                            </div>

                            <div className="campo-perfil">
                                <label htmlFor="contacto-telefono">Teléfono</label>
                                <div className="contacto-campo">
                                    <input
                                        id="contacto-telefono"
                                        type="tel"
                                        autoComplete="tel"
                                        value={contactoBorrador.telefono}
                                        aria-invalid={Boolean(erroresContacto.telefono)}
                                        aria-describedby={erroresContacto.telefono ? "error-contacto-telefono" : undefined}
                                        onChange={(event) => cambiarContacto("telefono", event.target.value)}
                                    />
                                    {erroresContacto.telefono && (
                                        <small id="error-contacto-telefono" className="contacto-error" role="alert">
                                            {erroresContacto.telefono}
                                        </small>
                                    )}
                                </div>
                            </div>

                            <div className="campo-perfil">
                                <label htmlFor="contacto-telefono-alternativo">Teléfono alternativo</label>
                                <div className="contacto-campo">
                                    <input
                                        id="contacto-telefono-alternativo"
                                        type="tel"
                                        value={contactoBorrador.telefonoAlternativo}
                                        aria-invalid={Boolean(erroresContacto.telefonoAlternativo)}
                                        aria-describedby={erroresContacto.telefonoAlternativo ? "error-contacto-telefono-alternativo" : undefined}
                                        onChange={(event) => cambiarContacto("telefonoAlternativo", event.target.value)}
                                    />
                                    {erroresContacto.telefonoAlternativo && (
                                        <small id="error-contacto-telefono-alternativo" className="contacto-error" role="alert">
                                            {erroresContacto.telefonoAlternativo}
                                        </small>
                                    )}
                                </div>
                            </div>

                            <div className="contacto-acciones">
                                <button
                                    className="contacto-cancelar"
                                    type="button"
                                    onClick={cancelarEdicionContacto}
                                >
                                    Cancelar
                                </button>
                                <button className="btn-editar" type="submit">
                                    Guardar cambios
                                </button>
                            </div>
                        </form>
                    ) : (
                        <>
                            <div className="contacto-form">
                                <div className="campo-perfil">
                                    <span>Email</span>
                                    <strong>{contacto.email}</strong>
                                </div>
                                <div className="campo-perfil">
                                    <span>Teléfono</span>
                                    <strong>{contacto.telefono}</strong>
                                </div>
                                <div className="campo-perfil">
                                    <span>Teléfono alternativo</span>
                                    <strong>{contacto.telefonoAlternativo || "No especificado"}</strong>
                                </div>
                            </div>
                            {contactoGuardado ? (
                                <p className="contacto-exito" role="status">Los datos de contacto se guardaron correctamente.</p>
                            ) : (
                                <p className="texto-ayuda">Estos datos se utilizarán para comunicarnos con vos.</p>
                            )}
                        </>
                    )}
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