// `next-intl/server` se distribuye como ESM y no pasa por el transform de Jest,
// lo que hacía fallar cualquier test que importara una página del App Router.
const translate = (key) => key;
translate.rich = (key) => key;
translate.markup = (key) => key;
translate.raw = (key) => key;
translate.has = () => true;

export const getTranslations = async () => translate;
export const getLocale = async () => "en";
export const getMessages = async () => ({});
export const getNow = async () => new Date(0);
export const getTimeZone = async () => "UTC";
export const getFormatter = async () => ({});
export const setRequestLocale = () => {};
