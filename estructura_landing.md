# Análisis de Estructura de la Landing Page

La página utiliza un diseño de ancho completo (*full-width*) con un contenedor central (estimado en `max-width: 1200px`) para el contenido. Alterna principalmente entre fondos oscuros (`#111111` o similar) y blancos (`#FFFFFF`), utilizando un verde neón brillante (`#00FF00` aprox.) como color de acento.

## 1. Encabezado (Header & Nav)
* **Top Bar (Barra superior):**
    * **Fondo:** Negro oscuro.
    * **Layout:** `display: flex`, `justify-content: space-between`.
    * **Padding:** `10px 5%`.
    * **Contenido:** Información de contacto a la izquierda, redes sociales a la derecha. Texto en tamaño pequeño (`12px-14px`).
* **Navegación Principal:**
    * **Fondo:** Transparente superpuesto sobre la imagen hero (o negro sólido al hacer scroll).
    * **Layout:** `display: flex`, `justify-content: space-between`, `align-items: center`.
    * **Padding:** `20px 5%`.
    * **Estructura:** Menú de enlaces a la izquierda, Logo centrado, Botón *Call to Action* (CTA) verde a la derecha.

## 2. Sección Hero (Principal)
* **Fondo:** Imagen a pantalla completa con una capa superpuesta (*overlay*) oscura para mejorar la legibilidad.
* **Layout:** `display: flex`, `flex-direction: column`, `align-items: center`, `justify-content: center`.
* **Padding:** `150px 20px` (arriba/abajo), centrado verticalmente.
* **Contenido:** Texto verde de subtítulo, Título principal en tipografía gruesa y desgastada (centrado, ancho máximo `800px`), Botón CTA verde centrado con `margin-top: 30px`.

## 3. Sección "About Us" (Sobre Nosotros)
* **Fondo:** Blanco.
* **Padding General:** `80px 5%`.
* **Estructura Superior (Texto):** `display: grid` a 2 columnas (`gap: 40px`). Columna izquierda (Título + CTA), Columna derecha (Párrafo descriptivo).
* **Estructura Inferior (Imagen del Auto):**
    * **Posición:** La imagen del auto (mitad verde/mitad blanco) está centrada.
    * **Particularidad de Diseño:** Utiliza un posicionamiento relativo con un margen negativo inferior (ej. `margin-bottom: -150px; position: relative; z-index: 10;`) para "romper" el contenedor y superponerse visualmente sobre la siguiente sección negra.

## 4. Sección "Services" (Servicios)
* **Fondo:** Negro oscuro (`#111111`).
* **Padding General:** `150px 5% 100px 5%` (el padding superior es mayor para acomodar la superposición del auto).
* **Layout:** `display: grid` a 2 columnas (proporción aprox. 40% / 60%), `gap: 50px`.
* **Columna Izquierda:** Imagen cuadrada/rectangular de una casa con auto. `border-radius: 8px`. Una insignia verde posicionada en la esquina superior derecha (`position: absolute; top: 20px; right: -20px;`).
* **Columna Derecha:** Título principal. Lista de 4 tarjetas de servicios dispuestas en columna (`display: flex`, `flex-direction: column`, `gap: 15px`). Cada tarjeta tiene fondo blanco, icono verde a la izquierda, padding `20px`.

## 5. Sección Características y Estadísticas
* **Fondo:** Blanco.
* **Padding General:** `80px 5%`.
* **Bloque Superior (Beneficios):**
    * Título centrado con margen inferior `40px`.
    * **Layout:** `display: grid` a 4 columnas (`gap: 20px`).
    * **Tarjetas:** Alineación de texto centrada (`text-align: center`), icono superior verde, fondo con un ligero sombreado o borde muy sutil, padding de `30px 20px`.
* **Bloque Inferior (Estadísticas):**
    * **Layout:** `display: grid` a 4 columnas. Separado del bloque superior por un margen de `60px` y una línea divisoria sutil (`border-top: 1px solid #eee`).
    * **Padding del bloque:** `40px 0 0 0`.
    * **Contenido:** Números grandes (negrita), texto descriptivo pequeño debajo.

## 6. Sección Galería / Portafolio
* **Fondo:** Negro.
* **Padding General:** `100px 5%`.
* **Layout:** Título centrado con `margin-bottom: 50px`.
* **Carrusel/Grid:** 4 imágenes dispuestas en fila. `display: grid`, 4 columnas, `gap: 20px`. Controles de flechas verdes posicionados absolutamente en los bordes laterales (`position: absolute`, `top: 50%`, `transform: translateY(-50%)`).

## 7. Sección Testimonios
* **Fondo:** Blanco.
* **Padding General:** `100px 5%`.
* **Layout:** Título centrado.
* **Tarjetas de Reseña:** `display: grid`, 3 columnas, `gap: 30px`.
* **Estilo de Tarjeta:** Fondo verde muy claro (`#f0fdf0`), padding de `40px`. Estrellas amarillas/verdes arriba, texto del testimonio, divisor de línea, nombre del cliente. Icono de comillas en la esquina inferior derecha.

## 8. Sección Contacto / Formulario
* **Fondo:** Dividido o con textura (fondo principal negro, pero el formulario tiene un contenedor blanco).
* **Padding General:** `80px 5%`.
* **Layout:** `display: grid`, 2 columnas (`gap: 50px`).
* **Columna Izquierda (Formulario):** Contenedor con fondo blanco, padding de `40px`, sombras suaves (`box-shadow`), superpuesto visualmente con un margen superior negativo o flotando. Inputs con padding de `12px`, fondo gris claro (`#f9f9f9`), borde sin líneas pronunciadas. Layout de inputs en grid (2 columnas para campos cortos, 1 para mensaje).
* **Columna Derecha (Texto):** Alineado verticalmente al centro. Título verde, texto descriptivo blanco, lista de viñetas con iconos de check verdes.

## 9. Sección Blog
* **Fondo:** Blanco.
* **Padding General:** `80px 5%`.
* **Layout:** `display: grid`, 2 columnas (proporción 40% / 60%).
* **Columna Izquierda:** Título, descripción, botón CTA verde. `padding-right: 40px`.
* **Columna Derecha:** Lista de 3 artículos. `display: flex`, `flex-direction: column`, `gap: 20px`. Cada artículo usa `display: flex` (imagen pequeña a la izquierda de aprox `150x100px`, texto a la derecha).

## 10. Sección Ubicación / Mapa
* **Fondo:** Blanco.
* **Padding General:** `80px 5%`.
* **LayoutSuperior:** Título y subtítulo centrados, `margin-bottom: 50px`.
* **Layout Inferior:** `display: grid`, 2 columnas (`gap: 40px`).
* **Columna Izquierda (Info):** Lista de iconos (ubicación, teléfono, horario) con texto. Botón verde inferior con `margin-top: 20px`.
* **Columna Derecha (Mapa):** Iframe de Google Maps. Ocupa el 100% del ancho/alto del contenedor. Borde redondeado sutil.

## 11. Footer (Pie de página)
* **Fondo:** Negro oscuro.
* **Padding Principal:** `60px 5% 40px 5%`.
* **Layout Principal:** `display: grid`, 4 columnas (`gap: 30px`).
* **Columna 1:** Logo, descripción corta, iconos de redes sociales (pequeños círculos verdes, `gap: 10px`).
* **Columna 2 & 3:** Enlaces rápidos. Lista sin viñetas, `margin-bottom: 10px` por elemento.
* **Columna 4:** Información de contacto estaructurada.
* **Barra Inferior (Copyright):** `border-top: 1px solid #333`, `padding: 20px 0`, texto centrado tamaño pequeño (`12px`), alineado al centro.
