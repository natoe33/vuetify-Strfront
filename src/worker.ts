import { db } from "@/utils/db";
import {
  TableProduct,
  TableProductImg,
  TableProductTag,
  type IContent,
} from "@/models";

interface IProductData {
  id: string;
  created_at: number;
  content: string;
  tags: string[];
}

onmessage = (message) => {
  if (message.data.type === "parseProduct") {
    console.log(`parsing product`);
    const prodData: IProductData = {
      id: message.data.data.id,
      created_at: message.data.data.created_at,
      content: message.data.data.content,
      tags: message.data.data.tags,
    };
    parseProduct(prodData);
  }
};

function parseProduct(data: IProductData) {
  // console.log(data);
  const content: IContent = JSON.parse(data.content);
  const product: TableProduct = new TableProduct(
    content.id,
    data.id,
    content.stall_id,
    content.name,
    content.description,
    content.currency,
    content.price,
    content.quantity,
    data.created_at
  );

  addProductToDb(product);
  const tags: string[] = [];
  const prodTags: TableProductTag[] = [];
  data.tags.forEach((t: string) => {
    if (t[0] === "t") {
      tags.push(t[1]);
      prodTags.push(new TableProductTag(product.product_id, t[1]));
    }
  });
  addProductTagsToDb(prodTags);
  addTagsToDb(tags);
  const prodImg: TableProductImg[] = [];
  content.images.forEach((image) => {
    prodImg.push(new TableProductImg(product.product_id, image));
  });
  addImagesToDb(prodImg);
}

function addProductToDb(product: TableProduct) {
  db.products
    .where("product_id")
    .equalsIgnoreCase(product.product_id)
    .and(p => p.event_id === product.event_id)
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
            currency: product.currency,
            price: product.price,
            quantity: product.quantity,
            created_at: product.created_at,
          },
          product.product_id
        );
        console.log("Product added to products");
      } else {
        console.log("Product already exists");
      }
    })
    .catch((e) =>
      console.error(`db call - ${e} on event id: ${product.event_id}`)
    );
}

async function addProductTagsToDb(tags: TableProductTag[]) {
  db.transaction("rw", db.productTags, () => {
    tags.forEach(async (tag) => {
      await db.productTags
        .where("product_id")
        .equalsIgnoreCase(tag.product_id)
        .and((t) => t.tag === tag.tag)
        .count()
        .then(async (count) => {
          if (count === 0) {
            db.productTags.add({
              product_id: tag.product_id,
              tag: tag.tag,
            });
            console.log("ProductTag added to productTags");
          } else {
            console.log("ProductTag already exists");
          }
        });
    });
  });
}

async function addTagsToDb(tags: string[]) {
  tags.forEach(async (tag) => {
    db.tags.add(tag);
    console.log("Tag added to tags");
  });
}

async function addImagesToDb(images: TableProductImg[]) {
  images.forEach(async (image) => {
    await db.productImages
      .where("product_id")
      .equalsIgnoreCase(image.product_id)
      .and((i) => i.url === image.url)
      .count()
      .then(async (count) => {
        if (count === 0) {
          db.productImages.add({
            product_id: image.product_id,
            url: image.url,
          });
          console.log("ProductImage added to productImages");
        } else {
          console.log("ProductImage already exists");
        }
      })
      .catch((e) => console.error(`db call - ${e}`));
  });
}
