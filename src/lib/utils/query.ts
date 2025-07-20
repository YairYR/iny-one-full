import prisma from "@/lib/db";
import { Utm } from "@/lib/types";

export const getShortenUrl = (short: string) => {
  return prisma.shortenUrl.findFirst({
    where: {
      short,
      active: true
    },
    include: {
      utms: true
    }
  });
}

export const addShortenUrl = (uri: URL, short: string, active: boolean, utms: Utm[]) => {
  const [ subdomain, domain ] = uri.host.split(".");

  return prisma.shortenUrl.create({
    data: {
      protocol: uri.protocol.substring(0, uri.protocol.length - 1), // remove ":"
      subdomain: (!domain) ? null : subdomain,
      domain: (!domain) ? subdomain : domain,
      path: (uri.pathname.length > 0) ? uri.pathname : null,
      short,
      active,
      utms: {
        create: utms
      }
    }
  })
}