/**
 * Contraste automático de texto sobre fondos de vídeo/GIF.
 *
 * Mide la luminancia media del fotograma que queda justo detrás de un
 * elemento y le añade una clase cuando ese fondo es oscuro, para que el texto
 * pase al color de contraste (claro sobre oscuro y oscuro sobre claro).
 *
 * Lo comparten:
 *   · los enlaces de la cabecera (`Navbar.astro`) sobre el banner;
 *   · el titular del banner (`Hero.astro`).
 *
 * La medición se hace dibujando el fotograma en un canvas fuera de pantalla,
 * respetando el recorte centrado de `object-fit: cover` que usa la capa del
 * banner, así que se mide exactamente lo que se ve detrás del texto.
 */

/** Cada cuántos ms se vuelve a medir (el fondo es un vídeo en movimiento). */
const SAMPLE_MS = 200;
/** Por debajo de este valor el fondo es oscuro ⇒ texto claro. */
const LUM_DARK_BELOW = 120;
/** Por encima de este valor el fondo es claro ⇒ texto oscuro. */
const LUM_LIGHT_ABOVE = 170;

export interface AutoContrastOptions {
  /** Elemento que recibe la clase de contraste (a su texto afecta). */
  target: HTMLElement;
  /** Contenedor del fondo: define el encuadre del `object-fit`. */
  container: HTMLElement;
  /** Vídeo o imagen de fondo. */
  media: () => HTMLVideoElement | HTMLImageElement | null;
  /** Clase que se añade al target cuando el fondo es oscuro. */
  darkClass?: string;
  /**
   * Zona a medir, en coordenadas de viewport. Por defecto, el rect del
   * target recortado al contenedor.
   */
  region?: () => { left: number; top: number; right: number; bottom: number } | null;
  /**
   * Si devuelve false, el fondo se considera claro y no se mide (p. ej. la
   * cabecera cuando ya lleva su propio fondo blanco).
   */
  auto?: () => boolean;
  /** Milisegundos entre muestreos. */
  sampleMs?: number;
}

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

/**
 * Rectángulo del fotograma equivalente a una franja del contenedor,
 * respetando el encuadre centrado de `object-fit: cover` (sin deformar).
 */
const sourceRectFor = (
  iw: number,
  ih: number,
  cw: number,
  ch: number,
  left: number,
  top: number,
  right: number,
  bottom: number
) => {
  const s = Math.max(cw / iw, ch / ih); // escala del object-fit: cover
  return {
    sx: clamp(iw / 2 + (left - cw / 2) / s, 0, iw),
    sy: clamp(ih / 2 + (top - ch / 2) / s, 0, ih),
    sw: clamp(right - left, 0, cw) / s,
    sh: clamp(bottom - top, 0, ch) / s,
  };
};

/**
 * Luminancia media (0-255) del fondo detrás de una zona, o null si todavía
 * no se puede medir (sin medios, sin decodificar o fotograma ilegible).
 */
const sampleLuminance = (
  media: HTMLVideoElement | HTMLImageElement,
  containerRect: DOMRect,
  zone: { left: number; top: number; right: number; bottom: number }
): number | null => {
  if (!canvas) {
    canvas = document.createElement("canvas");
    ctx = canvas.getContext("2d", { willReadFrequently: true });
  }
  if (!ctx) return null;

  const iw =
    (media as HTMLVideoElement).videoWidth ||
    (media as HTMLImageElement).naturalWidth;
  const ih =
    (media as HTMLVideoElement).videoHeight ||
    (media as HTMLImageElement).naturalHeight;
  if (!iw || !ih) return null; // el vídeo/GIF aún no tiene datos

  // Solo la parte de la zona que cae dentro del contenedor
  const left = Math.max(zone.left, containerRect.left);
  const right = Math.min(zone.right, containerRect.right);
  const top = Math.max(zone.top, containerRect.top);
  const bottom = Math.min(zone.bottom, containerRect.bottom);
  if (right <= left || bottom <= top) return null;

  const src = sourceRectFor(
    iw,
    ih,
    containerRect.width,
    containerRect.height,
    left - containerRect.left,
    top - containerRect.top,
    right - containerRect.left,
    bottom - containerRect.top
  );

  try {
    const dstW = 16;
    const dstH = Math.max(1, Math.round((dstW * src.sh) / src.sw));
    canvas.width = dstW;
    canvas.height = dstH;
    ctx.drawImage(media, src.sx, src.sy, src.sw, src.sh, 0, 0, dstW, dstH);

    const { data } = ctx.getImageData(0, 0, dstW, dstH);
    let lum = 0;
    for (let i = 0; i < data.length; i += 4) {
      lum += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
    }
    return lum / (data.length / 4);
  } catch {
    // Canvas "contaminado" o fotograma ilegible: no se puede medir
    return null;
  }
};

/**
 * Observa el fondo y mantiene la clase de contraste en `target`:
 * fondo oscuro → clase puesta (texto claro); fondo claro → clase quitada.
 */
export function watchAutoContrast(options: AutoContrastOptions): void {
  const {
    target,
    container,
    media,
    darkClass = "on-dark",
    region,
    auto,
    sampleMs = SAMPLE_MS,
  } = options;

  let lastDark: boolean | null = null;
  let queued = false;

  const setDark = (dark: boolean) => {
    if (dark === lastDark) return;
    lastDark = dark;
    target.classList.toggle(darkClass, dark);
  };

  const apply = () => {
    // Estado mandado por el contenedor (p. ej. la cabecera con fondo blanco)
    if (auto && !auto()) {
      setDark(false);
      return;
    }

    const el = media();
    const zone = region ? region() : target.getBoundingClientRect();
    if (!el || !zone) {
      setDark(false);
      return;
    }

    const lum = sampleLuminance(el, container.getBoundingClientRect(), zone);
    if (lum === null) return; // aún sin datos: conserva el último estado

    // Histéresis: dos umbrales para que el texto no parpadee cuando el vídeo
    // alterna entre tonos cercanos al límite
    const dark =
      lastDark === null
        ? lum < (LUM_DARK_BELOW + LUM_LIGHT_ABOVE) / 2
        : lastDark
          ? lum < LUM_LIGHT_ABOVE
          : lum < LUM_DARK_BELOW;
    setDark(dark);
  };

  // Al hacer scroll basta con un muestreo por frame
  const onScroll = () => {
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(() => {
      queued = false;
      apply();
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", apply, { passive: true });
  window.setInterval(apply, sampleMs);
  apply();
}
