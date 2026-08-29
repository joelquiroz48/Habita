import { useState } from "react";
import { Link } from "react-router-dom";
import "./Layout.css";
import iconPerfil from "../../assets/img/foto-perfil.png";
import iconLogo from "../../assets/img/icon.png";

import {ChevronDown, Menu, Bell, House, Wallet, Calendar, Megaphone, Folder, MessageCircleMore } from "lucide-react";


function Layout({ children }) {

    const [sidebarAbierto, setSidebarAbierto] = useState(true);
    const [menuAbierto, setMenuAbierto] = useState(false);

    return (
        <div className="layout">

            <div className="layout-principal">

                {/* ----- HEADER ----- */}
                <header>

                    <div className="header-navegacion">

                        <button
                            className="boton-sidebar"
                            onClick={() => setSidebarAbierto(!sidebarAbierto)}
                            aria-label="Abrir menú"
                        >
                            <Menu />
                        </button>

                        <Link to="/inicio" className="logo">
                            <img src={iconLogo} alt="Logo de Habita" />
                            <h1>Habita</h1>
                        </Link>

                    </div>


                    <div className="header-info">
                        <h1>Bienvenido, usuario</h1>
                        <p>Resumen de tu comunidad</p>
                    </div>


                    <div className="header-usuario">

                        <div className="header-notificaciones">
                            <Bell />
                        </div>

                        <img src={iconPerfil} alt="Imagen de perfil"/>

                        <div
                            className="menu-usuario"
                            onClick={() => setMenuAbierto(!menuAbierto)}
                        >

                            <ChevronDown />

                            {menuAbierto && (
                                <div className="menu-perfil">
                                    
                                    <Link to="/perfil">Mi perfil</Link>
                                    <Link to="/configuracion">Configuración</Link>                                        
                                    <Link to="/cerrarSesion">Cerrar Sesión</Link>

                                </div>
                            )}

                        </div>

                    </div>

                </header>


                {/* ----- SIDEBAR + CONTENIDO ----- */}
                <div className="contenido-layout">

                    <aside className={`sidebar ${sidebarAbierto ? "mostrar" : ""}`}>
                        <nav className="sidebar-nav">
                            <ul>

                                <li>
                                    <Link to="/inicio">
                                        <House />
                                        <span>Inicio</span>
                                    </Link>
                                </li>

                                <li>
                                    <Link to="/expensas">
                                        <Wallet />
                                        <span>Mis expensas</span>
                                    </Link>
                                </li>

                                <li>
                                    <Link to="/reservas">
                                        <Calendar />
                                        <span>Reservas</span>
                                    </Link>
                                </li>

                                <li>
                                    <Link to="/avisos">
                                        <Megaphone />
                                        <span>Avisos</span>
                                    </Link>
                                </li>

                                <li>
                                    <Link to="/documentos">
                                        <Folder />
                                        <span>Documentos</span>
                                    </Link>
                                </li>

                            </ul>
                        </nav>
                    </aside>


                    {/* ----- CONTENIDO DE CADA PÁGINA ----- */}
                    <main id="contenido-main">
                        {children}
                    </main>

                </div>

            </div>

        </div>
    );
}

export default Layout;