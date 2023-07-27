import { bech32 } from "@scure/base";

import {
  Kind,
  validateEvent,
  verifySignature,
  type Event,
  type EventTemplate,
} from "./event";
import { utf8Decoder } from "./utils";

let _fetch: any;

try {
  _fetch = fetch;
} catch {}

export function useFetchImplementation(fetchImplementation: any) {
  _fetch = fetchImplementation;
}

export async function getZapEndpoint(
  metadata: Event<Kind.Metadata>
): Promise<null | string> {
  try {
    let lnurl: string = "";
    const { lud06, lud16 } = JSON.parse(metadata.content);
    if (lud06) {
      const { words } = bech32.decode(lud06, 1000);
      const data = bech32.fromWords(words);
      lnurl = utf8Decoder.decode(data);
    } else if (lud16) {
      const [name, domain] = lud16.split("@");
      lnurl = `https://${domain}/.well-known/lnurlp/${name}`;
    } else {
      return null;
    }

    const res = await _fetch(lnurl);
    const body = await res.json();

    if (body.allowsNostr && body.nostrPubkey) {
      return body.callback;
    }
  } catch (err) {
    /*-*/
  }

  return null;
}

export function makeZapRequest({
  profile,
  event,
  amount,
  relays,
  comment = "",
}: {
  profile: string;
  event: string | null;
  amount: number;
  comment: string;
  relays: string[];
}): EventTemplate<Kind.ZapRequest> {
  if (!amount) throw new Error("amount not given");
  if (!profile) throw new Error("profile not given");

  const zr: EventTemplate<Kind.ZapRequest> = {
    kind: 9734,
    created_at: Math.round(Date.now() / 1000),
    content: comment,
    tags: [
      ["p", profile],
      ["amount", amount.toString()],
      ["relays", ...relays],
    ],
  };

  if (event) {
    zr.tags.push(["e", event]);
  }

  return zr;
}

export function validateZapRequest(zapRequestString: string): string | null {
  let zapRequest: Event;

  try {
    zapRequest = JSON.parse(zapRequestString);
  } catch (err) {
    return "Invalid zap request JSON.";
  }

  if (!validateEvent(zapRequest))
    return "Zap request is not a valid Nostr event.";

  if (!verifySignature(zapRequest)) return "Invalid signature on zap request.";

  const p = zapRequest.tags.find(([t, v]) => t === "p" && v);
  if (!p) return "Zap request doesn't have a 'p' tag.";
  if (!p[1].match(/^[a-f0-9]{64}$/))
    return "Zap request 'p' tag is not valid hex.";

  const e = zapRequest.tags.find(([t, v]) => t === "e" && v);
  if (e && !e[1].match(/^[a-f0-9]{64}$/))
    return "Zap request 'e' tag is not valid hex.";

  const relays = zapRequest.tags.find(([t, v]) => t === "relays" && v);
  if (!relays) return "Zap request doesn't have a 'relays' tag.";

  return null;
}

export function makeZapReceipt({
  zapRequest,
  preimage,
  bolt11,
  paidAt,
}: {
  zapRequest: string;
  preimage?: string;
  bolt11: string;
  paidAt: Date;
}): EventTemplate<Kind.Zap> {
  const zr: Event<Kind.ZapRequest> = JSON.parse(zapRequest);
  const tagsFromZapRequest = zr.tags.filter(
    ([t]) => t === "e" || t === "p" || t === "a"
  );

  const zap: EventTemplate<Kind.Zap> = {
    kind: 9735,
    created_at: Math.round(paidAt.getTime() / 1000),
    content: "",
    tags: [
      ...tagsFromZapRequest,
      ["bolt11", bolt11],
      ["description", zapRequest],
    ],
  };

  if (preimage) {
    zap.tags.push(["preimage", preimage]);
  }

  return zap;
}
