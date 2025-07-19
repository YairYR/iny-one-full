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

    const getCountry = async (ip: string): Promise<string|null> => {
        if(!ip || ip.length === 0) return null;
        if(country !== null) return country;

        return fetch(`https://free.freeipapi.com/api/json/${ip}`)
            .then((res) => res.json())
            .then((data) => {
                setCountry(data.countryName)
                return data.countryName;
            })
    }

    return {
        ip,
        getIp,
        country,
        getCountry,
    }
}