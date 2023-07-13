import Dexie, { Table } from "dexie";
import { Product, Shipping, Stall } from "@/models";

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

/**
class IStall {
  id: string;
  pubkey: string;
  created_at: number;
  name: string;
  description: string;
  currency: string;
}

class Shipping {
  id: string;
  stall_id: string;
  name: string;
  currency: string;
  cost: number;
  countries: string[];
}
 */

export class dbService extends Dexie {
  tags!: Table<string>;
  products!: Table<Product>;
  merchants!: Table<Stall>;
  shipping!: Table<Shipping>;

  // TODO: update products to use multi-entry indexes for images and tags
  constructor() {
    super("StrFront");
    this.version(1).stores({
      tags: "&tag",
      products:
        "++product_id, event_id, stall_id, name, description, &images, currency, price, quantity, &tags, created_at",
      merchants:
        "++stall_id, event_id, pubkey, created_at, name, description, currency",
      shipping: "++shipping_id, stall_id, name, currency, cost, &countries",
    });
  }
}
export const db = new dbService();
