import { loadBloom } from "@/utils/check_domain";

const args = process.argv.slice(2);
const domains = args[0]?.split(',') ?? [];

if(domains.length === 0) {
  console.log('command usage:\n\ncheck-domain.ts <domain-list>\n\noptions:\n  <domain-list>\tseparated by ","');
  process.exit(1);
}

const filter = loadBloom();
const founds = domains.filter((domain) => (Boolean(domain) && filter.has(domain)));

if (founds.length > 0) {
  console.log("Domains found.");
  console.log(founds.join("\n"));
} else {
  console.log("No domains found.");
}
