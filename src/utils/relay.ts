import { SimplePool, type Filter } from "nostr-tools";
import { Utils } from "@/utils";

export class RelayHelper {
  private _pool = new SimplePool();
  private _utils = new Utils();

  private _relays: string[] = [];

  constructor(relays: string[]) {
    this._relays = relays;
  }

  getPool() {
    return this._pool;
  }

  createSub(pool: SimplePool, filters: Filter) {
    console.log(
      `[RelayPool] creating sub with filters (id: ${filters.ids}, authors: ${filters.authors}, kinds: ${filters.kinds}), limit: ${filters.limit}`
    );

    const sub = pool.sub(this._relays, [filters]);
    sub.on("event", (event) => {
      // this._utils.parseEvent(event);
    });
    sub.on("eose", () => {
      sub.unsub;
    });
    return sub;
  }
}
