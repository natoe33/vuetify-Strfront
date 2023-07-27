import crypto from "node:crypto";

import { encrypt, decrypt } from "./nip04.ts";
import { getPublicKey, generatePrivateKey } from "./keys.ts";

// @ts-ignore
// eslint-disable-next-line no-undef
globalThis.crypto = crypto;

test("encrypt and decrypt message", async () => {
  const sk1 = generatePrivateKey();
  const sk2 = generatePrivateKey();
  const pk1 = getPublicKey(sk1);
  const pk2 = getPublicKey(sk2);

  expect(await decrypt(sk2, pk1, await encrypt(sk1, pk2, "hello"))).toEqual(
    "hello"
  );
});
