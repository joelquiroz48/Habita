const inputMensaje = document.querySelector('.msg-input');
const botonEnviar = document.querySelector('.send-btn');
const ventanaChat = document.querySelector('.win-chat');

function enviarMensaje(){
    const texto = inputMensaje.value.trim();
    if (texto == '') return;
    const nuevoMensaje = document.createElement('div');
    nuevoMensaje.classList.add('msj-usr');
    nuevoMensaje.textContent = texto;
    ventanaChat.appendChild(nuevoMensaje);
    inputMensaje.value = '';
    ventanaChat.scrollTop = ventanaChat.scrollHeight;
}

botonEnviar.addEventListener('click', enviarMensaje);
inputMensaje.addEventListener('keydown', function(event){
    if (event.key === 'Enter'){
        enviarMensaje();
    }
});