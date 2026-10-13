import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Layout.css";

import iconPerfil from "../../assets/img/foto-perfil.png";
import iconLogo from "../../assets/img/icon.png";
import imagenEdificio from "../../assets/img/imagen-predeterminada.png";

import {
    ChevronDown,
    Menu,
    Bell,
    House,
    Wallet,
    Calendar,
    MessageSquareWarning,
    Megaphone,
    Folder,
} from "lucide-react";

const informacionHeader = {
    "/inicio": {
        titulo: "Bienvenido, Residente",
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
    "/reclamos": {
        titulo: "Reclamos",
        descripcion: "Reportá problemas y consultá el estado de tus reclamos",
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

const itemsMenu = [
    { to: "/inicio", icon: House, label: "Inicio" },
    { to: "/expensas", icon: Wallet, label: "Mis expensas" },
    { to: "/reservas", icon: Calendar, label: "Reservas" },
    { to: "/reclamos", icon: MessageSquareWarning, label: "Reclamos" },
    { to: "/avisos", icon: Megaphone, label: "Avisos" },
    { to: "/documentos", icon: Folder, label: "Documentos" },
];

const CHAT_SESSION_STORAGE_KEY = "habita-chat-messages";
const MENSAJE_INICIAL_CHAT = {
    id: 1,
    emisor: "bot",
    texto: "¡Hola! Soy tu asistente Habita 🤖. ¿En qué te puedo ayudar hoy?",
};

function cargarMensajesChat() {
    try {
        const mensajesGuardados = JSON.parse(
            sessionStorage.getItem(CHAT_SESSION_STORAGE_KEY) || "null"
        );
        if (Array.isArray(mensajesGuardados) && mensajesGuardados.length > 0) {
            return mensajesGuardados;
        }
    } catch {
        return [MENSAJE_INICIAL_CHAT];
    }

    return [MENSAJE_INICIAL_CHAT];
}

import ChatWidget from "./ChatWidget/ChatWidget";

function Layout({ children }) {
    const [sidebarAbierto, setSidebarAbierto] = useState(true);
    const [menuAbierto, setMenuAbierto] = useState(false);

    const location = useLocation();
    const infoHeader = informacionHeader[location.pathname];

    // Estado del Chat Flotante
    const [chatAbierto, setChatAbierto] = useState(false);
    const [cargandoRespuesta, setCargandoRespuesta] = useState(false);
    const [mensajes, setMensajes] = useState(cargarMensajesChat);
    const [inputTexto, setInputTexto] = useState("");

    useEffect(() => {
        sessionStorage.setItem(CHAT_SESSION_STORAGE_KEY, JSON.stringify(mensajes));
    }, [mensajes]);

    const enviarMensaje = async (e) => {
        e.preventDefault();
        const textoAEnviar = inputTexto.trim();
        if (!textoAEnviar || cargandoRespuesta) return;

        const nuevoMensajeUsr = { id: Date.now(), emisor: "usr", texto: textoAEnviar };
        setMensajes((prev) => [...prev, nuevoMensajeUsr]);
        setInputTexto("");
        setCargandoRespuesta(true);

        try {
            // Enviamos el historial previo formateado junto al nuevo mensaje
            const historialParaEnviar = mensajes
                .slice(1)
                .filter((m) => m.emisor === "usr" || m.emisor === "bot")
                .map((m) => ({ emisor: m.emisor, texto: m.texto }));

            const res = await fetch("http://localhost:3000/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    mensaje: textoAEnviar,
                    historial: historialParaEnviar,
                }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || "El asistente no pudo responder.");
            }

            const data = await res.json();
            const respuestaBot = {
                id: Date.now() + 1,
                emisor: "bot",
                texto: data.respuesta || "No pude obtener una respuesta en este momento.",
            };
            setMensajes((prev) => [...prev, respuestaBot]);
        } catch (error) {
            console.error("Error al comunicarse con el asistente Habita:", error);
            const mensajeError = {
                id: Date.now() + 1,
                emisor: "error",
                texto: error instanceof TypeError
                    ? "No pude conectarme con Habita. Verificá que el servidor esté en ejecución."
                    : error.message,
            };
            setMensajes((prev) => [...prev, mensajeError]);
        } finally {
            setCargandoRespuesta(false);
        }
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
                        <h1>{infoHeader?.titulo}</h1>
                        <p>{infoHeader?.descripcion}</p>
                    </div>

                    <div className="header-usuario">
                        <div className="header-notificaciones">
                            <Bell />
                        </div>

                        <img
                            src={iconPerfil}
                            alt="Imagen de perfil"
                        />

                        <div
                            className="menu-usuario"
                            onClick={() => setMenuAbierto(!menuAbierto)}
                        >
                            <div className="menu-usuario-texto">
                                <strong>Usuario_nombre</strong>
                                <span>Residente</span>
                            </div>

                            <ChevronDown />

                            {menuAbierto && (
                                <div className="menu-perfil">
                                    <Link to="/perfil">
                                        Mi perfil
                                    </Link>

                                    <Link to="/configuracion">
                                        Configuración
                                    </Link>
                                    
                                    <Link
                                        to="/login"
                                        onClick={() => sessionStorage.removeItem(CHAT_SESSION_STORAGE_KEY)}
                                    >
                                        Cerrar sesión
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* ----- SIDEBAR + CONTENIDO ----- */}
                <div className="contenido-layout">

                    <aside
                        className={`sidebar ${
                            sidebarAbierto ? "mostrar" : ""
                        }`}
                    >
                        <nav className="sidebar-nav">
                            <ul>

                                {itemsMenu.map((item) => {
                                    const Icono = item.icon;

                                    const activo =
                                        location.pathname === item.to;

                                    return (
                                        <li key={item.to}>
                                            <Link
                                                to={item.to}
                                                className={
                                                    activo ? "activo" : ""
                                                }
                                            >
                                                <Icono />
                                                <span>{item.label}</span>
                                            </Link>
                                        </li>
                                    );
                                })}

                            </ul>

                            {/* ----- INFORMACIÓN DEL EDIFICIO ----- */}
                            <div className="sidebar-edificio">
                                <img
                                    src={imagenEdificio}
                                    alt="Imagen del edificio"
                                />

                                <div className="sidebar-edificio-info">
                                    <strong>Torre Los Álamos</strong>
                                    <span>Av. Siempre Viva 742</span>
                                </div>
                            </div>
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
                cargando={cargandoRespuesta}
            />
        </div>
    );
}

export default Layout;