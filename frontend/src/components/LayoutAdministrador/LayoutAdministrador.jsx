import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Layoutadministrador.css";

import iconPerfil from "../../assets/img/foto-perfil.png";
import iconLogo from "../../assets/img/icon.png";
import { supabase } from "../../supabase";

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
];

function LayoutAdministrador({ children }) {
    const [sidebarAbierto, setSidebarAbierto] = useState(true);
    const [menuAbierto, setMenuAbierto] = useState(false);

    const [cuenta, setCuenta] = useState({ nombre: "", fotoUrl: null });

    const location = useLocation();
    const infoHeader = informacionHeader[location.pathname];

    // Nombre y foto del administrador (y se actualizan cuando los cambia en Configuración)
    useEffect(() => {
        let activo = true;
        async function cargarCuenta() {
            const { data: sesion } = await supabase.auth.getSession();
            const id = sesion?.session?.user?.id;
            if (!id) return;
            const { data } = await supabase.from("usuario").select("nombre, foto_url").eq("id", id).maybeSingle();
            if (activo && data) setCuenta({ nombre: data.nombre ?? "", fotoUrl: data.foto_url ?? null });
        }
        cargarCuenta();
        const alActualizar = (evento) => setCuenta((c) => ({ ...c, nombre: evento.detail?.nombre ?? c.nombre }));
        window.addEventListener("habita:cuenta-actualizada", alActualizar);
        return () => {
            activo = false;
            window.removeEventListener("habita:cuenta-actualizada", alActualizar);
        };
    }, []);

    const primerNombre = cuenta.nombre.trim().split(" ")[0];
    const tituloHeader = location.pathname === "/administrador/inicio" && primerNombre
        ? `Bienvenido, ${primerNombre}`
        : infoHeader?.titulo;

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
                        <h1>{tituloHeader}</h1>
                        <p>{infoHeader?.descripcion}</p>
                    </div>

                    <div className="header-usuario">

                        <div className="header-notificaciones">
                            <Bell />
                        </div>

                        <img
                            src={cuenta.fotoUrl || iconPerfil}
                            alt="Imagen de perfil"
                        />

                        <div
                            className="menu-usuario"
                            onClick={() => setMenuAbierto(!menuAbierto)}
                        >
                            <div className="menu-admin-usuario-texto">
                                <strong>{cuenta.nombre || "Administrador"}</strong>
                                <span>Admin</span>
                            </div>

                            <ChevronDown />

                            {menuAbierto && (
                                <div className="menu-perfil">
                                    <Link to="/administrador/configuracion">
                                        Configuración
                                    </Link>

                                    <Link to="/login">
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