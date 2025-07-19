import {NextApiRequest, NextApiResponse} from "next";
import _ from "lodash";

const dataList = {
    blocklist: [] as string[],
    whitelist: [] as string[]
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if(req.method !== 'POST') {
        return res.status(400)
    }

    const body = JSON.parse(req.body);
    if(! body.content) {
        return res.status(400)
    }

    if(dataList.blocklist.length === 0) {
        try {
            await getBlockList();
        } catch (err) {
            console.error(err);
            return res.status(500)
        }
    }

    const filtered = filterList(dataList.blocklist, body.content);

    return res.status(200)
        .json({
            filtered,
            safe: filtered.length === 0
        });
}

const metaUrl = 'https://raw.githubusercontent.com/Bon-Appetit/porn-domains/refs/heads/main/meta.json';
const baseUrl = 'https://raw.githubusercontent.com/Bon-Appetit/porn-domains/refs/heads/main/';

const getMetaFile = async () => {
    return fetch(metaUrl)
            .then(response => {
                if (!response.ok) throw new Error('Failed to load meta.json');
                return response.json();
            });
}

const getBlockList = async () => {
    const meta = await getMetaFile();

    if(meta.blocklist) {
        const blocklistName = meta.blocklist.name;
        const response = await fetch(`${baseUrl}/${blocklistName}`);
        if(!response.ok) throw new Error('Failed to load meta.json');

        const data = await response.text();
        dataList.blocklist = _.split(data, "\n");
    }
}

const filterList = (list: string[], text: string) => {
    const regex = new RegExp(text, "gi");
    return _.filter(list, (item) => regex.test(item));
}