// Sustituto CJS de nanoid 5 (que sólo se publica como ESM) para el entorno de
// test. Mantiene el contrato: identificador aleatorio del alfabeto url-safe.
const ALPHABET = 'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLFGQZbfghjklqvwyzrict';

function nanoid(size = 21) {
  let id = '';
  for (let index = 0; index < size; index++) {
    id += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return id;
}

module.exports = { nanoid, customAlphabet: (alphabet, size) => () => nanoid(size) };
