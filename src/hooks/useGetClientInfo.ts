import {useState} from "react";
import { addToLocalStorage, getFromLocalStorage } from "@/utils/localstorage";

const maxTimeInSec = 15 * 60;

export default function useGetClientInfo() {
  const [ip, setIp] = useState<string | null>(null);
  const [country, setCountry] = useState<string | null>(null);

  const getIp = async (): Promise<string> => {
    if(ip !== null) return ip;

    const ipLoaded = getFromLocalStorage('ip')
    if(ipLoaded) {
      setIp(ipLoaded);
      return ipLoaded;
    }

    return fetch('https://api.ipify.org?format=json')
      .then((res) => res.json())
      .then((data) => {
        setIp(data.ip)
        addToLocalStorage('ip', data.ip, maxTimeInSec)
        return data.ip as string;
      });
  }

  const getCountry = async (client_ip?: string|null): Promise<string|null> => {
    client_ip = client_ip ?? ip;
    if(!client_ip || client_ip.length === 0) return null;
    if(country !== null) return country;
    const countryLoaded = getFromLocalStorage('country');
    if(countryLoaded) {
      setCountry(countryLoaded);
      return countryLoaded;
    }

    return fetch(`https://free.freeipapi.com/api/json/${client_ip}`)
      .then((res) => res.json())
      .then((data) => {
        setCountry(data.countryCode)
        addToLocalStorage('country', data.countryCode, maxTimeInSec);
        return data.countryCode;
      });
  }

  return {
    ip,
    getIp,
    country,
    getCountry,
  }
}