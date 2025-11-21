interface LocalData {
  [key: string]: {
    value: string,
    expires: number
  }
}

const getAll = (): LocalData => {
  if(!globalThis.localStorage) return {};
  const json = globalThis.localStorage.getItem('data');
  if(!json) return {};
  return JSON.parse(json);
}

export const addToLocalStorage = (name: string, value: string, expiresInSec: number) => {
  const data = getAll();
  data[name] = {
    value,
    expires: Date.now() + (expiresInSec * 1000),
  };
  globalThis.localStorage.setItem('data', JSON.stringify(data));
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
  if(!globalThis.sessionStorage) return;
  globalThis.sessionStorage.setItem(`data-${name}`, value);
}

export const getFromSessionStorage = (name: string) => {
  if(!globalThis.sessionStorage) return null;
  return globalThis.sessionStorage.getItem(`data-${name}`);
}

export const removeFromSessionStorage = (name: string) => {
  if(!globalThis.sessionStorage) return;
  globalThis.sessionStorage.removeItem(`data-${name}`);
}
