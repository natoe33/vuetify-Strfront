// Utilities
import { defineStore } from "pinia";
import { useLocalStorage, type RemovableRef } from "@vueuse/core";
import { Product, Relay } from "@/models";
import {
  Utils,
  NostrProviderService,
  RelayHelper,
  db,
  dbService,
} from "@/utils";
import NDK, {
  NDKEvent,
  NDKKind,
  NDKFilter,
  NDKUser,
  type NDKUserProfile,
} from "@/ndk";
import { type Filter } from "@/nostr-tools";

const relayUrls: string[] = [
  "wss://relay.damus.io",
  "wss://eden.nostr.land",
  "wss://relay.nostr.band",
];

type State = {
  relay: NDK;
  helper: RelayHelper;
  nostrProvider: NostrProviderService;
  utils: Utils;
  user: NDKUser;
  npub: RemovableRef<string>;
  pkey: RemovableRef<string>;
  pubKey: RemovableRef<string>;
  pubkeyLogin: RemovableRef<boolean>;
  relayList: RemovableRef<Relay[]>;
  relayUrls: string[];
  // products: RemovableRef<Product[]>;
  // productTags: RemovableRef<ProductTags[]>;
  // events: RemovableRef<NDKEvent[]>;
  // tags: RemovableRef<string[]>;
};

export const useNostrStore = defineStore({
  id: "nostr",
  state: (): State => ({
    relay: new NDK({ explicitRelayUrls: relayUrls }),
    helper: new RelayHelper(relayUrls),
    nostrProvider: new NostrProviderService(),
    utils: new Utils(),
    user: new NDKUser({}),
    npub: useLocalStorage("npub", ""),
    pkey: useLocalStorage("pkey", ""),
    pubKey: useLocalStorage("pubkey", ""),
    pubkeyLogin: useLocalStorage("pubkeyLogin", false),
    relayList: useLocalStorage("relayList", [] as Relay[]),
    relayUrls: relayUrls,
  }),
});
