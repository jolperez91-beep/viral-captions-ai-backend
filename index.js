/**
 * VIRAL CAPTIONS AI — Backend para Render
 * ------------------------------------------------------------------
 * Este servidor hace TODO el trabajo pesado de video, para no depender
 * de ffmpeg.wasm en el navegador (que da problemas de Workers/CORS
 * dificiles de garantizar en todos los navegadores):
 *
 *   POST /api/transcribe
 *     Recibe el video completo -> extrae el audio con FFmpeg real ->
 *     lo sube a fal.ai storage -> pide la transcripcion con timestamps
 *     por palabra a fal-ai/wizper -> devuelve el JSON.
 *
 *   POST /api/export
 *     Recibe el video completo + los subtitulos (JSON) -> quema el texto
 *     directamente en el video con FFmpeg (drawtext) -> devuelve el
 *     archivo .mp4 final para descargar.
 *
 * DEPLOY EN RENDER (igual que antes):
 *   Build command:  npm install
 *   Start command:  node index.js
 *   Environment variable:  FAL_KEY = tu clave de fal.ai
 *
 * Nota sobre recursos: con el plan Free de Render (512 MB RAM), esto
 * funciona bien para clips cortos tipo reel/TikTok (hasta 1-2 minutos).
 * Videos muy largos o en 4K pueden quedarse sin memoria -- si eso pasa,
 * sube al plan de $7/mes (mas CPU y RAM).
 */

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFile } = require('child_process');
const { fal } = require('@fal-ai/client');

const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 150 * 1024 * 1024 } // 150 MB -- de sobra para un reel corto
});

fal.config({ credentials: process.env.FAL_KEY });

// En produccion, restringe esto a tu dominio real de Netlify:
// app.use(cors({ origin: 'https://viral-caption-ai.netlify.app' }));
app.use(cors());

// Log de CADA peticion que llega, para poder distinguir "nunca llego al
// servidor" (problema de red/Render) de "llego y algo fallo por dentro".
app.use((req, res, next) => {
  console.log(`→ ${req.method} ${req.url}`);
  next();
});

// Si algo revienta el proceso sin pasar por un try/catch, que quede en los
// logs en vez de morir en silencio (Render reiniciaria el servicio solo,
// perdiendo la traza de por que paso).
process.on('unhandledRejection', (reason) => {
  console.error('UNHANDLED REJECTION:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
});

app.get('/', (req, res) => {
  res.send('Viral Captions AI — backend activo. Endpoints: POST /api/transcribe, POST /api/export');
});

/**
 * Descarga (una sola vez por instancia, se cachea en /tmp) un build COMPLETO
 * de FFmpeg — el paquete npm "ffmpeg-static" trae un binario recortado que
 * NO incluye libfreetype, por lo que el filtro "drawtext" falla con
 * "No such filter: 'drawtext'". Este build (John Van Sickle, el mismo usado
 * en incontables Dockerfiles) sí lo incluye, confirmado.
 */
let cachedFfmpegPath = null;
let ffmpegDownloadPromise = null;
async function getFfmpegPath(){
  if(cachedFfmpegPath && fs.existsSync(cachedFfmpegPath)) return cachedFfmpegPath;
  if(ffmpegDownloadPromise) return ffmpegDownloadPromise;

  ffmpegDownloadPromise = (async () => {
    const binDir = path.join(os.tmpdir(), 'ffmpeg-full');
    const binPath = path.join(binDir, 'ffmpeg');
    if(fs.existsSync(binPath)){ cachedFfmpegPath = binPath; return binPath; }

    console.log('Descargando build completo de FFmpeg (con soporte de texto/drawtext)…');
    const tarPath = path.join(os.tmpdir(), 'ffmpeg-release-amd64-static.tar.xz');
    const response = await fetch('https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz');
    if(!response.ok) throw new Error(`No se pudo descargar FFmpeg completo (status ${response.status}).`);
    fs.writeFileSync(tarPath, Buffer.from(await response.arrayBuffer()));

    fs.mkdirSync(binDir, { recursive: true });
    await new Promise((resolve, reject) => {
      execFile('tar', ['-xJf', tarPath, '-C', binDir, '--strip-components=1'], (err, stdout, stderr) => {
        if(err) return reject(new Error('No se pudo extraer FFmpeg: ' + (stderr || err.message)));
        resolve();
      });
    });
    fs.chmodSync(binPath, 0o755);
    console.log('FFmpeg completo listo en:', binPath);
    cachedFfmpegPath = binPath;
    return binPath;
  })();

  try {
    return await ffmpegDownloadPromise;
  } finally {
    ffmpegDownloadPromise = null;
  }
}

/** Corre el binario de FFmpeg (descargándolo primero si hace falta) con los argumentos dados. */
async function runFFmpeg(args){
  const ffmpegPath = await getFfmpegPath();
  return new Promise((resolve, reject) => {
    execFile(ffmpegPath, args, { maxBuffer: 1024 * 1024 * 100 }, (err, stdout, stderr) => {
      if(err) return reject(new Error((stderr && stderr.slice(-800)) || err.message));
      resolve();
    });
  });
}

/** Descarga (una sola vez, se cachea en /tmp) la fuente usada para quemar los subtitulos. */
let cachedFontPath = null;
async function getFontPath(){
  if(cachedFontPath && fs.existsSync(cachedFontPath)) return cachedFontPath;
  // OJO: jsdelivr NO puede servir archivos individuales del repo google/fonts
  // porque es demasiado grande para su CDN (devuelve 404). raw.githubusercontent.com
  // sirve el archivo directo sin importar el tamaño del repo.
  const response = await fetch('https://raw.githubusercontent.com/google/fonts/main/ofl/poppins/Poppins-Bold.ttf');
  if(!response.ok) throw new Error(`No se pudo descargar la fuente para los subtitulos (status ${response.status}).`);
  const buffer = Buffer.from(await response.arrayBuffer());
  const fontPath = path.join(os.tmpdir(), 'poppins-bold.ttf');
  fs.writeFileSync(fontPath, buffer);
  cachedFontPath = fontPath;
  return fontPath;
}

/** Escapa texto para que el filtro drawtext de FFmpeg no se rompa. */
function escapeForDrawtext(text){
  return String(text)
    .replace(/\\/g, '\\\\')
    .replace(/:/g, '\\:')
    .replace(/'/g, '\u2019');
}

/* ------------------------------------------------------------------ */
/* POST /api/transcribe -- video -> audio (FFmpeg) -> fal-ai/wizper     */
/* ------------------------------------------------------------------ */
app.post('/api/transcribe', upload.single('video'), async (req, res) => {
  let tmpDir;
  try {
    if(!process.env.FAL_KEY){
      return res.status(500).json({ error: 'Falta configurar la variable de entorno FAL_KEY en Render.' });
    }
    if(!req.file){
      return res.status(400).json({ error: 'No se recibio ningun video (campo "video").' });
    }
    console.log(`Video recibido: ${req.file.originalname || '(sin nombre)'} — ${(req.file.size / 1024 / 1024).toFixed(2)} MB`);

    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vca-transcribe-'));
    const inputPath = path.join(tmpDir, 'input.mp4');
    const audioPath = path.join(tmpDir, 'audio.mp3');
    fs.writeFileSync(inputPath, req.file.buffer);

    // 1. Extrae solo el audio (mucho mas rapido y liviano que mandar el video a fal)
    await runFFmpeg(['-y', '-i', inputPath, '-vn', '-ar', '16000', '-ac', '1', '-b:a', '64k', audioPath]);

    // 2. Sube el audio a fal.ai storage para obtener una URL temporal
    const audioBuffer = fs.readFileSync(audioPath);
    const blob = new Blob([audioBuffer], { type: 'audio/mpeg' });
    const audioUrl = await fal.storage.upload(blob);

    // 3. Transcribe con timestamps por palabra
    // OJO: si no hay idioma, hay que OMITIR la clave por completo (no mandar
    // "language: null") — el esquema de fal.ai valida "language" como un
    // enum de códigos ISO (es, en, pt, fr...) y es más estricto con un
    // valor null explícito que con la clave simplemente ausente.
    const language = req.body.language && req.body.language !== 'auto' ? req.body.language : undefined;
    // OJO: fal-ai/wizper solo acepta chunk_level: 'segment' (NO 'word',
    // aunque cierta documentación lo sugiera) — el detalle de error de fal
    // lo confirmó: "Input should be 'segment'".
    const input = { audio_url: audioUrl, chunk_level: 'segment' };
    if(language) input.language = language;

    const result = await fal.subscribe('fal-ai/wizper', { input, logs: false });

    res.json({ chunks: result.data.chunks || [], text: result.data.text || '' });
  } catch (err) {
    // fal.ai devuelve errores de validación (422) con un array "detail" con
    // el campo exacto que falló — lo mostramos completo en los Logs de Render
    // en vez de solo "[Object]", para poder diagnosticar sin adivinar.
    const validationDetail = err && err.body && err.body.detail ? JSON.stringify(err.body.detail) : null;
    console.error('Error en /api/transcribe:', validationDetail || (err && err.message) || err);
    res.status(500).json({
      error: 'No se pudo generar la transcripcion.',
      detail: validationDetail || String(err && err.message ? err.message : err)
    });
  } finally {
    if(tmpDir) fs.rm(tmpDir, { recursive: true, force: true }, () => {});
  }
});

/* ------------------------------------------------------------------ */
/* POST /api/export -- video + subtitulos -> FFmpeg (drawtext) -> .mp4 */
/* ------------------------------------------------------------------ */
app.post('/api/export', upload.single('video'), async (req, res) => {
  let tmpDir;
  try {
    if(!req.file){
      return res.status(400).json({ error: 'No se recibio ningun video (campo "video").' });
    }
    console.log(`Export: video recibido ${req.file.originalname || '(sin nombre)'} — ${(req.file.size / 1024 / 1024).toFixed(2)} MB`);
    let transcript;
    try { transcript = JSON.parse(req.body.transcript || '[]'); }
    catch { return res.status(400).json({ error: 'El campo "transcript" no es un JSON valido.' }); }
    if(!Array.isArray(transcript) || !transcript.length){
      return res.status(400).json({ error: 'No hay subtitulos que quemar en el video.' });
    }

    const fontColor = String(req.body.fontColor || '#FFFFFF').replace('#', '');
    const fontSize = Number(req.body.fontSize) || 52;

    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vca-export-'));
    const inputPath = path.join(tmpDir, 'input.mp4');
    const outputPath = path.join(tmpDir, 'output.mp4');
    fs.writeFileSync(inputPath, req.file.buffer);

    const fontPath = await getFontPath();
    console.log('Fuente lista en:', fontPath);

    // transcript llega como [{ text, start, end }] con start/end en SEGUNDOS
    const filters = transcript.map(row => {
      const text = escapeForDrawtext(String(row.text || '').toUpperCase());
      const start = Number(row.start) || 0;
      const end = Number(row.end) || start + 1.5;
      return `drawtext=fontfile=${fontPath}:text='${text}':fontcolor=0x${fontColor}:fontsize=${fontSize}:borderw=3:bordercolor=black:x=(w-text_w)/2:y=h*0.78:enable='between(t,${start},${end})'`;
    }).join(',');

    console.log(`Quemando ${transcript.length} líneas de subtítulos con FFmpeg…`);
    await runFFmpeg(['-y', '-i', inputPath, '-vf', filters, '-c:a', 'copy', outputPath]);
    console.log('FFmpeg terminó OK, enviando el archivo…');

    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', 'attachment; filename="viral-captions-ai.mp4"');
    const stream = fs.createReadStream(outputPath);
    stream.pipe(res);
    stream.on('close', () => { if(tmpDir) fs.rm(tmpDir, { recursive: true, force: true }, () => {}); });
  } catch (err) {
    console.error('Error en /api/export:', err);
    if(tmpDir) fs.rm(tmpDir, { recursive: true, force: true }, () => {});
    res.status(500).json({
      error: 'No se pudo exportar el video.',
      detail: String(err && err.message ? err.message : err)
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor de Viral Captions AI escuchando en el puerto ${PORT}`));
