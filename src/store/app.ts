// Utilities
import { defineStore } from "pinia";
import { useLocalStorage, type RemovableRef } from "@vueuse/core";
import { Product, Relay } from "@/models";
import { Event as NEvent, type Filter } from "@/nostr-tools";
import { db, dbService, Utils, IEvent, NostrProviderService } from "@/utils";
import NDK, { NDKEvent, NDKKind, NostrEvent } from "@/ndk";

const relayUrls: string[] = ["wss://relay.damus.io", "wss://eden.nostr.land"];

type ProductTags = {
  product_id: string;
  tag: string;
};

type State = {
  relay: NDK;
  nostrProvider: NostrProviderService;
  utils: Utils;
  db: dbService;
  page: number;
  npub: RemovableRef<string>;
  pkey: RemovableRef<string>;
  pubKey: RemovableRef<string>;
  relayList: RemovableRef<Relay[]>;
  products: RemovableRef<Product[]>;
  productTags: RemovableRef<ProductTags[]>;
  events: RemovableRef<NDKEvent[]>;
  tags: RemovableRef<string[]>;
};

export const useAppStore = defineStore({
  id: "app",
  state: (): State => ({
    relay: new NDK({ explicitRelayUrls: relayUrls }),
    nostrProvider: new NostrProviderService(db),
    utils: new Utils(),
    db: db,
    page: 0,
    npub: useLocalStorage("npub", ""),
    pkey: useLocalStorage("pkey", ""),
    pubKey: useLocalStorage("pubkey", ""),
    relayList: useLocalStorage("relayList", [] as Relay[]),
    products: useLocalStorage("products", [] as Product[]),
    productTags: useLocalStorage("productTags", [] as ProductTags[]),
    events: useLocalStorage("events", [] as NDKEvent[]),
    tags: useLocalStorage("tags", [] as string[]),
  }),
  getters: {
    getTags: (state) => {
      return state.tags;
    },
    getSortedTags: async (state) => {
      return state.tags.sort();
    },
    getProducts: (state) => {
      return state.products;
    },
    getNpub: (state) => {
      return state.npub;
    },
    getPKey: (state) => {
      return state.pkey;
    },
    getPubKey: (state) => {
      return state.pubKey;
    },
    getProduct: (state) => {
      return (id: string) =>
        state.products.find((product) => product.id === id);
    },
    getProductsWithTags: (state) => {
      const products = (tag: string) =>
        state.productTags.filter((product) => product.tag === tag);
      console.log(products);
    },
    getEvents: (state) => {
      return state.events;
    },
    getRelays: (state) => {
      return state.relayList;
    },
  },
  actions: {
    addEvent(event: NEvent) {
      // console.log(`AppStore: event added ${event.content}`);
      this.saveEvent(event);
      this.events.push(event);
      const product: Product = this.utils.parseProduct(event);
      this.db.products.add(product);
      this.products.push(product);
      this.utils.parseTags(event).forEach((tag) => {
        if (this.tags.filter((t) => t === tag).length === 0) {
          this.tags.push(tag);
          const prodTag: ProductTags = { product_id: product.id, tag: tag };
          this.productTags.push(prodTag);
          this.db.productTags.add(prodTag);
        }
      });
      // this.products.push(product);
    },
    createSub(filters: Filter) {
      // this.relay.createSub(this.relay.getPool(), filters);
    },
    initialEvents() {
      this.nostrProvider.fetchEvents(NDKKind.Product)
    },
    saveEvent(event: NEvent) {
      
    },
    clearRelays() {
      this.relayList = [];
    },
    addRelays(relays: Relay[]) {
      this.relayList = relays;
    },
  },
});
