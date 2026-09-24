# Landing — Motion Designer

Landing page construida con **Astro + Tailwind CSS v4** (JS vanilla para el embed del formulario de contacto y los efectos de scroll), replicando fielmente el diseño proporcionado.

## Estructura

```
src/
  layouts/BaseLayout.astro      Head, import de estilos (index.css), meta
  styles/
    variables.css               Variables/tokens (@theme): colores, fuentes
    fonts.css                   Tipografía del sistema (SF Pro en Apple)
    pricing.css                 Estilos propios de la sección de precios (word, hilo, balanceo)
    index.css                   Une tailwind + variables + fonts + estilos de bloque
  components/
    Navbar.astro                 Portfolio / Calendar / Contact
    Hero.astro                   Banner principal + fondo opcional (imagen/vídeo)
    LogoBand.astro                Franja "COLLABORATED WITH" (marquee en bucle)
    FeaturedWork.astro           "MOTION DESIGNER FOR AI PLATAFORM"
    PricingSection.astro         Precios: palabra gigante, conmutador mensual/anual y 3 tarjetas
    CalendarModal.astro          Modal de disponibilidad con Google Calendar API — sin usar ahora mismo
    ContactSection.astro         Embed del formulario de Youform + animación de aparición
    Footer.astro                 Logo + copyright (sin enlaces legales)
  pages/index.astro              Ensambla todas las secciones
```

## Uso

```bash
npm install
npm run dev       # http://localhost:4321
npm run build      # genera /dist
npm run preview    # sirve /dist
```

## Google Calendar API — `CalendarModal.astro`

`CalendarModal.astro` **no se usa ahora mismo**: la tarjeta que contenía los botones
**VIEW PORTFOLIO** y **OPEN CALENDAR** se retiró de la página, así que el componente se
conserva reutilizable pero no forma parte del HTML generado.

El enlace **Calendar** de la cabecera abre el diseño del calendario en Figma
(`PUBLIC_FIGMA_URL`, definido en `src/config.ts` como `CALENDAR_URL`) en una pestaña nueva.

Cuando se vuelva a montar el modal, muestra la disponibilidad real del mes obtenida de la
**Google Calendar API v3** (calendario público), consultada directamente desde el navegador.

### Variables de entorno

Copia `.env.example` a `.env` y rellena los valores:

| Variable | Descripción |
| --- | --- |
| `PUBLIC_GOOGLE_CALENDAR_API_KEY` | API key de Google Cloud con la *Google Calendar API* activada. |
| `PUBLIC_GOOGLE_CALENDAR_ID` | ID del calendario público (debe estar publicado como disponible públicamente). |
| `PUBLIC_FIGMA_URL` | Link de Figma del calendario: lo abre el enlace **Calendar** de la cabecera (pestaña nueva) y sirve de respaldo del modal. |
| `PUBLIC_REST_KEYWORDS` | *(opcional)* Palabras clave (separadas por coma) para marcar días de descanso por el título del evento. Por defecto: `Rest,OFF,Descanso,Vacaciones,Vacation,Holiday`. |

Llevan el prefijo `PUBLIC_` porque la petición a la API se hace desde el navegador
(no hay servidor). Por eso la API key debe restringirse por **HTTP referrers** a tu
dominio en la consola de Google Cloud.

### Cómo funciona

1. Al pulsar **OPEN CALENDAR**, el script comprueba si existen
   `PUBLIC_GOOGLE_CALENDAR_API_KEY` y `PUBLIC_GOOGLE_CALENDAR_ID`.
2. **Con API configurada** → se abre el modal y se piden los eventos del mes visible:
   `GET /calendar/v3/calendars/{id}/events?key=…&timeMin=…&timeMax=…`.
   Cada día se marca así (por orden de prioridad):
   - `rest` (blanco): día marcado como descanso **o** fin de semana sin eventos.
     Para marcar un descanso en día laborable (vacaciones, libre…), crea un evento
     cuyo título contenga una palabra clave de `PUBLIC_REST_KEYWORDS`
     (por defecto: `Rest`, `OFF`, `Descanso`, `Vacaciones`, `Vacation`, `Holiday`);
   - `occupied` (rojizo): el calendario tiene eventos ese día (salvo que sea un
     evento marcado como descanso);
   - `free` (verde): día laborable sin eventos, disponible para reservar.
   Los meses se cachean al navegar con `‹ ›`. Si la API falla, el modal muestra un
   aviso con un botón **Open Figma preview**.
3. **Sin API configurada** → el modal **no se muestra**: el botón abre
   `PUBLIC_FIGMA_URL` (el diseño del calendario en Figma) en una pestaña nueva.
   Si esa variable tampoco está definida, se usa un placeholder marcado con `TODO`
   dentro de `CalendarModal.astro`.

> Nota: la disponibilidad se muestra en la zona horaria del navegador del visitante.

## Notas de diseño

- El look "metálico" de los titulares se logra con la clase `.text-metal` (gradiente gris + `bg-clip-text`).
- El verde de marca es `--color-forest` (`#2f5b41`), usado en botones y el enlace "Motion Graphics".
- El fondo punteado del footer usa `.dot-grid` (radial-gradient repetido).
- Tipografía: stack nativo del sistema; en dispositivos Apple utiliza **SF Pro / San Francisco**.
- El formulario de contacto es un embed de **Youform** (iframe) dentro de una tarjeta sin fondo: aparece con un fade + subida suave al entrar en pantalla y tiene estados propios de carga, error y reintento. Los campos y sus validaciones se configuran en el dashboard de Youform.
- La sección de precios (`PricingSection.astro`) adapta un diseño de tarjetas colgando de un hilo a la paleta del sitio: la palabra gigante usa el metal desvanecido, la tarjeta destacada se invierte a verde de marca y el conmutador mensual/anual reescribe los precios desde sus `data-price-*`. Los degradados, el hilo y el balanceo viven en `src/styles/pricing.css`.
