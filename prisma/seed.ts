import prisma from "@/lib/db";

const main = async () => {
  console.time("Seeding complete 🌱");

  await prisma.$executeRaw`DELETE FROM urls`;
  await prisma.$executeRaw`DELETE FROM users_on_teams`;
  await prisma.$executeRaw`DELETE FROM teams`;
  await prisma.$executeRaw`DELETE FROM users`;

  await prisma.user.create({
    data: {
      id: 1,
      email: "goku@mail.com",
      passwordHash: "",
      plan: 1,
      status: 1,
      teams: {
        create: [
          {
            role: "ADMIN",
            team: {
              create: {
                id_author: 1,
                urls: {
                  create: [
                    { id: 1, code: "abc123", domain: "ejemplo.com", status: true, reference: "https://ejemplo.com" },
                    { id: 2, code: "def456", domain: "google.com", status: true, reference: "https://google.com" },
                    { id: 3, code: "7P3oYM", domain: "google.com", status: true, reference: "https://google.com" },
                    { id: 4, code: "2mooaq", domain: "instagram.com", status: true, reference: "https://instagram.com" },
                    { id: 5, code: "wHXtgf", domain: "instagram.com", status: true, reference: "https://instagram.com" },
                  ]
                }
              }
            }
          }
        ]
      }
    }
  })

  // await prisma.user.createMany({
  //   data: [
  //     { id: 1, status: 1, email: "", plan: 1, passwordHash: "" },
  //     { id: 2, status: 1, email: "", plan: 1, passwordHash: "" },
  //     { id: 3, status: 1, email: "", plan: 1, passwordHash: "" },
  //   ]
  // })
  //
  // await prisma.team.createMany({
  //   data: [
  //     { id: "", id_author: 1 }
  //   ]
  // })

  // await prisma.url.createMany({
  //   data: [
  //     { id: 1, code: "abc123", domain: "ejemplo.com", status: true, reference: "", id_team: "" },
  //     { id: 2, code: "def456", domain: "google.com", status: true, reference: "" },
  //     { id: 3, code: "7P3oYM", domain: "google.com", status: true, reference: "" },
  //     { id: 4, code: "2mooaq", domain: "instagram.com", status: true, reference: "" },
  //     { id: 5, code: "wHXtgf", domain: "instagram.com", status: true, reference: "" },
  //     { id: 6, code: "xOdSDz", domain: "faceboook.com", status: true, reference: "" },
  //     { id: 7, code: "52CTdF", domain: "gmail.com", status: true, reference: "" },
  //     { id: 8, code: "yuZTgr", domain: "tiktok.com", status: true, reference: "" },
  //     { id: 9, code: "DBNy8W", domain: "discord.com", status: true, reference: "" },
  //     { id: 10, code: "pHG1sw", domain: "discord.com", status: true, reference: "" },
  //     { id: 11, code: "f7bvGi", domain: "crunchyroll.com", status: true },
  //     { id: 12, code: "g4q09g", domain: "metlife.cl", status: true,  },
  //     { id: 13, code: "w3I2Cs", domain: "jkanime.net", status: true,  },
  //     { id: 14, code: "sx4kfr", domain: "chatgpt.com", status: true,  },
  //     { id: 15, code: "upflcH", domain: "duolingo.com", status: true,  },
  //     { id: 16, code: "1gSR4g", domain: "linkedin.com", path: "/feed", status: true, subdomain: "www" },
  //     { id: 17, code: "OwuHs-", domain: "metworkday.com", status: true, subdomain: "europe", hash: "#/booking/" },
  //     { id: 18, code: "E9kfdM", domain: "nngroup.com", path: "/articles/bottom-sheet/", status: true, subdomain: "www" },
  //     { id: 19, code: "6TgHqr", domain: "google.com", status: true,  },
  //     { id: 20, code: "h0fhKW", domain: "emol.cl", status: true,  },
  //     { id: 21, code: "tp5hUO", domain: "google.com", status: true,  },
  //     { id: 22, code: "XL0nvF", domain: "playtoearn.com", status: true,  },
  //     { id: 23, code: "JJ_rVc", domain: "alexanderroizman.com", status: true, },
  //     { id: 24, code: "hJdYQT", domain: "metlife.cl", status: true,  },
  //     { id: 25, code: "u3FcGl", domain: "datacamp.com", status: true,  },
  //     { id: 26, code: "1uCm-D", domain: "Facebook.com", status: true,  },
  //     { id: 27, code: "ijVynb", domain: "google.com", status: true,  },
  //     { id: 28, code: "NYzmz2", domain: "harinaselecta.cl", status: true, subdomain: "www", path: "/blog/recetas-de-quiches-para-verano" },
  //   ]
  // })
  //
  // await prisma.utm.createMany({
  //   data: [
  //     { urlId: 4, name: "utm_source", content: "inyone" },
  //     { urlId: 4, name: "utm_medium", content: "test" },
  //     { urlId: 14, name: "utm_source", content: "iny.one" },
  //   ]
  // })

  console.timeEnd("Seeding complete 🌱");
}

main()
    .then(() => {
      console.log("Process completed");
    })
    .catch((err) => {
      console.error(err);
    })