
import fs from 'node:fs';
import { initSync, find_proof } from './proof_work.js';


const bytes = fs.readFileSync(new URL('./proof_work_bg.wasm', import.meta.url));
initSync({ module: bytes });

// 1) Your live challenge payload - you can get this from https://www.ticketmaster.co.uk/epsf/pow/request	
const payload = {
  challenge: "1755169038-10558534669121080849",
  difficulty: 6,
  signature: "9c32d59f3240488f87347057a6b23c362e16c6bdd80547e7f0fb57424f38876a"
};


const prefix = '0'.repeat(payload.difficulty);

// helper: BigInt u64 -> Number (if safe) else decimal string
const toJS = v =>
    typeof v === 'bigint'
        ? (v <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(v) : v.toString())
        : v;

const res = await find_proof(payload.challenge, prefix);


const nonce = toJS(res.nonce);


const meetsTarget = String(res.hash).startsWith(prefix);

console.log('solver:', { nonce, hash: res.hash, meetsTarget });


const submitBody = {
  challenge: payload.challenge,
  difficulty: payload.difficulty,
  nonce,                 
  signature: payload.signature,
};

console.log('Submit this JSON:', JSON.stringify(submitBody));

