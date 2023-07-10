import { Product, type IContent } from "@/models";
import { Event } from "@/nostr-tools";
import { NDKEvent } from "@/ndk";

export class Utils {
  parseProduct = (event: NDKEvent): Product => {
    const content: IContent = JSON.parse(event.content);
    const product: Product = new Product(
      content.id,
      event.id,
      content.stall_id,
      content.name,
      content.description,
      content.images,
      content.currency,
      content.price,
      content.quantity
    );
    // console.log(product);
    return product;
  };

  parseTags = (event: NDKEvent): string[] => {
    const returnTags: string[] = [];
    const validTags = event.tags.filter((tag) => tag[0] === "t");
    validTags.forEach((tag) => {
      returnTags.push(tag[1]);
    });
    return returnTags;
  };
}
