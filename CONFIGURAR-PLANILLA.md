# Configurar confirmaciones (Excel) y fotos de la fiesta

Se hace una sola vez, toma unos 10 minutos y es gratis. Usa tu cuenta de Google:
- Las **confirmaciones** se guardan en una planilla de Google Sheets (se descarga como Excel cuando quieras).
- Las **fotos de la fiesta** se guardan en una carpeta de tu Google Drive.

## 1. Crear la carpeta para las fotos

1. Entrá a https://drive.google.com → **Nuevo → Carpeta** → nombre: `Fotos XV Luz María`.
2. Abrí la carpeta y copiá el ID del link. Ejemplo:
   `https://drive.google.com/drive/folders/`**`1AbCdEfGhIjKlMnOpQrStUv`** ← eso es el ID.

## 2. Crear la planilla y el script

1. Entrá a https://sheets.new (crea una planilla nueva). Ponele de nombre `Invitados XV Luz María`.
2. Menú **Extensiones → Apps Script**.
3. Borrá lo que aparece y pegá **todo** el contenido del archivo `apps-script/Code.gs`.
4. En la línea `const FOLDER_ID = '...'` pegá el ID de la carpeta del paso 1.
5. Guardá (ícono de disquete).

## 3. Publicarlo como aplicación web

1. Arriba a la derecha: **Implementar → Nueva implementación**.
2. En el engranaje ⚙ elegí **Aplicación web**.
3. Configurá:
   - **Ejecutar como:** Yo (tu cuenta)
   - **Quién tiene acceso:** Cualquier persona
4. **Implementar** → te pide **Autorizar acceso** → elegí tu cuenta →
   si aparece "Google no verificó esta app": **Configuración avanzada → Ir a (nombre del proyecto)** → **Permitir**.
   (Es normal: es tu propio script).
5. Copiá la **URL de la aplicación web** (termina en `/exec`).

## 4. Pegar la URL en la web

En `js/main.js`, arriba de todo:

```js
scriptUrl: 'https://script.google.com/macros/s/XXXXXXXX/exec',
```

## 5. Probar

- Abrí la web, completá el formulario de confirmación → tiene que aparecer una fila en la hoja **Confirmaciones**.
- Para probar las fotos antes de la fiesta:
  1. En el script poné `ALLOW_UPLOAD_ANYTIME = true`, guardá y hacé **Implementar → Gestionar implementaciones → ✏ editar → Versión: Nueva versión → Implementar** (la URL no cambia).
  2. Abrí la web con `?probar=fotos` al final (ej. `.../index.html?probar=fotos`), bajá a "Compartí tus fotos" y subí una.
  3. Revisá que aparezca en la carpeta de Drive.
  4. **Volvé a poner `ALLOW_UPLOAD_ANYTIME = false`** y publicá una nueva versión de la misma forma.

## Descargar la lista como Excel

En la planilla: **Archivo → Descargar → Microsoft Excel (.xlsx)**.
O abrila directamente con la app de Google Sheets en el celular para ver en tiempo real quién confirmó.

> ⚠ Cada vez que cambies el código del script tenés que publicar una **nueva versión**
> (Gestionar implementaciones → editar → Nueva versión). Si creás una implementación nueva, la URL cambia y hay que actualizarla en `main.js`.
