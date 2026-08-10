/**
 * Días que vive un enlace creado sin cuenta.
 *
 * Vive aquí, sin dependencias, porque lo consumen dos sitios que no pueden
 * discrepar: la ruta que fija `expires_at` al crear el enlace y el aviso que se
 * muestra en la home a quien no ha iniciado sesión. Si el valor se duplicara,
 * la interfaz acabaría prometiendo un plazo distinto del que aplica el servidor.
 */
export const ANONYMOUS_LINK_TTL_DAYS = 180;
