// main.mjs  (or main.js with package.json: { "type": "module" })
import fs from 'node:fs';
import { initSync, find_proof } from './proof_work.js'; // named export from the glue

// 1) Init WASM from local bytes (no deprecation warning)
const bytes = fs.readFileSync(new URL('./proof_work_bg.wasm', import.meta.url));
initSync({ module: bytes }); // pass an OBJECT, not raw bytes

// 2) Your live challenge payload
const payload = {
  challenge: "1755169038-10558534669121080849",
  difficulty: 6,
  signature: "9c32d59f3240488f87347057a6b23c362e16c6bdd80547e7f0fb57424f38876a"
};

// 3) Use the confirmed calling convention: challenge + hex-zero prefix
const prefix = '0'.repeat(payload.difficulty);

// helper: BigInt u64 -> Number (if safe) else decimal string
const toJS = v =>
    typeof v === 'bigint'
        ? (v <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(v) : v.toString())
        : v;

const res = await find_proof(payload.challenge, prefix);

// Normalize nonce for submission
const nonce = toJS(res.nonce);

// Optional sanity check (leading zeros)
const meetsTarget = String(res.hash).startsWith(prefix);

console.log('solver:', { nonce, hash: res.hash, meetsTarget });

// 4) EXACT body to submit (server expects these 4 fields only)
const submitBody = {
  challenge: payload.challenge,
  difficulty: payload.difficulty,
  nonce,                 // number if safe; if you prefer, String(nonce) is also commonly accepted
  signature: payload.signature,
};

console.log('Submit this JSON:', JSON.stringify(submitBody));
