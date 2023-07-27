/* global WebSocket */

import { verifySignature, validateEvent, type Event } from "./event";
import { matchFilters, type Filter } from "./filter";
import { getHex64, getSubscriptionId } from "./fakejson";
import { MessageQueue } from "./utils";

type RelayEvent = {
  connect: () => void | Promise<void>;
  disconnect: () => void | Promise<void>;
  error: () => void | Promise<void>;
  notice: (msg: string) => void | Promise<void>;
  auth: (challenge: string) => void | Promise<void>;
};
export type CountPayload = {
  count: number;
};
type SubEvent<K extends number> = {
  event: (event: Event<K>) => void | Promise<void>;
  count: (payload: CountPayload) => void | Promise<void>;
  eose: () => void | Promise<void>;
};
export type Relay = {
  url: string;
  status: number;
  connect: () => Promise<void>;
  close: () => void;
  sub: <K extends number = number>(
    filters: Filter<K>[],
    opts?: SubscriptionOptions
  ) => Sub<K>;
  list: <K extends number = number>(
    filters: Filter<K>[],
    opts?: SubscriptionOptions
  ) => Promise<Event<K>[]>;
  get: <K extends number = number>(
    filter: Filter<K>,
    opts?: SubscriptionOptions
  ) => Promise<Event<K> | null>;
  count: (
    filters: Filter[],
    opts?: SubscriptionOptions
  ) => Promise<CountPayload | null>;
  publish: (event: Event<number>) => Pub;
  auth: (event: Event<number>) => Pub;
  off: <T extends keyof RelayEvent, U extends RelayEvent[T]>(
    event: T,
    listener: U
  ) => void;
  on: <T extends keyof RelayEvent, U extends RelayEvent[T]>(
    event: T,
    listener: U
  ) => void;
};
export type Pub = {
  on: (type: "ok" | "failed", cb: any) => void;
  off: (type: "ok" | "failed", cb: any) => void;
};
export type Sub<K extends number = number> = {
  sub: <K extends number = number>(
    filters: Filter<K>[],
    opts: SubscriptionOptions
  ) => Sub<K>;
  unsub: () => void;
  on: <T extends keyof SubEvent<K>, U extends SubEvent<K>[T]>(
    event: T,
    listener: U
  ) => void;
  off: <T extends keyof SubEvent<K>, U extends SubEvent<K>[T]>(
    event: T,
    listener: U
  ) => void;
};

export type SubscriptionOptions = {
  id?: string;
  verb?: "REQ" | "COUNT";
  skipVerification?: boolean;
  alreadyHaveEvent?: null | ((id: string, relay: string) => boolean);
};

const newListeners = (): { [TK in keyof RelayEvent]: RelayEvent[TK][] } => ({
  connect: [],
  disconnect: [],
  error: [],
  notice: [],
  auth: [],
});

export function relayInit(
  url: string,
  options: {
    getTimeout?: number;
    listTimeout?: number;
    countTimeout?: number;
  } = {}
): Relay {
  const {
    listTimeout = 3000,
    getTimeout = 3000,
    countTimeout = 3000,
  } = options;

  let ws: WebSocket;
  const openSubs: {
    [id: string]: { filters: Filter[] } & SubscriptionOptions;
  } = {};
  let listeners = newListeners();
  let subListeners: {
    [subid: string]: { [TK in keyof SubEvent<any>]: SubEvent<any>[TK][] };
  } = {};
  let pubListeners: {
    [eventid: string]: {
      ok: Array<() => void>;
      seen: Array<() => void>;
      failed: Array<(reason: string) => void>;
    };
  } = {};

  let connectionPromise: Promise<void> | undefined;
  async function connectRelay(): Promise<void> {
    if (connectionPromise) return connectionPromise;
    connectionPromise = new Promise((resolve, reject) => {
      try {
        ws = new WebSocket(url);
      } catch (err) {
        reject(err);
      }

      ws.onopen = () => {
        listeners.connect.forEach((cb) => cb());
        resolve();
      };
      ws.onerror = () => {
        connectionPromise = undefined;
        listeners.error.forEach((cb) => cb());
        reject();
      };
      ws.onclose = async () => {
        connectionPromise = undefined;
        listeners.disconnect.forEach((cb) => cb());
      };

      const incomingMessageQueue: MessageQueue = new MessageQueue();
      let handleNextInterval: any;

      ws.onmessage = (e) => {
        incomingMessageQueue.enqueue(e.data);
        if (!handleNextInterval) {
          handleNextInterval = setInterval(handleNext, 0);
        }
      };

      function handleNext() {
        if (incomingMessageQueue.size === 0) {
          clearInterval(handleNextInterval);
          handleNextInterval = null;
          return;
        }

        const json = incomingMessageQueue.dequeue();
        if (!json) return;

        const subid = getSubscriptionId(json);
        if (subid) {
          const so = openSubs[subid];
          if (
            so &&
            so.alreadyHaveEvent &&
            so.alreadyHaveEvent(getHex64(json, "id"), url)
          ) {
            return;
          }
        }

        try {
          const data = JSON.parse(json);

          // we won't do any checks against the data since all failures (i.e. invalid messages from relays)
          // will naturally be caught by the encompassing try..catch block

          switch (data[0]) {
            case "EVENT": {
              const id = data[1];
              const event = data[2];
              if (
                validateEvent(event) &&
                openSubs[id] &&
                (openSubs[id].skipVerification || verifySignature(event)) &&
                matchFilters(openSubs[id].filters, event)
              ) {
                openSubs[id];
                (subListeners[id]?.event || []).forEach((cb) => cb(event));
              }
              return;
            }
            case "COUNT":
              const id = data[1];
              const payload = data[2];
              if (openSubs[id]) {
                (subListeners[id]?.count || []).forEach((cb) => cb(payload));
              }
              return;
            case "EOSE": {
              const id = data[1];
              if (id in subListeners) {
                subListeners[id].eose.forEach((cb) => cb());
                subListeners[id].eose = []; // 'eose' only happens once per sub, so stop listeners here
              }
              return;
            }
            case "OK": {
              const id: string = data[1];
              const ok: boolean = data[2];
              const reason: string = data[3] || "";
              if (id in pubListeners) {
                if (ok) pubListeners[id].ok.forEach((cb) => cb());
                else pubListeners[id].failed.forEach((cb) => cb(reason));
                pubListeners[id].ok = []; // 'ok' only happens once per pub, so stop listeners here
                pubListeners[id].failed = [];
              }
              return;
            }
            case "NOTICE":
              const notice = data[1];
              listeners.notice.forEach((cb) => cb(notice));
              return;
            case "AUTH": {
              const challenge = data[1];
              listeners.auth?.forEach((cb) => cb(challenge));
              return;
            }
          }
        } catch (err) {
          return;
        }
      }
    });

    return connectionPromise;
  }

  function connected() {
    return ws?.readyState === 1;
  }

  async function connect(): Promise<void> {
    if (connected()) return; // ws already open
    await connectRelay();
  }

  async function trySend(params: [string, ...any]) {
    const msg = JSON.stringify(params);
    if (!connected()) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      if (!connected()) {
        return;
      }
    }
    try {
      ws.send(msg);
    } catch (err) {
      console.log(err);
    }
  }

  const sub = <K extends number = number>(
    filters: Filter<K>[],
    {
      verb = "REQ",
      skipVerification = false,
      alreadyHaveEvent = null,
      id = Math.random().toString().slice(2),
    }: SubscriptionOptions = {}
  ): Sub<K> => {
    const subid = id;

    openSubs[subid] = {
      id: subid,
      filters,
      skipVerification,
      alreadyHaveEvent,
    };
    trySend([verb, subid, ...filters]);

    return {
      sub: (newFilters, newOpts = {}) =>
        sub(newFilters || filters, {
          skipVerification: newOpts.skipVerification || skipVerification,
          alreadyHaveEvent: newOpts.alreadyHaveEvent || alreadyHaveEvent,
          id: subid,
        }),
      unsub: () => {
        delete openSubs[subid];
        delete subListeners[subid];
        trySend(["CLOSE", subid]);
      },
      on: (type, cb) => {
        subListeners[subid] = subListeners[subid] || {
          event: [],
          count: [],
          eose: [],
        };
        subListeners[subid][type].push(cb);
      },
      off: (type, cb): void => {
        const listeners = subListeners[subid];
        const idx = listeners[type].indexOf(cb);
        if (idx >= 0) listeners[type].splice(idx, 1);
      },
    };
  };

  function _publishEvent(event: Event<number>, type: string) {
    if (!event.id) throw new Error(`event ${event} has no id`);
    const id = event.id;

    trySend([type, event]);

    return {
      on: (type: "ok" | "failed", cb: any) => {
        pubListeners[id] = pubListeners[id] || {
          ok: [],
          failed: [],
        };
        pubListeners[id][type].push(cb);
      },
      off: (type: "ok" | "failed", cb: any) => {
        const listeners = pubListeners[id];
        if (!listeners) return;
        const idx = listeners[type].indexOf(cb);
        if (idx >= 0) listeners[type].splice(idx, 1);
      },
    };
  }

  return {
    url,
    sub,
    on: <T extends keyof RelayEvent, U extends RelayEvent[T]>(
      type: T,
      cb: U
    ): void => {
      listeners[type].push(cb);
      if (type === "connect" && ws?.readyState === 1) {
        // i would love to know why we need this
        (cb as () => void)();
      }
    },
    off: <T extends keyof RelayEvent, U extends RelayEvent[T]>(
      type: T,
      cb: U
    ): void => {
      const index = listeners[type].indexOf(cb);
      if (index !== -1) listeners[type].splice(index, 1);
    },
    list: (filters, opts?: SubscriptionOptions) =>
      new Promise((resolve) => {
        const s = sub(filters, opts);
        const events: Event<any>[] = [];
        const timeout = setTimeout(() => {
          s.unsub();
          resolve(events);
        }, listTimeout);
        s.on("eose", () => {
          s.unsub();
          clearTimeout(timeout);
          resolve(events);
        });
        s.on("event", (event) => {
          events.push(event);
        });
      }),
    get: (filter, opts?: SubscriptionOptions) =>
      new Promise((resolve) => {
        const s = sub([filter], opts);
        const timeout = setTimeout(() => {
          s.unsub();
          resolve(null);
        }, getTimeout);
        s.on("event", (event) => {
          s.unsub();
          clearTimeout(timeout);
          resolve(event);
        });
      }),
    count: (filters: Filter[]): Promise<CountPayload | null> =>
      new Promise((resolve) => {
        const s = sub(filters, { ...sub, verb: "COUNT" });
        const timeout = setTimeout(() => {
          s.unsub();
          resolve(null);
        }, countTimeout);
        s.on("count", (event: CountPayload) => {
          s.unsub();
          clearTimeout(timeout);
          resolve(event);
        });
      }),
    publish(event): Pub {
      return _publishEvent(event, "EVENT");
    },
    auth(event): Pub {
      return _publishEvent(event, "AUTH");
    },
    connect,
    close(): void {
      listeners = newListeners();
      subListeners = {};
      pubListeners = {};
      if (ws.readyState === WebSocket.OPEN) {
        ws?.close();
      }
    },
    get status() {
      return ws?.readyState ?? 3;
    },
  };
}
