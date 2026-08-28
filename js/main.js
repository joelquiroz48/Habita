const inputMensaje = document.querySelector('.msg-input');
const botonEnviar = document.querySelector('.send-btn');
const ventanaChat = document.querySelector('.win-chat');

let intervaloAnimacion;

function iniciarAnimacionCargando(elemento) {
    let puntos = '';

    intervaloAnimacion = setInterval(() => {
        if (puntos.length < 3) {
            puntos += '.';
        } else {
            puntos = '.'
        }

        elemento.textContent = 'Escribiendo' + puntos;
    }, 500);

}

function detenerAnimacionCargando() {
    clearInterval(intervaloAnimacion);
}

async function enviarMensaje() {
    const texto = inputMensaje.value.trim();
    if (texto === '') return;

    const nuevoMensaje = document.createElement('div');
    nuevoMensaje.classList.add('msj-usr');
    nuevoMensaje.textContent = texto;
    ventanaChat.appendChild(nuevoMensaje);

    inputMensaje.value = '';
    ventanaChat.scrollTop = ventanaChat.scrollHeight;

    const msjCargando = document.createElement('div');
    msjCargando.classList.add('msj-chat');
    iniciarAnimacionCargando(msjCargando);
    ventanaChat.appendChild(msjCargando);
    ventanaChat.scrollTop = ventanaChat.scrollHeight;

    try {
        const respuestaServidor = await fetch('http://localhost:3000/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mensaje: texto })
        });

        const datos = await respuestaServidor.json();

        detenerAnimacionCargando();

        if (datos.respuesta) {
            msjCargando.innerHTML = marked.parse(datos.respuesta);
        } else {
            msjCargando.textContent = datos.error || 'Hubo un error al obtener la respuesta.';
        }

    } catch (error) {
        detenerAnimacionCargando();
        msjCargando.textContent = 'Error de conexión con el servidor.';
    }
    ventanaChat.scrollTop = ventanaChat.scrollHeight;
}
botonEnviar.addEventListener('click', enviarMensaje);
inputMensaje.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') enviarMensaje();
});

botonEnviar.addEventListener('click', enviarMensaje);
inputMensaje.addEventListener('keydown', function(event){
    if (event.key === 'Enter'){
        enviarMensaje();
    }
});


//----------- Animaciones de pantalla del chat -----------

const pantallaChat = document.querySelector('.ia-pantalla-chat');
const botonIniciarChat = document.querySelector('.btn-iniciar-chat');
const botonCerrarChat = document.querySelector('.x-cerrar-chat');
const imgIa = document.querySelector('.contenedor-ia .img-ia');
const ImgGloboDialogo = document.querySelector('.globo-dialogo-ia');

botonIniciarChat.addEventListener('click',() => {
    pantallaChat.classList.remove('oculto');
    imgIa.src = 'img/habita-asistente-2.png';
    ImgGloboDialogo.classList.remove('oculto');
})

botonCerrarChat.addEventListener('click', () => {
    pantallaChat.classList.add('oculto');
    imgIa.src = 'img/habita-asistente.png';
    ImgGloboDialogo.classList.add('oculto');

})