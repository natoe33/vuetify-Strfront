// Utilities
import { defineStore } from "pinia";
import { useLocalStorage, type RemovableRef } from "@vueuse/core";
import { Product, Relay } from "@/models";
import { Utils, NostrProviderService } from "@/utils";
import NDK, { NDKEvent, NDKKind } from "@/ndk";

const relayUrls: string[] = ["wss://relay.damus.io", "wss://eden.nostr.land"];

const ITEMS_PER_PAGE = 40;

type ProductTags = {
  product_id: string;
  tag: string;
};

type State = {
  relay: NDK;
  nostrProvider: NostrProviderService;
  utils: Utils;
  page: number;
  tag: string;
  tagLoading: boolean;
  loading: boolean;
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
    nostrProvider: new NostrProviderService(),
    utils: new Utils(),
    page: 0,
    tag: "",
    tagLoading: false,
    loading: false,
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
    getSortedTags: async (state) => {
      return state.tags.sort();
    },
    getProducts: (state) => {
      console.log(`return products for page ${state.page}`);
      return state.products.slice(
        state.page * ITEMS_PER_PAGE,
        state.page * ITEMS_PER_PAGE + ITEMS_PER_PAGE
      );
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
    addEvent(event: NDKEvent) {
      // console.log(`AppStore: event added ${event.content}`);
      this.saveEvent(event);
      this.events.push(event);
      const product: Product = this.utils.parseProduct(event);
      this.products.push(product);
      this.utils.parseTags(event).forEach((tag) => {
        if (this.tags.filter((t) => t === tag).length === 0) {
          this.tags.push(tag);
          const prodTag: ProductTags = { product_id: product.id, tag: tag };
          this.productTags.push(prodTag);
        }
      });
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
      const eventSet = await this.nostrProvider.fetchEvents(NDKKind.Product);
      const merchSet = await this.nostrProvider.fetchEvents(NDKKind.Stall);
      console.log(merchSet);
      if (eventSet) {
        eventSet.forEach((event) => {
          const product: Product = this.utils.parseProduct(event);
          if (
            this.products.filter((prod) => prod.id === product.id).length === 0
          )
            this.products.push(product);
          this.utils.parseTags(event).forEach((tag) => {
            const prodTag: ProductTags = {
              product_id: product.product_id,
              tag: tag,
            };
            if (
              this.productTags.filter(
                (t) => t.product_id === product.product_id && t.tag === tag
              ).length === 0
            )
              this.productTags.push(prodTag);
            if (this.tags.filter((t) => t === tag).length === 0)
              this.tags.push(tag);
          });
        });
      }
    },
    async merchantEvent() {},
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
