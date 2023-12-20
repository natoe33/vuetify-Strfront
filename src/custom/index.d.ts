declare module "light-bolt11-decoder" {
  export function decode(
    paymentRequest: any,
    network: any
  ): {
    paymentRequest: any;
    sections: (
      | {
          name: string;
          letters: any;
          value: any;
          tag?: undefined;
        }
      | {
          name: any;
          tag: any;
          letters: any;
          value: any;
        }
      | {
          name: string;
          letters: any;
          value?: undefined;
          tag?: undefined;
        }
    )[];
    readonly expiry: any;
    readonly route_hints: any[];
  };
  export function hrpToMillisat(
    hrpString: any,
    outputString: any
  ): string | number;
}
