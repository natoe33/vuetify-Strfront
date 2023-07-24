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
  db: dbService;
  relay: NDK;
  helper: RelayHelper;
  nostrProvider: NostrProviderService;
  utils: Utils;
  productsLoading: boolean;
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
    db: db,
    relay: new NDK({ explicitRelayUrls: relayUrls }),
    helper: new RelayHelper(relayUrls),
    nostrProvider: new NostrProviderService(),
    utils: new Utils(),
    productsLoading: false,
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
    getEvents: async (state) => {
      return await state.db.products.count();
    },
    getMerchantProfile: (state) => {
      return async (pubkey: string) =>
        await state.nostrProvider.fetchProfileEvent(pubkey);
    },
    getUserMerchantEvent: async (state) => {
      const userPubKey = state.user.hexpubkey();
      console.log(`Fetching stall for ${userPubKey}`);
      return await state.nostrProvider.fetchMerchantEvents([userPubKey]);
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
    createSub(filters: Filter) {
      this.helper.createSub(this.helper.getPool(), filters);
    },
    async initialEvents() {
      const eventSet: Set<NDKEvent> | undefined =
        await this.nostrProvider.fetchEvents(NDKKind.Product);
      console.log(eventSet);
      const merchSet: Set<NDKEvent> | undefined =
        await this.nostrProvider.fetchEvents(NDKKind.Stall);
      console.log(merchSet);
      if (eventSet) {
        eventSet.forEach((event) => {
          // console.log(event);
          this.utils.parseEvent(event);
        });
      }
      if (merchSet) {
        merchSet.forEach((event) => {
          this.utils.parseEvent(event);
        });
      }
      console.log("Exiting initialEvents");
    },
    async subEvent(filters: NDKFilter) {
      // TODO: Replace with NDK implementation
      this.helper.createSub(this.helper.getPool(), filters);
    },
  },
});
