// Utilities
import { defineStore } from "pinia";
import { useLocalStorage, type RemovableRef } from "@vueuse/core";
import { Product, Relay, Stall } from "@/models";
import {
  Utils,
  NostrProviderService,
  db,
  dbService,
} from "@/utils";
import NDK, {
  NDKEvent,
  NDKKind,
  NDKFilter,
  NDKSubscription,
  NDKUser,
  type NDKUserProfile,
} from "@/ndk";
import { type Filter } from "@/nostr-tools";

const relayUrls: string[] = ["wss://relay.damus.io", "wss://relay.nostr.band"];

const ITEMS_PER_PAGE = 40;

type ProductTags = {
  product_id: string;
  tag: string;
};

type State = {
  relay: NDK;
  // helper: RelayHelper;
  nostrProvider: NostrProviderService;
  utils: Utils;
  db: dbService;
  loggingIn: boolean;
  loggedIn: RemovableRef<boolean>;
  user: RemovableRef<NDKUser>;
  npub: RemovableRef<string>;
  privkey: string;
  pubkeyLogin: RemovableRef<boolean>;
  drawer: boolean;
  overflow: boolean;
  openStore: boolean;
  page: RemovableRef<number>;
  tag: string;
  tagLoading: boolean;
  loading: boolean;
  productsLoading: boolean;
  newProduct: boolean;
  relayList: RemovableRef<Relay[]>;
  relayUrls: string[];
  products: RemovableRef<Product[]>;
  stalls: RemovableRef<Stall[]>;
  store: NDKEvent;
  events: RemovableRef<Map<string, NDKEvent>>;
};

export const useAppStore = defineStore({
  id: "app",
  state: (): State => ({
    relay: new NDK({ explicitRelayUrls: relayUrls }),
    // helper: new RelayHelper(relayUrls),
    nostrProvider: new NostrProviderService(),
    utils: new Utils(),
    db: db,
    loggingIn: false,
    loggedIn: useLocalStorage("loggedIn", false),
    user: useLocalStorage("user", new NDKUser({})),
    npub: useLocalStorage("npub", ""),
    privkey: "",
    pubkeyLogin: useLocalStorage("pubkeyLogin", false),
    drawer: false,
    overflow: false,
    openStore: false,
    page: useLocalStorage("page", 1),
    tag: "",
    tagLoading: false,
    loading: false,
    productsLoading: false,
    newProduct: false,
    relayList: useLocalStorage("relayList", [] as Relay[]),
    relayUrls: relayUrls,
    products: useLocalStorage("products", [] as Product[]),
    stalls: useLocalStorage("stalls", [] as Stall[]),
    store: new NDKEvent(),
    // products: useLocalStorage("products", [] as Product[]),
    // productTags: useLocalStorage("productTags", [] as ProductTags[]),
    events: useLocalStorage("events", new Map()),
    // tags: useLocalStorage("tags", [] as string[]),
  }),
  getters: {
    getNDK: (state) => {
      // return state.relay;
    },
    getUser: (state) => {
      return state.user;
    },
    getPrivKey: (state) => {
      return state.privkey;
    },
    getPubKey: (state) => {
      return state.user.hexpubkey();
    },
    getNpub: (state) => {
      return state.npub;
    },
    getSortedTags: async (state) => {
      const list = await state.db.tags.toArray();
      // console.log(list);
      return ["a", "b", "c"];
    },
    getLoggedIn: (state) => {
      return state.loggedIn;
    },
    getLoggingIn: (state) => {
      return state.loggingIn;
    },
    getProducts: (state) => {
      // TODO: detect browser and determine if Dexie or localstorage should be used
      console.log(`return products for page ${state.page}`);
      return state.products.sort();
      // return await state.db.products
      //   .orderBy("created_at")
      //   .offset((state.page - 1) * ITEMS_PER_PAGE)
      //   .limit(ITEMS_PER_PAGE)
      //   .toArray();
    },
    getProduct: (state) => {
      return (event_id: string) => state.products.find((p) => p.event_id === event_id);
    },
    getMerchant: (state) => {
      return (stall_id: string) => state.stalls.find((s) => s.stall_id === stall_id);
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
    getNumOfPages: (state) => {
      // const numItems = await state.db.products.count();
      const numItems = state.products.length;
      console.log(
        `${numItems} stored for ${Math.ceil(numItems / ITEMS_PER_PAGE)} pages`
      );
      return Math.ceil(numItems / ITEMS_PER_PAGE);
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
      return state.events.size;
      // return await state.db.products.count();
    },
    getRelays: (state) => {
      return state.relayList;
    },
  },
  actions: {
    setUser(user: NDKUser) {
      this.user = user;
    },
    setNpub(npub: string) {
      this.npub = npub;
    },
    setLoggedIn(loggedIn: boolean) {
      this.loggedIn = loggedIn;
    },
    setLoggingIn(loggingIn: boolean) {
      this.loggingIn = loggingIn;
    },
    setPubkeyLogin(pubkeyLogin: boolean) {
      this.pubkeyLogin = pubkeyLogin;
    },
    setPrivKey(pkey: string) {
      this.privkey = pkey;
    },
    // createSub(filters: Filter) {
    //   this.helper.createSub(this.helper.getPool(), filters);
    // },
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
      console.log("loading initial events");
      console.log(this.nostrProvider);
      // this.nostrProvider.createSub(NDKKind.Product, this.events);
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
    // async subEvent(filters: NDKFilter) {
    //   // TODO: Replace with NDK implementation
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
