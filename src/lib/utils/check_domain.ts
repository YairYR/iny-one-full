import fs from 'node:fs';
import path from 'node:path';
import { BloomFilter } from "bloom-filters";

let bloom: BloomFilter | null = null;
export function loadBloom(): BloomFilter {
  if (bloom) return bloom;

  const filePath = path.join(process.cwd(), "public", "bloom.bin");
  const data = fs.readFileSync(filePath, "utf-8");
  const json = JSON.parse(data);

  bloom = BloomFilter.fromJSON(json);
  return <BloomFilter> bloom;
}
