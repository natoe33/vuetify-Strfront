import Dexie, { Table } from "dexie";
import { Product } from "@/models";

export interface IProductTag {
  id?: number;
  product_id: string;
  tag: string;
}

export class dbService extends Dexie {
  tags!: Table<string>;
  productTags!: Table<IProductTag>;
  products!: Table<Product>;

  constructor() {
    super("StrFront");
    this.version(1).stores({
      tags: "++tag",
      productTag: "++id, product_id, tag",
      products: "++product_id, id, stall_id, name, description, images, currency, price, quantity",
    });
  }
}
export const db = new dbService();

// dbService.version(1).stores({
//     tags: '++id, event_id, tag',
//     products: '++id, Product',
// })
