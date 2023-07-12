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
  pubkey: string;
  name: string;
  description: string;
  currency: string;
  shipping: Shipping[];
}

export class Stall implements IStall {
  id: string;
  pubkey: string;
  name: string;
  description: string;
  currency: string;
  shipping: Shipping[];

  /**
   *
   */
  constructor(
    id: string,
    pubkey: string,
    name: string,
    description: string,
    currency: string,
    shipping: Shipping[]
  ) {
    this.id = id;
    this.pubkey = pubkey;
    this.name = name;
    this.description = description;
    this.currency = currency;
    this.shipping = shipping;
  }
}