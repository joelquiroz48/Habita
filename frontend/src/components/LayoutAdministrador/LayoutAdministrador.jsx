import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./LayoutAdministrador.css";

import iconPerfil from "../../assets/img/foto-perfil.png";
import iconLogo from "../../assets/img/icon.png";

import {
    ChevronDown,
    Menu,
    Bell,
    LayoutDashboard,
    Users,
    Building2,
    FileText,
    Wallet,
    BellRing,
    Megaphone,
    CalendarDays,
    Folder,
    BarChart3,
} from "lucide-react";

const informacionHeader = {
    "/administrador/inicio": {
        titulo: "Bienvenido, Administrador",
        descripcion: "Resumen general del consorcio",
    },
    "/administrador/residentes": {
        titulo: "Residentes",
        descripcion: "Gestioná los residentes del edificio",
    },
    "/administrador/unidades": {
        titulo: "Unidades",
        descripcion: "Gestioná las unidades del edificio",
    },
    "/administrador/expensas": {
        titulo: "Expensas",
        descripcion: "Creá y gestioná las expensas del consorcio",
    },
    "/administrador/pagos": {
        titulo: "Pagos",
        descripcion: "Consultá los pagos recibidos",
    },
    "/administrador/reclamos": {
        titulo: "Reclamos",
        descripcion: "Gestioná y actualizá el estado de los reclamos",
    },
    "/administrador/comunicados": {
        titulo: "Comunicados",
        descripcion: "Publicá avisos para los residentes",
    },
    "/administrador/reservas": {
        titulo: "Reservas",
        descripcion: "Gestioná las reservas de espacios comunes",
    },
    "/administrador/documentos": {
        titulo: "Documentos",
        descripcion: "Administrá los documentos del consorcio",
    },
    "/administrador/reportes": {
        titulo: "Reportes",
        descripcion: "Consultá estadísticas del consorcio",
    },
    "/administrador/configuracion": {
        titulo: "Configuración",
        descripcion: "Personalizá las opciones de tu cuenta",
    },
};

const itemsMenu = [
    {
        to: "/administrador/inicio",
        icon: LayoutDashboard,
        label: "Dashboard",
    },
    {
        to: "/administrador/residentes",
        icon: Users,
        label: "Residentes",
    },
    {
        to: "/administrador/unidades",
        icon: Building2,
        label: "Unidades",
    },
    {
        to: "/administrador/expensas",
        icon: FileText,
        label: "Expensas",
    },
    {
        to: "/administrador/pagos",
        icon: Wallet,
        label: "Pagos",
    },
    {
        to: "/administrador/reclamos",
        icon: BellRing,
        label: "Reclamos",
    },
    {
        to: "/administrador/comunicados",
        icon: Megaphone,
        label: "Comunicados",
    },
    {
        to: "/administrador/reservas",
        icon: CalendarDays,
        label: "Reservas",
    },
    {
        to: "/administrador/documentos",
        icon: Folder,
        label: "Documentos",
    },
    {
        to: "/administrador/reportes",
        icon: BarChart3,
        label: "Reportes",
    },
];

function LayoutAdministrador({ children }) {
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

                        <Link
                            to="/administrador/inicio"
                            className="logo-admin"
                        >
                            <img
                                src={iconLogo}
                                alt="Logo de Habita"
                            />

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
                            <div className="menu-admin-usuario-texto">
                                <strong>Administrador</strong>
                                <span>Admin</span>
                            </div>

                            <ChevronDown />

                            {menuAbierto && (
                                <div className="menu-perfil">
                                    <Link to="/administrador/configuracion">
                                        Configuración
                                    </Link>

                                    <Link to="/">
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

export default LayoutAdministrador;