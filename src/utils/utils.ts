import { Product, Stall, type IContent } from "@/models";
import { Event } from "@/nostr-tools";
import { NDKEvent } from "@/ndk";

export class Utils {
  parseProduct = (event: NDKEvent): Product => {
    const tags: string[] = [];
    event.tags.forEach((t) => {
      if (t[0] === "t") tags.push(t[1]);
    });
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
      content.quantity,
      tags
    );
    // console.log(product);
    return product;
  };

  // parseMerchant = (event: NDKEvent): Stall => {
  //   const content: IContent = JSON.parse(event.content);
  //   // const shipping: string[]
  //   // const stall: Stall = new Stall(
  //   //   content.id,
  //   //   event.pubkey,
  //   //   content.name,
  //   //   content.description,
  //   //   content.currency,
  //   //   content.shipping
  //   // )
  // }

  parseTags = (event: NDKEvent): string[] => {
    const returnTags: string[] = [];
    const validTags = event.tags.filter((tag) => tag[0] === "t");
    validTags.forEach((tag) => {
      returnTags.push(tag[1]);
    });
    return returnTags;
  };
}
