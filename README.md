# Nutrición con Mariana — Nutrióloga en San Luis Potosí

Sitio web de una página construido con [Astro](https://astro.build) y [Tailwind CSS](https://tailwindcss.com).

## Desarrollo

```bash
npm install      # instala dependencias
npm run dev      # servidor de desarrollo en http://localhost:4321
npm run build    # genera el sitio estático en /dist
npm run preview  # previsualiza el build de producción
```

## Personalización

Edita **`src/consts.ts`** para cambiar todos los datos del sitio: nombre, marca,
contacto, WhatsApp, servicios, testimonios e imágenes. Reemplaza las imágenes en
`/public/images` o las URLs de `IMAGES` en ese mismo archivo.

## Analítica (GA4)

Activo. El Measurement ID es `GA4_ID` en `src/consts.ts` (`G-L5RB0B2JTL`) y la
etiqueta se emite desde `src/layouts/Layout.astro`, así que aparece **una sola
vez** en todas las páginas. No añadas otra etiqueta de Google en ningún sitio.

Para apuntar un deploy de staging a otra propiedad — o para desactivar la
etiqueta — define la variable de entorno `PUBLIC_GA4_ID` en Vercel; sobrescribe
el valor de `consts.ts` (con cadena vacía no se emite nada).

El CSP de `vercel.json` ya permite `googletagmanager.com` y `google-analytics.com`.

Se registran dos eventos automáticamente: `phone_call_click` (cualquier enlace
`tel:`) y `quote_cta_click` (cualquier enlace a `#contact`). **El envío del
formulario no se puede medir**: es un iframe de Tintwiz en otro dominio.

## SEO — archivos clave

- `public/robots.txt` — permite crawlers de IA explícitamente, bloquea `/page/` y query strings.
- `public/llms.txt` — resumen del negocio y los servicios para asistentes de IA.
  Se mantiene a mano; la fuente de verdad de los datos es `src/consts.ts`.
- `public/google39eaf0e602f1ab15.html` — verificación de Google Search Console.
- El sitemap lo genera `@astrojs/sitemap` en cada build (`/sitemap-index.xml`).

Las imágenes de `src/assets/images` usan nombres descriptivos a propósito (Astro
los conserva en el hash que sirve). El host de deploy distingue mayúsculas y
rutas: si renombras una, verifica con `git ls-files` antes de hacer push.

## Tipografía

- Títulos: **Instrument Serif** (Google Fonts)
- Acentos manuscritos: **Homemade Apple** (Google Fonts)
- Cuerpo de texto: **Karla**

---

Diseñado por [ClicksRun](https://clicksrun.com).
