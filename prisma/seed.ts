import prisma from "@/lib/db";

const main = async () => {
  console.time("Seeding complete 🌱");

  await prisma.shortenUrl.createMany({
    data: [
      { id: 1, short: "abc123", domain: "ejemplo.com", protocol: "https", active: true, subdomain: null },
      { id: 2, short: "def456", domain: "google.com", protocol: "https", active: true, subdomain: null },
      { id: 3, short: "7P3oYM", domain: "google.com", protocol: "https", active: true, subdomain: null },
      { id: 4, short: "2mooaq", domain: "instagram.com", protocol: "https", active: true, subdomain: null },
      { id: 5, short: "wHXtgf", domain: "instagram.com", protocol: "https", active: true, subdomain: null },
      { id: 6, short: "xOdSDz", domain: "faceboook.com", protocol: "https", active: true, subdomain: null },
      { id: 7, short: "52CTdF", domain: "gmail.com", protocol: "https", active: true, subdomain: null },
      { id: 8, short: "yuZTgr", domain: "tiktok.com", protocol: "https", active: true, subdomain: null },
      { id: 9, short: "DBNy8W", domain: "discord.com", protocol: "https", active: true, subdomain: null },
      { id: 10, short: "pHG1sw", domain: "discord.com", protocol: "https", active: true, subdomain: null },
      { id: 11, short: "f7bvGi", domain: "crunchyroll.com", protocol: "https", active: true, subdomain: "www", path: "/" },
      { id: 12, short: "g4q09g", domain: "metlife.cl", protocol: "https", active: true, subdomain: null },
      { id: 13, short: "w3I2Cs", domain: "jkanime.net", protocol: "https", active: true, subdomain: null },
      { id: 14, short: "sx4kfr", domain: "chatgpt.com", protocol: "https", active: true, subdomain: null },
      { id: 15, short: "upflcH", domain: "duolingo.com", protocol: "https", active: true, subdomain: null },
      { id: 16, short: "1gSR4g", domain: "linkedin.com", path: "/feed", protocol: "https", active: true, subdomain: "www" },
      { id: 17, short: "OwuHs-", domain: "metworkday.com", protocol: "https", active: true, subdomain: "europe", hash: "#/booking/" },
      { id: 18, short: "E9kfdM", domain: "nngroup.com", path: "/articles/bottom-sheet/", protocol: "https", active: true, subdomain: "www" },
      { id: 19, short: "6TgHqr", domain: "google.com", protocol: "https", active: true, subdomain: null },
      { id: 20, short: "h0fhKW", domain: "emol.cl", protocol: "https", active: true, subdomain: null },
      { id: 21, short: "tp5hUO", domain: "google.com", protocol: "https", active: true, subdomain: null },
      { id: 22, short: "XL0nvF", domain: "playtoearn.com", protocol: "https", active: true, subdomain: null },
      { id: 23, short: "JJ_rVc", domain: "alexanderroizman.com", protocol: "https", active: true, subdomain: null, path: "/" },
      { id: 24, short: "hJdYQT", domain: "metlife.cl", protocol: "https", active: true, subdomain: null },
      { id: 25, short: "u3FcGl", domain: "datacamp.com", protocol: "https", active: true, subdomain: null },
      { id: 26, short: "1uCm-D", domain: "Facebook.com", protocol: "https", active: true, subdomain: null },
      { id: 27, short: "ijVynb", domain: "google.com", protocol: "https", active: true, subdomain: null },
      { id: 28, short: "NYzmz2", domain: "harinaselecta.cl", protocol: "https", active: true, subdomain: "www", path: "/blog/recetas-de-quiches-para-verano" },
    ]
  })

  await prisma.urlUtm.createMany({
    data: [
      { urlId: 4, name: "utm_source", content: "inyone" },
      { urlId: 4, name: "utm_medium", content: "test" },
      { urlId: 14, name: "utm_source", content: "iny.one" },
    ]
  })

  console.timeEnd("Seeding complete 🌱");
}

main()
    .then(() => {
      console.log("Process completed");
    })
    .catch((err) => {
      console.error(err);
    })