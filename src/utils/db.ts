import Dexie, { Table } from "dexie";
import { TableProduct, TableProductImg, TableProductTag } from "@/models";

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
  productTags!: Table<TableProductTag>;
  productImages!: Table<TableProductImg>;
  products!: Table<TableProduct>;
  events!: Table<IEvent>;
  eventTags!: Table<IEventTag>;


  // TODO: update products to use multi-entry indexes for images and tags
  constructor() {
    super("StrFront");
    this.version(1).stores({
      tags: "++id, &tag",
      productTags: "++id, product_id, tag",
      productImages: "product_id, url",
      products:
        "++product_id, event_id, stall_id, name, description, currency, price, quantity, created_at",
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
