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
import NDK, { NDKEvent, NDKKind } from "@/ndk";
import { type Filter } from "@/nostr-tools";

const relayUrls: string[] = ["wss://relay.damus.io", "wss://eden.nostr.land"];

const ITEMS_PER_PAGE = 40;

type ProductTags = {
  product_id: string;
  tag: string;
};

type State = {
  relay: NDK;
  helper: RelayHelper;
  // nostrProvider: NostrProviderService;
  utils: Utils;
  db: dbService;
  page: number;
  tag: string;
  tagLoading: boolean;
  loading: boolean;
  newProduct: boolean;
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
    helper: new RelayHelper(relayUrls),
    // nostrProvider: new NostrProviderService(),
    utils: new Utils(),
    db: db,
    page: 0,
    tag: "",
    tagLoading: false,
    loading: false,
    newProduct: false,
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
    // getNDK: (state) => {
    //   return state.relay;
    // },
    getSortedTags: async (state) => {
      return state.tags.sort();
    },
    getProducts: async (state) => {
      console.log(`return products for page ${state.page}`);
      return await state.db.products
        .orderBy("created_at")
        .offset(state.page * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE)
        .toArray();
    },
    getMerchant: (state) => {
      return async (stall_id: string) =>
        await state.db.merchants
          .where("stall_id")
          .equalsIgnoreCase(stall_id)
          .limit(1)
          .toArray();
    },
    getNumOfPages: async (state) => {
      const numItems = await state.db.products.count();
      return Math.ceil(numItems / ITEMS_PER_PAGE);
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
      return async (id: string) =>
        await state.db.products
          .where("event_id")
          .equalsIgnoreCase(id)
          .toArray();
      // return (id: string) =>
      //   state.products.find((product) => product.event_id === id);
    },
    getProductsWithTags: (state) => {
      console.log(`getProductsWithTags tag: ${state.tag}`);
      const taggedProds = state.productTags.filter((p) => p.tag === state.tag);
      console.log(taggedProds);
      const retProd = state.products.filter(
        (p) => p.tags.indexOf(state.tag) !== -1
      );
      console.log(retProd);
      return retProd;
    },
    getEvents: (state) => {
      return state.events;
    },
    getRelays: (state) => {
      return state.relayList;
    },
  },
  actions: {
    createSub(filters: Filter) {
      this.helper.createSub(this.helper.getPool(), filters);
    },
    addEvent(event: NDKEvent) {
      // console.log(`AppStore: event added ${event.content}`);
      // this.saveEvent(event);
      // this.events.push(event);
      // const product: Product = this.utils.parseProduct(event);
      // this.products.push(product);
      // this.utils.parseTags(event).forEach((tag) => {
      //   if (this.tags.filter((t) => t === tag).length === 0) {
      //     this.tags.push(tag);
      //     const prodTag: ProductTags = { product_id: product.event_id, tag: tag };
      //     this.productTags.push(prodTag);
      //   }
      // });
      // this.products.push(product);
    },
    setTagandLoading(tag: string) {
      this.tag = tag;
      this.tagLoading = true;
    },
    clearTagandLoading() {
      this.tag = "";
      this.page = 0;
      this.loading = false;
    },
    // async initialEvents() {
    //   const eventSet = await this.nostrProvider.fetchEvents(NDKKind.Product);
    //   const merchSet = await this.nostrProvider.fetchEvents(NDKKind.Stall);
    //   console.log(merchSet);
    //   if (eventSet) {
    //     eventSet.forEach((event) => {
    //       const product: Product = this.utils.parseProduct(event);
    //       if (
    //         this.products.filter((prod) => prod.event_id === product.event_id).length === 0
    //       )
    //         this.products.push(product);
    //       this.utils.parseTags(event).forEach((tag) => {
    //         const prodTag: ProductTags = {
    //           product_id: product.product_id,
    //           tag: tag,
    //         };
    //         if (
    //           this.productTags.filter(
    //             (t) => t.product_id === product.product_id && t.tag === tag
    //           ).length === 0
    //         )
    //           this.productTags.push(prodTag);
    //         if (this.tags.filter((t) => t === tag).length === 0)
    //           this.tags.push(tag);
    //       });
    //     });
    //   }
    // },
    // async merchantEvent(filters: Filter) {
    //   this.helper.createSub(this.helper.getPool(), filters);
    // },
    nextPage() {
      this.page++;
      this.loading = true;
    },
    prevPage() {
      this.page--;
      this.loading = true;
    },
    saveEvent(event: NDKEvent) {
      this.events.push(event);
    },
    clearRelays() {
      this.relayList = [];
    },
    addRelays(relays: Relay[]) {
      this.relayList = relays;
    },
    async loadProductsUsingTags() {
      console.log(`getProductsWithTags tag: ${this.tag}`);
      const taggedProds = await this.productTags.filter(
        (p) => p.tag === this.tag
      );
      console.log(taggedProds);
      const prods = taggedProds.map((x) => {
        return x.product_id;
      });
      console.log(prods);
      const filteredProds = this.products.filter((p) =>
        prods.includes(p.product_id)
      );
      console.log(filteredProds);
      return filteredProds;
    },
  },
});
