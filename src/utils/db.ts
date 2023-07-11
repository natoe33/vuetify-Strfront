import Dexie, { Table } from "dexie";
import { Product } from "@/models";

export interface IProductTag {
  product_id: string;
  tag: string;
}

export interface IEvent {
  id: string;
  pubkey: string;
  created_at: number;
  kind: number;
  content: string;
  sig: string;
}
interface IEventTag {
  id: string;
  type: string;
  tag: string;
}

export class dbService extends Dexie {
  tags!: Table<string>;
  productTags!: Table<IProductTag>;
  products!: Table<Product>;
  events!: Table<IEvent>;
  eventTags!: Table<IEventTag>;

  constructor() {
    super("StrFront");
    this.version(1).stores({
      tags: "++tag",
      productTags: "product_id, tag",
      products:
        "++product_id, id, stall_id, name, description, images, currency, price, quantity",
    });
    this.version(2).stores({
      events: "++id, pubkey, created_at, kind, content, sig",
      eventTags: "event_id, type, tag",
    });
  }
}
export const db = new dbService();

// dbService.version(1).stores({
//     tags: '++id, event_id, tag',
//     products: '++id, Product',
// })
