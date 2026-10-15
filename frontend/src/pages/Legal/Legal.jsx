import { useEffect } from "react";
import { Link } from "react-router-dom";

import "./Legal.css";
import { DOCUMENTOS_LEGALES, FECHA_ACTUALIZACION } from "./textosLegales";

/**
 * Página pública (sin menú ni sesión) con los textos legales.
 * "terminos" y "privacidad" usan exactamente el mismo diseño.
 *   <Route path="/terminos"   element={<Legal tipo="terminos" />} />
 *   <Route path="/privacidad" element={<Legal tipo="privacidad" />} />
 */
function Legal({ tipo }) {
    const documento = DOCUMENTOS_LEGALES[tipo] ?? DOCUMENTOS_LEGALES.terminos;

    useEffect(() => {
        document.title = `Habita | ${documento.titulo}`;
        window.scrollTo(0, 0);
    }, [documento.titulo]);

    return (
        <div className="legal">
            <header className="legal-cabecera">
                <span className="legal-logo">Habita</span>
                <nav className="legal-nav" aria-label="Documentos legales">
                    {Object.entries(DOCUMENTOS_LEGALES).map(([clave, doc]) => (
                        <Link
                            key={clave}
                            to={doc.ruta}
                            className={clave === tipo ? "activo" : ""}
                            aria-current={clave === tipo ? "page" : undefined}
                        >
                            {doc.titulo}
                        </Link>
                    ))}
                </nav>
            </header>

            <main className="legal-contenido">
                <h1>{documento.titulo}</h1>
                <p className="legal-resumen">{documento.resumen}</p>
                <p className="legal-fecha">Última actualización: {FECHA_ACTUALIZACION}</p>

                {documento.secciones.map((seccion) => (
                    <section key={seccion.titulo}>
                        <h2>{seccion.titulo}</h2>
                        {seccion.parrafos.map((parrafo) => (
                            <p key={parrafo}>{parrafo}</p>
                        ))}
                        {seccion.items && (
                            <ul>
                                {seccion.items.map((item) => <li key={item}>{item}</li>)}
                            </ul>
                        )}
                    </section>
                ))}
            </main>

            <footer className="legal-pie">© Habita · Todos los derechos reservados</footer>
        </div>
    );
}

export default Legal;
