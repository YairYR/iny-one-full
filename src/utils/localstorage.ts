interface LocalData {
  [key: string]: {
    value: string,
    expires: number
  }
}

const getAll = (): LocalData => {
  if(typeof window === 'undefined' || !window.localStorage) return {};
  const json = window.localStorage.getItem('data');
  if(!json) return {};
  return JSON.parse(json);
}

export const addToLocalStorage = (name: string, value: string, expiresInSec: number) => {
  const data = getAll();
  data[name] = {
    value,
    expires: Date.now() + (expiresInSec * 1000),
  };
  window.localStorage.setItem('data', JSON.stringify(data));
}

export const getFromLocalStorage = (name: string) => {
  const data = getAll();
  if(!data[name]) return null;
  const value = data[name];
  const expiresIn = (new Date(value.expires)).getTime();
  if((Date.now() - expiresIn) >= 0) return null;
  return value.value;
}

export const addToSessionStorage = (name: string, value: string) => {
  if(typeof window === 'undefined' || !window.sessionStorage) return;
  window.sessionStorage.setItem(`data-${name}`, value);
}

export const getFromSessionStorage = (name: string) => {
  if(typeof window === 'undefined' || !window.sessionStorage) return null;
  return window.sessionStorage.getItem(`data-${name}`);
}

export const removeFromSessionStorage = (name: string) => {
  if(typeof window === 'undefined' || !window.sessionStorage) return;
  window.sessionStorage.removeItem(`data-${name}`);
}
