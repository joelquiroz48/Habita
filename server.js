const express = require('express');
const cors = require('cors');
require('dotenv').config();
const {GoogleGenAI} = require('@google/genai');

const ERRORES_GEMINI_REINTENTABLES = new Set([429, 500, 502, 503, 504]);
const MAX_INTENTOS_GEMINI = 3;

const app = express();
app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY});
const instruccionesSistema = require('./chat-info/instrucciones-sistema.js')

async function generarRespuestaGemini(contents) {
    for (let intento = 1; intento <= MAX_INTENTOS_GEMINI; intento++) {
        try {
            return await ai.models.generateContent({
                model: 'gemini-3.5-flash-lite',
                contents,
                config: {
                    systemInstruction: instruccionesSistema,
                },
            });
        } catch (error) {
            const status = Number(error.status);
            if (!ERRORES_GEMINI_REINTENTABLES.has(status) || intento === MAX_INTENTOS_GEMINI) {
                throw error;
            }

            const esperaMs = 500 * 2 ** (intento - 1);
            console.warn(`Gemini devolvió ${status}; reintento ${intento + 1}/${MAX_INTENTOS_GEMINI} en ${esperaMs} ms`);
            await new Promise((resolve) => setTimeout(resolve, esperaMs));
        }
    }
}

// Ruta POST para recibir los mensajes con historial conversacional
app.post('/api/chat', async (req, res) => {
    try {
        const { mensaje, historial = [] } = req.body;

        if (!mensaje || !mensaje.trim()) {
            return res.status(400).json({ error: 'El mensaje no puede estar vacío.' });
        }

        // Mapeamos el historial recibido (excluyendo el saludo inicial del bot si es el primer mensaje)
        // al formato de Gemini: role: 'user' | 'model'
        const contents = [];

        for (const item of historial) {
            // El saludo inicial del bot podemos omitirlo o mapearlo como model
            if (item.emisor === 'usr') {
                contents.push({
                    role: 'user',
                    parts: [{ text: item.texto }],
                });
            } else if (item.emisor === 'bot') {
                contents.push({
                    role: 'model',
                    parts: [{ text: item.texto }],
                });
            }
        }

        // Añadimos el nuevo mensaje del usuario al final de la conversación
        contents.push({
            role: 'user',
            parts: [{ text: mensaje }],
        });

        const startedAt = Date.now();
        const response = await generarRespuestaGemini(contents);

        console.info(`Respuesta de Gemini en ${Date.now() - startedAt} ms`);
        res.json({ respuesta: response.text });
    } catch (error) {
        console.error('Error al hablar con Habita:', error);
        const status = ERRORES_GEMINI_REINTENTABLES.has(Number(error.status)) ? 503 : 502;
        const mensaje = status === 503
            ? 'El asistente está temporalmente ocupado. Esperá unos segundos e intentá de nuevo.'
            : 'No se pudo generar una respuesta. Revisá la configuración del asistente.';
        res.status(status).json({ error: mensaje });
    }
});

// // ruta de prueba
// app.get('/',(req,res) => {
//     resizeBy.send('El servidor backend funciona correctamente!');
// });

const PORT = 3000;
app.listen(PORT, () => {
    console.log('Servidor corriendo en http://localhost:${PORT}');
});

