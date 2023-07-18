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

const relayUrls: string[] = ["wss://relay.damus.io", "wss://eden.nostr.land"];

const ITEMS_PER_PAGE = 40;

type ProductTags = {
  product_id: string;
  tag: string;
};

type State = {
  relay: NDK;
  helper: RelayHelper;
  nostrProvider: NostrProviderService;
  utils: Utils;
  db: dbService;
  loggingIn: RemovableRef<boolean>;
  loggedIn: RemovableRef<boolean>;
  drawer: boolean;
  page: RemovableRef<number>;
  tag: string;
  tagLoading: boolean;
  loading: boolean;
  productsLoading: boolean;
  newProduct: boolean;
  user: NDKUser;
  npub: RemovableRef<string>;
  pkey: RemovableRef<string>;
  pubKey: RemovableRef<string>;
  pubkeyLogin: RemovableRef<boolean>;
  relayList: RemovableRef<Relay[]>;
  relayUrls: string[];
  products: Product[];
  // products: RemovableRef<Product[]>;
  // productTags: RemovableRef<ProductTags[]>;
  // events: RemovableRef<NDKEvent[]>;
  // tags: RemovableRef<string[]>;
};

export const useAppStore = defineStore({
  id: "app",
  state: (): State => ({
    relay: new NDK({ explicitRelayUrls: relayUrls }),
    helper: new RelayHelper(relayUrls),
    nostrProvider: new NostrProviderService(),
    utils: new Utils(),
    db: db,
    loggingIn: useLocalStorage("loggingIn", false),
    loggedIn: useLocalStorage("loggedIn", false),
    drawer: false,
    page: useLocalStorage("page", 1),
    tag: "",
    tagLoading: false,
    loading: false,
    productsLoading: false,
    newProduct: false,
    user: new NDKUser({}),
    npub: useLocalStorage("npub", ""),
    pkey: useLocalStorage("pkey", ""),
    pubKey: useLocalStorage("pubkey", ""),
    pubkeyLogin: useLocalStorage("pubkeyLogin", false),
    relayList: useLocalStorage("relayList", [] as Relay[]),
    relayUrls: relayUrls,
    products: [] as Product[],
    // products: useLocalStorage("products", [] as Product[]),
    // productTags: useLocalStorage("productTags", [] as ProductTags[]),
    // events: useLocalStorage("events", [] as NDKEvent[]),
    // tags: useLocalStorage("tags", [] as string[]),
  }),
  getters: {
    getNDK: (state) => {
      return state.relay;
    },
    getSortedTags: async (state) => {
      const list = await state.db.tags.toArray();
      console.log(list);
      return ["a", "b", "c"];
    },
    getLoggedIn: (state) => {
      return state.loggedIn;
    },
    getProducts: async (state) => {
      // TODO: detect browser and determine if Dexie or localstorage should be used
      console.log(`return products for page ${state.page}`);
      return await state.db.products
        .orderBy("created_at")
        .offset((state.page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE)
        .toArray();
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
    getMerchant: (state) => {
      return async (stall_id: string) =>
        await state.db.merchants
          .where("stall_id")
          .equalsIgnoreCase(stall_id)
          .limit(1)
          .toArray();
    },
    getMerchantProfile: (state) => {
      return async (pubkey: string) =>
        await state.nostrProvider.fetchProfileEvent(pubkey);
    },
    getNumOfPages: async (state) => {
      const numItems = await state.db.products.count();
      console.log(
        `${numItems} stored for ${Math.ceil(numItems / ITEMS_PER_PAGE)} pages`
      );
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
    getProductsWithTags: (state) => {
      // console.log(`getProductsWithTags tag: ${state.tag}`);
      // const taggedProds = state.productTags.filter((p) => p.tag === state.tag);
      // console.log(taggedProds);
      // const retProd = state.products.filter(
      //   (p) => p.tags.indexOf(state.tag) !== -1
      // );
      // console.log(retProd);
      // return retProd;
    },
    getEvents: async (state) => {
      return await state.db.products.count();
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
    async initialEvents() {
      this.productsLoading = true;
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
    nextPage() {
      this.page++;
      this.loading = true;
    },
    prevPage() {
      this.page--;
      this.loading = true;
    },
    saveEvent(event: NDKEvent) {
      // this.events.push(event);
    },
    clearRelays() {
      this.relayList = [];
    },
    addRelays(relays: Relay[]) {
      this.relayList = relays;
    },
    async loadProductsUsingTags() {
      // console.log(`getProductsWithTags tag: ${this.tag}`);
      // const taggedProds = await this.productTags.filter(
      //   (p) => p.tag === this.tag
      // );
      // console.log(taggedProds);
      // const prods = taggedProds.map((x) => {
      //   return x.product_id;
      // });
      // console.log(prods);
      // const filteredProds = this.products.filter((p) =>
      //   prods.includes(p.product_id)
      // );
      // console.log(filteredProds);
      // return filteredProds;
    },
  },
});
