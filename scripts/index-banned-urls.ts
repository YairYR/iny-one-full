import fs from 'fs';
import _ from 'lodash';

/**
 * Fake
 * Threat Intelligence Feeds
 * DoH/VPN/TOR/Proxy Bypass
 * Dynamic DNS blocking
 * Badware Hoster blocking
 * URL Shortener
 * Anti Piracy
 * Gambling
 * NSFW
 */

const base_url = 'https://raw.githubusercontent.com/hagezi/dns-blocklists/main';
const base_url_phishing = 'https://raw.githubusercontent.com/Phishing-Database/Phishing.Database/master';
const db_domains_to_merge = {
  'fake-onlydomains': base_url + '/wildcard/fake-onlydomains.txt',
  'tif-onlydomains': base_url + '/wildcard/tif-onlydomains.txt',
  'doh-vpn-proxy-bypass-onlydomains': base_url + '/wildcard/doh-vpn-proxy-bypass-onlydomains.txt',
  'dyndns-onlydomains': base_url + '/wildcard/dyndns-onlydomains.txt',
  'hoster-onlydomains': base_url + '/wildcard/hoster-onlydomains.txt',
  'urlshortener-onlydomains': base_url + '/wildcard/urlshortener-onlydomains.txt',
  'anti.piracy-onlydomains': base_url + '/wildcard/anti.piracy-onlydomains.txt',
  'gambling-onlydomains': base_url + '/wildcard/gambling-onlydomains.txt',
  'nsfw-onlydomains': base_url + '/wildcard/nsfw-onlydomains.txt',

  // phishing
  'phishing-domains-ACTIVE': base_url_phishing + '/phishing-domains-ACTIVE.txt',
};

const args = process.argv.slice(2);

function downloadFile(url: string, filename: string) {
  return new Promise(async (resolve, reject) => {
    await fetch(url)
      .then((res) => res.text())
      .then((text) => {
        fs.writeFile(__dirname + '/files/' + filename, text, { encoding: 'utf8' }, (err) => {
          if(err) return reject(err);
          return resolve(text);
        });
      }).catch(reject);
  })
}

function getRandomTime(min: number, max: number) {
  min = Math.ceil(min); // Ensure min is an integer
  max = Math.floor(max); // Ensure max is an integer
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function get_all_files() {
  const keys = Object.keys(db_domains_to_merge);
  for (const key of keys) {
    // @ts-expect-error No causa error dado que uwu
    const url: string = base_url + db_domains_to_merge[key];
    await downloadFile(url, key + '.txt');
    await new Promise(resolve => setTimeout(resolve, getRandomTime(800, 2000)));
  }
}

function merge_all_files() {
  const fileNames = Object.keys(db_domains_to_merge);
  fileNames.push('porn-domains');
  let urls: string[] = [];

  for (const key of fileNames) {
    const text = fs.readFileSync(__dirname + '/files/' + key + '.txt', { encoding: 'utf8' });
    const lines = _.split(text, '\n').filter((line) => !line.startsWith('#'))
    urls = _.concat(urls, lines);
  }

  const domains = _.uniq(urls);
  console.log('before:', urls.length, 'after:', domains.length);

  const text = _.join(domains, '\n');
  domains.unshift('domain');
  const textCsv = _.join(domains, '\n');

  fs.writeFile(__dirname + '/files/all.txt', text, (err) => {
    if (err) console.log('[all.txt] error', err);
    else console.log('[all.txt] done');
  });
  fs.writeFile(__dirname + '/files/all.csv', textCsv, (err) => {
    if (err) console.log('[all.csv] error', err);
    else console.log('[all.csv] done');
  })
}

if(args[0] === '--get-all') {
  get_all_files()
    .catch(console.error);
}
else if(args[0] === '--merge') {
  merge_all_files();
}
else if(args[0] === '--get-and-merge') {
  get_all_files()
    .then(merge_all_files)
    .catch(console.error);
}