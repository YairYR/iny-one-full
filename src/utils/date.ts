export const localeToDateLocale = (locale: string) => {
  if (locale === 'es') {
    return 'es-CL';
  } else {
    return 'en-US';
  }
}

export const toLocaleDate = (locale: string, value?: string|number) => {
  const date = (value === undefined) ? new Date() : new Date(value);
  if(date.toLocaleDateString) {
    const date_locale = localeToDateLocale(locale);
    const formatted = date.toLocaleDateString(date_locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const time = date.toLocaleTimeString(date_locale, {
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
    });
    return formatted + " " + time;
  }
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes()}`;
}