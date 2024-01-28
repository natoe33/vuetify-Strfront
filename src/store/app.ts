// Utilities
import { defineStore } from "pinia";
import { useLocalStorage, useSessionStorage, type RemovableRef } from "@vueuse/core";
import { Product, Relay, Stall, Event } from "@/models";
import { Utils, NostrProviderService, db, dbService } from "@/utils";
import { NDKEvent, NDKUser } from "@nostr-dev-kit/ndk";

const relayUrls: string[] = ["wss://relay.damus.io", "wss://relay.nostr.band"];

const ITEMS_PER_PAGE = 40;

type ProductTags = {
  product_id: string;
  tag: string;
};

type State = {
  nostrProvider: NostrProviderService;
  ndkInitialized: boolean;
  nip07: RemovableRef<boolean>;
  user: NDKUser | undefined;
  utils: Utils;
  db: dbService;
  loaded: RemovableRef<boolean>;
  loggingIn: boolean;
  loggedIn: RemovableRef<boolean>;
  npub: RemovableRef<string>;
  nsec: RemovableRef<string>;
  drawer: boolean;
  openStore: boolean;
  editStore: boolean;
  deleteStore: boolean;
  addItem: boolean;
  page: RemovableRef<number>;
  itemsPerPage: number;
  tag: string;
  tagLoading: boolean;
  loading: boolean;
  productsLoading: boolean;
  newProduct: boolean;
  relayList: RemovableRef<Relay[]>;
  relayUrls: string[];
  products: RemovableRef<Product[]>;
  stalls: RemovableRef<Stall[]>;
  store: Event;
  userStores: Event[];
  events: RemovableRef<Map<string, NDKEvent>>;
  dark: RemovableRef<boolean>; 
};

export const useAppStore = defineStore({
  id: "app",
  state: (): State => ({
    nostrProvider: new NostrProviderService(),
    ndkInitialized: false,
    nip07: useLocalStorage("nip07", false),
    user: undefined,
    utils: new Utils(),
    db: db,
    loaded: useLocalStorage("loaded", false),
    loggingIn: false,
    loggedIn: useLocalStorage("loggedIn", false),
    npub: useLocalStorage("npub", ""),
    nsec: useSessionStorage("nsec", ""),
    drawer: false,
    openStore: false,
    editStore: false,
    deleteStore: false,
    addItem: false,
    page: useLocalStorage("page", 1),
    itemsPerPage: 40,
    tag: "",
    tagLoading: false,
    loading: false,
    productsLoading: false,
    newProduct: false,
    relayList: useLocalStorage("relayList", [] as Relay[]),
    relayUrls: relayUrls,
    products: useLocalStorage("products", [] as Product[]),
    stalls: useLocalStorage("stalls", [] as Stall[]),
    store: new Event(),
    userStores: [] as Event[],
    // products: useLocalStorage("products", [] as Product[]),
    // productTags: useLocalStorage("productTags", [] as ProductTags[]),
    events: useLocalStorage("events", new Map()),
    // tags: useLocalStorage("tags", [] as string[]),
    dark: useLocalStorage('dark', true),
  }),
  getters: {
    getNDK: (state) => {
      // return state.relay;
    },
    getUser: (state) => {
      // const localUser = localStorage.getItem('user');
      // return localUser ? JSON.parse(localUser) : undefined;
      return state.user;
    },
    // getPrivKey: (state) => {
    //   return state.privkey;
    // },
    getPubKey: (state) => {
      return state.nostrProvider.ndk.activeUser?.pubkey;
      // const { type, data } = nip19.decode(state.npub);
      // return data.toString();
    },
    getNpub: (state) => {
      return state.npub;
      // return state.npub;
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
      const startIndex: number = (state.page - 1) * state.itemsPerPage;
      const endIndex: number = startIndex + state.itemsPerPage;
      console.log(`return products for page ${state.page}`);
      return state.products.slice(startIndex, endIndex);
    },
    getProduct: (state) => {
      return (event_id: string) =>
        state.products.find((p) => p.event_id === event_id);
    },
    getMerchant: (state) => {
      return (stall_id: string) =>
        state.stalls.find((s) => s.stall_id === stall_id);
    },
    getMerchantProfile: (state) => {
      return async (pubkey: string) =>
        await state.nostrProvider.fetchProfileEvent(pubkey);
    },
    getUserMerchantEvents: async (state) => {
      console.log(
        `Fetching stall for ${state.nostrProvider.ndk.activeUser?.pubkey}`,
      );
      if (state.nostrProvider.ndk.activeUser?.pubkey)
        return await state.nostrProvider.fetchMerchantEvents([
          state.nostrProvider.ndk.activeUser?.pubkey,
        ]);
      // if (state.user.npub){
      //   const { type, data } = nip19.decode(state.npub);
      // console.log(type);
      // console.log(data);
      // console.log(`Fetching stall for ${state.user.pubkey}`);
      // return await state.nostrProvider.fetchMerchantEvents([state.user.pubkey.toString()])
      // if (type === "npub") {
      //   const userPubKey = data;
      //   console.log(`Fetching stall for ${state.user.pubkey}`);
      //   // console.log(state.nostrProvider.ndk?.pool.relays);
      //   //return await state.nostrProvider.fetchSingleMerchantEvent(data.toString());
      //   return await state.nostrProvider.fetchMerchantEvents([data.toString()]);
      // }
      // }
      return new Set<NDKEvent>();
    },
    getUserProductEvents: async (state) => {
      if (state.nostrProvider.ndk.activeUser) {
        console.log(
          `Fetching products for ${state.nostrProvider.ndk.activeUser.pubkey}`,
        );
        return await state.nostrProvider.fetchMerchantProducts([
          state.nostrProvider.ndk.activeUser.pubkey,
        ]);
      }
      // const { type, data } = nip19.decode(state.npub);
      // if (type === "npub") {
      //   const userPubKey = data;
      //   console.log(`Fetching products for ${userPubKey}`);
      //   return await state.nostrProvider.fetchMerchantProducts([
      //     data.toString(),
      //   ]);
      // }
    },
    getNumOfPages: (state) => {
      // const numItems = await state.db.products.count();
      const numItems = state.products.length;
      console.log(
        `${numItems} stored for ${Math.ceil(numItems / ITEMS_PER_PAGE)} pages`,
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
    setLoggedIn(loggedIn: boolean) {
      this.loggedIn = loggedIn;
    },
    setLoggingIn(loggingIn: boolean) {
      this.loggingIn = loggingIn;
    },
    setUser(ndkUser: NDKUser) {
      this.user = ndkUser; // JSON.stringify(ndkUser);
    },
    // setPrivKey(pkey: string) {
    //   this.privkey = pkey;
    // },
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
      this.loading = false;
    },
    async initialEvents() {
      console.log("loading initial events");
      this.loading = true;
      this.products = [];
      this.stalls = [];
      const eventSet: Set<NDKEvent> | undefined =
        await this.nostrProvider.fetchEvents(30018);
      // console.log(eventSet);
      const merchSet: Set<NDKEvent> | undefined =
        await this.nostrProvider.fetchEvents(30017);
      // console.log(merchSet);
      if (eventSet) {
        eventSet.forEach((event) => {
          this.utils.parseEvent(event);
        });
      }
      if (merchSet) {
        merchSet.forEach((event) => {
          this.utils.parseEvent(event);
        });
      }
      this.loading = false;
      this.loaded = true;
      console.log("Exiting initialEvents");
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
