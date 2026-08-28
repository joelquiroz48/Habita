const express = require('express');
const cors = require('cors');
require('dotenv').config();
const {GoogleGenAI} = require('@google/genai');

const app = express();
app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY});

// Ruta POST para recibir los mensajes
app.post('/api/chat',async (req,res) => {
    try{
        console.log(req.body);
        const {mensaje} = req.body;
        const response = await ai.models.generateContent({
            model: 'gemini-3.5-flash-lite',
            contents: mensaje,
        });
        console.log('Cuerpo recibido en el servidor:', req.body);

        res.json({ respuesta: response.text});
    } catch (error) {
        console.error('Error al hablar con Habita', error);
        res.status(500).json({ error: 'Ocurrio un error en el servidor'});
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