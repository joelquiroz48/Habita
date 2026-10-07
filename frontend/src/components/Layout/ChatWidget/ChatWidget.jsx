import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import "./ChatWidget.css";
import habitaImg from "../../../assets/img/interfaz-chat/habita-asistente.png";
import logoImg from "../../../assets/img/icon.png";

function ChatWidget() {
    const [abierto, setAbierto] = useState(false);
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

        // Simulación o llamada al Backend / IA
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
        <div className="chat-widget-container">
            {/* Ventana del Chat */}
            {abierto && (
                <div className="chat-window">
                    <header className="chat-header">
                        <div className="chat-titulo">
                            <img src={logoImg} alt="Habita IA" className="chat-icon-head" />
                            <span>Asistente Habita</span>
                        </div>
                        <button className="btn-cerrar" onClick={() => setAbierto(false)}>
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

                    <form className="chat-input-area" onSubmit={enviarMensaje}>
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
            )}

            {/* Botón Flotante para Abrir Chat */}
            {!abierto && (
                <div className="tarjeta-inicial-asistente">
                    <div className="contenido-asistente">
                        <img src={habitaImg} alt="Habita Asistente" className="img-asistente" />
                        <div className="texto-asistente">
                            <p>Tu asistente Habita siempre disponible las 24 hs</p>
                        </div>
                    </div>

                    <button className="btn-hablar" onClick={() => setAbierto(true)}>
                        <MessageCircle size={20} />
                        <span>Hablar con Habita</span>
                    </button>
                </div>
            )}
        </div>
    );
}

export default ChatWidget;