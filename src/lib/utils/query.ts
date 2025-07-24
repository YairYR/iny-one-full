import prisma from "@/lib/db";

export const getShortenUrl = (short: string) => {
  return prisma.url.findFirst({
    where: {
      code: short,
      status: true,
    },
  });
}

/*
export const addShortenUrl = (uri: URL, short: string, active: boolean, utms: Utm[]) => {
  const [ subdomain, domain ] = uri.host.split(".");

  return prisma.url.create({
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
 */