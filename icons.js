/* ==========================================================================
   Minimal inline icon set (self-contained — no external icon CDN dependency)
   Each entry is an SVG inner-path string, rendered at 24x24 viewBox.
   ========================================================================== */
const ICONS = {
  grid: '<rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="3" width="8" height="8" rx="2"/><rect x="3" y="13" width="8" height="8" rx="2"/><rect x="13" y="13" width="8" height="8" rx="2"/>',
  plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  film: '<rect x="3" y="4" width="18" height="16" rx="2"/><line x1="7" y1="4" x2="7" y2="20"/><line x1="17" y1="4" x2="17" y2="20"/><line x1="3" y1="9" x2="7" y2="9"/><line x1="3" y1="15" x2="7" y2="15"/><line x1="17" y1="9" x2="21" y2="9"/><line x1="17" y1="15" x2="21" y2="15"/>',
  folder: '<path d="M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/>',
  layout: '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="9" x2="9" y2="21"/>',
  type: '<polyline points="4,7 4,4 20,4 20,7"/><line x1="12" y1="4" x2="12" y2="20"/><line x1="9" y1="20" x2="15" y2="20"/>',
  palette: '<circle cx="12" cy="12" r="9"/><circle cx="9" cy="10" r="1"/><circle cx="14" cy="9" r="1"/><circle cx="15.5" cy="13.5" r="1"/><path d="M12 21a9 9 0 0 0 0-18 4 4 0 0 0-4 4c0 1.5 1 2 1 3.5s-2 1.5-2 3.5a4 4 0 0 0 5 6.5"/>',
  history: '<path d="M3 12a9 9 0 1 0 3-6.7"/><polyline points="3,4 3,9 8,9"/><polyline points="12,7 12,12 16,14"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.6V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.6 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.6 1Z"/>',
  menu: '<line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/>',
  undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
  redo: '<path d="m15 14 5-5-5-5"/><path d="M20 9H9.5a5.5 5.5 0 0 0 0 11H13"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
  download: '<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 19h14"/>',
  sparkles: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8"/>',
  'file-up': '<path d="M14 3v5h5"/><path d="M6 21h12a1 1 0 0 0 1-1V8l-5-5H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1Z"/><path d="M12 17v-5"/><path d="m9.5 14.5 2.5-2.5 2.5 2.5"/>',
  pause: '<rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>',
  split: '<path d="M6 3v6a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V3"/><path d="M12 12v9"/>',
  clock: '<circle cx="12" cy="12" r="9"/><polyline points="12,7 12,12 16,14"/>',
  eraser: '<path d="m7 21-4.3-4.3a1 1 0 0 1 0-1.4l9.6-9.6a1 1 0 0 1 1.4 0l6.6 6.6a1 1 0 0 1 0 1.4L13.7 21Z"/><path d="M7 21h13"/>',
  globe: '<circle cx="12" cy="12" r="9"/><line x1="3" y1="12" x2="21" y2="12"/><path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18Z"/>',
  search: '<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.5" y2="16.5"/>',
  captions: '<rect x="3" y="5" width="18" height="14" rx="2"/><line x1="7" y1="10" x2="10" y2="10"/><line x1="7" y1="14" x2="13" y2="14"/><line x1="14" y1="10" x2="17" y2="10"/>',
  crop: '<path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M18 22V8a2 2 0 0 0-2-2H2"/>',
  'zoom-out': '<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.5" y2="16.5"/><line x1="8" y1="11" x2="14" y2="11"/>',
  'zoom-in': '<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.5" y2="16.5"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>',
  'upload-cloud': '<path d="M7 18a5 5 0 0 1-1-9.9A6 6 0 0 1 18 7.5 4.5 4.5 0 0 1 17 18"/><path d="M12 12v7"/><path d="m9 15 3-3 3 3"/>',
  'skip-back': '<polygon points="19,4 9,12 19,20"/><line x1="5" y1="4" x2="5" y2="20"/>',
  play: '<polygon points="6,4 20,12 6,20"/>',
  pause2: '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>',
  'chevron-down': '<polyline points="6,9 12,15 18,9"/>',
  'align-left': '<line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="14" y2="12"/><line x1="4" y1="18" x2="17" y2="18"/>',
  'align-center': '<line x1="4" y1="6" x2="20" y2="6"/><line x1="7" y1="12" x2="17" y2="12"/><line x1="6" y1="18" x2="18" y2="18"/>',
  'align-right': '<line x1="4" y1="6" x2="20" y2="6"/><line x1="10" y1="12" x2="20" y2="12"/><line x1="7" y1="18" x2="20" y2="18"/>',
  save: '<path d="M5 3h11l3 3v15H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"/><polyline points="15,3 15,9 8,9 8,3"/><line x1="8" y1="14" x2="16" y2="14"/>',
  x: '<line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/>',
  info: '<circle cx="12" cy="12" r="9"/><line x1="12" y1="11" x2="12" y2="16"/><circle cx="12" cy="8" r="0.6" fill="currentColor" stroke="none"/>',
  star: '<polygon points="12,2 15,9 22,9.5 16.5,14 18.5,21 12,17 5.5,21 7.5,14 2,9.5 9,9"/>',
  trash: '<polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/>',
  check: '<polyline points="20,6 9,17 4,12"/>',
  scissors: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.1" y2="15.9"/><line x1="14.8" y1="14.8" x2="20" y2="20"/><line x1="8.1" y1="8.1" x2="12" y2="12"/>'
};

function svgIcon(name){
  const inner = ICONS[name] || ICONS['info'];
  return `<svg class="icon-svg" viewBox="0 0 24 24">${inner}</svg>`;
}

// Replace every element carrying an "icon-xxx" class with an inline SVG.
function hydrateIcons(root=document){
  const nodes = root.querySelectorAll('[class*="icon-"]');
  nodes.forEach(node => {
    const match = [...node.classList].find(c => c.startsWith('icon-') && c !== 'icon-svg' && c !== 'icon-btn' && c !== 'icon-btn-label' && c !== 'icon-dot');
    if(!match) return;
    const name = match.replace('icon-','');
    if(ICONS[name] && node.tagName.toLowerCase() === 'i'){
      node.innerHTML = svgIcon(name);
    }
  });
}
