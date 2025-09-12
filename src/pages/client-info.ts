import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  return response.json({
    headers: request.headers,
    body: request.body,
    remoteAddress: request.socket.remoteAddress,
  });
}