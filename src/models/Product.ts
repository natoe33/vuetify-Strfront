interface IProduct {
  product_id: string;
  id: string;
  stall_id: string;
  name: string;
  description: string;
  images: string[];
  currency: string;
  price: number;
  quantity: number;
  tags: string[];
}

interface ITags {
  product_id: string;
  tag: string;
}

export class Product implements IProduct {
  product_id: string;
  id: string;
  stall_id: string;
  name: string;
  description: string;
  images: string[];
  currency: string;
  price: number;
  quantity: number;
  tags: string[];

  /**
   *
   */
  constructor(
    product_id: string,
    id: string,
    stall_id: string,
    name: string,
    description: string,
    images: string[],
    currency: string,
    price: number,
    quantity: number,
    tags: string[]
  ) {
    this.id = id;
    this.product_id = product_id;
    this.stall_id = stall_id;
    this.name = name;
    this.description = description;
    this.images = images;
    this.currency = currency;
    this.price = price;
    this.quantity = quantity;
    this.tags = tags;
  }
}

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
