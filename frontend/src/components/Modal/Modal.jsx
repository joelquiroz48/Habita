import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import "./Modal.css";

/* =========================================================
   Ventana emergente reutilizable.
   Se cierra con la X, con la tecla Esc o haciendo clic afuera.

   <Modal titulo="..." onClose={...} pie={<botones/>}>contenido</Modal>
========================================================= */

function Modal({ titulo, onClose, children, pie, ancho = 520 }) {

    useEffect(() => {
        const alPresionar = (evento) => {
            if (evento.key === "Escape") onClose();
        };

        document.addEventListener("keydown", alPresionar);
        const overflowOriginal = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", alPresionar);
            document.body.style.overflow = overflowOriginal;
        };
    }, [onClose]);

    return createPortal(
        <div
            className="modal-fondo"
            onMouseDown={(evento) => {
                if (evento.target === evento.currentTarget) onClose();
            }}
        >
            <div
                className="modal"
                style={{ maxWidth: ancho }}
                role="dialog"
                aria-modal="true"
                aria-label={titulo}
            >
                <header className="modal-encabezado">
                    <h2>{titulo}</h2>

                    <button
                        type="button"
                        className="modal-cerrar"
                        onClick={onClose}
                        aria-label="Cerrar"
                    >
                        <X />
                    </button>
                </header>

                <div className="modal-cuerpo">{children}</div>

                {pie && <footer className="modal-pie">{pie}</footer>}
            </div>
        </div>,
        document.body
    );
}

export default Modal;
