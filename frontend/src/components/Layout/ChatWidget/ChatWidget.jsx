import React, { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import "./ChatWidget.css";

// Importamos la imagen normal y la de ojos cerrados/alternativa
import habitaImg from "../../../assets/img/interfaz-chat/habita-asistente.png";
import habitaImgHover from "../../../assets/img/interfaz-chat/habita-asistente-2.png";
import logoImg from "../../../assets/img/icon.png";

function ChatWidget({
    flotante = false,
    abierto = false,
    onAbrir = () => { },
    onCerrar = () => { },
    mensajes = [],
    onEnviarMensaje = () => { },
    inputTexto = "",
    setInputTexto = () => { }
}) {
    // Estado para detectar si el mouse está sobre la imagen
    const [isHovered, setIsHovered] = useState(false);

    if (!flotante) {
        return (
            <div className="tarjeta-inicial-asistente">
                <div className="contenido-asistente">
                    <img
                        src={isHovered ? habitaImgHover : habitaImg}
                        alt="Habita Asistente"
                        className="img-asistente"
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                    />
                    <div className="texto-asistente">
                        <p>Tu asistente Habita siempre disponible las 24 hs</p>
                    </div>
                </div>

                <button className="btn-hablar" onClick={onAbrir}>
                    <MessageCircle size={20} />
                    <span>Hablar con Habita</span>
                </button>
            </div>
        );
    }

    if (!abierto) return null;

    return (
        <div className="chat-window-flotante">
            <header className="chat-header">
                <div className="chat-titulo">
                    <img src={logoImg} alt="Habita IA" className="chat-icon-head" />
                    <span>Asistente Habita</span>
                </div>
                <button className="btn-cerrar" onClick={onCerrar}>
                    <X size={18} />
                </button>
            </header>

            <div className="chat-messages">
                {mensajes.map((msg) => (
                    <div key={msg.id} className={`mensaje ${msg.emisor === "usr" ? "msj-usr" : "msj-chat"}`}>
                        {msg.texto}
                    </div>
                ))}
            </div>

            <form className="chat-input-area" onSubmit={onEnviarMensaje}>
                <input
                    type="text"
                    placeholder="Escribe tu mensaje..."
                    value={inputTexto}
                    onChange={(e) => setInputTexto(e.target.value)}
                />
                <button type="submit" className="btn-enviar">
                    <Send size={16} />
                </button>
            </form>
        </div>
    );
}

export default ChatWidget;