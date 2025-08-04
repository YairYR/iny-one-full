import { useMemo } from "react";

interface LocalData {
  [key: string]: {
    value: string,
    expires: number
  }
}

const useLocalstorage = () => {
  const isWorking: boolean = useMemo(() => typeof window !== 'undefined' && !!window.localStorage, []);

  const getAll = (): LocalData => {
    if(!isWorking) return {};
    const json = window.localStorage.getItem('data');
    if(!json) return {};
    return JSON.parse(json);
  }

  const set = (name: string, value: string, expiresInSec: number) => {
    const data = getAll();
    data[name] = {
      value,
      expires: Date.now() + (expiresInSec * 1000),
    };
    window.localStorage.setItem('data', JSON.stringify(data));
  }

  const get = (name: string) => {
    const data = getAll();
    if(!data[name]) return null;
    const value = data[name];
    const expiresIn = (new Date(value.expires)).getTime();
    if((Date.now() - expiresIn) <= 0) return null;
    return value.value;
  }

  return {
    isWorking,
    set,
    get,
  }
}

export default useLocalstorage;