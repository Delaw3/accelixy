import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { DepositCheckout } from "@/components/dashboard/DepositCheckout";
import { getDepositMethodConfig, type DepositMethod } from "@/lib/deposit/payment-methods";
import { connectDB } from "@/lib/db/mongoose";
import DepositHistory from "@/lib/models/deposit-history.model";

type Params = {
  params: Promise<{ id: string }>;
};

export default async function DepositDetailsPage({ params }: Params) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    notFound();
  }

  const { id } = await params;
  await connectDB();

  const deposit = await DepositHistory.findOne({
    _id: id,
    userId,
  }).lean<{
    _id: { toString: () => string };
    method: DepositMethod;
    amountUsd: number;
    address: string;
    qrCodeUrl: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    reference: string;
    userMarkedDone: boolean;
  }>();

  if (!deposit) {
    notFound();
  }

  const methodConfig = getDepositMethodConfig(deposit.method);

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-semibold md:text-3xl">Deposit Details</h3>
      <DepositCheckout
        depositId={deposit._id.toString()}
        methodLabel={methodConfig?.label ?? deposit.method}
        amountUsd={deposit.amountUsd}
        address={deposit.address}
        qrCodeUrl={deposit.qrCodeUrl}
        reference={deposit.reference}
        initialUserMarkedDone={deposit.userMarkedDone}
      />
    </div>
  );
}
