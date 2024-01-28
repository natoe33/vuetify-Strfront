import { NDKTag } from "@nostr-dev-kit/ndk";

export type Nip96Spec = {
  api_url: string;
  download_url?: string;
  delegated_to_url?: string;
  supported_nips?: number[];
  tos_url?: string;
  content_types?: string[];
  plans: {
    [key: string]: {
      name: string;
      is_nip98_required: boolean;
      url?: string;
      max_byte_size?: number;
      file_expiration?: [number, number];
      media_transformations?: {
        image?: string[];
      };
    };
  };
};

export type Nip96UploadResponse = {
  status: "success" | "error";
  message: string;
  processing_url?: string;
  nip94_event?: {
    tags: NDKTag[];
    content: string;
  };
};
