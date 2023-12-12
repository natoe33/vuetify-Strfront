import NDK, { NDKFilter } from "../../index.js";
import NDKEvent, { NDKTag, NostrEvent } from "../index.js";

type classWithConvertFunction<T> = {
    from: (event: NDKEvent) => T;
};

/**
 * Handles NIP-18 reposts.
 */
export class NDKRepost<T> extends NDKEvent {
    private _repostedEvents: T[] | undefined;

    constructor(ndk?: NDK, rawEvent?: NostrEvent) {
        super(ndk, rawEvent);
    }

    static from(event: NDKEvent) {
        return new NDKRepost(event.ndk, event.rawEvent());
    }

    /**
     * Returns all reposted events by the current event.
     *
     * @param klass Optional class to convert the events to.
     * @returns
     */
    async repostedEvents(klass?: classWithConvertFunction<T>): Promise<T[]> {
        const items: T[] = [];

        if (!this.ndk) throw new Error("NDK instance not set");

        if (this._repostedEvents !== undefined) return this._repostedEvents;

        for (const eventId of this.repostedEventIds()) {
            const filter = filterForId(eventId);
            const event = await this.ndk.fetchEvent(filter);

            if (event) {
                items.push(klass ? klass.from(event) : (event as T));
            }
        }

        return items;
    }

    /**
     * Returns the reposted event IDs.
     */
    repostedEventIds(): string[] {
        return this.tags
            .filter((t: NDKTag) => t[0] === "e" || t[0] === "a")
            .map((t: NDKTag) => t[1]);
    }
}

function filterForId(id: string): NDKFilter {
    if (id.match(/:/)) {
        const [kind, pubkey, identifier] = id.split(":");
        return {
            kinds: [parseInt(kind)],
            authors: [pubkey],
            "#d": [identifier],
        };
    } else {
        return { ids: [id] };
    }
}
