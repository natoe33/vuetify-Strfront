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

export class TableProduct {
  product_id: string;
  event_id: string;
  stall_id: string;
  name: string;
  description: string;
  currency: string;
  price: number;
  quantity: number;
  created_at: number;

  /**
   *
   */
  constructor(
    product_id: string,
    event_id: string,
    stall_id: string,
    name: string,
    description: string,
    currency: string,
    price: number,
    quantity: number,
    created_at: number
  ) {
    this.product_id = product_id,
    this.event_id = event_id,
    this.stall_id = stall_id,
    this.name = name,
    this.description = description,
    this.currency = currency,
    this.price = price,
    this.quantity = quantity
    this.created_at = created_at
  }
}

export class TableProductImg {
  product_id: string;
  url: string;

  constructor(
    product_id: string,
    url: string
  ) {
    this.product_id = product_id,
    this.url = url    
  }
}

export class TableProductTag {
  product_id: string;
  tag: string;

  constructor(
    product_id: string,
    tag: string
  ){
    this.product_id = product_id,
    this.tag = tag
  }
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
