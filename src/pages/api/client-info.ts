import { NextApiRequest, NextApiResponse } from "next";
import { userAgent } from "next/server";

export default function ClientInfo(req: NextApiRequest, res: NextApiResponse) {
    //const url = req.url
    const agent = userAgent({
        headers: new Headers([['user-agent', req.headers["user-agent"] ?? '']]),
    })

    // device.type can be: 'mobile', 'tablet', 'console', 'smarttv',
    // 'wearable', 'embedded', or undefined (for desktop browsers)
    const viewport = agent.device.type ?? 'desktop'

    //url.searchParams.set('viewport', viewport)
    //return NextResponse.rewrite(url)
    res.status(200)
        .json({
            viewport,
            userAgent: agent,
            geo: ''
        })
}