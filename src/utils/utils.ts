import { Product, Stall } from "@/models";
import { v4 as uuidv4 } from "uuid";
import { NDKEvent } from "@/ndk";
import { storeToRefs } from "pinia";
import { useAppStore } from "@/store";
import json from "./currencies.json";
import cjson from "./countries.json";
import MyWorker from "@/worker?worker";

export class Utils {
  worker: Worker;

  /**
   *
   */
  constructor() {
    this.worker = new MyWorker();

    this.worker.onmessage = (ev) => {
      if (ev.data.type === "Product") {
        this.addProduct(ev.data.data);
      } else if (ev.data.type === "Stall") {
        console.log(`Stall: ${ev.data.data}`);
        this.addStall(ev.data.data);
      }
    };
  }

  parseEvent = (event: NDKEvent) => {
    if (event.kind === 30018) {
      this.parseProduct(event);
    } else if (event.kind === 30017) {
      this.parseMerchant(event);
    }
  };

  parseProduct = (event: NDKEvent) => {
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
    const prod = products.value.find((p) => p.event_id === product.event_id);
    if (prod) {
      product = this.dedup(product, prod);
    }
    products.value.push(product);
  };

  addStall = (stall: Stall) => {
    const appStore = useAppStore();
    const { stalls } = storeToRefs(appStore);
    const merch = stalls.value.find((s) => s.stall_id === stall.stall_id);
    if (merch) {
      stall = this.dedupMerch(stall, merch);
    }
    stalls.value.push(stall);
  };

  parseMerchant = (event: NDKEvent) => {
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

  getCountries = async () => {
    const countries = cjson;
    return countries;
  };
}
