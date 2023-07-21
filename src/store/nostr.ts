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
  user: RemovableRef<NDKUser>;
  npub: RemovableRef<string>;
  pkey: RemovableRef<string>;
  pubKey: RemovableRef<string>;
  pubkeyLogin: RemovableRef<boolean>;
  relayList: RemovableRef<Relay[]>;
  relayUrls: string[];
  store: NDKEvent;
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
    user: useLocalStorage("user", new NDKUser({})),
    npub: useLocalStorage("npub", ""),
    pkey: useLocalStorage("pkey", ""),
    pubKey: useLocalStorage("pubkey", ""),
    pubkeyLogin: useLocalStorage("pubkeyLogin", false),
    relayList: useLocalStorage("relayList", [] as Relay[]),
    relayUrls: relayUrls,
    store: new NDKEvent(),
  }),
  getters: {
    getRelay: (state) => {
      return state.relay;
    },
    getNostr: (state) => {
      return state.nostrProvider;
    },
    getUtils: (state) => {
      return state.utils;
    },
    getUser: (state) => {
      return state.user;
    },
    getNpub: (state) => {
      return state.npub;
    },
    getPrivKey: (state) => {
      return state.pkey;
    },
    getPubKey: (state) => {
      return state.pubKey;
    },
    getPubKeyLogin: (state) => {
      return state.pubkeyLogin;
    },
    getRelays: (state) => {
      return state.relayUrls;
    },
    getUserMerchantEvent: async (state) => {
      console.log(`Fetching stall for ${state.user.hexpubkey()}`);
      return await state.nostrProvider.fetchMerchantEvents([
        state.user.hexpubkey(),
      ]);
    },
  },
  actions: {
    setUser(user: NDKUser) {
      this.user = user;
    },
    setNpub(npub: string) {
      this.npub = npub;
    },
    setPrivKey(pkey: string) {
      this.pkey = pkey;
    },
    setPubKey(pubkey: string) {
      this.pubKey = pubkey;
    },
    setPubkeyLogin(pubkeyLogin: boolean) {
      this.pubkeyLogin = pubkeyLogin;
    },
    setRelays(relays: string[]) {
      this.relayUrls = relays;
    },
  },
});
