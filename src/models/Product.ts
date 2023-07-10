interface IShipping {
  id: string;
  name: string;
  cost: number;
  countries: string[];
}

export class Shipping implements IShipping {
  id: string;
  name: string;
  cost: number;
  countries: string[];

  /**
   *
   */
  constructor(id: string, name: string, cost: number, countries: string[]) {
    this.id = id;
    this.name = name;
    this.cost = cost;
    this.countries = countries;
  }
}

interface IStall {
  id: string;
  name: string;
  description: string;
  currency: string;
  shipping: Shipping[];
}

export class Stall implements IStall {
  id: string;
  name: string;
  description: string;
  currency: string;
  shipping: Shipping[];

  /**
   *
   */
  constructor(
    id: string,
    name: string,
    description: string,
    currency: string,
    shipping: Shipping[]
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.currency = currency;
    this.shipping = shipping;
  }
}

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
    quantity: number
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
