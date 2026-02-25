import { auth } from "@/auth";
import { WithdrawalRequestForm } from "@/components/dashboard/WithdrawalRequestForm";
import { connectDB } from "@/lib/db/mongoose";
import UserWalletAddress from "@/lib/models/user-wallet-address.model";

export default async function RequestWithdrawalPage() {
  const session = await auth();
  const userId = session?.user?.id;

  let wallets = {
    bitcoinBTC: "",
    usdtTRC20: "",
    usdtBEP20: "",
  };

  if (userId) {
    await connectDB();
    const walletAddresses = await UserWalletAddress.findOne({ userId }).lean<{
      bitcoinBTC?: string;
      usdtTRC20?: string;
      usdtBEP20?: string;
    }>();

    wallets = {
      bitcoinBTC: walletAddresses?.bitcoinBTC ?? "",
      usdtTRC20: walletAddresses?.usdtTRC20 ?? "",
      usdtBEP20: walletAddresses?.usdtBEP20 ?? "",
    };
  }

  return <WithdrawalRequestForm wallets={wallets} />;
}
