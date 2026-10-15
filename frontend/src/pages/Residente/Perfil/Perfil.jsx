import { useEffect, useRef, useState } from "react";

import iconPerfil from "../../../assets/img/foto-perfil.png";

import {
    UserRound,
    Building2,
    Mail,
    Pencil,
    ShieldCheck,
    ImagePlus,
    Eye,
    EyeOff,
    X,
} from "lucide-react";

import "./Perfil.css";
import Panel from "../../../components/Panel/Panel";
import { usePerfil } from "../../../context/PerfilContext";
import {
    cambiarContrasena,
    guardarPerfilBasico,
    guardarTelefono,
    validarFoto,
} from "../../../services/perfilService";

const ETIQUETA_ROL = {
    PROPIETARIO: "Propietario",
    INQUILINO: "Inquilino",
    OCUPANTE: "Ocupante",
};

const LARGO_MAXIMO_NOMBRE = 80;
const LARGO_MINIMO_CONTRASENA = 6;

function validarTelefono(valor) {
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
}

/* Campo de contraseña con botón para mostrar u ocultar lo que se escribe */
function CampoContrasena({ id, etiqueta, valor, onChange, autoComplete, invalido = false, ayuda = null }) {
    const [visible, setVisible] = useState(false);

    return (
        <div className="campo-perfil perfil-modal-nombre">
            <label htmlFor={id}>{etiqueta}</label>
            <div className="campo-contrasena">
                <input
                    id={id}
                    type={visible ? "text" : "password"}
                    autoComplete={autoComplete}
                    value={valor}
                    aria-invalid={invalido}
                    onChange={onChange}
                />
                <button
                    type="button"
                    className="campo-contrasena-ojo"
                    onClick={() => setVisible((actual) => !actual)}
                    aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
                    aria-pressed={visible}
                >
                    {visible ? <EyeOff /> : <Eye />}
                </button>
            </div>
            {ayuda}
        </div>
    );
}

function Perfil() {
    const { perfil, cargando, error: errorPerfil, recargarPerfil } = usePerfil();

    useEffect(() => {
        document.title = "Habita | Mi perfil";
    }, []);

    /* ---------- Editar perfil (nombre y foto) ---------- */
    const [modalEdicionAbierto, setModalEdicionAbierto] = useState(false);
    const [nombreBorrador, setNombreBorrador] = useState("");
    const [archivoBorrador, setArchivoBorrador] = useState(null);
    const [vistaPrevia, setVistaPrevia] = useState(null);
    const [quitarFoto, setQuitarFoto] = useState(false);
    const [errorEdicion, setErrorEdicion] = useState("");
    const [guardandoPerfil, setGuardandoPerfil] = useState(false);
    const inputFotoRef = useRef(null);

    /* ---------- Datos de contacto (teléfono) ---------- */
    const [editandoContacto, setEditandoContacto] = useState(false);
    const [telefonoBorrador, setTelefonoBorrador] = useState("");
    const [errorTelefono, setErrorTelefono] = useState("");
    const [guardandoTelefono, setGuardandoTelefono] = useState(false);
    const [contactoGuardado, setContactoGuardado] = useState(false);
    const [errorGuardadoContacto, setErrorGuardadoContacto] = useState("");

    /* ---------- Cambiar contraseña ---------- */
    const [modalContrasenaAbierto, setModalContrasenaAbierto] = useState(false);
    const [contrasenaActual, setContrasenaActual] = useState("");
    const [contrasenaNueva, setContrasenaNueva] = useState("");
    const [contrasenaRepetida, setContrasenaRepetida] = useState("");
    const [errorContrasena, setErrorContrasena] = useState("");
    const [guardandoContrasena, setGuardandoContrasena] = useState(false);
    const [contrasenaCambiada, setContrasenaCambiada] = useState(false);

    // Libera la vista previa de la foto cuando cambia o se cierra
    useEffect(() => {
        return () => {
            if (vistaPrevia) URL.revokeObjectURL(vistaPrevia);
        };
    }, [vistaPrevia]);

    // Escape cierra cualquiera de los dos modales
    useEffect(() => {
        if (!modalEdicionAbierto && !modalContrasenaAbierto) return;

        const cerrarConEscape = (event) => {
            if (event.key !== "Escape") return;
            setModalEdicionAbierto(false);
            setModalContrasenaAbierto(false);
        };

        window.addEventListener("keydown", cerrarConEscape);
        return () => window.removeEventListener("keydown", cerrarConEscape);
    }, [modalEdicionAbierto, modalContrasenaAbierto]);

    /* =========================
          EDITAR PERFIL
    ========================= */

    const abrirEdicionPerfil = () => {
        setNombreBorrador(perfil?.nombre ?? "");
        setArchivoBorrador(null);
        setVistaPrevia(null);
        setQuitarFoto(false);
        setErrorEdicion("");
        setModalEdicionAbierto(true);
    };

    const seleccionarFoto = (event) => {
        const archivo = event.target.files?.[0];
        if (!archivo) return;

        const mensaje = validarFoto(archivo);
        if (mensaje) {
            setErrorEdicion(mensaje);
            event.target.value = "";
            return;
        }

        setErrorEdicion("");
        setArchivoBorrador(archivo);
        setVistaPrevia(URL.createObjectURL(archivo));
        setQuitarFoto(false);
    };

    const quitarFotoSeleccionada = () => {
        if (inputFotoRef.current) inputFotoRef.current.value = "";
        setErrorEdicion("");

        if (archivoBorrador) {
            // Descarta la foto recién elegida y vuelve a la que ya tenía
            setArchivoBorrador(null);
            setVistaPrevia(null);
        } else {
            setQuitarFoto(true);
        }
    };

    const guardarPerfil = async (event) => {
        event.preventDefault();

        const nombre = nombreBorrador.trim();
        if (!nombre) {
            setErrorEdicion("El nombre no puede estar vacío.");
            return;
        }
        if (nombre.length > LARGO_MAXIMO_NOMBRE) {
            setErrorEdicion(`El nombre puede tener hasta ${LARGO_MAXIMO_NOMBRE} caracteres.`);
            return;
        }

        setGuardandoPerfil(true);
        setErrorEdicion("");
        try {
            await guardarPerfilBasico({
                nombre,
                archivo: archivoBorrador,
                quitarFoto,
                fotoActualUrl: perfil?.fotoUrl ?? null,
            });
            await recargarPerfil(); // actualiza también la cabecera
            setModalEdicionAbierto(false);
        } catch (error) {
            setErrorEdicion(error.message);
        } finally {
            setGuardandoPerfil(false);
        }
    };

    const fotoMostrada =
        vistaPrevia || (quitarFoto ? null : perfil?.fotoUrl) || iconPerfil;
    const hayFotoPropia = Boolean(vistaPrevia || (perfil?.fotoUrl && !quitarFoto));

    /* =========================
            CONTACTO
    ========================= */

    const abrirEdicionContacto = () => {
        setTelefonoBorrador(perfil?.telefono ?? "");
        setErrorTelefono("");
        setErrorGuardadoContacto("");
        setContactoGuardado(false);
        setEditandoContacto(true);
    };

    const cancelarEdicionContacto = () => {
        setErrorTelefono("");
        setErrorGuardadoContacto("");
        setEditandoContacto(false);
    };

    const guardarContacto = async (event) => {
        event.preventDefault();

        const mensaje = validarTelefono(telefonoBorrador);
        setErrorTelefono(mensaje);
        if (mensaje) return;

        setGuardandoTelefono(true);
        setErrorGuardadoContacto("");
        try {
            await guardarTelefono(telefonoBorrador);
            await recargarPerfil();
            setEditandoContacto(false);
            setContactoGuardado(true);
        } catch (error) {
            setErrorGuardadoContacto(error.message);
        } finally {
            setGuardandoTelefono(false);
        }
    };

    /* =========================
        CAMBIAR CONTRASEÑA
    ========================= */

    const abrirCambioContrasena = () => {
        setContrasenaActual("");
        setContrasenaNueva("");
        setContrasenaRepetida("");
        setErrorContrasena("");
        setContrasenaCambiada(false);
        setModalContrasenaAbierto(true);
    };

    const guardarContrasena = async (event) => {
        event.preventDefault();

        if (!contrasenaActual) {
            setErrorContrasena("Ingresá tu contraseña actual.");
            return;
        }
        if (contrasenaNueva.length < LARGO_MINIMO_CONTRASENA) {
            setErrorContrasena(`La nueva contraseña debe tener al menos ${LARGO_MINIMO_CONTRASENA} caracteres.`);
            return;
        }
        if (contrasenaNueva === contrasenaActual) {
            setErrorContrasena("La nueva contraseña tiene que ser distinta de la actual.");
            return;
        }
        if (contrasenaNueva !== contrasenaRepetida) {
            setErrorContrasena("Las contraseñas nuevas no coinciden.");
            return;
        }

        setGuardandoContrasena(true);
        setErrorContrasena("");
        try {
            await cambiarContrasena(contrasenaActual, contrasenaNueva);
            setModalContrasenaAbierto(false);
            setContrasenaCambiada(true);
        } catch (error) {
            setErrorContrasena(error.message);
        } finally {
            setGuardandoContrasena(false);
        }
    };

    /* =========================
            PANTALLA
    ========================= */

    if (cargando && !perfil) {
        return (
            <main className="perfil">
                <p className="texto-ayuda" role="status">Cargando tu perfil...</p>
            </main>
        );
    }

    if (!perfil) {
        return (
            <main className="perfil">
                <p className="contacto-error" role="alert">
                    {errorPerfil
                        ? "No pudimos cargar tu perfil. Probá recargar la página."
                        : "Iniciá sesión para ver tu perfil."}
                </p>
            </main>
        );
    }

    const { unidad, edificio } = perfil;

    // Avisos en vivo mientras se escribe la nueva contraseña
    const nuevaMuyCorta = contrasenaNueva.length > 0 && contrasenaNueva.length < LARGO_MINIMO_CONTRASENA;
    const repetidaNoCoincide = contrasenaRepetida.length > 0 && contrasenaRepetida !== contrasenaNueva;
    const repetidaCoincide = contrasenaRepetida.length > 0 && contrasenaRepetida === contrasenaNueva;

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
                            <img src={perfil.fotoUrl || iconPerfil} alt="Imagen de perfil"/>
                        </div>

                        <div className="residente-datos">
                            <h3>{perfil.nombre}</h3>
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

                        {unidad ? (
                            <div className="unidad-datos">
                                <div>
                                    <span>Edificio</span>
                                    <strong>{edificio?.nombre ?? "—"}</strong>
                                </div>

                                <div>
                                    <span>Unidad</span>
                                    <strong>{unidad.numero}</strong>
                                </div>

                                <div>
                                    <span>Piso</span>
                                    <strong>{unidad.piso ?? "—"}</strong>
                                </div>

                                <div>
                                    <span>Dirección</span>
                                    <strong>{edificio?.direccion ?? "—"}</strong>
                                </div>

                                <div>
                                    <span>Estado</span>
                                    <small className="badge-residente">
                                        {ETIQUETA_ROL[perfil.rol] ?? perfil.rol ?? "—"}
                                    </small>
                                </div>
                            </div>
                        ) : (
                            <p className="texto-ayuda">
                                Todavía no tenés una unidad vinculada. Pedile a tu administración que te asigne una.
                            </p>
                        )}
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
                                <span>Email</span>
                                <strong>{perfil.email}</strong>
                            </div>

                            <div className="campo-perfil">
                                <label htmlFor="contacto-telefono">Teléfono</label>
                                <div className="contacto-campo">
                                    <input
                                        id="contacto-telefono"
                                        type="tel"
                                        autoComplete="tel"
                                        value={telefonoBorrador}
                                        aria-invalid={Boolean(errorTelefono)}
                                        aria-describedby={errorTelefono ? "error-contacto-telefono" : undefined}
                                        onChange={(event) => {
                                            setTelefonoBorrador(event.target.value);
                                            setErrorTelefono("");
                                        }}
                                    />
                                    {errorTelefono && (
                                        <small id="error-contacto-telefono" className="contacto-error" role="alert">
                                            {errorTelefono}
                                        </small>
                                    )}
                                </div>
                            </div>

                            {errorGuardadoContacto && (
                                <small className="contacto-error" role="alert">{errorGuardadoContacto}</small>
                            )}

                            <div className="contacto-acciones">
                                <button
                                    className="contacto-cancelar"
                                    type="button"
                                    disabled={guardandoTelefono}
                                    onClick={cancelarEdicionContacto}
                                >
                                    Cancelar
                                </button>
                                <button className="btn-editar" type="submit" disabled={guardandoTelefono}>
                                    {guardandoTelefono ? "Guardando..." : "Guardar cambios"}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <>
                            <div className="contacto-form">
                                <div className="campo-perfil">
                                    <span>Email</span>
                                    <strong>{perfil.email}</strong>
                                </div>
                                <div className="campo-perfil">
                                    <span>Teléfono</span>
                                    <strong>{perfil.telefono || "No especificado"}</strong>
                                </div>
                            </div>
                            {contactoGuardado ? (
                                <p className="contacto-exito" role="status">Los datos de contacto se guardaron correctamente.</p>
                            ) : (
                                <p className="texto-ayuda">
                                    Tu email es el que usás para iniciar sesión, por eso no se puede modificar acá.
                                    Estos datos se utilizarán para comunicarnos con vos.
                                </p>
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

                            {contrasenaCambiada && (
                                <p className="contacto-exito" role="status">
                                    Tu contraseña se actualizó correctamente.
                                </p>
                            )}

                            <button className="btn-seguridad" onClick={abrirCambioContrasena}>
                                Cambiar contraseña
                            </button>
                        </div>
                    </div>
                </Panel>

            </section>

            {/* =========================
                MODAL EDITAR PERFIL
            ========================= */}

            {modalEdicionAbierto && (
                <div
                    className="perfil-modal-fondo"
                    onClick={() => !guardandoPerfil && setModalEdicionAbierto(false)}
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
                                disabled={guardandoPerfil}
                                onClick={() => setModalEdicionAbierto(false)}
                            >
                                <X />
                            </button>
                        </div>

                        <form onSubmit={guardarPerfil}>
                            <div className="perfil-modal-foto">
                                <img
                                    src={fotoMostrada}
                                    alt="Vista previa de la foto de perfil"
                                />

                                <input
                                    id="foto-perfil-input"
                                    ref={inputFotoRef}
                                    className="perfil-archivo-oculto"
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp"
                                    onChange={seleccionarFoto}
                                />

                                <div className="perfil-foto-acciones">
                                    <button
                                        type="button"
                                        className="btn-editar"
                                        onClick={() => inputFotoRef.current?.click()}
                                    >
                                        <ImagePlus />
                                        {hayFotoPropia ? "Cambiar foto" : "Elegir foto"}
                                    </button>

                                    {hayFotoPropia && (
                                        <button
                                            type="button"
                                            className="perfil-modal-cancelar"
                                            onClick={quitarFotoSeleccionada}
                                        >
                                            Quitar
                                        </button>
                                    )}
                                </div>

                                <small className="perfil-foto-ayuda">
                                    {archivoBorrador
                                        ? archivoBorrador.name
                                        : "JPG, PNG o WebP · máximo 2 MB"}
                                </small>
                            </div>

                            <div className="campo-perfil perfil-modal-nombre">
                                <label htmlFor="nombre-perfil-input">Nombre de usuario</label>
                                <input
                                    id="nombre-perfil-input"
                                    type="text"
                                    value={nombreBorrador}
                                    maxLength={LARGO_MAXIMO_NOMBRE}
                                    onChange={(event) => {
                                        setNombreBorrador(event.target.value);
                                        setErrorEdicion("");
                                    }}
                                    required
                                />
                            </div>

                            {errorEdicion && (
                                <span className="perfil-modal-error" role="alert">
                                    {errorEdicion}
                                </span>
                            )}

                            <div className="perfil-modal-acciones">
                                <button
                                    className="perfil-modal-cancelar"
                                    type="button"
                                    disabled={guardandoPerfil}
                                    onClick={() => setModalEdicionAbierto(false)}
                                >
                                    Cancelar
                                </button>
                                <button className="btn-editar" type="submit" disabled={guardandoPerfil}>
                                    {guardandoPerfil ? "Guardando..." : "Guardar cambios"}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            )}

            {/* =========================
              MODAL CAMBIAR CONTRASEÑA
            ========================= */}

            {modalContrasenaAbierto && (
                <div
                    className="perfil-modal-fondo"
                    onClick={() => !guardandoContrasena && setModalContrasenaAbierto(false)}
                >
                    <section
                        className="perfil-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="contrasena-modal-titulo"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="perfil-modal-header">
                            <h2 id="contrasena-modal-titulo">Cambiar contraseña</h2>
                            <button
                                className="perfil-modal-cerrar"
                                type="button"
                                aria-label="Cerrar"
                                disabled={guardandoContrasena}
                                onClick={() => setModalContrasenaAbierto(false)}
                            >
                                <X />
                            </button>
                        </div>

                        <form onSubmit={guardarContrasena} noValidate>
                            <CampoContrasena
                                id="contrasena-actual"
                                etiqueta="Contraseña actual"
                                autoComplete="current-password"
                                valor={contrasenaActual}
                                onChange={(event) => {
                                    setContrasenaActual(event.target.value);
                                    setErrorContrasena("");
                                }}
                            />

                            <CampoContrasena
                                id="contrasena-nueva"
                                etiqueta="Nueva contraseña"
                                autoComplete="new-password"
                                valor={contrasenaNueva}
                                invalido={nuevaMuyCorta}
                                onChange={(event) => {
                                    setContrasenaNueva(event.target.value);
                                    setErrorContrasena("");
                                }}
                                ayuda={
                                    <small className={nuevaMuyCorta ? "contacto-error" : "perfil-foto-ayuda"}>
                                        Mínimo {LARGO_MINIMO_CONTRASENA} caracteres.
                                    </small>
                                }
                            />

                            <CampoContrasena
                                id="contrasena-repetida"
                                etiqueta="Repetir nueva contraseña"
                                autoComplete="new-password"
                                valor={contrasenaRepetida}
                                invalido={repetidaNoCoincide}
                                onChange={(event) => {
                                    setContrasenaRepetida(event.target.value);
                                    setErrorContrasena("");
                                }}
                                ayuda={
                                    repetidaNoCoincide ? (
                                        <small className="contacto-error" role="alert">
                                            Las contraseñas no coinciden.
                                        </small>
                                    ) : repetidaCoincide ? (
                                        <small className="contacto-exito" role="status">
                                            Las contraseñas coinciden.
                                        </small>
                                    ) : null
                                }
                            />

                            {errorContrasena && (
                                <span className="perfil-modal-error" role="alert">
                                    {errorContrasena}
                                </span>
                            )}

                            <div className="perfil-modal-acciones">
                                <button
                                    className="perfil-modal-cancelar"
                                    type="button"
                                    disabled={guardandoContrasena}
                                    onClick={() => setModalContrasenaAbierto(false)}
                                >
                                    Cancelar
                                </button>
                                <button className="btn-editar" type="submit" disabled={guardandoContrasena}>
                                    {guardandoContrasena ? "Guardando..." : "Cambiar contraseña"}
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
