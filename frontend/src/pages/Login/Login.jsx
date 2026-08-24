import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Login.css";

import logo from "../../assets/img/icon.png";
import {Users, ShieldUser, FileText, ChartNoAxesColumnIncreasing, LockKeyhole, Mail, Eye, EyeOff } from "lucide-react";

function Login() {
    
    useEffect(() => {
        document.title = "Habita | Iniciar sesión";
    }, []);

    const [mostrarContrasena, setMostrarContrasena] = useState(false);

    const manejarSubmit = (e) => {
        e.preventDefault();
        console.log("Formulario enviado");
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

                            <a href="/" className="marca" aria-label="Habita - Inicio">

                                <img src={logo} alt="Logo de Habita"/>
                                <h1>Habita</h1>

                            </a>

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
                            <button type="submit" className="boton-ingresar">
                                Iniciar sesión
                            </button>

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