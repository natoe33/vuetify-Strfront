import { randomBytes } from "@noble/hashes/utils";
import { secp256k1 } from "@noble/curves/secp256k1";
import { base64 } from "@scure/base";

import { utf8Decoder, utf8Encoder } from "./utils";

// @ts-ignore
if (typeof crypto !== "undefined" && !crypto.subtle && crypto.webcrypto) {
  // @ts-ignore
  crypto.subtle = crypto.webcrypto.subtle;
}

export async function encrypt(
  privkey: string,
  pubkey: string,
  text: string
): Promise<string> {
  const key = secp256k1.getSharedSecret(privkey, "02" + pubkey);
  const normalizedKey = getNormalizedX(key);

  const iv = Uint8Array.from(randomBytes(16));
  const plaintext = utf8Encoder.encode(text);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    normalizedKey,
    { name: "AES-CBC" },
    false,
    ["encrypt"]
  );
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-CBC", iv },
    cryptoKey,
    plaintext
  );
  const ctb64 = base64.encode(new Uint8Array(ciphertext));
  const ivb64 = base64.encode(new Uint8Array(iv.buffer));

  return `${ctb64}?iv=${ivb64}`;
}

export async function decrypt(
  privkey: string,
  pubkey: string,
  data: string
): Promise<string> {
  const [ctb64, ivb64] = data.split("?iv=");
  const key = secp256k1.getSharedSecret(privkey, "02" + pubkey);
  const normalizedKey = getNormalizedX(key);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    normalizedKey,
    { name: "AES-CBC" },
    false,
    ["decrypt"]
  );
  const ciphertext = base64.decode(ctb64);
  const iv = base64.decode(ivb64);

  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-CBC", iv },
    cryptoKey,
    ciphertext
  );

  const text = utf8Decoder.decode(plaintext);
  return text;
}

function getNormalizedX(key: Uint8Array): Uint8Array {
  return key.slice(1, 33);
}
