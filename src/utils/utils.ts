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
    this.ndk = this.appStore.$state.getNDK();
  }

  parseEvent = (event: Event) => {
    const ndkEvent: NDKEvent = new NDKEvent(this.ndk, event);
    if (event.kind === 30018) {
      this.parseProduct(ndkEvent);
    } else if (event.kind === 30017){
      this.parseMerchant(ndkEvent);
    }
  }

  parseProduct = (event: NDKEvent): Product => {
    this.worker.postMessage({type: 'parseProduct', data: event.content})
    const tags: string[] = [];
    event.tags.forEach((t) => {
      if (t[0] === "t") tags.push(t[1]);
    });
    const content: IContent = JSON.parse(event.content);
    const product: Product = new Product(
      content.id,
      event.id,
      content.stall_id,
      content.name,
      content.description,
      content.images,
      content.currency,
      content.price,
      content.quantity,
      tags
    );
    // console.log(product);
    return product;
  };

  parseMerchant = (event: NDKEvent) => {}
  // parseMerchant = (event: NDKEvent): Stall => {
  //   const content: IContent = JSON.parse(event.content);
  //   const shipping: string[][]
  //   const stall: Stall = new Stall(
  //     content.id,
  //     event.pubkey,
  //     content.name,
  //     content.description,
  //     content.currency,
  //     content.shipping
  //   )
  // }

  parseTags = (event: NDKEvent): string[] => {
    const returnTags: string[] = [];
    const validTags = event.tags.filter((tag) => tag[0] === "t");
    validTags.forEach((tag) => {
      returnTags.push(tag[1]);
    });
    return returnTags;
  };
}
