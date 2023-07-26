import { Product, Stall, type IContent } from "@/models";
import { Event } from "@/nostr-tools";
import { v4 as uuidv4 } from "uuid";
import NDK, { NDKEvent } from "@/ndk";
import { StoreGeneric, storeToRefs } from "pinia";
import { useAppStore } from "@/store";
import json from "./currencies.json";
import MyWorker from "@/worker?worker";
// import { useWebWorker } from "@vueuse/core";

export class Utils {
  worker: Worker;
  // appStore: StoreGeneric;
  // ndk: NDK;
  // products: Map<string, Product>;

  /**
   *
   */
  constructor() {
    this.worker = new MyWorker();
    // this.appStore = useAppStore();
    // this.ndk = this.appStore.getNDK;
    // const { products } = storeToRefs(this.appStore);
    // this.products = products.value;

    this.worker.onmessage = (ev) => {
      // console.log(ev.data);
      if (ev.data.type === "Product") {
        // console.log('adding product')
        this.addProduct(ev.data.data);
      } else if (ev.data.type === "Stall") {
        // console.log('adding stall');
        console.log(`Stall: ${ev.data.data}`);
        this.addStall(ev.data.data);
      }
    };
  }

  parseEvent = (event: NDKEvent) => {
    // console.log('received event');
    if (event.kind === 30018) {
      this.parseProduct(event);
    } else if (event.kind === 30017) {
      this.parseMerchant(event);
    }
  };

  parseProduct = (event: NDKEvent) => {
    // const { newProduct } = storeToRefs(this.appStore);
    // console.log("sending message");
    this.worker.postMessage({
      type: "parseProduct",
      data: {
        id: event.id,
        pubkey: event.pubkey,
        created_at: event.created_at,
        content: event.content,
        tags: event.tags,
      },
    });
  };

  dedup = (prod1: Product, prod2: Product) => {
    if (prod1.created_at > prod2.created_at) {
      return prod1;
    }
    return prod2;
  };

  dedupMerch = (stall1: Stall, stall2: Stall) => {
    if (stall1.created_at > stall2.created_at) {
      return stall1;
    }
    return stall2;
  };

  addProduct = (product: Product) => {
    const appStore = useAppStore();
    const { products } = storeToRefs(appStore);
    const prod = products.value.get(product.event_id);
    if (prod) {
      product = this.dedup(product, prod);
    }
    products.value.set(product.event_id, product);
    // console.log(products.value);
  };

  addStall = (stall: Stall) => {
    const appStore = useAppStore();
    const { stalls } = storeToRefs(appStore);
    const merch = stalls.value.get(stall.stall_id);
    if (merch) {
      stall = this.dedupMerch(stall, merch);
    }
    stalls.value.set(stall.stall_id, stall);
  };

  parseMerchant = (event: NDKEvent) => {
    const appStore = useAppStore();
    this.worker.postMessage({
      type: "parseMerchant",
      data: {
        id: event.id,
        pubkey: event.pubkey,
        created_at: event.created_at,
        content: event.content,
        tags: event.tags,
      },
    });
    appStore.newProduct;
  };

  parseTags = (event: NDKEvent): string[] => {
    const returnTags: string[] = [];
    const validTags = event.tags.filter((tag) => tag[0] === "t");
    validTags.forEach((tag) => {
      returnTags.push(tag[1]);
    });
    return returnTags;
  };

  generateUUID = (): string => {
    console.log(uuidv4());
    return uuidv4();
  };

  /**
   * fetch world currencies as json
   */
  getWorldCurrencies = async () => {
    const currencies = json;
    return currencies;
  };
}
