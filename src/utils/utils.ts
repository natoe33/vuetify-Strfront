import { Product, Stall, type IContent } from "@/models";
import { Event } from "@/nostr-tools";
import { v4 as uuidv4 } from "uuid";
import NDK, { NDKEvent } from "@/ndk";
import { StoreGeneric, storeToRefs } from "pinia";
import { useAppStore } from "@/store";
import json from './currencies.json';
import MyWorker from "@/worker?worker";
// import { useWebWorker } from "@vueuse/core";


export class Utils {
  worker: Worker;
  appStore: StoreGeneric;
  ndk: NDK;

  /**
   *
   */
  constructor() {
    this.worker = new MyWorker();
    this.appStore = useAppStore();
    this.ndk = this.appStore.getNDK;
  }

  parseEvent = (event: NDKEvent) => {
    if (event.kind === 30018) {
      this.parseProduct(event);
    } else if (event.kind === 30017) {
      this.parseMerchant(event);
    }
  };

  parseProduct = (event: NDKEvent) => {
    // const { newProduct } = storeToRefs(this.appStore);
    console.log("sending message");
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
    this.appStore.newProduct;
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
  }

  /**
   * fetch world currencies as json
   */
   getWorldCurrencies = async () => {
    const currencies = json;
    return currencies
  }
}
