# Cómo trazar (o corregir) las ventanas a mano

Cada archivo `*.svg` de esta carpeta es una **plantilla de trazado**: contiene la
foto del vehículo embebida a escala nativa y, encima, un `<path>` por ventana con
los trazados actuales como punto de partida.

## Flujo

1. Abre el SVG en **Inkscape**, **Illustrator** o **Figma** (arrastra el archivo).
2. Edita los nodos de cada path hasta que delimite el vidrio exactamente.
   También puedes borrar un path y dibujarlo de cero.
3. Reglas importantes:
   - **No renombres los paths.** Los ids válidos son:
     `front-windshield`, `driver-front-window`, `driver-rear-window`,
     `quarter-window`, `rear-windshield`, `glass-roof`.
   - **No muevas ni escales la imagen de fondo** (el trazado debe quedar en las
     mismas coordenadas de la foto).
   - **No apliques transforms** (en Inkscape: Trayecto → aplanar; en Illustrator
     exporta con "presentation attributes"). Si un path lleva `transform=`, el
     script lo ignora y te avisa.
4. Guarda el archivo **aquí mismo, con el mismo nombre** (p. ej. `sedan-front.svg`).
5. Corre:

   ```
   node scripts/build-views.mjs
   ```

   Tus paths reemplazan a los automáticos (ventana por ventana — puedes corregir
   solo una y dejar el resto). Luego `npm run build` o el deploy normal.

Una sola máscara por ventana sirve para **todos los tonos de tint** — el tono
solo cambia la opacidad del path en el visualizador.

## Vistas faltantes

`SEDAN REAR.svg` y `SPORT FRONT.svg` llegaron vacíos (sin imagen embebida) y
Compact no tiene renders: por eso esos vehículos no muestran el switch
Front/Rear completo. Si consigues los renders, ponlos en
`src/assets/vehicle-views/` con la misma convención de nombres y corre el
script: la plantilla y la vista aparecerán solas (las máscaras de una vista
nueva hay que trazarlas: el script avisará que no encuentra JSON — dibuja los
paths en la plantilla generada y listo).
