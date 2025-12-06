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

const setAll = (data: LocalData) => {
  if(!globalThis.localStorage) return;
  globalThis.localStorage.setItem('data', JSON.stringify(data));
}

export const addToLocalStorage = (name: string, value: string, expiresInSec: number) => {
  const data = getAll();
  data[name] = {
    value,
    expires: Date.now() + (expiresInSec * 1000),
  };
  setAll(data);
}

export const getFromLocalStorage = (name: string) => {
  const data = getAll();
  if(!data[name]) return null;
  const value = data[name];
  const expiresIn = (new Date(value.expires)).getTime();
  if((Date.now() - expiresIn) >= 0) {
    delete data[name];
    setAll(data);
    return null;
  }
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

// ============== Cart ==================

interface ICart {
  planId: string;
}

export const setCartPlan = (planId: string) => {
  addToLocalStorage("cart", JSON.stringify({ planId }), 86400 * 30);
}

export const getCart = (): ICart|null => {
  const cart = getFromLocalStorage("cart");
  return cart ? JSON.parse(cart) : null;
}

export const clearCart = () => {
  const data = getAll();
  if(data['cart']) {
    delete data['cart'];
    setAll(data);
  }
}
