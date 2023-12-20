import { decode as invoiceDecode } from "light-bolt11-decoder";
import { decode } from "bolt11";

export class Util {
  static getAmountFromInvoice(invoice: string): number | undefined {
    try {
      // const parsed = invoiceDecode(invoice);
      //   const parsed = decode(invoice);
      //   const amountSection = parsed.sections.find(
      //     (a: any) => a.name === "amount"
      //   );
      //   const amount = amountSection
      //     ? Number(amountSection.value as number | string)
      //     : undefined;
      //   return amount;
    } catch (e) {
      console.error(e);
    }
    return undefined;
  }
}
