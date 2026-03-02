import type { LucideIcon } from "lucide-react";
import { Bitcoin, CircleDollarSign, Hexagon, Triangle } from "lucide-react";
import { DEPOSIT_METHODS } from "@/lib/deposit/payment-methods";

const iconByMethod: Record<
  (typeof DEPOSIT_METHODS)[number]["method"],
  { token: LucideIcon; network: LucideIcon }
> = {
  USDT_BEP20: {
    token: CircleDollarSign,
    network: Hexagon,
  },
  USDT_TRC20: {
    token: CircleDollarSign,
    network: Triangle,
  },
  BTC: {
    token: Bitcoin,
    network: Bitcoin,
  },
};

export function SupportedPaymentMethods() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-14 md:px-6">
      <h2 className="text-center text-2xl font-semibold md:text-3xl">Supported Payment Methods</h2>
      <p className="mt-2 text-center text-sm text-muted md:text-base">
        Deposit securely with our currently supported crypto payment options.
      </p>

      <div className="mt-6 flex flex-wrap items-start justify-center gap-2 md:gap-x-10 md:gap-y-3">
        {DEPOSIT_METHODS.map((method) => {
          const icons = iconByMethod[method.method];
          const TokenIcon = icons.token;
          const NetworkIcon = icons.network;

          return (
            <article key={method.method} className="flex min-w-[108px] shrink-0 flex-col items-center p-1 text-center md:min-w-[130px]">
              <div className="flex items-center justify-center gap-px">
                <TokenIcon className="h-8 w-8 text-primary md:h-10 md:w-10" strokeWidth={2} />
                <NetworkIcon className="h-4 w-4 text-primary/85 md:h-5 md:w-5" strokeWidth={2} />
              </div>

              <h3 className="mt-1.5 text-sm font-semibold md:text-base">{method.label}</h3>
            </article>
          );
        })}
      </div>
    </section>
  );
}
