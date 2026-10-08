import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Layout.css";
import iconPerfil from "../../assets/img/foto-perfil.png";
import iconLogo from "../../assets/img/icon.png";

import { ChevronDown, Menu, Bell, House, Wallet, Calendar, Megaphone, Folder, MessageCircleMore } from "lucide-react";
import ChatWidget from "./ChatWidget/ChatWidget";

function Layout({ children }) {
    const [sidebarAbierto, setSidebarAbierto] = useState(true);
    const [menuAbierto, setMenuAbierto] = useState(false);

    // Estado del Chat Flotante
    const [chatAbierto, setChatAbierto] = useState(false);
    const [mensajes, setMensajes] = useState([
        { id: 1, emisor: "bot", texto: "¡Hola! Soy tu asistente Habita 🤖. ¿En qué te puedo ayudar hoy?" }
    ]);
    const [inputTexto, setInputTexto] = useState("");

    const enviarMensaje = (e) => {
        e.preventDefault();
        if (!inputTexto.trim()) return;

        const nuevoMensajeUsr = { id: Date.now(), emisor: "usr", texto: inputTexto };
        setMensajes((prev) => [...prev, nuevoMensajeUsr]);
        setInputTexto("");

        setTimeout(() => {
            const respuestaBot = {
                id: Date.now() + 1,
                emisor: "bot",
                texto: "Entendido, estoy procesando tu consulta..."
            };
            setMensajes((prev) => [...prev, respuestaBot]);
        }, 800);
    };

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

                        <img src={iconPerfil} alt="Imagen de perfil" />

                        <div
                            className="menu-usuario"
                            onClick={() => setMenuAbierto(!menuAbierto)}
                        >
                            <ChevronDown />

                            {menuAbierto && (
                                <div className="menu-perfil">
                                    <Link to="/miPerfil">Mi perfil</Link>
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
                                <li>
                                    <Link to="/mensajes">
                                        <MessageCircleMore />
                                        <span>Mensajes</span>
                                    </Link>
                                </li>
                            </ul>
                        </nav>
                    </aside>

                    {/* ----- CONTENIDO DE CADA PÁGINA ----- */}
                    <main id="contenido-main">
                        {/* Se clona el elemento hijo pasando onAbrirChat de forma segura con React.cloneElement */}
                        {React.isValidElement(children)
                            ? React.cloneElement(children, { onAbrirChat: () => setChatAbierto(true) })
                            : children}
                    </main>
                </div>
            </div>

            {/* ----- VENTANA DEL CHAT FLOTANTE ----- */}
            <ChatWidget
                flotante={true}
                abierto={chatAbierto}
                onCerrar={() => setChatAbierto(false)}
                mensajes={mensajes}
                inputTexto={inputTexto}
                setInputTexto={setInputTexto}
                onEnviarMensaje={enviarMensaje}
            />
        </div>
    );
}

export default Layout;