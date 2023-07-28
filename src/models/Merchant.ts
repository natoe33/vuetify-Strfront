export interface IShipping {
  id: string;
  name: string;
  currency: string;
  cost: number;
  countries: string[];
}

export class Shipping implements IShipping {
  id: string;
  name: string;
  currency: string;
  cost: number;
  countries: string[];

  /**
   *
   */
  constructor(
    id: string,
    stall_id: string,
    name: string,
    currency: string,
    cost: number,
    countries: string[]
  ) {
    this.id = id;
    this.name = name;
    this.currency = currency;
    this.cost = cost;
    this.countries = countries;
  }
}

export interface IStall {
  stall_id: string;
  event_id: string;
  pubkey: string;
  created_at: number;
  name: string;
  description: string;
  currency: string;
  shipping: Shipping[];
}

export class Stall implements IStall {
  stall_id: string;
  event_id: string;
  pubkey: string;
  created_at: number;
  name: string;
  description: string;
  currency: string;
  shipping: Shipping[];

  /**
   *
   */
  constructor(
    stall_id: string,
    event_id: string,
    pubkey: string,
    created_at: number,
    name: string,
    description: string,
    currency: string,
    shipping: Shipping[]
  ) {
    this.stall_id = stall_id;
    this.event_id = event_id;
    this.pubkey = pubkey;
    this.created_at = created_at;
    this.name = name;
    this.description = description;
    this.currency = currency;
    this.shipping = shipping;
  }
}

export interface IMerchContent {
  id: string;
  name: string;
  description: string;
  currency: string;
  shipping: IShipping[];
}

/**
'{
  "id":"Dfejkk24dzJiHJhRfg75fh",
  "name":"BitBest Hardware Wallets",
  "description":"Hardware Wallets",
  "currency":"EUR",
  "shipping":[
    {
      "name":"EU",
      "currency":"EUR",
      "cost":10.0,
      "countries":[
        "Europe"
      ],
      "id":"PeEo7pPa3L9YH93t9Ac5ea"
    }
  ]
}'
*/
