// import { NostrFetcher, eventKind, type NostrEvent } from "nostr-fetch";
import debug from "debug";
import { Ref } from "vue";
import { storeToRefs } from "pinia";
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
} from "@nostr-dev-kit/ndk";
import { nip19 } from "@/nostr-tools";
import { Relay, newStall, Event } from "@/models";
import { LoginUtil, NewCredential } from "./login";
import { useAppStore } from "@/store";
import { BehaviorSubject } from "rxjs";

const explicitUrls: string[] = [
  "wss://relay.damus.io",
  "wss://eden.nostr.land",
  "wss://relay.nostr.band",
];

export class NostrProviderService {
  ndk: NDK | undefined;
  debug: debug.Debugger;
  currentUserProfile: NDKUserProfile | undefined;
  currentUser: NDKUser | undefined;
  currentUserNpub: string | undefined;
  isNip05Verified$ = new BehaviorSubject<boolean>(false);
  peopleIFollowEmitter: NDKSubscription | undefined;
  explicitRelayUrls: string[];
  private signer: NDKSigner | undefined = undefined;
  loggedIn: boolean = false;
  loggingIn: boolean = false;
  loginError: string | undefined;
  canWriteToNostr: boolean = false;
  isNip07 = false;
  isLoggedInUsingPubKey$ = new BehaviorSubject<boolean>(false);
  isLoggedInUsingNsec: boolean = false;
  relayUrls: string[];
  // user: NDKUser;
  npub: string;

  constructor() {
    // this.fetcher = NostrFetcher.init();
    this.debug = debug("ndk");
    const appStore = useAppStore();
    const { npub } = storeToRefs(appStore);
    const { getNpub, getPrivKey, getPubKey, getUser } = appStore;
    this.explicitRelayUrls = explicitUrls;
    this.relayUrls = explicitUrls;
    this.npub = npub ? npub.value : "";
    // this.user = getUser;
    // console.log(this.user);
    // // private appStore = useAppStore();
    // // this.nostrStore = useNostrStore();
    // console.log(getNpub);

    if (!npub || npub.value === "") {
      console.log("unauth session");
      this.startWithUnauthSession();
    } else {
      console.log("auth session");
      console.log(npub.value);
      if (npub && npub.value !== "") {
        if (getPrivKey && getPrivKey !== "") {
          console.log("privkey session");
          this.isNip07 = false;
          this.isLoggedInUsingNsec = true;
          this.signer = new NDKPrivateKeySigner(getPrivKey);
          this.canWriteToNostr = true;
          this.tryLoginUsingNpub(getNpub);
        } else {
          console.log("pubkey session");
          if (getPubKey && getPubKey !== "") {
            this.isNip07 = true;
            this.isLoggedInUsingPubKey$.next(true);
          } else {
            this.isNip07 = true;
            this.canWriteToNostr = true;
          }
          this.tryLoginUsingNpub(getNpub);
        }
      }
    }
  }

  createNDKEvent(): NDKEvent {
    return new NDKEvent(this.ndk);
  }

  private async startWithUnauthSession() {
    const appStore = useAppStore();
    const { loggingIn, loggedIn } = storeToRefs(appStore);
    // loggingIn.value = true;
    // setLoggingIn(true);
    // setLoggingIn(true)
    this.canWriteToNostr = false;
    this.currentUserProfile = {
      displayName: "Prospective Purchaser",
    };
    this.ndk = new NDK({
      explicitRelayUrls: explicitUrls,
    });
    await this.ndk.connect(1000);
    // loggedIn.value = true;
    // loggingIn.value = true;
    // setLoggedIn(true);
    // setLoggingIn(false);
    // this.appStore.setLoggingIn(false);
  }

  createNewNostrUser(): NewCredential {
    const newUser: NewCredential = LoginUtil.generateNewCredential();
    return newUser;
    // this.attemptLoginUsingPrivateOrPubKey(newUser.privateKey);
  }

  loginNewUser(newUser: NewCredential) {
    this.attemptLoginUsingPrivateOrPubKey(newUser.privateKey);
  }

  validateAndGetHexKey(enteredKey: string): string {
    if (!enteredKey || enteredKey === "" || enteredKey == null) {
      throw new Error("Key to login is required");
    }
    return LoginUtil.getHexFromPrivateOrPubKey(enteredKey);
  }

  attemptLoginUsingPrivateOrPubKey(enteredKey: string) {
    const appStore = useAppStore();
    const { loggingIn, privkey, loggedIn, pubkeyLogin, user } =
      storeToRefs(appStore);
    try {
      loggingIn.value = true;
      const hexPrivateKey = this.validateAndGetHexKey(enteredKey);
      if (enteredKey.startsWith("nsec")) {
        this.signer = new NDKPrivateKeySigner(hexPrivateKey);
        this.signer.user().then((suser) => {
          privkey.value = hexPrivateKey;
          user.value = suser;
          this.isLoggedInUsingNsec = true;
          this.canWriteToNostr = true;
          this.tryLoginUsingNpub(user.value.npub);
        });
      } else if (enteredKey.startsWith("npub")) {
        pubkeyLogin.value = true;
        this.isLoggedInUsingPubKey$.next(true);
        this.tryLoginUsingNpub(enteredKey);
      } else {
        this.loginError = "Invalid input. Enter either nsec or npub id";
      }
    } catch (e: any) {
      console.error(e);
      this.loginError = e.message;
      loggingIn.value = false;
    }
  }

  async tryLoginUsingNpub(npubFromLocal: string) {
    const appStore = useAppStore();
    const { relay } = storeToRefs(appStore);
    // setLoggingIn(true);

    // loggingIn.value = true;
    this.loginError = undefined;
    if (this.isNip07) {
      while (!window.nostr) {
        // define the condition as you like
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      // console.log("Found window nostr");
      this.signer = new NDKNip07Signer();
    }

    const params: NDKConstructorParams = {
      signer: this.signer,
      explicitRelayUrls: this.relayUrls,
      debug: this.debug,
    };
    this.ndk = new NDK(params);
    relay.value = this.ndk;

    await this.ndk.connect(1000);
    this.initializeUsingNpub(npubFromLocal);
  }

  attemptLoginWithNip07() {
    const appStore = useAppStore();
    const { setLoggingIn } = appStore;
    setLoggingIn(true);
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
      console.error(e);
      return undefined;
    }
  }

  private resolveNip07Extension() {
    // console.log("waiting for window.nostr");
    if (window.nostr) {
      // console.log("Found window.nostr");
      this.signer = new NDKNip07Signer();
      this.initializeClientWithSigner();
    }
    async () => {
      while (!window.nostr) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      this.signer = new NDKNip07Signer();
      this.initializeClientWithSigner();
    };
  }

  private async initializeClientWithSigner() {
    try {
      // console.log(`initialize with signer`);
      this.signer?.user().then(async (user) => {
        let relayUrls: string[] | undefined = [];
        if (this.relayUrls !== undefined) {
          relayUrls = this.relayUrls;
        }
        const params: NDKConstructorParams = {
          signer: this.signer,
          explicitRelayUrls: relayUrls ? relayUrls : this.explicitRelayUrls,
          debug: this.debug,
        };
        this.ndk = new NDK(params);
        await this.ndk.assertSigner();
        await this.ndk.connect(1000);
        if (user.npub) {
          console.log(
            "Permission granted to read their public key:",
            user.npub
          );
          await this.initializeUsingNpub(user.npub);
        } else {
          console.log("Permission not granted");
        }
      });
    } catch (err) {
      console.log(err);
    }
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

  private async initializeUsingNpub(pubkey: string) {
    // const { user, loggedIn, loggingIn, npub } = storeToRefs(this.appStore);
    const appStore = useAppStore();
    const { setLoggedIn, setLoggingIn, setUser, setNpub } = appStore;
    const { relay } = storeToRefs(appStore);
    // const nostrStore = useNostrStore();
    // const { setNpub, setUser } = nostrStore;
    // setNpub(pubkey);
    // npub.value = pubkey;
    this.currentUserProfile = await this.getProfileFromNpub(pubkey);
    this.currentUser = await this.getNdkUserFromNpub(pubkey);
    // const relayUrls: string[] = explicitUrls;
    const userRelays = await this.fetchSubscribedRelaysFromCache();
    const relayUrls: string[] = [];
    userRelays.forEach((x) => {
      relayUrls.push(x.url);
    });
    // console.log(relayUrls);
    // console.log(this.signer);
    if (relayUrls && relayUrls.length > 0) {
      const newNDKParams: NDKConstructorParams = {
        signer: this.signer,
        explicitRelayUrls: relayUrls,
        debug: this.debug,
      };
      const newNDK: NDK = new NDK(newNDKParams);
      if (this.isNip07) {
        await newNDK.assertSigner();
      }
      try {
        await newNDK.connect(1000).catch((e) => console.log(e));
        this.ndk = newNDK;
        relay.value = newNDK;
      } catch (e) {
        console.log(`Error connecting NDK: ${e}`);
      }
    }
    setLoggingIn(false);
    setLoggedIn(true);
    // console.log(this.currentUser);
    if (this.currentUser) {
      setUser(this.currentUser);
      setNpub(this.currentUser.npub);
    }

    await this.checkIfNIP05Verified(
      this.currentUserProfile?.nip05,
      this.currentUser?.hexpubkey()
    );
  }

  async createNewUserOnNostr(displayName: string) {
    const appStore = useAppStore();
    const { relay } = storeToRefs(appStore);
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
    const relayTags = this.relayUrls.map((val) => ["r", val]);
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

  async createStall(stall: newStall): Promise<NDKEvent> {
    const appStore = useAppStore();
    const { npub, user, relay } = storeToRefs(appStore);
    const { type, data } = nip19.decode(npub.value);
    console.log(type);
    console.log(data);
    console.log(relay.value);
    console.log(this.ndk);
    const ndkEvent = new NDKEvent(this.ndk);
    const tags: NDKTag[] = [];
    tags.push(["d", stall.id]);
    ndkEvent.kind = 30017;
    ndkEvent.content = JSON.stringify(stall);
    ndkEvent.tags = tags;
    ndkEvent.pubkey = data.toString();
    console.log(ndkEvent);
    await ndkEvent.publish();
    return ndkEvent;
  }

  async updateStall(event: Event): Promise<NDKEvent> {
    console.log(window.nostr);
    const ndkEvent = new NDKEvent(this.ndk);
    console.log(ndkEvent);
    ndkEvent.pubkey = event.pubkey;
    ndkEvent.kind = event.kind;
    ndkEvent.tags = event.tags;
    ndkEvent.content = event.content;
    console.log(ndkEvent);
    await ndkEvent.publish();
    return ndkEvent;
  }

  async fetchSingleMerchantEvent(
    pubkey: string
  ): Promise<NDKEvent | null | undefined> {
    const filter: NDKFilter = {
      authors: [pubkey],
      kinds: [NDKKind.MarketStall],
    };
    // return await this.ndk?.fetchEvent(filter, {});
    return await this.ndk?.fetchEvent(filter);
  }

  async createSub(kind: number, events: Map<string, NDKEvent>) {
    // const appStore = useAppStore();
    // const { events } = storeToRefs(appStore);
    const subscription = this.ndk?.subscribe(
      { kinds: [kind] },
      { closeOnEose: false }
    );
    console.log(subscription);
    subscription?.on("event", (event: NDKEvent) => {
      console.log(`Adding event: ${event.content}`);
      const existingEvent = events.get(event.tagId());
      if (existingEvent && event.created_at && existingEvent.created_at) {
        event =
          event.created_at > existingEvent.created_at ? event : existingEvent;
      }
      event.ndk = this.ndk;
      events.set(event.tagId(), event);
    });
    subscription?.on("eose", () => {
      console.log(`subscription closed ${subscription}`);
    });
  }

  async fetchProfileEvent(pubkey: string): Promise<Set<NDKEvent> | undefined> {
    const filter: NDKFilter = { authors: [pubkey], kinds: [0] };
    return await this.ndk?.fetchEvents(filter);
  }

  async fetchEvents(kind: number): Promise<Set<NDKEvent> | undefined> {
    // console.log("Fetching events");
    // console.log(this.ndk);
    while (!this.ndk) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    // console.log(this.ndk);
    const filter: NDKFilter = { kinds: [kind] };
    return await this.ndk?.fetchEvents(filter);
  }

  async fetchEventLimit(
    kind: number,
    limit: number
  ): Promise<Set<NDKEvent> | undefined> {
    const filter: NDKFilter = { kinds: [kind], limit: limit };
    const productEvents = await this.ndk?.fetchEvents(filter);
    return productEvents;
  }

  async fetchMerchantProducts(
    authors: string[]
  ): Promise<Set<NDKEvent> | undefined> {
    const filter: NDKFilter = { kinds: [30018], authors: authors };
    const prodEvents = await this.ndk?.fetchEvents(filter);
    console.log(prodEvents?.values());
    return prodEvents;
  }

  async fetchMerchantEvents(
    authors: string[]
  ): Promise<Set<NDKEvent> | undefined> {
    const filter: NDKFilter = { kinds: [30017], authors: authors };
    const stallEvents = await this.ndk?.fetchEvents(filter);
    // console.log(stallEvents?.values());
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
    const relayEvents = await this.ndk?.fetchEvents(filter);
    if (relayEvents) {
      const sortedRelayEvents = [...relayEvents].sort(
        (a: NDKEvent, b: NDKEvent) => b.created_at! - a.created_at!
      );
      relayEvent = sortedRelayEvents[0]; //take the latest event
      if (!relayEvent) {
        // failover to the damus/snort relay event
        // some clients use kind 3 (contacts) events to broadcast a user's subscribed relays
        const filter2: NDKFilter = { kinds: [3], authors: [hexPubKey] };
        relayEvent = await this.ndk?.fetchEvent(filter2);
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
    console.log("Getting user relays");
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
    const appStore = useAppStore();
    const { clearRelays, addRelays } = appStore;
    if (relaysFromRelay) {
      clearRelays();
      console.log("Subbed relay db cleared");
      addRelays(relaysFromRelay);
    }
  }

  async fetchSubscribedRelaysFromCache(): Promise<Relay[]> {
    const appStore = useAppStore();
    const { getRelays } = appStore;
    const subscribedRelaysFromCache = getRelays;
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
