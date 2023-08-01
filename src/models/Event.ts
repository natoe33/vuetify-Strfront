export interface IEvent {
  id?: string;
  pubkey?: string;
  created_at?: number;
  kind?: number;
  tags?: string[][];
  content?: string;
  sig?: string;
}

export class Event {
  id: string;
  pubkey: string;
  created_at: number;
  kind: number;
  tags: string[][];
  content: string;
  sig: string;

  constructor(event: IEvent = {}) {
    this.id = event.id || "";
    this.pubkey = event.pubkey || "";
    this.created_at = event.created_at || 0;
    this.kind = event.kind || 0;
    this.tags = event.tags || [];
    this.content = event.content || "";
    this.sig = event.sig || "";
  }
}
