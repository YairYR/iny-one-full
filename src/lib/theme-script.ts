// Sin dependencias de React: lo importa el layout raíz, que es Server Component.
export const THEME_STORAGE_KEY = 'theme';

/**
 * Se ejecuta en <head> antes del primer pintado: sin él la página se pinta en
 * claro y salta a oscuro al hidratar. Sin preferencia guardada sigue al sistema.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('${THEME_STORAGE_KEY}');var d=t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);}catch(e){}})();`;
