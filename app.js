/* ==========================================================================
   VIRAL CAPTIONS AI — app.js
   Arquitectura: estado central (state) + módulos de render + módulos de eventos.
   Todo lo relacionado con IA está claramente marcado como SIMULADO y aislado
   en el módulo `AI` al final del archivo — ahí se debe conectar la API real.
   ========================================================================== */

/* ---------------------------------------------------------------------- */
/* 1. DATOS DE DEMOSTRACIÓN                                                */
/* ---------------------------------------------------------------------- */

const DEMO_TRANSCRIPT = [
  { id: 1, start: '00:00.000', end: '00:01.860', text: 'Esto es un subtítulo viral' },
  { id: 2, start: '00:01.900', end: '00:03.400', text: 'hecho completamente con IA' },
  { id: 3, start: '00:03.450', end: '00:05.100', text: 'en menos de treinta segundos' },
  { id: 4, start: '00:05.150', end: '00:06.700', text: 'sin editar nada a mano' },
  { id: 5, start: '00:06.750', end: '00:08.500', text: 'elige tu estilo favorito' },
  { id: 6, start: '00:08.550', end: '00:10.200', text: 'y aplícalo con un solo clic' },
  { id: 7, start: '00:10.250', end: '00:12.000', text: 'cada palabra se resalta sola' },
  { id: 8, start: '00:12.050', end: '00:13.800', text: 'igual que en tus creadores favoritos' },
  { id: 9, start: '00:13.850', end: '00:15.600', text: 'exporta en un par de segundos' },
  { id: 10, start: '00:15.650', end: '00:17.300', text: 'y sube directo a tus redes' },
  { id: 11, start: '00:17.350', end: '00:19.100', text: 'sin marcas de agua molestas' },
  { id: 12, start: '00:19.150', end: '00:20.900', text: 'guarda tu marca personal' },
  { id: 13, start: '00:20.950', end: '00:22.700', text: 'y reutilízala en cada video' },
  { id: 14, start: '00:22.750', end: '00:24.000', text: 'así de simple es crear contenido viral' }
];

const STYLE_LIBRARY = [
  { id: 'karaoke-pro', name: 'Karaoke Pro', font: 'Poppins', color: '#FFFFFF', highlight: '#FACC15', desc: 'Palabra activa en amarillo' },
  { id: 'mrbeast', name: 'MrBeast Style', font: 'Archivo Black', color: '#FFFFFF', highlight: '#FACC15', outline: true, desc: 'Grande, grueso, contorno negro' },
  { id: 'clean-creator', name: 'Clean Creator', font: 'Inter', color: '#FFFFFF', highlight: '#FFFFFF', desc: 'Minimalista, sin efectos' },
  { id: 'neon-energy', name: 'Neon Energy', font: 'Poppins', color: '#22D3EE', highlight: '#F472B6', glow: true, desc: 'Resplandor vibrante' },
  { id: 'luxury-minimal', name: 'Luxury Minimal', font: 'Playfair Display', color: '#F5F5F0', highlight: '#D4AF37', desc: 'Elegante y refinado' },
  { id: 'pop-bounce', name: 'Pop Bounce', font: 'Fredoka', color: '#FFFFFF', highlight: '#A78BFA', desc: 'Rebote en cada palabra' },
  { id: 'typewriter', name: 'Typewriter', font: 'Inter', color: '#FFFFFF', highlight: '#FFFFFF', desc: 'Aparición progresiva' },
  { id: 'highlight-box', name: 'Highlight Box', font: 'Poppins', color: '#FFFFFF', highlight: '#000000', bg: '#A78BFA', desc: 'Fondo en palabra activa' },
  { id: 'glitch-digital', name: 'Glitch Digital', font: 'Orbitron', color: '#22D3EE', highlight: '#F87171', desc: 'Interferencia digital' },
  { id: 'kinetic-bold', name: 'Kinetic Bold', font: 'Anton', color: '#FFFFFF', highlight: '#FACC15', desc: 'Movimiento dinámico' },
  { id: 'street-caption', name: 'Street Caption', font: 'Bebas Neue', color: '#FFFFFF', highlight: '#F87171', outline: true, desc: 'Estilo urbano, contorno grueso' },
  { id: 'podcast-viral', name: 'Podcast Viral', font: 'Inter', color: '#FFFFFF', highlight: '#22D3EE', desc: 'Grande y centrado' },
  { id: 'minimal-white', name: 'Minimal White', font: 'Inter', color: '#FFFFFF', highlight: '#FFFFFF', desc: 'Sombra suave' },
  { id: 'gradient-word', name: 'Gradient Word', font: 'Poppins', color: '#FFFFFF', highlight: '#A78BFA', gradient: true, desc: 'Degradado en palabras clave' },
  { id: 'comic-impact', name: 'Comic Impact', font: 'Bungee', color: '#FFFFFF', highlight: '#FACC15', desc: 'Animación elástica' },
  { id: 'luxury-gold', name: 'Luxury Gold', font: 'Playfair Display', color: '#D4AF37', highlight: '#FFF3C4', desc: 'Tonos dorados' },
  { id: 'red-alert', name: 'Red Alert', font: 'Archivo Black', color: '#FFFFFF', highlight: '#F87171', desc: 'Palabras clave en rojo' },
  { id: 'smooth-reveal', name: 'Smooth Reveal', font: 'Inter', color: '#FFFFFF', highlight: '#FFFFFF', desc: 'Aparición suave' },
  { id: 'zoom-emphasis', name: 'Zoom Emphasis', font: 'Poppins', color: '#FFFFFF', highlight: '#22D3EE', desc: 'Palabras clave más grandes' },
  { id: 'social-pop', name: 'Social Pop', font: 'Fredoka', color: '#FFFFFF', highlight: '#F472B6', desc: 'Colores y rebotes' }
];

const ANIMATION_GROUPS = [
  { title: 'Entrada', items: ['Pop', 'Bounce', 'Slide up', 'Zoom', 'Typewriter', 'Word by word', 'Elastic', 'Blur to sharp'] },
  { title: 'Énfasis', items: ['Karaoke', 'Highlight', 'Shake', 'Glitch', 'Dynamic emphasis', 'Smooth reveal'] },
  { title: 'Salida', items: ['Slide down', 'Fade out', 'Shrink'] }
];

const EFFECTS_LIST = ['Sombra', 'Contorno', 'Resplandor', 'Fondo de texto', 'Caja de texto', 'Degradado', 'Desenfoque', 'Rotación', 'Escala', 'Espaciado'];

const FONT_LIBRARY = {
  'Bold / Viral': ['Anton', 'Bebas Neue', 'Impact', 'Oswald', 'Archivo Black', 'Barlow Condensed', 'League Spartan', 'Montserrat ExtraBold'],
  'Modern / Clean': ['Inter', 'Poppins', 'Manrope', 'DM Sans', 'Plus Jakarta Sans', 'Sora', 'Space Grotesk'],
  'Premium / Editorial': ['Playfair Display', 'Cormorant Garamond', 'Fraunces', 'Libre Baskerville'],
  'Fun / Creative': ['Baloo 2', 'Fredoka', 'Bungee', 'Luckiest Guy', 'Lilita One'],
  'Tech / Futuristic': ['Orbitron', 'Exo 2', 'Rajdhani', 'Audiowide']
};

const TEMPLATES = [
  { name: 'Podcast', tag: 'Voz y opinión', style: 'podcast-viral' },
  { name: 'Motivación', tag: 'Frases de impacto', style: 'kinetic-bold' },
  { name: 'Marketing digital', tag: 'Ventas y ofertas', style: 'highlight-box' },
  { name: 'Educación', tag: 'Explicativo', style: 'clean-creator' },
  { name: 'Storytelling', tag: 'Narrativa', style: 'smooth-reveal' },
  { name: 'Gaming', tag: 'Alta energía', style: 'glitch-digital' },
  { name: 'Fitness', tag: 'Motivador', style: 'red-alert' },
  { name: 'Noticias', tag: 'Informativo', style: 'minimal-white' },
  { name: 'Lifestyle', tag: 'Cotidiano', style: 'luxury-minimal' },
  { name: 'Business', tag: 'Corporativo', style: 'luxury-gold' },
  { name: 'UGC', tag: 'Auténtico', style: 'mrbeast' },
  { name: 'Faceless videos', tag: 'Solo texto', style: 'gradient-word' }
];

const DEMO_PROJECTS = [
  { name: 'Reel — Rutina de mañana', sub: 'Editado hace 2h', style: 'karaoke-pro', caption: 'RUTINA DE 5AM' },
  { name: 'Podcast clip #12', sub: 'Editado ayer', style: 'podcast-viral', caption: 'ESTO CAMBIÓ TODO' },
  { name: 'Promo Black Friday', sub: 'Editado hace 3 días', style: 'highlight-box', caption: '70% DE DESCUENTO' },
  { name: 'Consejos de trading', sub: 'Editado hace 5 días', style: 'gradient-word', caption: 'NUNCA HAGAS ESTO' },
  { name: 'Storytime viral', sub: 'Editado hace 1 semana', style: 'smooth-reveal', caption: 'NO VAS A CREER ESTO' },
  { name: 'Gym motivation', sub: 'Editado hace 2 semanas', style: 'red-alert', caption: 'SIN EXCUSAS HOY' }
];

const EXPORT_HISTORY = [
  { name: 'Reel — Rutina de mañana', sub: '1080p · MP4 · 30fps', status: 'done' },
  { name: 'Podcast clip #12', sub: '4K · MP4 · 60fps', status: 'done' },
  { name: 'Promo Black Friday', sub: '1080p · MP4 · 30fps', status: 'processing' },
  { name: 'Consejos de trading', sub: '720p · MP4 · 24fps', status: 'done' }
];

/* ---------------------------------------------------------------------- */
/* 2. ESTADO CENTRAL                                                       */
/* ---------------------------------------------------------------------- */

const state = {
  currentView: 'editor',
  activeTool: 'captions',
  activeProp: 'text',
  transcript: JSON.parse(JSON.stringify(DEMO_TRANSCRIPT)),
  selectedCaptionId: 1,
  currentStyle: 'karaoke-pro',
  favoriteFonts: new Set(['Poppins', 'Anton', 'Space Grotesk']),
  activeFontCategory: 'Bold / Viral',
  zoom: 100,
  captionsVisible: true,
  safeZoneVisible: true,
  sidebarCollapsed: false,
  history: [],
  redoStack: []
};

/* ---------------------------------------------------------------------- */
/* 3. UTILIDADES                                                          */
/* ---------------------------------------------------------------------- */

function $(sel, root=document){ return root.querySelector(sel); }
function $all(sel, root=document){ return [...root.querySelectorAll(sel)]; }

function showToast(message, type='info'){
  const container = $('#toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const iconName = type === 'success' ? 'check' : type === 'error' ? 'x' : 'info';
  toast.innerHTML = `<i>${svgIcon(iconName)}</i><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(6px)';
    toast.style.transition = 'all .2s ease';
    setTimeout(() => toast.remove(), 220);
  }, 2600);
}

function markUnsaved(){
  const status = $('#saveStatus');
  status.classList.add('saving');
  status.innerHTML = `<i class="icon-dot"></i>Guardando…`;
  clearTimeout(markUnsaved._t);
  markUnsaved._t = setTimeout(() => {
    status.classList.remove('saving');
    status.innerHTML = `<i class="icon-dot"></i>Guardado`;
  }, 900);
}

let confirmCallback = null;
function askConfirm(title, body, onConfirm){
  $('#confirmModalTitle').textContent = title;
  $('#confirmModalBody').textContent = body;
  confirmCallback = onConfirm;
  $('#confirmModalOverlay').classList.add('open');
}

/* ---------------------------------------------------------------------- */
/* 4. NAVEGACIÓN ENTRE VISTAS                                             */
/* ---------------------------------------------------------------------- */

function setView(view){
  state.currentView = view;
  $all('.nav-item').forEach(el => el.classList.toggle('active', el.dataset.view === view));
  $all('.view').forEach(el => el.classList.toggle('active', el.dataset.viewPanel === view));
  $('#sidebar').classList.remove('mobile-open');
}

function initNav(){
  $all('.nav-item').forEach(btn => btn.addEventListener('click', () => setView(btn.dataset.view)));
  $('#collapseToggle').addEventListener('click', () => {
    state.sidebarCollapsed = !state.sidebarCollapsed;
    $('#sidebar').classList.toggle('collapsed', state.sidebarCollapsed);
  });
  $('#mobileMenuBtn').addEventListener('click', () => $('#sidebar').classList.toggle('mobile-open'));
  $('#newProjectUploadBtn').addEventListener('click', () => { setView('editor'); $('#videoFileInput').click(); });
}

/* ---------------------------------------------------------------------- */
/* 5. TOPBAR: undo/redo, nombre de proyecto, preview                      */
/* ---------------------------------------------------------------------- */

function initTopbar(){
  $('#projectNameInput').addEventListener('input', markUnsaved);
  $('#undoBtn').addEventListener('click', () => showToast('Se deshizo el último cambio', 'info'));
  $('#redoBtn').addEventListener('click', () => showToast('Cambio rehecho', 'info'));
  $('#previewBtn').addEventListener('click', () => {
    const stage = $('#stage');
    stage.requestFullscreen ? stage.requestFullscreen().catch(()=>{}) : null;
    showToast('Reproduciendo vista previa', 'info');
  });
  $('#exportBtn').addEventListener('click', openExportModal);
  document.addEventListener('keydown', (e) => {
    if((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z'){
      e.preventDefault();
      showToast(e.shiftKey ? 'Cambio rehecho' : 'Se deshizo el último cambio', 'info');
    }
    if((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's'){
      e.preventDefault(); markUnsaved();
    }
  });
}

/* ---------------------------------------------------------------------- */
/* 6. HERRAMIENTAS (panel izquierdo)                                      */
/* ---------------------------------------------------------------------- */

function initToolTabs(){
  $all('.tool-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      state.activeTool = tab.dataset.tool;
      $all('.tool-tab').forEach(t => t.classList.toggle('active', t === tab));
      $all('.tool-pane').forEach(p => p.classList.toggle('active', p.dataset.toolPane === tab.dataset.tool));
    });
  });
}

function renderCaptionList(){
  const list = $('#captionList');
  list.innerHTML = state.transcript.map(row => `
    <div class="caption-row ${row.id === state.selectedCaptionId ? 'selected' : ''}" data-id="${row.id}">
      <div class="caption-row-top">
        <span class="caption-time">${row.start} → ${row.end}</span>
        <div class="caption-row-actions">
          <button data-action="split" title="Dividir">${svgIcon('scissors')}</button>
          <button data-action="duplicate" title="Duplicar">${svgIcon('copy')}</button>
          <button data-action="delete" title="Eliminar">${svgIcon('trash')}</button>
        </div>
      </div>
      <textarea class="caption-text" rows="1" data-id="${row.id}">${row.text}</textarea>
    </div>
  `).join('');
  $('#captionCount').textContent = `${state.transcript.length} líneas`;

  $all('.caption-row', list).forEach(row => {
    row.addEventListener('click', (e) => {
      if(e.target.closest('button')) return;
      state.selectedCaptionId = Number(row.dataset.id);
      renderCaptionList();
      const cap = state.transcript.find(c => c.id === state.selectedCaptionId);
      if(cap) updateStageCaptionText(cap.text);
    });
  });
  $all('.caption-text', list).forEach(ta => {
    ta.addEventListener('input', () => {
      const row = state.transcript.find(c => c.id === Number(ta.dataset.id));
      if(row){ row.text = ta.value; markUnsaved(); if(row.id === state.selectedCaptionId) updateStageCaptionText(row.text); }
    });
  });
  $all('[data-action="delete"]', list).forEach(btn => {
    btn.addEventListener('click', () => {
      const id = Number(btn.closest('.caption-row').dataset.id);
      askConfirm('¿Eliminar este subtítulo?', 'Esta línea se eliminará de la transcripción.', () => {
        state.transcript = state.transcript.filter(c => c.id !== id);
        renderCaptionList();
        showToast('Subtítulo eliminado', 'success');
      });
    });
  });
  $all('[data-action="duplicate"]', list).forEach(btn => {
    btn.addEventListener('click', () => {
      const id = Number(btn.closest('.caption-row').dataset.id);
      const row = state.transcript.find(c => c.id === id);
      const newId = Math.max(...state.transcript.map(c => c.id)) + 1;
      const idx = state.transcript.findIndex(c => c.id === id);
      state.transcript.splice(idx + 1, 0, { ...row, id: newId });
      renderCaptionList();
      showToast('Subtítulo duplicado', 'success');
    });
  });
  $all('[data-action="split"]', list).forEach(btn => {
    btn.addEventListener('click', () => {
      const id = Number(btn.closest('.caption-row').dataset.id);
      const row = state.transcript.find(c => c.id === id);
      const words = row.text.split(' ');
      if(words.length < 2){ showToast('No hay suficientes palabras para dividir', 'error'); return; }
      const mid = Math.ceil(words.length / 2);
      const first = words.slice(0, mid).join(' ');
      const second = words.slice(mid).join(' ');
      const newId = Math.max(...state.transcript.map(c => c.id)) + 1;
      row.text = first;
      const idx = state.transcript.findIndex(c => c.id === id);
      state.transcript.splice(idx + 1, 0, { id: newId, start: row.end, end: row.end, text: second });
      renderCaptionList();
      showToast('Frase dividida en dos', 'success');
    });
  });
}

function renderStyleGallery(){
  const render = (containerId, full) => {
    const el = $(containerId);
    if(!el) return;
    el.innerHTML = STYLE_LIBRARY.map(style => `
      <div class="style-card ${style.id === state.currentStyle ? 'selected' : ''}" data-style="${style.id}">
        <div class="style-thumb">
          <span class="style-thumb-text" style="font-family:'${style.font}'; color:${style.color}; font-size:${full ? '17px':'14px'}; ${style.outline ? '-webkit-text-stroke:1.5px #000;' : ''} ${style.glow ? `text-shadow:0 0 10px ${style.highlight};` : ''}">
            ${style.name.split(' ')[0]}<br><span style="color:${style.highlight}">${style.desc.split(' ')[0]}</span>
          </span>
        </div>
        <div class="style-info">
          <span class="style-name">${style.name}</span>
          <button class="style-apply" data-apply="${style.id}" title="Aplicar estilo">${svgIcon('check')}</button>
        </div>
      </div>
    `).join('');
    $all('[data-apply]', el).forEach(btn => {
      btn.addEventListener('click', () => applyStyle(btn.dataset.apply));
    });
    $all('.style-card', el).forEach(card => {
      card.addEventListener('click', (e) => {
        if(e.target.closest('button')) return;
        applyStyle(card.dataset.style);
      });
    });
  };
  render('#styleGallery', false);
  render('#styleGalleryFull', true);
}

function applyStyle(styleId){
  const style = STYLE_LIBRARY.find(s => s.id === styleId);
  if(!style) return;
  state.currentStyle = styleId;
  const cap = $('#stageCaption');
  cap.style.fontFamily = `'${style.font}'`;
  cap.style.color = style.color;
  $all('.cap-word', cap).forEach((w, i) => { if(w.dataset.active === 'true') w.style.color = style.highlight; else w.style.color = style.color; });
  if(style.outline){ cap.style.webkitTextStroke = '1.5px #000'; } else { cap.style.webkitTextStroke = '0px transparent'; }
  cap.style.textShadow = style.glow ? `0 0 16px ${style.highlight}, 0 3px 10px rgba(0,0,0,.5)` : '0 3px 10px rgba(0,0,0,.5)';
  $('#currentFontLabel').textContent = style.font;
  $('#currentFontLabel').style.fontFamily = `'${style.font}'`;
  $('#highlightColorInput').value = style.highlight;
  $('#highlightColorHex').value = style.highlight.toUpperCase();
  renderStyleGallery();
  markUnsaved();
  showToast(`Estilo "${style.name}" aplicado`, 'success');
}

function renderAnimGroups(){
  const el = $('#animGroups');
  el.innerHTML = ANIMATION_GROUPS.map(group => `
    <div class="anim-group">
      <p class="anim-group-title">${group.title}</p>
      <div class="anim-chip-grid">
        ${group.items.map(name => `
          <button class="anim-chip" data-anim="${name}">
            <span class="anim-chip-preview">${name}</span>
          </button>
        `).join('')}
      </div>
    </div>
  `).join('');
  $all('.anim-chip', el).forEach(chip => {
    chip.addEventListener('click', () => {
      $all('.anim-chip', el).forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      playCaptionPreviewAnimation(chip.dataset.anim);
      markUnsaved();
    });
  });
}

function renderEffects(){
  const el = $('#effectsGrid');
  el.innerHTML = EFFECTS_LIST.map(name => `<button class="effect-chip" data-effect="${name}"><span>${name}</span></button>`).join('');
  $all('.effect-chip', el).forEach(chip => {
    chip.addEventListener('click', () => {
      chip.classList.toggle('active');
      markUnsaved();
      showToast(`${chip.classList.contains('active') ? 'Efecto activado' : 'Efecto desactivado'}: ${chip.dataset.effect}`, 'info');
    });
  });
}

function playCaptionPreviewAnimation(name){
  const cap = $('#stageCaption');
  cap.style.animation = 'none';
  void cap.offsetWidth;
  const map = {
    'Pop': 'capPop .35s ease', 'Bounce': 'capBounce .5s ease', 'Slide up': 'capSlideUp .35s ease',
    'Zoom': 'capZoom .35s ease', 'Shake': 'capShake .4s ease', 'Elastic': 'capBounce .6s ease'
  };
  cap.style.animation = map[name] || 'capPop .35s ease';
}

function updateStageCaptionText(text){
  const cap = $('#stageCaption');
  const words = text.trim().split(/\s+/);
  cap.innerHTML = words.map((w, i) => `<span class="cap-word" data-active="${i === 0}">${w}</span>`).join('');
  applyStyle(state.currentStyle);
}

/* Inject small keyframes used by animation previews */
(function injectAnimKeyframes(){
  const style = document.createElement('style');
  style.textContent = `
    @keyframes capPop{0%{transform:translate(-50%,-50%) scale(0.7);opacity:0;}100%{transform:translate(-50%,-50%) scale(1);opacity:1;}}
    @keyframes capBounce{0%{transform:translate(-50%,-50%) scale(0.6);}60%{transform:translate(-50%,-50%) scale(1.12);}100%{transform:translate(-50%,-50%) scale(1);}}
    @keyframes capSlideUp{0%{transform:translate(-50%,-30%);opacity:0;}100%{transform:translate(-50%,-50%);opacity:1;}}
    @keyframes capZoom{0%{transform:translate(-50%,-50%) scale(1.8);opacity:0;}100%{transform:translate(-50%,-50%) scale(1);opacity:1;}}
    @keyframes capShake{0%,100%{transform:translate(-50%,-50%);}25%{transform:translate(-52%,-50%);}75%{transform:translate(-48%,-50%);}}
  `;
  document.head.appendChild(style);
})();

/* ---------------------------------------------------------------------- */
/* 7. PANEL DE PROPIEDADES (derecha)                                      */
/* ---------------------------------------------------------------------- */

function initPropTabs(){
  $all('.prop-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      state.activeProp = tab.dataset.prop;
      $all('.prop-tab').forEach(t => t.classList.toggle('active', t === tab));
      $all('.prop-pane').forEach(p => p.classList.toggle('active', p.dataset.propPane === tab.dataset.prop));
    });
  });
}

function bindRange(id, valueId, formatter, onInput){
  const range = $(id); const label = valueId ? $(valueId) : null;
  range.addEventListener('input', () => {
    if(label) label.textContent = formatter ? formatter(range.value) : range.value;
    onInput && onInput(range.value);
    markUnsaved();
  });
}

function initPropertyControls(){
  const cap = () => $('#stageCaption');

  bindRange('#fontSizeRange', '#fontSizeValue', v => `${v}px`, v => cap().style.fontSize = `${v}px`);
  bindRange('#letterSpacingRange', '#letterSpacingValue', v => `${v}px`, v => cap().style.letterSpacing = `${v}px`);
  bindRange('#lineHeightRange', '#lineHeightValue', v => (v/100).toFixed(2), v => cap().style.lineHeight = (v/100));
  bindRange('#posXRange', '#posXValue', v => `${v}%`, v => cap().style.left = `${v}%`);
  bindRange('#posYRange', '#posYValue', v => `${v}%`, v => cap().style.top = `${v}%`);
  bindRange('#outlineWidthRange', '#outlineWidthValue', v => `${v}px`, v => cap().style.webkitTextStroke = `${v}px ${$('#outlineColorInput').value}`);
  bindRange('#shadowRange', '#shadowValue', v => `${v}%`, v => cap().style.textShadow = `0 3px 10px rgba(0,0,0,${v/100})`);
  bindRange('#opacityRange', '#opacityValue', v => `${v}%`, v => cap().style.opacity = v/100);
  bindRange('#bgRadiusRange', '#bgRadiusValue', v => `${v}px`, v => cap().style.setProperty('--bg-radius', `${v}px`));
  bindRange('#animSpeedRange', '#animSpeedValue', v => `${(v/100).toFixed(1)}x`);
  bindRange('#animIntensityRange', '#animIntensityValue', v => `${v}%`);
  bindRange('#animBounceRange', '#animBounceValue', v => `${v}%`);
  bindRange('#animDurationRange', '#animDurationValue', v => `${(v/100).toFixed(2)}s`);
  bindRange('#readingSpeedRange', '#readingSpeedValue', v => `${v} cps`);
  bindRange('#maxWordsRange', '#maxWordsValue', v => v);

  $('#fontWeightSelect').addEventListener('change', () => { cap().style.fontWeight = $('#fontWeightSelect').value; markUnsaved(); });

  $('#textColorInput').addEventListener('input', () => {
    $('#textColorHex').value = $('#textColorInput').value.toUpperCase();
    cap().style.color = $('#textColorInput').value;
    markUnsaved();
  });
  $('#highlightColorInput').addEventListener('input', () => {
    $('#highlightColorHex').value = $('#highlightColorInput').value.toUpperCase();
    const active = cap().querySelector('[data-active="true"]');
    if(active) active.style.color = $('#highlightColorInput').value;
    markUnsaved();
  });

  $all('.segmented-btn[data-align]').forEach(btn => {
    btn.addEventListener('click', () => {
      $all('.segmented-btn[data-align]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      cap().style.justifyContent = { left:'flex-start', center:'center', right:'flex-end' }[btn.dataset.align];
      markUnsaved();
    });
  });
  $all('.segmented-btn[data-case]').forEach(btn => {
    btn.addEventListener('click', () => {
      $all('.segmented-btn[data-case]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      cap().style.textTransform = { none:'none', upper:'uppercase', lower:'lowercase' }[btn.dataset.case];
      markUnsaved();
    });
  });

  $('#bgToggle').addEventListener('change', () => {
    $('#bgControls').setAttribute('data-disabled', String(!$('#bgToggle').checked));
    if($('#bgToggle').checked){
      cap().style.background = $('#bgColorInput').value;
      cap().style.padding = '6px 14px';
      cap().style.borderRadius = $('#bgRadiusRange').value + 'px';
    } else {
      cap().style.background = 'transparent';
      cap().style.padding = '0';
    }
    markUnsaved();
  });
  $('#bgColorInput').addEventListener('input', () => { if($('#bgToggle').checked) cap().style.background = $('#bgColorInput').value; markUnsaved(); });

  $('#animInSelect').addEventListener('change', () => { playCaptionPreviewAnimation(capitalize($('#animInSelect').value)); markUnsaved(); });
}

function capitalize(s){ return s.charAt(0).toUpperCase() + s.slice(1); }

/* ---------------------------------------------------------------------- */
/* 8. STAGE (previsualización), transporte, drag & drop de texto/video     */
/* ---------------------------------------------------------------------- */

function initStage(){
  const stageEmpty = $('#stageEmpty');
  const videoInput = $('#videoFileInput');
  const videoEl = $('#videoEl');

  $('#uploadVideoBtn').addEventListener('click', () => videoInput.click());
  videoInput.addEventListener('change', () => {
    const file = videoInput.files[0];
    if(!file) return;
    const url = URL.createObjectURL(file);
    videoEl.src = url;
    videoEl.style.display = 'block';
    stageEmpty.classList.add('hidden');
    showToast('Video cargado correctamente', 'success');
    markUnsaved();
  });

  const stage = $('#stage');
  ['dragover','dragenter'].forEach(evt => stage.addEventListener(evt, e => { e.preventDefault(); stage.style.outline = `2px dashed var(--accent)`; }));
  ['dragleave','drop'].forEach(evt => stage.addEventListener(evt, e => { e.preventDefault(); stage.style.outline = 'none'; }));
  stage.addEventListener('drop', e => {
    const file = e.dataTransfer.files[0];
    if(file && file.type.startsWith('video/')){
      const url = URL.createObjectURL(file);
      videoEl.src = url; videoEl.style.display = 'block';
      stageEmpty.classList.add('hidden');
      showToast('Video cargado correctamente', 'success');
      markUnsaved();
    }
  });

  $('#hideCaptionsBtn').addEventListener('click', () => {
    state.captionsVisible = !state.captionsVisible;
    $('#stageCaption').classList.toggle('hidden', !state.captionsVisible);
    $('#hideCaptionsBtn').setAttribute('data-active', String(state.captionsVisible));
  });
  $('#safeZoneBtn').addEventListener('click', () => {
    state.safeZoneVisible = !state.safeZoneVisible;
    $('#stageSafezone').classList.toggle('hidden', !state.safeZoneVisible);
    $('#safeZoneBtn').setAttribute('data-active', String(state.safeZoneVisible));
  });
  $('#safeZoneBtn').setAttribute('data-active', 'true');
  $('#hideCaptionsBtn').setAttribute('data-active', 'true');

  $all('.platform-tag').forEach(tag => {
    tag.addEventListener('click', () => {
      $all('.platform-tag').forEach(t => t.classList.remove('active'));
      tag.classList.add('active');
    });
  });

  $('#zoomInBtn').addEventListener('click', () => setZoom(state.zoom + 10));
  $('#zoomOutBtn').addEventListener('click', () => setZoom(state.zoom - 10));
  function setZoom(z){
    state.zoom = Math.max(50, Math.min(150, z));
    $('#zoomLevel').textContent = `${state.zoom}%`;
    $('#stage').style.width = `min(${300 * state.zoom / 100}px, 100%)`;
  }

  // Transport (demo — no real media required to feel functional)
  let playing = false; let fakeTime = 0; const total = 24;
  const playBtn = $('#playBtn'); const scrub = $('#transportScrub'); const timeLabel = $('#transportTime');
  function fmt(t){ const m = String(Math.floor(t/60)).padStart(2,'0'); const s = String(Math.floor(t%60)).padStart(2,'0'); return `${m}:${s}`; }
  function updateTimeUI(){ timeLabel.textContent = `${fmt(fakeTime)} / ${fmt(total)}`; scrub.value = (fakeTime/total)*100; }
  updateTimeUI();
  playBtn.addEventListener('click', () => {
    playing = !playing;
    playBtn.innerHTML = playing ? svgIcon('pause2') : svgIcon('play');
    if(videoEl.src){ playing ? videoEl.play().catch(()=>{}) : videoEl.pause(); }
    if(playing) tick();
  });
  function tick(){
    if(!playing) return;
    fakeTime += 0.2;
    if(fakeTime >= total){ fakeTime = 0; }
    updateTimeUI();
    setTimeout(tick, 200);
  }
  scrub.addEventListener('input', () => { fakeTime = (scrub.value/100)*total; updateTimeUI(); });
  $('#restartBtn').addEventListener('click', () => { fakeTime = 0; updateTimeUI(); if(videoEl.src) videoEl.currentTime = 0; });

  // Draggable caption inside stage
  let dragging = false; let offsetX = 0, offsetY = 0;
  const capEl = $('#stageCaption');
  capEl.addEventListener('mousedown', (e) => {
    dragging = true; capEl.style.cursor = 'grabbing';
    const rect = stage.getBoundingClientRect();
    offsetX = e.clientX - rect.left; offsetY = e.clientY - rect.top;
  });
  window.addEventListener('mousemove', (e) => {
    if(!dragging) return;
    const rect = stage.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left)/rect.width)*100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top)/rect.height)*100));
    capEl.style.left = `${x}%`; capEl.style.top = `${y}%`;
    $('#posXRange').value = Math.round(x); $('#posXValue').textContent = `${Math.round(x)}%`;
    $('#posYRange').value = Math.round(y); $('#posYValue').textContent = `${Math.round(y)}%`;
  });
  window.addEventListener('mouseup', () => { if(dragging){ dragging = false; capEl.style.cursor = 'grab'; markUnsaved(); } });
}

/* ---------------------------------------------------------------------- */
/* 9. FUENTES — modal Font Library                                        */
/* ---------------------------------------------------------------------- */

function initFontModal(){
  $('#fontPickerTrigger').addEventListener('click', () => {
    renderFontCategories(); renderFontList(state.activeFontCategory);
    $('#fontModalOverlay').classList.add('open');
  });
  $('#closeFontModal').addEventListener('click', () => $('#fontModalOverlay').classList.remove('open'));
  $('#fontModalOverlay').addEventListener('click', (e) => { if(e.target.id === 'fontModalOverlay') $('#fontModalOverlay').classList.remove('open'); });
  $('#fontModalSearch').addEventListener('input', () => {
    const q = $('#fontModalSearch').value.toLowerCase();
    const all = Object.values(FONT_LIBRARY).flat().filter(f => f.toLowerCase().includes(q));
    renderFontList(null, all);
  });
}

function renderFontCategories(){
  const el = $('#fontCategories');
  el.innerHTML = Object.keys(FONT_LIBRARY).map(cat => `<button class="font-cat-chip ${cat === state.activeFontCategory ? 'active':''}" data-cat="${cat}">${cat}</button>`).join('');
  $all('.font-cat-chip', el).forEach(chip => {
    chip.addEventListener('click', () => {
      state.activeFontCategory = chip.dataset.cat;
      renderFontCategories();
      renderFontList(chip.dataset.cat);
    });
  });
}

function renderFontList(category, customList){
  const el = $('#fontModalList');
  const fonts = customList || FONT_LIBRARY[category] || [];
  el.innerHTML = fonts.map(font => `
    <div class="font-list-item">
      <span class="font-list-item-name" style="font-family:'${font}'">${font}</span>
      <div class="font-list-item-actions">
        <button class="font-fav-btn ${state.favoriteFonts.has(font) ? 'active':''}" data-fav="${font}">${svgIcon('star')}</button>
        <button class="btn btn-ghost" data-apply-font="${font}" style="padding:6px 10px; font-size:11.5px;">Aplicar</button>
      </div>
    </div>
  `).join('');
  $all('[data-fav]', el).forEach(btn => {
    btn.addEventListener('click', () => {
      const font = btn.dataset.fav;
      state.favoriteFonts.has(font) ? state.favoriteFonts.delete(font) : state.favoriteFonts.add(font);
      btn.classList.toggle('active');
    });
  });
  $all('[data-apply-font]', el).forEach(btn => {
    btn.addEventListener('click', () => {
      const font = btn.dataset.applyFont;
      $('#stageCaption').style.fontFamily = `'${font}'`;
      $('#currentFontLabel').textContent = font;
      $('#currentFontLabel').style.fontFamily = `'${font}'`;
      $('#fontModalOverlay').classList.remove('open');
      markUnsaved();
      showToast(`Fuente "${font}" aplicada`, 'success');
    });
  });
}

/* ---------------------------------------------------------------------- */
/* 10. EXPORTACIÓN                                                        */
/* ---------------------------------------------------------------------- */

function openExportModal(){
  $('#exportModalBody').hidden = false;
  $('#exportProgressBody').hidden = true;
  $('#exportModalOverlay').querySelector('.modal-footer').hidden = false;
  $('#exportModalOverlay').classList.add('open');
}
function initExportModal(){
  $('#closeExportModal').addEventListener('click', () => $('#exportModalOverlay').classList.remove('open'));
  $('#cancelExportBtn').addEventListener('click', () => $('#exportModalOverlay').classList.remove('open'));
  $('#exportModalOverlay').addEventListener('click', (e) => { if(e.target.id === 'exportModalOverlay') $('#exportModalOverlay').classList.remove('open'); });

  $all('#resSegmented .segmented-btn').forEach(btn => {
    btn.addEventListener('click', () => { $all('#resSegmented .segmented-btn').forEach(b=>b.classList.remove('active')); btn.classList.add('active'); });
  });
  const qualityLabels = ['Baja', 'Alta', 'Máxima'];
  $('#qualityRange').addEventListener('input', () => $('#qualityValue').textContent = qualityLabels[$('#qualityRange').value]);

  $('#startExportBtn').addEventListener('click', () => {
    $('#exportModalBody').hidden = true;
    $('#exportProgressBody').hidden = false;
    $('#exportModalOverlay').querySelector('.modal-footer').hidden = true;
    runFakeExportProgress();
  });
}

function runFakeExportProgress(){
  // NOTA: la exportación real requiere un backend con FFmpeg o un servicio de
  // renderizado en la nube. Aquí simulamos el progreso para la demo.
  const ring = $('#progressRingFg');
  const label = $('#progressRingLabel');
  const statusText = $('#exportStatusText');
  const circumference = 2 * Math.PI * 52;
  const steps = [
    [10, 'Preparando fotogramas…'], [35, 'Aplicando estilo de subtítulos…'],
    [60, 'Renderizando animaciones…'], [85, 'Codificando video final…'], [100, '¡Listo!']
  ];
  let i = 0;
  function step(){
    if(i >= steps.length){
      showToast('Video exportado correctamente', 'success');
      setTimeout(() => $('#exportModalOverlay').classList.remove('open'), 600);
      return;
    }
    const [pct, text] = steps[i];
    ring.style.strokeDashoffset = circumference - (circumference * pct / 100);
    label.textContent = `${pct}%`;
    statusText.textContent = text;
    i++;
    setTimeout(step, 550);
  }
  step();
}

/* ---------------------------------------------------------------------- */
/* 11. CONFIRM MODAL genérico                                             */
/* ---------------------------------------------------------------------- */

function initConfirmModal(){
  $('#confirmModalCancel').addEventListener('click', () => $('#confirmModalOverlay').classList.remove('open'));
  $('#confirmModalOk').addEventListener('click', () => {
    if(confirmCallback) confirmCallback();
    $('#confirmModalOverlay').classList.remove('open');
  });
}

/* ---------------------------------------------------------------------- */
/* 12. VISTAS ESTÁTICAS: dashboard, proyectos, plantillas, historial       */
/* ---------------------------------------------------------------------- */

function renderProjectCard(p){
  const style = STYLE_LIBRARY.find(s => s.id === p.style) || STYLE_LIBRARY[0];
  return `
    <div class="project-card">
      <div class="project-thumb">
        <span class="thumb-caption" style="font-family:'${style.font}'; color:${style.color};">${p.caption}</span>
      </div>
      <div class="project-meta">
        <span class="p-name">${p.name}</span>
        <span class="p-sub">${p.sub}</span>
      </div>
    </div>`;
}

function renderStaticViews(){
  $('#dashboardProjects').innerHTML = DEMO_PROJECTS.slice(0, 4).map(renderProjectCard).join('');
  $('#projectsGridFull').innerHTML = DEMO_PROJECTS.map(renderProjectCard).join('');

  $('#templateGrid').innerHTML = TEMPLATES.map(t => {
    const style = STYLE_LIBRARY.find(s => s.id === t.style);
    return `
      <div class="template-card">
        <div class="project-thumb">
          <span class="thumb-caption" style="font-family:'${style.font}'; color:${style.color};">${t.name.toUpperCase()}</span>
        </div>
        <div class="project-meta">
          <span class="p-name">${t.name}</span>
          <span class="p-sub">${t.tag}</span>
        </div>
      </div>`;
  }).join('');

  $('#exportHistoryList').innerHTML = EXPORT_HISTORY.map(h => `
    <div class="history-row">
      <div class="h-thumb"></div>
      <div class="h-info"><span class="h-name">${h.name}</span><span class="h-sub">${h.sub}</span></div>
      <span class="status-badge ${h.status}">${h.status === 'done' ? 'Completado' : 'Procesando'}</span>
      <button class="icon-btn" title="Descargar">${svgIcon('download')}</button>
    </div>
  `).join('');

  $all('.template-card').forEach((card, i) => {
    card.addEventListener('click', () => {
      applyStyle(TEMPLATES[i].style);
      setView('editor');
      showToast(`Plantilla "${TEMPLATES[i].name}" aplicada`, 'success');
    });
  });
}

/* ---------------------------------------------------------------------- */
/* 13. IA — FUNCIONES SIMULADAS
   Todas estas funciones usan datos de demostración. Para producción,
   sustituir el cuerpo de cada función por una llamada real a la API
   correspondiente (transcripción, NLP, traducción, etc.) manteniendo
   la misma firma para no romper el resto de la interfaz.
   ---------------------------------------------------------------------- */

const AI = {
  // TODO: conectar con una API real de transcripción (ej. Whisper / AssemblyAI)
  generateTranscript(videoFile){
    return new Promise(resolve => setTimeout(() => resolve(DEMO_TRANSCRIPT), 1400));
  },

  // TODO: conectar con un modelo de generación de subtítulos dinámicos
  generateCaptions(transcript){
    return new Promise(resolve => setTimeout(() => resolve(transcript), 900));
  },

  // TODO: conectar con un modelo de NLP para extracción de palabras clave
  detectKeywords(transcript){
    const words = transcript.flatMap(t => t.text.split(' '));
    const keywords = [...new Set(words.filter(w => w.length > 6))].slice(0, 6);
    return new Promise(resolve => setTimeout(() => resolve(keywords), 700));
  },

  // TODO: conectar con una API de traducción real (ej. DeepL / Google Translate)
  translateCaptions(transcript, targetLang){
    return new Promise(resolve => setTimeout(() => resolve(transcript), 1100));
  },

  // TODO: conectar con un modelo de análisis de video para detectar momentos clave
  analyzeVideo(videoFile){
    return new Promise(resolve => setTimeout(() => resolve({
      highlights: ['00:03 — pico de energía', '00:11 — posible hook', '00:19 — cierre fuerte'],
      suggestedTitle: 'ESTO CAMBIARÁ TU RUTINA'
    }), 1300));
  }
};

function initAiGenerate(){
  $('#generateAiBtn').addEventListener('click', async () => {
    const btn = $('#generateAiBtn');
    btn.classList.add('is-loading');
    btn.innerHTML = `<i class="icon-sparkles"></i><span>Generando subtítulos…</span>`;
    $('#captionList').innerHTML = Array(5).fill('<div class="skeleton-row"></div>').join('');

    const transcript = await AI.generateTranscript();
    state.transcript = JSON.parse(JSON.stringify(transcript));
    renderCaptionList();

    btn.classList.remove('is-loading');
    btn.innerHTML = `<i class="icon-sparkles"></i><span>Generar con IA</span>`;
    showToast('Subtítulos generados con IA (demo)', 'success');
    markUnsaved();
  });

  $('#importSrtBtn').addEventListener('click', () => showToast('Selecciona un archivo .srt para importar', 'info'));
  $('#importVttBtn').addEventListener('click', () => showToast('Selecciona un archivo .vtt para importar', 'info'));

  $all('.tool-action').forEach(btn => {
    btn.addEventListener('click', async () => {
      const action = btn.dataset.action;
      const originalHTML = btn.innerHTML;
      btn.innerHTML = `<span>Procesando…</span>`;
      if(action === 'detect-pauses'){
        await AI.generateCaptions(state.transcript);
        showToast('Pausas detectadas y marcadas', 'success');
      } else if(action === 'split-sentences'){
        showToast('Frases largas divididas automáticamente', 'success');
      } else if(action === 'sync-adjust'){
        showToast('Sincronización ajustada con el audio', 'success');
      } else if(action === 'dedupe-words'){
        showToast('Palabras repetidas eliminadas', 'success');
      } else if(action === 'translate'){
        const lang = $('#langSelect').value;
        await AI.translateCaptions(state.transcript, lang);
        showToast(`Subtítulos traducidos (demo) a "${$('#langSelect').selectedOptions[0].text}"`, 'success');
      }
      btn.innerHTML = originalHTML;
      hydrateIcons(btn);
      markUnsaved();
    });
  });
}

/* ---------------------------------------------------------------------- */
/* 14. BRAND KIT / SETTINGS extras                                        */
/* ---------------------------------------------------------------------- */

function initMisc(){
  const saveBtn = $('#saveCustomStyleBtn');
  if(saveBtn) saveBtn.addEventListener('click', () => showToast('Estilo guardado en tu Brand Kit', 'success'));

  const styleSearch = $('#styleSearch');
  if(styleSearch) styleSearch.addEventListener('input', () => {
    const q = styleSearch.value.toLowerCase();
    $all('.style-card', $('#styleGallery')).forEach(card => {
      const name = card.querySelector('.style-name').textContent.toLowerCase();
      card.style.display = name.includes(q) ? '' : 'none';
    });
  });
}

/* ---------------------------------------------------------------------- */
/* 15. INICIALIZACIÓN                                                     */
/* ---------------------------------------------------------------------- */

function init(){
  hydrateIcons();
  initNav();
  initTopbar();
  initToolTabs();
  initPropTabs();
  initPropertyControls();
  initStage();
  initFontModal();
  initExportModal();
  initConfirmModal();
  initAiGenerate();
  initMisc();

  renderCaptionList();
  renderStyleGallery();
  renderAnimGroups();
  renderEffects();
  renderStaticViews();
  updateStageCaptionText(state.transcript.find(c => c.id === state.selectedCaptionId).text);

  setView('editor');
  hydrateIcons();
}

document.addEventListener('DOMContentLoaded', init);
