import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, Check, FileText, MessageCircle, Wallet } from "lucide-react";
import logo from "../../assets/img/icon.png";
import edificio from "../../assets/img/fondo-landing.png";
import Panel from "../../components/Panel/Panel";
import "./Landing.css";

const funcionalidades = [
    {
        icon: MessageCircle,
        titulo: "Una comunidad conectada",
        descripcion: "Avisos y conversaciones para que todos estén al tanto.",
    },
    {
        icon: Wallet,
        titulo: "Todo más claro",
        descripcion: "Expensas y pagos organizados, siempre a mano.",
    },
    {
        icon: CalendarDays,
        titulo: "Espacios compartidos",
        descripcion: "Reservá amenities y coordiná turnos sin complicaciones.",
    },
    {
        icon: FileText,
        titulo: "Tu edificio, en orden",
        descripcion: "Documentos, gestiones y novedades en un solo lugar.",
    },
];

function Landing() {
    useEffect(() => {
        document.title = "Habita | Vivir mejor en comunidad";

        const elementos = document.querySelectorAll(".landing-reveal");
        const prefersReducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        if (prefersReducedMotion || !("IntersectionObserver" in window)) {
            elementos.forEach((elemento) => elemento.classList.add("is-visible"));
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.14, rootMargin: "0px 0px -35px 0px" }
        );

        elementos.forEach((elemento) => observer.observe(elemento));

        return () => observer.disconnect();
    }, []);

    return (
        <div className="landing" id="inicio">
            <header className="landing-header">
                <div className="landing-header-inner">
                    <a className="landing-brand" href="/" aria-label="Habita, inicio">
                        <img src={logo} alt="" />
                        <h1>Habita</h1>
                    </a>

                    <nav className="landing-nav" aria-label="Navegación principal">
                        <a href="#funcionalidades">Qué podés hacer</a>
                        <a href="#nosotros">Nuestra mirada</a>
                    </nav>

                    <div className="landing-header-actions">
                        <Link className="landing-login-link" to="/login">
                            Iniciar sesión
                        </Link>
                        <Link className="landing-small-cta" to="/register">
                            Crear cuenta <ArrowRight aria-hidden="true" />
                        </Link>
                    </div>
                </div>
            </header>

            <main>
                <section className="landing-hero">
                    <div className="landing-hero-background" aria-hidden="true">
                        <img src={edificio} alt="" />
                    </div>
                    <div className="landing-hero-inner">
                        <div className="landing-hero-copy landing-reveal">
                            <div className="landing-eyebrow">
                                <span className="landing-eyebrow-dot" />
                                Tu edificio, más cerca
                            </div>
                            <h1>
                                Vivir en comunidad
                                <br />
                                <span>puede ser más simple.</span>
                            </h1>
                            <p className="landing-hero-description">
                                Habita reúne todo lo que pasa en tu edificio para que
                                organizarse, comunicarse y disfrutarlo sea más fácil.
                            </p>
                            <div className="landing-trust">
                                <span className="landing-trust-icon">
                                    <Check aria-hidden="true" />
                                </span>
                                Para residentes y administraciones
                            </div>
                        </div>

                    </div>
                    <a className="landing-scroll-cue" href="#funcionalidades">
                        Descubrí Habita <span><ArrowRight aria-hidden="true" /></span>
                    </a>
                </section>

                <section className="landing-features" id="funcionalidades">
                    <div className="landing-section-heading landing-reveal">
                        <span className="landing-kicker">Un edificio que funciona mejor</span>
                        <h2>Lo importante, sin dar tantas vueltas.</h2>
                        <p>
                            Menos mensajes perdidos. Más tiempo para disfrutar tu hogar.
                        </p>
                    </div>
                    <div className="landing-feature-grid">
                        {funcionalidades.map(({ icon: Icon, titulo, descripcion }, index) => (
                            <Panel icono={<Icon aria-hidden="true" />} titulo={titulo}>
                                <p>{descripcion}</p>
                            </Panel>
                        ))}
                    </div>
                </section>

                <section className="landing-about landing-reveal" id="nosotros">
                    <div className="landing-about-copy">
                        <span className="landing-kicker">Hecho para convivir mejor</span>
                        <h2>Un buen lugar también se construye entre todos.</h2>
                        <p>
                            Creemos que cuando la información está clara y las personas
                            conectadas, cada edificio puede sentirse un poco más como hogar.
                        </p>
                    </div>
                </section>
            </main>

            <footer className="landing-footer landing-reveal">
                <div className="landing-footer-main">
                    <div className="landing-footer-brand-column">
                        <a className="landing-brand" href="/" aria-label="Habita, inicio">
                            <img src={logo} alt="" />
                            <h1>Habita</h1>
                        </a>
                        <p>Una mejor forma de vivir en comunidad.</p>
                    </div>

                    <nav className="landing-footer-column" aria-label="Explorá Habita">
                        <h2>Explorá</h2>
                        <a href="#funcionalidades">Qué podés hacer</a>
                        <a href="#nosotros">Nuestra mirada</a>
                    </nav>

                    <nav className="landing-footer-column" aria-label="Tu cuenta">
                        <h2>Tu cuenta</h2>
                        <Link to="/login">Iniciar sesión</Link>
                        <Link to="/register">Crear cuenta</Link>
                    </nav>
                    
                    <nav className="landing-footer-column">
                        <h2>© {new Date().getFullYear()} Habita.  <br />Todos los derechos reservados.</h2>
                        <a href="#inicio">
                            Volver arriba ↑
                        </a>
                    </nav>
                </div>
            </footer>
        </div>
    );
}

export default Landing;
