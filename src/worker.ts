import { db } from "@/utils/db";
import { Product, Stall, type IContent, type IMerchContent } from "@/models";

interface IProductData {
  id: string;
  created_at: number;
  content: string;
  tags: string[][];
}

interface IMerchantData {
  id: string;
  pubkey: string;
  created_at: number;
  content: string;
  tags: string[][];
}

onmessage = (message) => {
  if (message.data.type === "parseProduct") {
    const prodData: IProductData = {
      id: message.data.data.id,
      created_at: message.data.data.created_at,
      content: message.data.data.content,
      tags: message.data.data.tags,
    };
    parseProduct(prodData);
  } else if (message.data.type === "parseMerchant") {
    const merchData: IMerchantData = {
      id: message.data.id,
      pubkey: message.data.pubkey,
      created_at: message.data.data.created_at,
      content: message.data.data.content,
      tags: message.data.data.tags,
    };
    parseMerchant(merchData);
  }
};

function parseProduct(data: IProductData) {
  const tags: string[] = [];
  data.tags.forEach((t) => {
    tags.push(t[1]);
  });
  const content: IContent = JSON.parse(data.content);
  const product: Product = new Product(
    content.id,
    data.id,
    content.stall_id,
    content.name,
    content.description,
    content.images,
    content.currency,
    content.price,
    content.quantity,
    tags,
    data.created_at
  );

  addProductToDb(product);
  addTagsToDb(data.tags);
}

function addProductToDb(product: Product) {
  db.products
    .where("product_id")
    .equalsIgnoreCase(product.product_id)
    .and((p) => p.event_id === product.event_id)
    .count()
    .then(async (count) => {
      if (count === 0) {
        db.products.add(
          {
            product_id: product.product_id,
            event_id: product.event_id,
            stall_id: product.stall_id,
            name: product.name,
            description: product.description,
            images: product.images,
            currency: product.currency,
            price: product.price,
            quantity: product.quantity,
            tags: product.tags,
            created_at: product.created_at,
          },
          product.product_id
        );
      }
    })
    .catch((e) =>
      console.error(`db call - ${e} on event id: ${product.event_id}`, product)
    );
}

async function addTagsToDb(tags: string[][]) {
  tags.forEach(async (tag) => {
    db.tags.add(tag[1]);
  });
}

function parseMerchant(data: IMerchantData) {
  const tags: string[] = [];
  data.tags.forEach((t) => {
    tags.push(t[1]);
  });
  const content: IMerchContent = JSON.parse(data.content);
  const stall: Stall = new Stall(
    content.id,
    data.id,
    data.pubkey,
    data.created_at,
    content.name,
    content.description,
    content.currency
  );
  addStallToDb(stall);
}

function addStallToDb(stall: Stall) {
  db.merchants
    .where("stall_id")
    .equalsIgnoreCase(stall.stall_id)
    .and((m) => m.event_id === stall.event_id)
    .count()
    .then(async (count) => {
      if (count === 0) {
        db.merchants.add(
          {
            stall_id: stall.stall_id,
            event_id: stall.event_id,
            pubkey: stall.pubkey,
            created_at: stall.created_at,
            name: stall.name,
            description: stall.description,
            currency: stall.currency,
          },
          stall.stall_id
        );
        console.log("Stall added to merchants");
      } else {
        console.log("Stall already exists");
      }
    });
}
