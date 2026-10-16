const TRUSTED_CLIENT_TOKEN = "6A5AA1D4EAFF4E9FB37E23D68491D6F4";
const WIN_EPOCH = 11_644_473_600;
const U32 = 0xffffffffn;

const SHA256_INITIAL = [
  0x6a09e667n, 0xbb67ae85n, 0x3c6ef372n, 0xa54ff53an, 0x510e527fn, 0x9b05688cn, 0x1f83d9abn, 0x5be0cd19n,
];
const SHA256_STATE = [
  0xfd9fbea2n, 0x91243ce7n, 0xbe499094n, 0xcd2e1e0an, 0x6c006f49n, 0x04bd35abn, 0xfeb0a7e4n, 0x03effbd2n,
];
const SHA256_SCHEDULE = [
  0xeb24bf9en, 0x1558691fn, 0xa0c09ee2n, 0x0cfa32ban, 0xa622ee8cn, 0xd1dd9491n, 0xc0dd25a0n, 0xf9e70ab6n,
  0xf0c31573n, 0x7058ce4en, 0x7188e606n, 0x00e5ab33n, 0xd258b060n, 0x72766564n,
];
const SHA256_ROUND_CONSTANTS = [
  0x428a2f98n, 0x71374491n, 0xb5c0fbcfn, 0xe9b5dba5n, 0x3956c25bn, 0x59f111f1n, 0x923f82a4n, 0xab1c5ed5n,
  0xd807aa98n, 0x12835b01n, 0x243185ben, 0x550c7dc3n, 0x72be5d74n, 0x80deb1fen, 0x9bdc06a7n, 0xc19bf174n,
  0xe49b69c1n, 0xefbe4786n, 0x0fc19dc6n, 0x240ca1ccn, 0x2de92c6fn, 0x4a7484aan, 0x5cb0a9dcn, 0x76f988dan,
  0x983e5152n, 0xa831c66dn, 0xb00327c8n, 0xbf597fc7n, 0xc6e00bf3n, 0xd5a79147n, 0x06ca6351n, 0x14292967n,
  0x27b70a85n, 0x2e1b2138n, 0x4d2c6dfcn, 0x53380d13n, 0x650a7354n, 0x766a0abbn, 0x81c2c92en, 0x92722c85n,
  0xa2bfe8a1n, 0xa81a664bn, 0xc24b8b70n, 0xc76c51a3n, 0xd192e819n, 0xd6990624n, 0xf40e3585n, 0x106aa070n,
  0x19a4c116n, 0x1e376c08n, 0x2748774cn, 0x34b0bcb5n, 0x391c0cb3n, 0x4ed8aa4an, 0x5b9cca4fn, 0x682e6ff3n,
  0x748f82een, 0x78a5636fn, 0x84c87814n, 0x8cc70208n, 0x90befffan, 0xa4506cebn, 0xbef9a3f7n, 0xc67178f2n,
];
const SHA256_ADJUSTMENT = 0xc9dc06a7n;
const SHA256_BLOCK_CONSTANTS = [
  ...SHA256_ROUND_CONSTANTS.slice(0, 14),
  SHA256_ADJUSTMENT,
  ...SHA256_ROUND_CONSTANTS.slice(15),
];
const SHA256_SIGMA0_ADJUSTMENT = 0x059c0b80n;
const SHA256_SIGMA1_ADJUSTMENT = 0x000b92c0n;

const CS64_COEFFICIENTS: Array<[bigint, bigint]> = [
  [0xe82e91b1n, 0xb32700d0n],
  [0x44de24c6n, 0x88dff51dn],
  [0x3beb65bcn, 0x29514038n],
  [0xc89c5933n, 0xb328cbdfn],
  [0x8d1ec211n, 0xd405b4d5n],
  [0x314ef5d5n, 0x26e55f3cn],
  [0xe92491b1n, 0x607801c6n],
  [0xf0a5b9d5n, 0x82b2c1fbn],
  [0x06064cf3n, 0xfa51a3dan],
  [0xda79fa60n, 0x207cc464n],
  [0xbed20560n, 0x3c3c74f3n],
  [0x89f9c9f8n, 0xd2d14b61n],
  [0x35fa38c6n, 0xbb04a2c1n],
  [0xcb49e3c6n, 0xc5626167n],
];
const CS64_FACTOR = 0x82893933n;
const CS64_ADJUSTMENT0 = 0xf2f90b1an;
const CS64_ADJUSTMENT1 = 0x0b1a0000n;

function u32(n: bigint): bigint {
  return n & U32;
}

function rol16(value: bigint): bigint {
  const v = u32(value);
  return u32((v << 16n) | (v >> 16n));
}

function wordsLe4Even(data: Uint8Array): bigint[] {
  const pad = (4 - (data.length % 4)) % 4;
  const padded = new Uint8Array(data.length + pad);
  padded.set(data);
  const words: bigint[] = [];
  for (let i = 0; i < padded.length; i += 4) {
    words.push(
      BigInt(padded[i]! | (padded[i + 1]! << 8) | (padded[i + 2]! << 16) | (padded[i + 3]! << 24)),
    );
  }
  if (words.length % 2) words.push(0n);
  return words;
}

function sigma0(value: bigint): bigint {
  return u32((value >> 7n) ^ (value << 25n) ^ (value >> 18n) ^ (value << 14n) ^ (value >> 3n));
}

function sigma1(value: bigint): bigint {
  return u32((value >> 17n) ^ (value << 15n) ^ (value >> 19n) ^ (value << 13n) ^ (value >> 10n));
}

function sha256Rounds(state: bigint[], words: bigint[], firstRound = 0): bigint[] {
  let a = state[0]!;
  let b = state[1]!;
  let c = state[2]!;
  let d = state[3]!;
  let e = state[4]!;
  let f = state[5]!;
  let g = state[6]!;
  let h = state[7]!;
  const constants = firstRound === 14 ? SHA256_BLOCK_CONSTANTS : SHA256_ROUND_CONSTANTS;
  const aligned = Math.min(64, Math.floor((firstRound + 7) / 8) * 8);
  for (let index = firstRound; index < aligned; index++) {
    const rotE = e * 0x100000001n;
    const rotA = a * 0x100000001n;
    const t1 =
      h +
      ((rotE >> 6n) ^ (rotE >> 11n) ^ (rotE >> 25n)) +
      (g ^ (e & (f ^ g))) +
      constants[index]! +
      words[index]!;
    const t2 = ((rotA >> 2n) ^ (rotA >> 13n) ^ (rotA >> 22n)) + ((a & b) | (c & (a | b)));
    const nextA = u32(t1 + t2);
    const nextE = u32(d + t1);
    h = g;
    g = f;
    f = e;
    e = nextE;
    d = c;
    c = b;
    b = a;
    a = nextA;
  }
  for (let index = aligned; index < 64; index += 8) {
    {
      const rotE = e * 0x100000001n;
      const rotA = a * 0x100000001n;
      const t1 = h + ((rotE >> 6n) ^ (rotE >> 11n) ^ (rotE >> 25n)) + (g ^ (e & (f ^ g))) + constants[index]! + words[index]!;
      d = u32(d + t1);
      h = u32(t1 + ((rotA >> 2n) ^ (rotA >> 13n) ^ (rotA >> 22n)) + ((a & b) | (c & (a | b))));
    }
    {
      const rotE = d * 0x100000001n;
      const rotA = h * 0x100000001n;
      const t1 = g + ((rotE >> 6n) ^ (rotE >> 11n) ^ (rotE >> 25n)) + (f ^ (d & (e ^ f))) + constants[index + 1]! + words[index + 1]!;
      c = u32(c + t1);
      g = u32(t1 + ((rotA >> 2n) ^ (rotA >> 13n) ^ (rotA >> 22n)) + ((h & a) | (b & (h | a))));
    }
    {
      const rotE = c * 0x100000001n;
      const rotA = g * 0x100000001n;
      const t1 = f + ((rotE >> 6n) ^ (rotE >> 11n) ^ (rotE >> 25n)) + (e ^ (c & (d ^ e))) + constants[index + 2]! + words[index + 2]!;
      b = u32(b + t1);
      f = u32(t1 + ((rotA >> 2n) ^ (rotA >> 13n) ^ (rotA >> 22n)) + ((g & h) | (a & (g | h))));
    }
    {
      const rotE = b * 0x100000001n;
      const rotA = f * 0x100000001n;
      const t1 = e + ((rotE >> 6n) ^ (rotE >> 11n) ^ (rotE >> 25n)) + (d ^ (b & (c ^ d))) + constants[index + 3]! + words[index + 3]!;
      a = u32(a + t1);
      e = u32(t1 + ((rotA >> 2n) ^ (rotA >> 13n) ^ (rotA >> 22n)) + ((f & g) | (h & (f | g))));
    }
    {
      const rotE = a * 0x100000001n;
      const rotA = e * 0x100000001n;
      const t1 = d + ((rotE >> 6n) ^ (rotE >> 11n) ^ (rotE >> 25n)) + (c ^ (a & (b ^ c))) + constants[index + 4]! + words[index + 4]!;
      h = u32(h + t1);
      d = u32(t1 + ((rotA >> 2n) ^ (rotA >> 13n) ^ (rotA >> 22n)) + ((e & f) | (g & (e | f))));
    }
    {
      const rotE = h * 0x100000001n;
      const rotA = d * 0x100000001n;
      const t1 = c + ((rotE >> 6n) ^ (rotE >> 11n) ^ (rotE >> 25n)) + (b ^ (h & (a ^ b))) + constants[index + 5]! + words[index + 5]!;
      g = u32(g + t1);
      c = u32(t1 + ((rotA >> 2n) ^ (rotA >> 13n) ^ (rotA >> 22n)) + ((d & e) | (f & (d | e))));
    }
    {
      const rotE = g * 0x100000001n;
      const rotA = c * 0x100000001n;
      const t1 = b + ((rotE >> 6n) ^ (rotE >> 11n) ^ (rotE >> 25n)) + (a ^ (g & (h ^ a))) + constants[index + 6]! + words[index + 6]!;
      f = u32(f + t1);
      b = u32(t1 + ((rotA >> 2n) ^ (rotA >> 13n) ^ (rotA >> 22n)) + ((c & d) | (e & (c | d))));
    }
    {
      const rotE = f * 0x100000001n;
      const rotA = b * 0x100000001n;
      const t1 = a + ((rotE >> 6n) ^ (rotE >> 11n) ^ (rotE >> 25n)) + (h ^ (f & (g ^ h))) + constants[index + 7]! + words[index + 7]!;
      e = u32(e + t1);
      a = u32(t1 + ((rotA >> 2n) ^ (rotA >> 13n) ^ (rotA >> 22n)) + ((b & c) | (d & (b | c))));
    }
  }
  return [a, b, c, d, e, f, g, h];
}

function expandSha256Schedule(words: bigint[], firstWord = 16) {
  for (let index = firstWord; index < 64; index++) {
    const x = words[index - 2]!;
    const y = words[index - 15]!;
    const s1 = (x >> 17n) ^ (x << 15n) ^ (x >> 19n) ^ (x << 13n) ^ (x >> 10n);
    const s0 = (y >> 7n) ^ (y << 25n) ^ (y >> 18n) ^ (y << 14n) ^ (y >> 3n);
    words.push(u32(s1 + words[index - 7]! + s0 + words[index - 16]!));
  }
}

function readBe(data: Uint8Array, start: number, len: number): bigint {
  let n = 0n;
  for (let i = 0; i < len; i++) n = (n << 8n) | BigInt(data[start + i] ?? 0);
  return n;
}

let cachedInit: bigint[] | null = null;
let cachedInitKey = "";

function sha256Init(data: Uint8Array): bigint[] {
  const key = Buffer.from(data.subarray(0, 7)).toString("hex");
  if (cachedInit && cachedInitKey === key) return cachedInit;
  const words: bigint[] = Array.from({ length: 14 }, () => 0n);
  words.push(readBe(data, 0, 3));
  words.push(readBe(data, 3, 4));
  for (let index = 16; index < 30; index++) {
    let value = SHA256_SCHEDULE[index - 16]!;
    if (index - 2 >= 14) {
      value += index === 16 ? sigma1(words[index - 2]!) ^ SHA256_SIGMA1_ADJUSTMENT : sigma1(words[index - 2]!);
    }
    if (index - 7 >= 14) value += words[index - 7]!;
    if (index - 15 >= 14) {
      value += index === 29 ? sigma0(words[index - 15]!) ^ SHA256_SIGMA0_ADJUSTMENT : sigma0(words[index - 15]!);
    }
    words.push(u32(value));
  }
  words.push(
    u32(
      sigma1(words[28]!) +
        words[23]! +
        sigma0(words[15]!) +
        words[14]! +
        SHA256_ADJUSTMENT -
        SHA256_ROUND_CONSTANTS[14]!,
    ),
  );
  expandSha256Schedule(words, 31);
  const working = sha256Rounds(SHA256_STATE, words, 14);
  cachedInit = SHA256_INITIAL.map((x, i) => u32(x + working[i]!));
  cachedInitKey = key;
  return cachedInit;
}

function sha256Digest(data: Uint8Array): Uint8Array {
  if (data.length < 7) throw new Error("Token salt must contain at least seven bytes");
  const length = 57 + data.length;
  const padLen = (55 - length) % 64;
  const padBytes = ((padLen % 64) + 64) % 64;
  const tail = data.subarray(7);
  const padded = new Uint8Array(tail.length + 1 + padBytes + 8);
  padded.set(tail);
  padded[tail.length] = 0x80;
  const bitLen = BigInt(length) * 8n;
  for (let i = 0; i < 8; i++) padded[padded.length - 1 - i] = Number((bitLen >> BigInt(i * 8)) & 0xffn);
  let state = sha256Init(data);
  for (let offset = 0; offset < padded.length; offset += 64) {
    const words: bigint[] = [];
    for (let i = 0; i < 16; i++) words.push(readBe(padded, offset + i * 4, 4));
    expandSha256Schedule(words);
    const working = sha256Rounds(state, words);
    state = state.map((x, i) => u32(x + working[i]!));
  }
  const out = new Uint8Array(32);
  state.forEach((word, i) => {
    out[i * 4] = Number((word >> 24n) & 0xffn);
    out[i * 4 + 1] = Number((word >> 16n) & 0xffn);
    out[i * 4 + 2] = Number((word >> 8n) & 0xffn);
    out[i * 4 + 3] = Number(word & 0xffn);
  });
  return out;
}

function cs64Digest(data: Uint8Array, digest: Uint8Array): [bigint, bigint] {
  let keyA = BigInt(digest[0]! | (digest[1]! << 8) | (digest[2]! << 16) | (digest[3]! << 24));
  let keyB = BigInt(digest[4]! | (digest[5]! << 8) | (digest[6]! << 16) | (digest[7]! << 24));
  keyA |= 1n;
  keyB |= 1n;
  const factors = [u32(keyA * CS64_FACTOR), u32(keyB * CS64_FACTOR)];
  const terms: bigint[] = CS64_COEFFICIENTS.map(([coefficient], index) => u32(coefficient * factors[index % 2]!));
  const offsets: bigint[] = CS64_COEFFICIENTS.map(([, offset]) => offset);
  const prefix = new Uint8Array(data.length + 1);
  prefix.set(data, 1);
  wordsLe4Even(prefix).forEach((word, index) => {
    let term = word * (index % 2 === 0 ? keyA : keyB);
    let offset = rol16(word) * (index % 2 === 0 ? 0xef0569fbn : 0xc31713dbn);
    if (index === 0) {
      term += CS64_ADJUSTMENT0 * factors[0]!;
      offset += CS64_ADJUSTMENT1;
    }
    terms.push(u32(term));
    offsets.push(u32(offset));
  });
  let swapAcc = 0n;
  let swapLast = 0n;
  let state = 0n;
  let acc = 0n;
  for (let index = 0; index < terms.length; index += 2) {
    const x = terms[index]!;
    const y = terms[index + 1]!;
    let t = rol16(u32(offsets[index]! + x));
    let q = u32(t * 0x76f50f34n);
    swapAcc += u32(rol16(q) * 0xc3efea97n + q);
    t = rol16(u32(offsets[index + 1]! + y));
    q = u32(t * 0x1881ce3cn);
    swapLast = u32(rol16(q) * 0x35bd1ec9n + q);
    swapAcc = u32(swapAcc + swapLast);
    state = u32(state * keyA + x);
    state = u32(rol16(state) * 0xcf98b111n);
    state = u32(rol16(state) * 0x87085b9fn);
    state = u32(rol16(state) * 0x12ceb96dn);
    state = u32(rol16(state) * 0x257e1d83n);
    acc += state;
    t = u32(state * keyB + y);
    t = u32(rol16(t) * 0xa27416f5n);
    t = u32(rol16(t) * 0xd38396ffn);
    state = u32(rol16(u32(rol16(t) * 0x7c932b89n)) * 0xbfa49f69n);
    acc = u32(acc + state);
  }
  return [swapLast ^ state, swapAcc ^ acc];
}

function tokenHash(data: Uint8Array): [string, string] {
  const digest = sha256Digest(data);
  const [a, b] = cs64Digest(data, digest);
  const aw = Number(u32(a));
  const bw = Number(u32(b));
  const le = Uint8Array.from([
    aw & 0xff,
    (aw >> 8) & 0xff,
    (aw >> 16) & 0xff,
    (aw >> 24) & 0xff,
    bw & 0xff,
    (bw >> 8) & 0xff,
    (bw >> 16) & 0xff,
    (bw >> 24) & 0xff,
  ]);
  return [Buffer.from(le).toString("hex").toUpperCase(), Buffer.from(digest).toString("hex").toUpperCase()];
}

export const EDGE_CLIENT_TOKEN = TRUSTED_CLIENT_TOKEN;
export const EDGE_GEC_VERSION = "2-143.0.3650.75";

export function generateSecMsGec(unixSeconds = Date.now() / 1000): string {
  let ticks = unixSeconds + WIN_EPOCH;
  ticks -= ticks % 300;
  ticks *= 1e7;
  const stamp = Math.round(ticks).toString();
  const [cs64, sha] = tokenHash(Buffer.from(`${stamp}${TRUSTED_CLIENT_TOKEN}`, "ascii"));
  return `${cs64}-${sha}`;
}
