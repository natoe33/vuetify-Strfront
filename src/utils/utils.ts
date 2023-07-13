import { Product, Stall, type IContent } from "@/models";
import { Event } from "@/nostr-tools";
import NDK, { NDKEvent } from "@/ndk";
import { StoreGeneric } from "pinia";
import { useAppStore } from "@/store";
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

  parseEvent = (event: Event) => {
    const ndkEvent: NDKEvent = new NDKEvent(this.ndk, event);
    if (event.kind === 30018) {
      this.parseProduct(ndkEvent);
    } else if (event.kind === 30017) {
      this.parseMerchant(ndkEvent);
    }
  };

  parseProduct = (event: NDKEvent) => {
    this.worker.postMessage({
      type: "parseProduct",
      data: {
        id: event.id,
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
  };

  parseTags = (event: NDKEvent): string[] => {
    const returnTags: string[] = [];
    const validTags = event.tags.filter((tag) => tag[0] === "t");
    validTags.forEach((tag) => {
      returnTags.push(tag[1]);
    });
    return returnTags;
  };
}
