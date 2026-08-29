import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Layout.css";
import iconPerfil from "../../assets/img/foto-perfil.png";
import iconLogo from "../../assets/img/icon.png";

import {ChevronDown, Menu, Bell, House, Wallet, Calendar, Megaphone, Folder, MessageCircleMore } from "lucide-react";

const informacionHeader = {
    "/inicio": {
        titulo: "Bienvenido, usuario",
        descripcion: "Resumen de tu comunidad",
    },
    "/expensas": {
        titulo: "Mis expensas",
        descripcion: "Consultá, pagá y descargá tus expensas",
    },
    "/reservas": {
        titulo: "Reservas",
        descripcion: "Reservá y gestioná los espacios comunes de tu comunidad",
    },
    "/avisos": {
        titulo: "Avisos",
        descripcion: "Mantenete informado sobre todo lo que sucede en tu comunidad",
    },
    "/documentos": {
        titulo: "Documentos",
        descripcion: "Accedé a los documentos importantes de tu consorcio",
    },
    "/perfil": {
        titulo: "Mi perfil",
        descripcion: "Consultá y actualizá tus datos personales",
    },
    "/configuracion": {
        titulo: "Configuración",
        descripcion: "Personalizá las opciones de tu cuenta",
    },
};

function Layout({ children }) {

    const [sidebarAbierto, setSidebarAbierto] = useState(true);
    const [menuAbierto, setMenuAbierto] = useState(false);

    const location = useLocation();

    const infoHeader = informacionHeader[location.pathname];

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
                        <h1>{infoHeader?.titulo}</h1>
                        <p>{infoHeader?.descripcion}</p>
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
                                    <Link to="/">Cerrar Sesión</Link>

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