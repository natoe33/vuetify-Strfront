import { type Nip96Spec, type Nip96UploadResponse } from "@/models";
import { useAppStore } from "@/store/app";
import  NDK, { NDKEvent, NDKKind, NostrEvent } from "@nostr-dev-kit/ndk";
import { storeToRefs } from "pinia";

const SPEC_PATH = "/.well-known/nostr/nip96.json";

type PrepareUploadResult = {
  url: string;
  headers: { [key: string]: string };
};

export class Nip96 {
  private ndk: NDK;
  public spec: Nip96Spec | undefined;
  private url: string;
  public nip98Required: boolean = false;

  /**
   *
   */
  constructor(domain: string) {
    const appStore = useAppStore();
    const { nostrProvider } = storeToRefs(appStore);
    this.ndk = nostrProvider.value.ndk as NDK;
    this.url = `https://${domain}/${SPEC_PATH}`;
  }

  public async upload(blob: Blob) {
    console.log(`upload: ${blob}`);

    const httpVerb = "POST";
    const { url, headers } = await this.prepareUpload(blob, httpVerb);
    const formData = new FormData();
    formData.append("file", blob);
    console.log(`uploading: url: ${this.spec?.api_url}, method: ${httpVerb}, headers: ${headers}, body: ${formData}`);

    const res = await fetch(this.spec!.api_url, {
      method: httpVerb,
      headers,
      body: formData,
    });

    console.log(res);

    if (res.status !== 200) throw new Error(`Failed to upload file to ${url}`);
    const json = (await res.json()) as Nip96UploadResponse;
    if (json.status !== "success") throw new Error(json.message);
    return json;
  }

  async prepareUpload(blob: Blob, httpVerb: string = "POST"): Promise<PrepareUploadResult> {
    console.log(`prepare upload - spec: ${this.spec}`);
    if (!this.spec) await this.fetchSpec();
    if (!this.spec) throw new Error("Failed to fetch NIP96 spec");

    let headers = {};

    if (this.nip98Required) {
      const authorizationHeader = await this.generateNip98Header(
        this.spec!.api_url,
        httpVerb,
        blob,
      );
      headers = { Authorization: authorizationHeader };
    }

    return {
      url: this.spec.api_url,
      headers,
    };
  }

  public async fetchSpec() {
    console.log('fetchSpec');
    const res = await fetch(this.url);
    if (res.status !== 200)
      throw new Error(`Failed to fetch NIP96 spec from ${this.url}`);
    const spec = await res.json();
    if (!spec) throw new Error(`Failed to parse NIP96 spec from ${this.url}`);
    this.spec = spec;
    this.nip98Required = this.spec!.plans.free.is_nip98_required;
    console.log(this.nip98Required);
  }

  async generateNip98Header(
    requestUrl: string,
    httpMethod: string,
    blob: Blob,
  ): Promise<string> {
    console.log('generateNip98Header');
    const appStore = useAppStore();
    const { nostrProvider } = storeToRefs(appStore);
    const event = new NDKEvent(nostrProvider.value.ndk as NDK, {
      kind: NDKKind.HttpAuth,
      tags: [
        ["u", requestUrl],
        ["method", httpMethod],
      ],
    } as NostrEvent);
    console.log(event);

    if (["POST", "PUT", "PATCH"].includes(httpMethod)) {
      const sha256Hash = await this.calculateSha256(blob);
      event.tags.push(["payload", sha256Hash]);
    }

    await event.sign();
    const encodedEvent = btoa(JSON.stringify(event.rawEvent()));
    console.log(encodedEvent);
    return `Nostr ${encodedEvent}`;
  }

  private async calculateSha256(blob: Blob): Promise<string> {
    console.log('calculating SHA256')
    const buffer = await blob.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    console.log('SHA256 calculated');
    return hashHex;
  }
}
