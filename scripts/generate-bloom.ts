import fs from "fs";
import { BloomFilter } from "bloom-filters";
import readline from "readline";

async function run() {
  const filePath = "scripts/files/all.txt";
  // tu archivo con los 2M dominios, uno por línea

  const lines = [];
  const rl = readline.createInterface({
    input: fs.createReadStream(filePath),
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    const domain = line.trim().toLowerCase();
    if (domain) lines.push(domain);
  }

  const total = lines.length;

  console.log("Dominios cargados:", total);

  // Ajusta el tamaño del bloom
  // 0.001 = 0.1% falsos positivos aprox.
  const bloom = BloomFilter.create(total, 0.001);

  for (const domain of lines) {
    bloom.add(domain);
  }

  // Guardar en binario
  const json = bloom.saveAsJSON();
  const buffer = Buffer.from(JSON.stringify(json), "utf-8");

  fs.writeFileSync("public/bloom.bin", buffer);

  console.log("Bloom filter generado en public/bloom.bin");
}

run().catch(console.error);
