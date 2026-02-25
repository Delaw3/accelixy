export type DepositMethod = "USDT_BEP20" | "USDT_TRC20" | "BTC";

export type DepositMethodConfig = {
  method: DepositMethod;
  label: string;
  address: string;
  qrCodeUrl: string;
};

export const DEPOSIT_METHODS: DepositMethodConfig[] = [
  {
    method: "USDT_BEP20",
    label: "USDT Bep20",
    address: "0xf3Cb555f3aA7Eb64E8C422a1471C16666b4C011d",
    qrCodeUrl:
      "https://lagpvwdlpjmuuxzukczh.supabase.co/storage/v1/object/public/Accelixy-Bucket/pictures/usdtBEP20.jpeg",
  },
  {
    method: "USDT_TRC20",
    label: "USDT Trc20",
    address: "TZ3FWpvafaHXw7akEgGkKECDU8fPktFCCH",
    qrCodeUrl:
      "https://lagpvwdlpjmuuxzukczh.supabase.co/storage/v1/object/public/Accelixy-Bucket/pictures/usdtTRC20.jpeg",
  },
  {
    method: "BTC",
    label: "BTC",
    address: "bc1q00n0fg260a02lu28le33nr4n92gr64m46u7e23",
    qrCodeUrl:
      "https://lagpvwdlpjmuuxzukczh.supabase.co/storage/v1/object/public/Accelixy-Bucket/pictures/BTC.jpeg",
  },
];

export function getDepositMethodConfig(method: DepositMethod) {
  return DEPOSIT_METHODS.find((item) => item.method === method);
}
