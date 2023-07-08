// import { NostrFetcher, eventKind, type NostrEvent } from "nostr-fetch";
import { type Event, Kind } from "@/nostr-tools";
import { Product, type IContent } from "@/models";
import { NostrFetcher } from "nostr-fetch";

const relayUrls: string[] = ["wss://relay.damus.io", "wss://eden.nostr.land"];
const nHoursAgo = (hrs: number): number =>
  Math.floor((Date.now() - hrs * 60 * 60 * 1000) / 1000);

const parseProduct = (event: Event): Product => {
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
  console.log(product);
  return product;
};

export class NostrProviderService {
  fetcher: NostrFetcher;

  constructor() {
    this.fetcher = NostrFetcher.init();

    console.log("New NostrProviderService");
  }

  async fetchEventIter(
    kind: number,
    since: number
  ): Promise<AsyncIterable<Event>> {
    const postIter = await this.fetcher.allEventsIterator(
      relayUrls,
      { kinds: [kind] },
      { since: nHoursAgo(since) }
    );
    return postIter;
  }

  async fetchProductsLimit(limit: number): Promise<Product[]> {
    console.log(`Fetching ${limit} events`);
    const products: Product[] = [];
    const events = await this.fetchEventLimit(Kind.Product, limit);
    for (const event of events) {
      products.push(parseProduct(event));
    }
    return products;
  }

  async fetchEventLimit(kind: number, limit: number): Promise<Event[]> {
    const productEvents = await this.fetcher.fetchLatestEvents(
      relayUrls,
      { kinds: [kind] },
      limit
    );
    return productEvents;
  }

  async fetchMerchantEvents(authors: string[]) {
    const merchantEvents = await this.fetcher.fetchLatestEventsPerAuthor(
      { authors, relayUrls },
      { kinds: [Kind.Product] },
      100
    );
    return merchantEvents;
  }

  async fetchProductEvent(id: string): Promise<Product | undefined> {
    const productEvent = await this.fetcher.fetchLastEvent(relayUrls, {
      ids: [id],
    });
    if (productEvent) return parseProduct(productEvent);
  }
}
