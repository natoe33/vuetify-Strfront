// import { NostrFetcher, eventKind, type NostrEvent } from "nostr-fetch";

import { IndexableType, Table } from "dexie";
import NDK, {
  type NDKConstructorParams,
  NDKNip07Signer,
  NDKUser,
  type NDKUserProfile,
  NDKFilter,
  NDKEvent,
  NostrEvent,
  NDKTag,
  NDKSubscription,
  NDKSigner,
  NDKPrivateKeySigner,
  NDKKind,
} from "@/ndk";
// import { nip57 } from "@/nostr-tools";
// import { bech32 } from "@scure/base";
// import { type Event, Kind } from "@/nostr-tools";
import { Product, type IContent, Relay } from "@/models";
// import { NostrFetcher } from "nostr-fetch";
// import { db, dbService } from "@/utils";
import { useAppStore } from "@/store";
import { BehaviorSubject, retry } from "rxjs";

const relayUrls: string[] = ["wss://relay.damus.io", "wss://eden.nostr.land"];
const nHoursAgo = (hrs: number): number =>
  Math.floor((Date.now() - hrs * 60 * 60 * 1000) / 1000);

export class NostrProviderService {
  // fetcher: NostrFetcher;
  ndk: NDK | undefined;
  currentUserProfile: NDKUserProfile | undefined;
  currentUser: NDKUser | undefined;
  currentUserNpub: string | undefined;
  isNip05Verified$ = new BehaviorSubject<boolean>(false);
  peopleIFollowEmitter: NDKSubscription | undefined;
  private signer: NDKSigner | undefined = undefined;
  loggedIn: boolean = false;
  loggingIn: boolean = false;
  loginError: string | undefined;
  canWriteToNostr: boolean = false;
  isNip07 = false;
  isLoggedInUsingPubKey$ = new BehaviorSubject<boolean>(false);
  isLoggedInUsingNsec: boolean = false;
  appStore;

  constructor() {
    // this.fetcher = NostrFetcher.init();
    this.appStore = useAppStore();
    const { getNpub, getPKey, getPubKey } = this.appStore;
    const npubFromLocal = getNpub;
    const privKey = getPKey;
    const loggedInPubKey = getPubKey;
    if (!this.loggedIn) {
      this.startWithUnauthSession();
    } else {
      if (npubFromLocal && npubFromLocal !== "") {
        if (privKey && privKey !== "") {
          this.isNip07 = false;
          this.isLoggedInUsingNsec = true;
          this.signer = new NDKPrivateKeySigner(privKey);
          this.canWriteToNostr = true;
          this.tryLoginUsingNpub(npubFromLocal);
        } else {
          if (loggedInPubKey && loggedInPubKey !== "") {
            this.isNip07 = true;
            this.isLoggedInUsingPubKey$.next(true);
          } else {
            this.isNip07 = true;
            this.canWriteToNostr = true;
          }
          this.tryLoginUsingNpub(npubFromLocal);
        }
      }
    }
  }

  createNDKEvent(): NDKEvent {
    return new NDKEvent(this.ndk);
  }

  private async startWithUnauthSession() {
    this.loggingIn = true;
    this.canWriteToNostr = false;
    this.currentUserProfile = {
      displayName: "Prospective Purchaser",
    };
    this.ndk = new NDK({
      explicitRelayUrls: relayUrls,
    });
    await this.ndk.connect(1000);
    this.loggedIn = true;
    this.loggingIn = false;
  }

  async tryLoginUsingNpub(npubFromLocal: string) {
    this.loggingIn = true;
    this.loginError = undefined;
    if (this.isNip07) {
      while (!window.hasOwnProperty("nostr")) {
        // define the condition as you like
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      console.log("Found window nostr");
      this.signer = new NDKNip07Signer();
    }

    const params: NDKConstructorParams = {
      signer: this.signer,
      explicitRelayUrls: relayUrls,
    };
    this.ndk = new NDK(params);

    await this.ndk.connect(1000);
    this.initializeUsingNpub(npubFromLocal);
  }

  attemptLoginWithNip07() {
    this.loggingIn = true;
    this.canWriteToNostr = true;
    this.resolveNip07Extension();
  }

  async getProfileFromNpub(npub: string): Promise<NDKUserProfile | undefined> {
    let user = undefined;
    user = this.ndk?.getUser({ npub: npub });
    await user?.fetchProfile();
    return user?.profile;
  }

  async getNdkUserFromNpub(npub: string): Promise<NDKUser | undefined> {
    try {
      const user: NDKUser | undefined = this.ndk?.getUser({ npub: npub });
      await user?.fetchProfile();
      return user;
    } catch (e) {
      console.log(e);
      return undefined;
    }
  }

  private resolveNip07Extension() {
    async () => {
      console.log("waiting for window.nostr");
      while (!window.hasOwnProperty("nostr")) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      this.signer = new NDKNip07Signer();
    };
  }

  async checkIfNIP05Verified(
    nip05: string | undefined,
    hexPubKey: string | undefined
  ): Promise<boolean> {
    let nip05Domain;
    let verificationEndpoint;
    let nip05Name;
    let verified: boolean = false;
    if (nip05) {
      const elements = nip05.split("@");
      nip05Domain = elements.pop();
      nip05Name = elements.pop();
      verificationEndpoint = `https://${nip05Domain}/.well-known/nostr.json?name=${nip05Name}`;

      const response = await fetch(`${verificationEndpoint}`);
      const body = await response.json();

      if (body["names"] && body["names"][`${nip05Name}`]) {
        const hexPubKeyFromRemote = body["names"][`${nip05Name}`];

        if (hexPubKey === hexPubKeyFromRemote) {
          verified = true;
          // raise this only for the current logged in user
          if (hexPubKey === this.currentUser?.hexpubkey())
            this.isNip05Verified$.next(true);
        }
      }
    }
    return verified;
  }

  private async initializeUsingNpub(npub: string) {
    this.currentUserNpub = npub;
    this.currentUserProfile = await this.getProfileFromNpub(npub);
    this.currentUser = await this.getNdkUserFromNpub(npub);
    const userRelays = await this.fetchSubscribedRelaysFromCache();
    const relayUrls: string[] = [];
    userRelays.forEach((x) => {
      relayUrls.push(x.url);
    });

    if (relayUrls && relayUrls.length > 0) {
      const newNDKParams: NDKConstructorParams = {
        signer: this.signer,
        explicitRelayUrls: relayUrls,
      };
      const newNDK: NDK = new NDK(newNDKParams);
      if (this.isNip07) {
        await newNDK.assertSigner();
      }
      try {
        await newNDK.connect(1000).catch((e) => console.log(e));
        this.ndk = newNDK;
      } catch (e) {
        console.log(`Error connecting NDK: ${e}`);
      }
    }
    this.loggingIn = false;
    this.loggedIn = true;

    await this.checkIfNIP05Verified(
      this.currentUserProfile?.nip05,
      this.currentUser?.hexpubkey()
    );
  }

  async createNewUserOnNostr(displayName: string) {
    if (this.canWriteToNostr) {
      //create a relay follow list event and send it across
      const relayEvent: NDKEvent = new NDKEvent(this.ndk);
      relayEvent.kind = 10002;
      relayEvent.content = "";
      relayEvent.tags = await this.getSuggestedRelays();
      console.log(relayEvent);
      relayEvent.publish();

      //create new profile event and send it across
      const newProfileEvent: NDKEvent = new NDKEvent(this.ndk);
      newProfileEvent.kind = 0;
      newProfileEvent.content = `{"display_name": "${displayName}", "name": "${displayName}"}`;
      console.log(newProfileEvent);
      await newProfileEvent.publish();
    }
    this.currentUserProfile = {
      name: displayName,
      displayName: displayName,
    };
  }

  async getSuggestedRelays(): Promise<NDKTag[]> {
    const relayTags = relayUrls.map((val) => ["r", val]);
    return relayTags;
  }

  isLoggedIn(): boolean {
    return this.loggedIn;
  }

  // async fetchEventIter(
  //   kind: number,
  //   since: number
  // ): Promise<AsyncIterable<Event>> {
  //   const postIter = await this.fetcher.allEventsIterator(
  //     relayUrls,
  //     { kinds: [kind] },
  //     { since: nHoursAgo(since) }
  //   );
  //   return postIter;
  // }

  // async fetchProductsLimit(limit: number): Promise<Product[]> {
  //   console.log(`Fetching ${limit} events`);
  //   const products: Product[] = [];
  //   const events = await this.fetchEventLimit(Kind.Product, limit);
  //   for (const event of events) {
  //     products.push(parseProduct(event));
  //   }
  //   return products;
  // }

  // async fetchEventLimit(kind: number, limit: number): Promise<Event[]> {
  //   const productEvents = await this.fetcher.fetchLatestEvents(
  //     relayUrls,
  //     { kinds: [kind] },
  //     limit
  //   );
  //   return productEvents;
  // }

  // async fetchMerchantEvents(authors: string[]) {
  //   const merchantEvents = await this.fetcher.fetchLatestEventsPerAuthor(
  //     { authors, relayUrls },
  //     { kinds: [Kind.Product] },
  //     100
  //   );
  //   return merchantEvents;
  // }

  // async fetchProductEvent(id: string): Promise<Product | undefined> {
  //   const productEvent = await this.fetcher.fetchLastEvent(relayUrls, {
  //     ids: [id],
  //   });
  //   if (productEvent) return parseProduct(productEvent);
  // }

  async fetchEvents(kind: number): Promise<Set<NDKEvent> | undefined> {
    const filter: NDKFilter = { kinds: [kind] };
    const events = await this.ndk?.fetchEvents(filter, {});
    return events;
  }

  async fetchEventLimit(
    kind: number,
    limit: number
  ): Promise<Set<NDKEvent> | undefined> {
    const filter: NDKFilter = { kinds: [30018], limit: limit };
    const productEvents = await this.ndk?.fetchEvents(filter, {});
    return productEvents;
  }

  async fetchMerchantEvents(
    authors: string[]
  ): Promise<Set<NDKEvent> | undefined> {
    const filter: NDKFilter = { kinds: [30017], authors: authors };
    const stallEvents = await this.ndk?.fetchEvents(filter, {});
    return stallEvents;
  }

  async fetchProductEvent(id: string): Promise<NDKEvent | null | undefined> {
    const productEvent = await this.ndk?.fetchEvent(id);
    return productEvent;
  }

  async fetchRelayEvent(
    hexPubKey: string
  ): Promise<NDKEvent | null | undefined> {
    let relayEvent: NDKEvent | null | undefined;
    // nip 65 specifies a kind 10002 event to broadcast a user's subscribed relays
    const filter: NDKFilter = { kinds: [10002], authors: [hexPubKey] };
    const relayEvents = await this.ndk?.fetchEvents(filter, {});
    if (relayEvents) {
      const sortedRelayEvents = [...relayEvents].sort(
        (a: NDKEvent, b: NDKEvent) => b.created_at! - a.created_at!
      );
      relayEvent = sortedRelayEvents[0]; //take the latest event
      if (!relayEvent) {
        // failover to the damus/snort relay event
        // some clients use kind 3 (contacts) events to broadcast a user's subscribed relays
        const filter2: NDKFilter = { kinds: [3], authors: [hexPubKey] };
        relayEvent = await this.ndk?.fetchEvent(filter2, {});
      }
    }
    return relayEvent;
  }

  processRelayTag(tag: NDKTag): Relay {
    let read: boolean = true;
    let write: boolean = true;

    const relayUrl: string = tag[1];
    const relayName: string = relayUrl.replace("wss://", "").replace("/", "");
    if (tag[2]) {
      if (tag[2] === "read") write = false;
      else if (tag[2] === "write") read = false;
    }

    return new Relay(relayName, relayUrl, read, write);
  }

  processRelayContent(relay: [string, unknown]): Relay {
    let read: boolean = true;
    let write: boolean = true;

    const relayUrl: string = relay[0];
    const relayName: string = relayUrl.replace("wss://", "").replace("/", "");
    const settings = Object.entries(relay[1] as Object);

    if (settings[0][0] == "read") read = settings[0][1];
    else if (settings[1][0] == "read") read = settings[1][1];
    if (settings[0][0] == "write") write = settings[0][1];
    else if (settings[1][0] == "write") write = settings[1][1];

    return new Relay(relayName, relayUrl, read, write);
  }

  parseRelayEventContent(content: string): Relay[] {
    const relays: Relay[] = [];
    const relayJSON = JSON.parse(content);
    const rel = Object.entries(relayJSON);
    rel.forEach((relay) => {
      const item: Relay = this.processRelayContent(relay);
      relays.push(item);
    });
    return relays;
  }

  parseRelayEventTags(tags: NDKTag[]): Relay[] {
    const relays: Relay[] = [];
    // console.log(tags);
    tags.forEach((tag) => {
      if (tag[0] === "r") {
        const item: Relay = this.processRelayTag(tag);
        relays.push(item);
      }
    });
    return relays;
  }

  async getUserSubscribedRelays(): Promise<Relay[]> {
    const relays: Relay[] = [];
    let author: string = "";
    if (this.currentUser?.hexpubkey()) {
      author = this.currentUser.hexpubkey();
    }
    const relayEvent: NDKEvent | null | undefined = await this.fetchRelayEvent(
      author
    );
    if (relayEvent) {
      if (relayEvent.kind === 10002) {
        const relayTag: Relay[] = this.parseRelayEventTags(relayEvent.tags);
        relayTag.forEach((relay) => {
          if (
            relays.map((x) => x.url).indexOf(relay.url) === -1 &&
            relays.map((x) => x.name).indexOf(relay.name) === -1
          ) {
            relays.push(relay);
          }
        });
      } else if (relayEvent.kind === 3) {
        try {
          const contentRelays: Relay[] = this.parseRelayEventContent(
            relayEvent.content
          );
          contentRelays.forEach((relay) => {
            if (
              relays.map((x) => x.url).indexOf(relay.url) === -1 &&
              relays.map((x) => x.name).indexOf(relay.name) === -1
            ) {
              relays.push(relay);
            }
          });
        } catch (err) {
          console.error(`Kind 3 event parsing error: ${err}`);
        }
      }
    }
    return relays;
  }

  async fetchSubscribedRelaysAndCache(relaysFromRelay: Relay[]) {
    if (relaysFromRelay) {
      const { clearRelays, addRelays } = this.appStore;
      clearRelays();
      console.log("Subbed relay db cleared");
      addRelays(relaysFromRelay);
    }
  }

  async fetchSubscribedRelaysFromCache(): Promise<Relay[]> {
    const { getRelays } = this.appStore;
    const subscribedRelaysFromCache = await getRelays;
    console.log(
      `Subscribed Relays from cache : ${subscribedRelaysFromCache?.length}`
    );

    const subscribedRelaysFromRelay: Relay[] =
      await this.getUserSubscribedRelays();

    if (
      subscribedRelaysFromCache?.length === 0 ||
      subscribedRelaysFromCache?.length !== subscribedRelaysFromRelay?.length
    ) {
      await this.fetchSubscribedRelaysAndCache(subscribedRelaysFromRelay);
    }
    return getRelays;
  }
}
