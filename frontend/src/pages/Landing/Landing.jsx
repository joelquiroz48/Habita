import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, FileText, MessageCircle, Wallet, Wrench } from "lucide-react";
import logo from "../../assets/img/icon.png";
import "./Landing.css";

const pestanas = [
    {
        icono: Wallet,
        titulo: "Control de expensas y pagos",
        resumen: "Visualizá saldos, vencimientos y comprobantes al instante.",
        etiqueta: "Módulo financiero",
        encabezado: "Expensas al día y claras",
        texto: "Olvidate de los papeles sueltos. Consultá tus liquidaciones y abonalas de forma segura desde el celular.",
        detalle: "Vencimiento: día 10 de cada mes · Pago con Mercado Pago",
    },
    {
        icono: Wrench,
        titulo: "Gestión de reclamos",
        resumen: "Reportá incidencias y seguilas en tiempo real.",
        etiqueta: "Módulo de reclamos",
        encabezado: "Tus reportes, con estado real",
        texto: "Cada reclamo pasa por etapas claras: Pendiente, En proceso y Resuelto.",
        detalle: "Estado actual: En proceso · Asignado a mantenimiento",
    },
    {
        icono: CalendarDays,
        titulo: "Reservas de espacios",
        resumen: "Coordiná turnos de espacios comunes sin complicaciones.",
        etiqueta: "Espacios comunes",
        encabezado: "Reservas ágiles y sin cruces",
        texto: "Consultá la disponibilidad del SUM, la parrilla o el laundry de forma visual.",
        detalle: "Elegí día y horario, y listo",
    },
];

const destacados = [
    { icono: MessageCircle, titulo: "Comunidad conectada", texto: "Avisos y conversaciones" },
    { icono: Wallet, titulo: "Todo más claro", texto: "Expensas y pagos" },
    { icono: CalendarDays, titulo: "Espacios compartidos", texto: "Reservas de amenities" },
    { icono: FileText, titulo: "Edificio en orden", texto: "Documentos y gestiones" },
];

const problemas = [
    { titulo: "Información dispersa", texto: "WhatsApp, mails y papeles separados. En Habita todo queda unificado en un solo lugar." },
    { titulo: "Reclamos sin seguimiento", texto: "Un reclamo por chat se pierde. Con reclamos digitales sabés el estado real." },
    { titulo: "Pagos difíciles de rastrear", texto: "Comprobantes sueltos y poca claridad. Controlá el estado de tus expensas." },
];

function Landing() {
    const [activa, setActiva] = useState(0);
    const tab = pestanas[activa];

    useEffect(() => {
        document.title = "Habita | Vivir mejor en comunidad";

        const elementos = document.querySelectorAll(".landing-reveal");
        const sinMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        if (sinMovimiento || !("IntersectionObserver" in window)) {
            elementos.forEach((e) => e.classList.add("is-visible"));
            return;
        }

        const observer = new IntersectionObserver(
            (entradas) => {
                entradas.forEach((entrada) => {
                    if (entrada.isIntersecting) {
                        entrada.target.classList.add("is-visible");
                        observer.unobserve(entrada.target);
                    }
                });
            },
            { threshold: 0.14, rootMargin: "0px 0px -35px 0px" }
        );
        elementos.forEach((e) => observer.observe(e));
        return () => observer.disconnect();
    }, []);

    return (
        <div className="landing" id="inicio">
            <div className="landing-malla" aria-hidden="true" />
            <div className="landing-brillo" aria-hidden="true" />

            <nav className="landing-nav-barra" aria-label="Navegación principal">
                <a className="landing-marca" href="#inicio" aria-label="Habita, inicio">
                    <img src={logo} alt="" />
                    <span>Habita</span>
                </a>

                <div className="landing-nav-links">
                    <a href="#vistas">Vistazo</a>
                    <a href="#problematicas">Problemáticas</a>
                </div>

                <div className="landing-nav-acciones">
                    <Link className="landing-texto-link" to="/login">Iniciar sesión</Link>
                    <Link className="landing-pildora" to="/register">Crear cuenta</Link>
                </div>
            </nav>

            <header className="landing-hero">
                <div className="landing-hero-texto landing-reveal">
                    <div className="landing-insignia">
                        <span className="landing-insignia-punto" /> TU EDIFICIO, MÁS CERCA
                    </div>

                    <h1>
                        Vivir en comunidad <br />
                        <em>puede ser más simple.</em>
                    </h1>

                    <p>
                        Habita es la plataforma para la gestión de consorcios y edificios.
                        Unifica expensas, reclamos y avisos en un solo lugar.
                    </p>

                    <div className="landing-hero-botones">
                        <Link className="landing-boton landing-boton-principal" to="/register">
                            Crear cuenta <ArrowRight size={18} aria-hidden="true" />
                        </Link>
                        <Link className="landing-boton landing-boton-secundario" to="/login">
                            Iniciar sesión
                        </Link>
                    </div>

                    <p className="landing-hero-nota">Para residentes y administraciones</p>
                </div>

                <div className="landing-telefono-contenedor landing-reveal">
                    <div className="landing-telefono">
                        <div className="landing-pantalla">
                            <div className="landing-notch" />
                            <div className="landing-app-cabecera">
                                <span>Habita</span>
                                <span className="landing-app-online">● En línea</span>
                            </div>

                            <div className="landing-app-saldo">
                                <span>Expensas del mes</span>
                                <strong>$ 45.230</strong>
                                <span className="landing-app-estado">Estado: al día ✓</span>
                            </div>

                            <div className="landing-app-acciones">
                                <div>Reservar SUM</div>
                                <div>Ver avisos</div>
                                <div>Pagar expensas</div>
                                <div>Documentos</div>
                            </div>

                            <div className="landing-app-ticket">
                                <strong>Último reclamo</strong>
                                Fuga de agua en cochera (En proceso)
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <section className="landing-destacados landing-reveal" aria-label="Qué ofrece Habita">
                {destacados.map(({ icono: Icono, titulo, texto }) => (
                    <div className="landing-destacado" key={titulo}>
                        <Icono aria-hidden="true" />
                        <h3>{titulo}</h3>
                        <p>{texto}</p>
                    </div>
                ))}
            </section>

            <section className="landing-vistas" id="vistas">
                <div className="landing-vistas-contenedor">
                    <div className="landing-vistas-tabs">
                        <span className="landing-etiqueta">EN UN VISTAZO</span>
                        <h2>Explorá la app como si ya la estuvieras usando</h2>
                        <p>Tocá cada opción para descubrir cómo facilita el día a día en tu edificio.</p>

                        {pestanas.map(({ icono: Icono, titulo, resumen }, i) => (
                            <button
                                type="button"
                                key={titulo}
                                className={`landing-tab ${i === activa ? "activa" : ""}`}
                                onClick={() => setActiva(i)}
                                aria-pressed={i === activa}
                            >
                                <h3><Icono size={18} aria-hidden="true" /> {titulo}</h3>
                                <p>{resumen}</p>
                            </button>
                        ))}
                    </div>

                    <div className="landing-vista-caja" key={activa}>
                        <span className="landing-vista-etiqueta">{tab.etiqueta}</span>
                        <h3>{tab.encabezado}</h3>
                        <p>{tab.texto}</p>
                        <div className="landing-vista-detalle">{tab.detalle}</div>
                    </div>
                </div>
            </section>

            <section className="landing-problemas" id="problematicas">
                <div className="landing-problemas-contenedor">
                    <span className="landing-etiqueta">¿POR QUÉ NECESITÁS HABITA?</span>
                    <h2>Administrar el caos de mil canales distintos ya fue.</h2>
                    <p className="landing-problemas-sub">
                        Habita reemplaza los chats perdidos por un sistema centralizado y transparente.
                    </p>

                    <div className="landing-problemas-grilla">
                        {problemas.map(({ titulo, texto }) => (
                            <article className="landing-problema landing-reveal" key={titulo}>
                                <h3>{titulo}</h3>
                                <p>{texto}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <footer className="landing-pie">
                <div className="landing-pie-contenido">
                    <a className="landing-marca landing-marca-clara" href="#inicio" aria-label="Habita, inicio">
                        <img src={logo} alt="" />
                        <span>Habita</span>
                    </a>
                    <nav className="landing-pie-links" aria-label="Tu cuenta">
                        <Link to="/login">Iniciar sesión</Link>
                        <Link to="/register">Crear cuenta</Link>
                    </nav>
                </div>
                <div className="landing-pie-abajo">
                    <span>© {new Date().getFullYear()} Habita. Todos los derechos reservados.</span>
                    <a href="#inicio">Volver arriba ↑</a>
                </div>
            </footer>
        </div>
    );
}

export default Landing;