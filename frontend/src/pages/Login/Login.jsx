import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

import logo from "../../assets/img/icon.png";
import {Users, ShieldUser, FileText, ChartNoAxesColumnIncreasing, LockKeyhole, Mail, Eye, EyeOff } from "lucide-react";

function Login() {
    
    useEffect(() => {
        document.title = "Habita | Iniciar sesión";
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
        const formData = new FormData(form);
        const email = formData.get('email');
        const password = formData.get('password');

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            const res = await fetch(`${apiUrl.replace(/\/$/, '')}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const body = await res.json().catch(() => ({}));
            if (!res.ok) {
                setError(body.detail || body.msg || 'Error en el login');
                setLoading(false);
                return;
            }

            // store token (simple approach)
            if (body.access_token) {
                localStorage.setItem('access_token', body.access_token);
            }

            setLoading(false);
            // redirect to home or dashboard
            navigate('/');
        } catch (err) {
            setError('Error de red');
            setLoading(false);
        }
    };

    return (
        <div className="login">
            <main className="contenedor">

                {/* =========================
                        PANEL IZQUIERDO
                ========================== */}

                <section className="panel-izquierdo">

                    <div className="contenido-izquierdo">

                        {/* -------- Marca -------- */}
                        <header className="encabezado">

                            <Link to="/inicio" className="marca" aria-label="Habita - Inicio">
                                <img src={logo} alt="Logo de Habita" />
                                <h1>Habita</h1>
                            </Link>

                            <p>
                                Gestión inteligente para consorcios y edificios.
                            </p>

                        </header>


                        {/* -------- Bienvenida -------- */}
                        <section className="bienvenida">

                            <h1>Bienvenido de nuevo</h1>

                            <p>
                                Ingresa a tu cuenta para continuar gestionando
                                tu comunidad de manera simple y eficiente.
                            </p>

                        </section>


                        {/* -------- Características -------- */}
                        <section className="caracteristicas">

                            <article className="caracteristica">

                                <div className="icono-caracteristica">
                                    <Users />
                                </div>

                                <div className="texto-caracteristica">

                                    <h2>Comunicación</h2>

                                    <p>
                                        Avisos, notificaciones y mensajes
                                        para toda la comunidad.
                                    </p>

                                </div>

                            </article>


                            <article className="caracteristica">

                                <div className="icono-caracteristica">
                                    <FileText />
                                </div>

                                <div className="texto-caracteristica">

                                    <h2>Gestión</h2>

                                    <p>
                                        Administrá reservas, expensas,
                                        documentos y más.
                                    </p>

                                </div>

                            </article>


                            <article className="caracteristica">

                                <div className="icono-caracteristica">
                                    <ChartNoAxesColumnIncreasing />
                                </div>

                                <div className="texto-caracteristica">
                                    <h2>Transparencia</h2>
                                    <p>Información clara y accesible en todo momento.</p>
                                </div>

                            </article>

                        </section>


                        {/* -------- Badge -------- */}
                        <div className="badge">
                            <ShieldUser />
                            <span>
                                Acceso para{" "}
                                <strong>Residente y Administrador</strong>
                            </span>

                        </div>

                    </div>

                </section>


                {/* =========================
                        PANEL DERECHO
                ========================== */}

                <section className="panel-derecho">

                    <div className="formulario">

                        {/* -------- Icono -------- */}
                        <div className="icono-login">
                            <LockKeyhole />
                        </div>


                        {/* -------- Encabezado -------- */}
                        <div className="encabezado-formulario">
                            <h2>Iniciar sesión</h2>
                            <p>Accedé a tu cuenta de Habita.</p>
                        </div>


                        {/* -------- Formulario -------- */}
                        <form onSubmit={manejarSubmit}>

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
                                        placeholder="••••••••"
                                        autoComplete="current-password"
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


                            {/* -------- Recordarme -------- */}
                            <div className="opciones-formulario">

                                <label className="checkbox">

                                    <input type="checkbox" id="recordarme" name="recordarme"/>

                                    <span>
                                        Recordarme en este dispositivo
                                    </span>

                                </label>

                            </div>


                            {/* -------- Botón ingresar -------- */}
                            <button type="submit" className="boton-ingresar" disabled={loading}>
                                {loading ? 'Ingresando...' : 'Iniciar sesión'}
                            </button>

                            {error && <p style={{ color: 'var(--texto-verde)', marginTop: 12 }}>{error}</p>}

                        </form>


                        {/* -------- Registro -------- */}
                        <div className="registro">

                            <a href="#" className="link">
                                ¿Olvidaste tu contraseña?
                            </a>

                            <div className="separador">
                                <p>──────── o ────────</p>
                            </div>

                            <div className="crear-cuenta">
                                <span>¿No tenés una cuenta? </span>
                                <Link to="/register">Crear cuenta</Link>
                            </div>

                        </div>

                    </div>

                </section>

            </main>
        </div>
    );
}

export default Login;