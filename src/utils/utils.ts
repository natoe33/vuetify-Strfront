import { Product, type IContent } from "@/models";
import { Event } from "@/nostr-tools";

export class Utils {
  parseProduct = (event: Event): Product => {
    const tags = event.tags.filter((tag) => tag[0] === "t");
    const content: IContent = JSON.parse(event.content);
    const product: Product = new Product(
      event.id,
      content.id,
      content.stall_id,
      content.name,
      content.description,
      content.images,
      content.currency,
      content.price,
      content.quantity,
      tags,
      tags
    );
    // console.log(product);
    return product;
  };

  parseTags = (event: Event): string[] => {
    const returnTags: string[] = [];
    const validTags = event.tags.filter((tag) => tag[0] === "t");
    validTags.forEach((tag) => {
      returnTags.push(tag[1]);
    });
    return returnTags;
  };
}
