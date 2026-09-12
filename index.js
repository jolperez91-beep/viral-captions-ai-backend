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
 *     Recibe el video completo + los subtitulos (JSON) -> genera cada
 *     subtitulo como una IMAGEN PNG (con "sharp", renderizando texto vía
 *     SVG) y las superpone sobre el video con el filtro "overlay" de
 *     FFmpeg -> devuelve el archivo .mp4 final.
 *
 *     Nota tecnica: NO usamos el filtro "drawtext" de FFmpeg porque
 *     requiere que el binario este compilado con libfreetype, algo que
 *     varios builds estaticos (incluido el que probamos primero) NO
 *     traen, y es dificil de garantizar de antemano. "overlay" en cambio
 *     esta presente en absolutamente cualquier build de FFmpeg.
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
const sharp = require('sharp');
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

    console.log('Descargando build completo de FFmpeg…');
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

/** ffprobe viene en el mismo paquete descargado que ffmpeg — se usa para saber el tamaño del video. */
async function getFfprobePath(){
  const ffmpegPath = await getFfmpegPath();
  return path.join(path.dirname(ffmpegPath), 'ffprobe');
}

/**
 * Genera UNA imagen PNG transparente (del tamaño exacto del video) con el
 * texto del subtítulo dibujado, usando SVG + sharp. Esto reemplaza a
 * "drawtext" — sharp es mucho más portable y no depende de que FFmpeg
 * tenga compilado el soporte de texto.
 */
async function renderCaptionPNG(text, width, height, fontSize, fontColorHex){
  const clean = String(text).toUpperCase().trim();
  // Si la línea es muy larga, reduce el tamaño para que no se salga del cuadro
  const adjustedSize = clean.length > 22 ? Math.round(fontSize * 0.68) : fontSize;
  const escaped = clean.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const strokeWidth = Math.max(2, Math.round(adjustedSize * 0.08));
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <text x="50%" y="${Math.round(height * 0.78)}" text-anchor="middle" dominant-baseline="middle"
        font-family="DejaVu Sans, Liberation Sans, Arial, sans-serif" font-weight="900"
        font-size="${adjustedSize}" fill="#${fontColorHex}"
        stroke="#000000" stroke-width="${strokeWidth}" paint-order="stroke">${escaped}</text>
    </svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
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
/* POST /api/export -- video + subtitulos -> imagenes + overlay -> .mp4 */
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

    const ffprobePath = await getFfprobePath();
    console.log('Detectando resolución del video…');
    const { width, height } = await new Promise((resolve, reject) => {
      execFile(ffprobePath, [
        '-v', 'error', '-select_streams', 'v:0',
        '-show_entries', 'stream=width,height', '-of', 'csv=s=x:p=0', inputPath
      ], (err, stdout) => {
        if(err) return reject(new Error('No se pudo leer el video: ' + err.message));
        const [w, h] = stdout.trim().split('x').map(Number);
        if(!w || !h) return reject(new Error('No se pudo determinar el tamaño del video.'));
        resolve({ width: w, height: h });
      });
    });
    console.log(`Resolución detectada: ${width}x${height}`);

    console.log(`Generando ${transcript.length} imágenes de subtítulos…`);
    const overlays = [];
    for(let i = 0; i < transcript.length; i++){
      const row = transcript[i];
      const text = String(row.text || '').trim();
      if(!text) continue;
      const pngBuffer = await renderCaptionPNG(text, width, height, fontSize, fontColor);
      const pngPath = path.join(tmpDir, `cap_${i}.png`);
      fs.writeFileSync(pngPath, pngBuffer);
      const start = Number(row.start) || 0;
      overlays.push({ path: pngPath, start, end: Number(row.end) || start + 1.5 });
    }
    if(!overlays.length){
      return res.status(400).json({ error: 'No hay texto válido en los subtítulos.' });
    }

    // input 0 = video; inputs 1..N = una imagen PNG transparente por línea de subtítulo
    const args = ['-y', '-i', inputPath];
    overlays.forEach(o => args.push('-i', o.path));

    let filter = '';
    let lastLabel = '0:v';
    overlays.forEach((o, i) => {
      const inputIdx = i + 1;
      const outLabel = i === overlays.length - 1 ? 'vout' : `v${i}`;
      filter += `[${lastLabel}][${inputIdx}:v]overlay=0:0:enable='between(t,${o.start},${o.end})'[${outLabel}];`;
      lastLabel = outLabel;
    });
    filter = filter.slice(0, -1); // quita el ";" final

    args.push('-filter_complex', filter, '-map', '[vout]', '-map', '0:a?', '-c:a', 'copy', outputPath);

    console.log('Superponiendo subtítulos con FFmpeg (overlay)…');
    await runFFmpeg(args);
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
