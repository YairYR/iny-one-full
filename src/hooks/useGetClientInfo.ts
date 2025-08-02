import {useState} from "react";

export default function useGetClientInfo() {
    const [ip, setIp] = useState<string | null>(null);
    const [country, setCountry] = useState<string | null>(null);

    const getIp = async (): Promise<string> => {
        if(ip !== null) return ip;

        return fetch('https://api.ipify.org?format=json')
            .then((res) => res.json())
            .then((data) => {
                setIp(data.ip)
                return data.ip as string;
            })
    }

    const getCountry = async (client_ip?: string|null): Promise<string|null> => {
        client_ip = client_ip ?? ip;
        if(!client_ip || client_ip.length === 0) return null;
        if(country !== null) return country;

        return fetch(`https://free.freeipapi.com/api/json/${client_ip}`)
            .then((res) => res.json())
            .then((data) => {
                setCountry(data.countryCode)
                return data.countryCode;
            })
    }

    return {
        ip,
        getIp,
        country,
        getCountry,
    }
}