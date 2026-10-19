# Invitación XV · Luz María

Web estática (HTML + CSS + JS, sin instalar nada). Para verla, abrí `index.html` en el navegador.

## Cosas para editar (en `js/main.js`, arriba de todo, en `CONFIG`)

- `start`: fecha y **hora** del evento.
- `scriptUrl`: URL del script de Google que guarda las confirmaciones en una planilla y las fotos en Drive.
  **Cómo crearla: ver [CONFIGURAR-PLANILLA.md](CONFIGURAR-PLANILLA.md).**
- `gift`: alias / CVU / titular de Mercado Pago para la sección de regalo (si está vacío, la sección no se muestra).
- `photoUpload`: desde y hasta cuándo se pueden subir fotos de la fiesta.
- `photos`: qué fotos salen en la galería (los archivos están en `img/`).

## QR para las mesas

Abrí `qr.html` **desde la web ya publicada** (ej. `https://TU-USUARIO.github.io/xv-luz-maria/qr.html`) y tocá **Imprimir**.
Genera una tarjetita A6 con un QR que lleva directo a la sección para subir fotos.
Para ver cómo queda la sección de fotos antes de la fiesta: agregá `?probar=fotos` al link.

## Link personalizado por invitado

Agregá `?para=` al final del link para que la invitación salude a cada familia:

```
https://TU-USUARIO.github.io/xv-luz-maria/?para=Familia Pérez
```

## Publicar gratis en GitHub Pages

1. Creá una cuenta en https://github.com y un repositorio nuevo **público** (ej. `xv-luz-maria`).
2. En el repo: **Add file → Upload files** y arrastrá: `index.html`, `qr.html`, `.nojekyll`, y las carpetas `css`, `js`, `img`.
   (No hace falta subir `Destacados`, son las fotos originales).
3. **Commit changes**.
4. **Settings → Pages → Branch: `main` / `(root)` → Save**.
5. En 1–2 minutos queda en `https://TU-USUARIO.github.io/xv-luz-maria/`.

**Alternativa aún más fácil:** https://app.netlify.com/drop: arrastrás la carpeta y te da un link al instante.

> Para que la vista previa con foto salga bien en WhatsApp, cuando tengas el link final cambiá en `index.html`
> `content="img/og-cover.jpg"` por la URL completa, ej. `https://TU-USUARIO.github.io/xv-luz-maria/img/og-cover.jpg`.
