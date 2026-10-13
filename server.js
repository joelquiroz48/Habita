const express = require('express');
const cors = require('cors');
require('dotenv').config();
const {GoogleGenAI} = require('@google/genai');

const app = express();
app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY});
const instruccionesSistema = require('./chat-info/instrucciones-sistema.js')

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

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: {
                systemInstruction: instruccionesSistema,
            },
        });

        res.json({ respuesta: response.text });
    } catch (error) {
        console.error('Error al hablar con Habita:', error);
        res.status(500).json({ error: 'Ocurrió un error en el servidor' });
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

