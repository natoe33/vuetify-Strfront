import {
  Product,
  Stall,
  type IContent,
  type IMerchContent,
  Shipping,
} from "@/models";
import { v4 as uuidv4 } from "uuid";
import { NDKEvent, NostrEvent } from "@nostr-dev-kit/ndk";
import { storeToRefs } from "pinia";
import { useAppStore } from "@/store/app";
import { nip98, nip19, utils } from "nostr-tools";
import { base64 } from "@scure/base";
import json from "./currencies.json";
import cjson from "./countries.json";
// import MyWorker from "@/worker?worker";

interface IProductData {
  id: string;
  pubkey: string;
  created_at: number;
  content: string;
  tags: string[][];
}

interface IMerchantData {
  id: string;
  pubkey: string;
  created_at: number;
  content: string;
  tags: string[][];
}
export class Utils {
  /**
   *
   */
  constructor() {}

  parseEvent = (event: NDKEvent) => {
    if (event.kind === 30018) {
      this.parseProduct(event);
    } else if (event.kind === 30017) {
      this.parseMerchant(event);
    }
  };

  parseProduct = (event: NDKEvent) => {
    const prodData: IProductData = {
      id: event.id,
      pubkey: event.pubkey,
      created_at: event.created_at || 0,
      content: event.content,
      tags: event.tags,
    };

    const tags: string[] = [];
    prodData.tags.forEach((t) => {
      if (t[0] === "t") tags.push(t[1]);
    });
    const content: IContent = JSON.parse(prodData.content);
    const product: Product = new Product(
      content.id,
      prodData.id,
      content.stall_id,
      content.name,
      content.description,
      content.images,
      content.currency,
      content.price,
      content.quantity,
      tags,
      prodData.created_at,
      prodData.pubkey
    );
    this.addProduct(product);
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
    const merchData: IMerchantData = {
      id: event.id,
      pubkey: event.pubkey,
      created_at: event.created_at || 0,
      content: event.content,
      tags: event.tags,
    };
    const tags: string[] = [];
    merchData.tags.forEach((t) => {
      tags.push(t[1]);
    });
    const content: IMerchContent = JSON.parse(merchData.content);
    // console.log(content.shipping);
    const ship: Shipping[] = [];
    if (content.shipping) {
      content.shipping.forEach((s) => {
        const shipping: Shipping = {
          id: s.id,
          name: s.name,
          currency: s.currency,
          cost: s.cost,
          countries: s.countries,
        };
        ship.push(shipping);
      });
    }
    const stall: Stall = new Stall(
      content.id,
      merchData.id,
      merchData.pubkey,
      merchData.created_at,
      content.name,
      content.description,
      content.currency,
      ship
    );
    this.addStall(stall);
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
    // console.log(uuidv4());
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

  /**
   * Generate NIP-98 auth header
   *
   * @param {string} url - api endpoint for image upload service
   * @param {string} httpMethod - http method required by api endpoint
   * @returns {string}
   * @example
   * await getSignedToken('https://imageapi.com/v1/upload', 'POST')
   */
  async getSignedToken(url: string, httpMethod: string) {
    const appStore = useAppStore();
    const { npub, nostrProvider } = storeToRefs(appStore);
    console.log(nostrProvider.value);
    // const event = getBlankEvent(27235);
    // event.tags = [
    //   ["u", url],
    //   ["method", httpMethod],
    // ];
    // event.created_at = Math.round(new Date().getTime() / 1000);
    // const { type, data } = nip19.decode(npub.value);
    // const pubkey = type === "npub" ? data : "";
    // const nEvent: NostrEvent = {
    //   pubkey: (await window.nostr?.getPublicKey()) || pubkey,
    //   tags: event.tags,
    //   created_at: event.created_at,
    //   content: "",
    // };
    // nEvent.sig = await nostrProvider.value.ndk?.signer?.sign(nEvent);
    // return "Nostr " + base64.encode(utils.utf8Encoder.encode(JSON.stringify(nEvent)));
    return "Nostr " + "test";
  }

  /**
   * Generate NIP-98 auth header for nostr.build and upload image
   *
   * @param {file} file - image being uploaded
   *
   * @return {String} - image url
   * @example
   * await uploadImages(file)
   */
  async uploadImage(file: File): Promise<string> {
    // Generate NIP-98 auth header for nostr.build
    const url: string = import.meta.env.VITE_UPLOAD_URL;
    console.log(url);
    const token = await this.getSignedToken(url, "POST");
    console.log(token);
    const formData = new FormData();
    formData.append(file.name, file);
    const headers = new Headers();
    headers.append("Authorization", token);
    headers.append("Accept", "application/json");
    const data = await fetch(url, {
      method: "POST",
      mode: "cors",
      headers: headers,
      body: formData,
    })
    const response = await data.json();
    console.log(response.data);
    console.log(response.data[0].url);
    return response.data[0].url;
  }
}
