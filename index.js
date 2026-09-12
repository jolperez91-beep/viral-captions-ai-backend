/**
 * VIRAL CAPTIONS AI — Backend mínimo para Render
 * ------------------------------------------------------------------
 * El único trabajo real de este servidor es:
 *   1. Recibir un archivo de audio desde el frontend.
 *   2. Subirlo a fal.ai storage para obtener una URL temporal.
 *   3. Pedirle a fal-ai/wizper (Whisper v3 optimizado) una transcripción
 *      con timestamps POR PALABRA — eso es lo que necesita el editor
 *      para el efecto karaoke/word-by-word.
 *   4. Devolver ese JSON al navegador.
 *
 * No hace falta FFmpeg aquí: el video se procesa en el propio navegador
 * del usuario con ffmpeg.wasm (ver app.js), así que este servidor puede
 * vivir en el plan gratis/Starter de Render sin problema.
 *
 * DEPLOY EN RENDER:
 *   1. Sube esta carpeta "server" (puede ser un repo aparte, o el mismo
 *      repo con "Root Directory: server" en la configuración de Render).
 *   2. Build command:  npm install
 *   3. Start command:  node index.js
 *   4. Environment > Add Environment Variable:
 *        FAL_KEY = tu clave de fal.ai (la misma que usas en therawest-ai)
 *   5. Copia la URL pública que te da Render, algo como
 *        https://viral-captions-ai-backend.onrender.com
 *      y pégala en CONFIG.API_BASE_URL dentro de app.js (frontend).
 */

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { fal } = require('@fal-ai/client');

const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 } // 25 MB — suficiente para el audio extraído de un reel
});

fal.config({ credentials: process.env.FAL_KEY });

// En producción, restringe esto a tu dominio real de Netlify, por ejemplo:
// app.use(cors({ origin: 'https://viral-captions-ai.netlify.app' }));
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Viral Captions AI — backend activo. Usa POST /api/transcribe con un audio.');
});

app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
  try {
    if (!process.env.FAL_KEY) {
      return res.status(500).json({ error: 'Falta configurar la variable de entorno FAL_KEY en Render.' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No se recibió ningún archivo de audio (campo "audio").' });
    }

    // 1. Sube el audio a fal.ai storage para obtener una URL pública temporal
    const blob = new Blob([req.file.buffer], { type: req.file.mimetype || 'audio/mpeg' });
    const audioUrl = await fal.storage.upload(blob);

    // 2. Transcribe con timestamps por palabra
    const language = req.body.language && req.body.language !== 'auto' ? req.body.language : null;
    const result = await fal.subscribe('fal-ai/wizper', {
      input: {
        audio_url: audioUrl,
        chunk_level: 'word',
        language // null = fal.ai detecta el idioma automáticamente
      },
      logs: false
    });

    res.json({ chunks: result.data.chunks || [], text: result.data.text || '' });
  } catch (err) {
    console.error('Error en /api/transcribe:', err);
    res.status(500).json({
      error: 'No se pudo generar la transcripción con fal.ai.',
      detail: String(err && err.message ? err.message : err)
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor de Viral Captions AI escuchando en el puerto ${PORT}`));
