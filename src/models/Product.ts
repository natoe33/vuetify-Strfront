import {newShipping} from './Merchant'

interface IProduct {
  product_id: string;
  event_id: string;
  stall_id: string;
  name: string;
  description: string;
  images: string[];
  currency: string;
  price: number;
  quantity: number;
  tags: string[];
  created_at: number;
  pubkey: string;
}

interface ITags {
  product_id: string;
  tag: string;
}

export class Product implements IProduct {
  product_id: string;
  event_id: string;
  stall_id: string;
  name: string;
  description: string;
  images: string[];
  currency: string;
  price: number;
  quantity: number;
  tags: string[];
  created_at: number;
  pubkey: string;

  /**
   *
   */
  constructor(
    product_id: string,
    event_id: string,
    stall_id: string,
    name: string,
    description: string,
    images: string[],
    currency: string,
    price: number,
    quantity: number,
    tags: string[],
    created_at: number,
    pubkey: string
  ) {
    this.event_id = event_id;
    this.product_id = product_id;
    this.stall_id = stall_id;
    this.name = name;
    this.description = description;
    this.images = images;
    this.currency = currency;
    this.price = price;
    this.quantity = quantity;
    this.tags = tags;
    this.created_at = created_at;
    this.pubkey = pubkey;
  }
}

export type TProduct = {
  product_id: string;
  event_id?: string;
  stall_id: string;
  name: string;
  description: string;
  images: string[];
  currency: string;
  price: number;
  quantity: number;
  tags: string[][];
  shipping: newShipping[];
  created_at?: number;
  pubkey?: string;
};

export interface IContent {
  id: string;
  stall_id: string;
  name: string;
  description: string;
  images: string[];
  currency: string;
  price: number;
  quantity: number;
}

export interface newContent {
  id: string;
  stall_id: string;
  name: string;
  description: string;
  images: string[];
  currency: string;
  price: number;
  quantity: number;
  shipping: newShipping[];
}
