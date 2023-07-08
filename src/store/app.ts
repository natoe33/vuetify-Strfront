// Utilities
import { defineStore } from "pinia";
import { useLocalStorage, type RemovableRef } from "@vueuse/core";
import { Product } from "@/models";
import { RelayHelper, Utils } from "@/utils";
import { Event, type Filter } from "@/nostr-tools";
import { db, dbService } from "@/utils/db";

const relayUrls: string[] = ["wss://relay.damus.io", "wss://eden.nostr.land"];

type ProductTags = {
  product_id: string;
  tag: string;
}

type State = {
  relay: RelayHelper;
  utils: Utils;
  db: dbService;
  products: RemovableRef<Product[]>;
  productTags: RemovableRef<ProductTags[]>;
  events: RemovableRef<Event[]>;
  tags: RemovableRef<string[]>;
};

export const useAppStore = defineStore({
  id: "app",
  state: (): State => ({
    relay: new RelayHelper(relayUrls),
    utils: new Utils(),
    db: db,
    products: useLocalStorage("products", [] as Product[]),
    productTags: useLocalStorage("productTags", [] as ProductTags[]),
    events: useLocalStorage("events", [] as Event[]),
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
    getProduct: (state) => {
      return (id: string) => state.products.find((product) => product.id === id);
    },
    getProductsWithTags: (state) => {
      const products = (tag: string) => state.productTags.filter((product) => product.tag === tag);
      console.log(products);
    },
    getEvents: (state) => {
      return state.events;
    },
  },
  actions: {
    addEvent(event: Event) {
      console.log(`AppStore: event added ${event.content}`);
      this.events.push(event);
      const product: Product = this.utils.parseProduct(event);
      this.db.products.add(product);
      this.products.push(product);
      this.utils.parseTags(event).forEach((tag) => {
        if (this.tags.filter((t) => t === tag).length === 0) {
          this.tags.push(tag);
          const prodTag: ProductTags = { product_id: product.id, tag: tag }
          this.productTags.push(prodTag);
          this.db.productTags.add(prodTag);
        }
      });
      // this.products.push(product);
    },
    createSub(filters: Filter) {
      this.relay.createSub(this.relay.getPool(), filters);
    },
  },
});
