import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Register.css";

import logo from "../../assets/img/icon.png";
import {User, UserRoundPlus, IdCard, Phone, LockKeyhole, Mail, Eye, EyeOff } from "lucide-react";

function Register() {
    
    useEffect(() => {
        document.title = "Habita | Crear cuenta";
    }, []);

    const [mostrarContrasena, setMostrarContrasena] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const manejarSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        const form = e.currentTarget;
        const fd = new FormData(form);
        const username = fd.get('username');
        const dni = fd.get('dni');
        const telefono = fd.get('telefono');
        const email = fd.get('email');
        const password = fd.get('password');
        const confirm = fd.get('confirm-password');

        if (password !== confirm) {
            setError('Las contraseñas no coinciden');
            setLoading(false);
            return;
        }

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            const res = await fetch(`${apiUrl.replace(/\/$/, '')}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, user_metadata: { nombre: username, dni, telefono } }),
            });

            const body = await res.json().catch(() => ({}));
            if (!res.ok) {
                setError(body.detail || body.msg || 'Error en el registro');
                setLoading(false);
                return;
            }

            setLoading(false);
            // redirect to login
            navigate('/');
        } catch (err) {
            setError('Error de red');
            setLoading(false);
        }
    };

    return (
        <div className="register">
            <main className="contenedor">

                {/* =========================
                        PANEL IZQUIERDO
                ========================== */}

                <section className="panel-izquierdo">

                    <div className="contenido-izquierdo">

                        {/* -------- Marca -------- */}
                        <header className="encabezado">

                            <a href="/" className="marca" aria-label="Habita - Inicio">

                                <img src={logo} alt="Logo de Habita"/>
                                <h1>Habita</h1>

                            </a>

                            <p>
                                Gestión inteligente para consorcios y edificios.
                            </p>

                        </header>


                        {/* -------- Bienvenida comunidad -------- */}
                        <section className="bienvenida-comunidad">

                            <h1>Unite a tu comunidad</h1>

                            <p>
                                Creá tu cuenta y comenzá a formar parte de una comunidad más organizada, conectada y eficiente.
                            </p>

                        </section>


                        {/* -------- Mensaje inicial -------- */}
                        <section className="mensaje-inicial">
                            <span className="icono-mensaje" aria-hidden="true">
                                <Mail />
                            </span>
                            <p>
                                Después de crear tu cuenta, podrás unirte a tu edificio con un {" "} <strong>código de invitación</strong> que te proporcionará la administración.
                            </p>
                        </section>

                    </div>

                </section>


                {/* =========================
                        PANEL DERECHO
                ========================== */}

                <section className="panel-derecho">

                    <div className="formulario">

                        {/* -------- Icono -------- */}
                        <div className="icono-register">
                            <UserRoundPlus />
                        </div>


                        {/* -------- Encabezado -------- */}
                        <div className="encabezado-formulario">
                            <h2>Crear cuenta</h2>
                            <p>Completá tus datos para comenzar.</p>
                        </div>


                        {/* -------- Formulario -------- */}
                        <form onSubmit={manejarSubmit}>
                            
                            {/* -------- Nombre completo -------- */}
                            <div className="campo">

                                <label htmlFor="username">
                                    Nombre completo
                                </label>

                                <div className="input-contenedor" >

                                    <span className="input-icono" aria-hidden="true">
                                        <User />
                                    </span>

                                    <input
                                        type="text"
                                        id="username"
                                        name="username"
                                        placeholder="Tu nombre y apellido"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="campos-telefono-dni">
                                <div className="campo">
                                    {/* -------- DNI -------- */}
                                    
                                    <label htmlFor="dni">
                                        DNI
                                    </label>

                                    <div className="input-contenedor" >
                                        <span className="input-icono" aria-hidden="true">
                                            <IdCard />
                                        </span>
                                        <input 
                                        type="text" 
                                        id="dni" 
                                        name="dni" 
                                        placeholder="Ej: 12345678"
                                        required 
                                        />
                                    </div>
                                    
                                </div>

                                <div className="campo">
                                    {/* -------- Telefono -------- */}
                                    
                                    <label htmlFor="telefono">
                                        Teléfono
                                    </label>
                                    
                                    <div className="input-contenedor" >
                                        <span className="input-icono" aria-hidden="true">
                                            <Phone />
                                        </span>
                                        <input 
                                        type="tel" 
                                        id="telefono" 
                                        name="telefono" 
                                        placeholder="Ej: 11 1234-5678" 
                                        required
                                        />
                                    </div>
                                    
                                </div>
                            </div>

                            {/* -------- Email -------- */}
                            <div className="campo">

                                <label htmlFor="email">
                                    Correo electrónico
                                </label>

                                <div className="input-contenedor" >

                                    <span className="input-icono" aria-hidden="true">
                                        <Mail />
                                    </span>

                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        placeholder="ejemplo@correo.com"
                                        autoComplete="email"
                                        required
                                    />

                                </div>

                            </div>

                            {/* -------- Contraseña -------- */}

                            <div className="campo">

                                <label htmlFor="password">
                                    Contraseña
                                </label>

                                <div className="input-contenedor">

                                    <span className="input-icono" aria-hidden="true">
                                        <LockKeyhole />
                                    </span>

                                    <input
                                        type={
                                            mostrarContrasena
                                                ? "text"
                                                : "password"
                                        }
                                        id="password"
                                        name="password"
                                        placeholder="Mínimo 8 carácteres"
                                        autoComplete="new-password"
                                        required
                                    />

                                    <button
                                        type="button"
                                        className="mostrar-password"
                                        aria-label={
                                            mostrarContrasena
                                                ? "Ocultar contraseña"
                                                : "Mostrar contraseña"
                                        }
                                        onClick={() =>
                                            setMostrarContrasena(!mostrarContrasena)
                                        }
                                    >
                                        {mostrarContrasena ? <EyeOff /> : <Eye />}
                                    </button>

                                </div>

                            </div>

                            {/* -------- Confirmar contraseña -------- */}

                            <div className="campo">

                                <label htmlFor="confirm-password">
                                    Confirmar contraseña
                                </label>

                                <div className="input-contenedor">

                                    <span className="input-icono" aria-hidden="true">
                                        <LockKeyhole />
                                    </span>

                                    <input
                                        type={mostrarContrasena ? "text" : "password"}
                                        id="confirm-password"
                                        name="confirm-password"
                                        placeholder="Repetir contraseña"
                                        autoComplete="new-password"
                                        required
                                    />

                                    <button
                                        type="button"
                                        className="mostrar-password"
                                        aria-label={
                                            mostrarContrasena
                                                ? "Ocultar contraseña"
                                                : "Mostrar contraseña"
                                        }
                                        onClick={() =>
                                            setMostrarContrasena(!mostrarContrasena)
                                        }
                                    >
                                        {mostrarContrasena ? <EyeOff /> : <Eye />}
                                    </button>

                                </div>
                            
                            </div>


                            {/* -------- Terminos y condiciones -------- */}
                            <div className="opciones-formulario">

                                <label className="checkbox">

                                    <input type="checkbox" id="terminos-y-condiciones" name="terminos-y-condiciones"/>

                                    <span>
                                        Acepto los {" "} <strong>Términos y Condiciones</strong> y la {" "} <strong>Política de Privacidad</strong>
                                    </span>

                                </label>

                            </div>


                            {/* -------- Botón ingresar -------- */}
                            <button type="submit" className="boton-ingresar" disabled={loading}>
                                {loading ? 'Creando...' : 'Crear cuenta'}
                            </button>

                            {error && <p style={{ color: 'var(--texto-verde)', marginTop: 12 }}>{error}</p>}

                        </form>


                        {/* -------- acceso -------- */}
                        <div className="acceso">

                            <div className="separador">
                                <p>──────── o ────────</p>
                            </div>

                            <div className="iniciar-sesion">
                                <span>¿Ya tenés una cuenta? </span>
                                <Link to="/">Iniciar sesión</Link>
                            </div>

                        </div>

                    </div>

                </section>

            </main>
        </div>
    );
}

export default Register;