/**
 * Enlaces externos del sitio.
 *
 * PORTFOLIO_URL → página externa del portafolio (se abre en pestaña nueva).
 *                 Se usa en el enlace "Portfolio" de la cabecera.
 * CALENDAR_URL  → diseño del calendario en Figma (se abre en pestaña nueva).
 *                 Se usa en el enlace "Calendar" de la cabecera. Se puede
 *                 sobrescribir con PUBLIC_FIGMA_URL (ver .env / .env.example).
 */

export const PORTFOLIO_URL = "https://www.behance.net/ronaldmaldonado5";

/** Diseño del calendario en Figma. Se puede sobrescribir desde .env con
 *  PUBLIC_FIGMA_URL; si esa variable no existe en el entorno, se usa este
 *  enlace (el mismo que hay en .env) para que el enlace del menú no se rompa. */
export const CALENDAR_URL =
  import.meta.env.PUBLIC_FIGMA_URL ||
  "https://www.figma.com/design/W8WEkPdBOizHCBEedZ1yLF/Sin-t%C3%ADtulo?node-id=36-4573&t=P5XHydsFcBgkJsJH-1";
