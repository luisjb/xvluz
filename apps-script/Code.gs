/**
 * XV Luz María — backend gratuito con Google Apps Script.
 * - Confirmaciones de asistencia  -> hoja "Confirmaciones" de esta planilla
 * - Fotos de la fiesta            -> carpeta de Google Drive (FOLDER_ID)
 *
 * Instrucciones paso a paso en CONFIGURAR-PLANILLA.md
 */

// ID de la carpeta de Drive donde se guardan las fotos (lo que va después de /folders/ en el link)
const FOLDER_ID = 'PEGAR_ACA_EL_ID_DE_LA_CARPETA';

// Ventana en la que se aceptan fotos (hora Argentina). Debe coincidir con CONFIG.photoUpload de la web.
const UPLOAD_FROM = new Date('2026-11-07T00:00:00-03:00');
const UPLOAD_UNTIL = new Date('2026-11-09T23:59:59-03:00');
// Mientras pruebas antes de la fiesta, poné true. ¡Acordate de volver a false!
const ALLOW_UPLOAD_ANYTIME = false;

const SHEET_NAME = 'Confirmaciones';
const HEADERS = ['Fecha', 'Nombre', 'Apellido', 'Teléfono', '¿Asiste?', 'Personas', 'Mensaje', 'Link de invitación'];
const MAX_PHOTO_BYTES = 15 * 1024 * 1024;

function doPost(e) {
  try {
    const p = (e && e.parameter) || {};
    if (p.type === 'rsvp') return saveRsvp_(p);
    if (p.type === 'photo') return savePhoto_(p);
    return json_({ ok: false, error: 'tipo-invalido' });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: 'server' });
  }
}

// Permite comprobar en el navegador que la URL funciona
function doGet() {
  return json_({ ok: true, msg: 'Backend XV Luz María funcionando' });
}

function saveRsvp_(p) {
  const nombre = clean_(p.nombre, 60);
  const apellido = clean_(p.apellido, 60);
  const telefono = clean_(p.telefono, 25);
  if (!nombre || !apellido || !telefono) return json_({ ok: false, error: 'faltan-datos' });

  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sh = ss.getSheetByName(SHEET_NAME);
    if (!sh) {
      sh = ss.insertSheet(SHEET_NAME);
      sh.appendRow(HEADERS);
      sh.setFrozenRows(1);
      sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold').setBackground('#E7D8C6');
    }
    sh.appendRow([
      new Date(),
      nombre,
      apellido,
      telefono,
      p.asiste === 'No' ? 'No' : 'Sí',
      Math.max(0, Math.min(10, parseInt(p.personas, 10) || 0)),
      clean_(p.mensaje, 300),
      clean_(p.invitacion, 60),
    ]);
  } finally {
    lock.releaseLock();
  }
  return json_({ ok: true });
}

function savePhoto_(p) {
  const now = new Date();
  if (!ALLOW_UPLOAD_ANYTIME && (now < UPLOAD_FROM || now > UPLOAD_UNTIL)) {
    return json_({ ok: false, error: 'cerrado' });
  }
  const mime = /^image\/(jpeg|png|webp|heic|heif)$/.test(p.mime) ? p.mime : 'image/jpeg';
  const bytes = Utilities.base64Decode(String(p.data || ''));
  if (!bytes.length || bytes.length > MAX_PHOTO_BYTES) return json_({ ok: false, error: 'archivo-invalido' });

  const autor = clean_(p.autor, 40).replace(/[^\p{L}\p{N} _-]/gu, '').trim() || 'invitado';
  const stamp = Utilities.formatDate(now, 'America/Argentina/Cordoba', 'yyyyMMdd-HHmmss');
  const ext = mime.split('/')[1].replace('jpeg', 'jpg');
  const name = `${stamp}_${autor}_${Math.random().toString(36).slice(2, 6)}.${ext}`;

  DriveApp.getFolderById(FOLDER_ID).createFile(Utilities.newBlob(bytes, mime, name));
  return json_({ ok: true });
}

// Limpia texto y evita que la planilla lo interprete como fórmula
function clean_(v, max) {
  const s = String(v || '').trim().slice(0, max);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
