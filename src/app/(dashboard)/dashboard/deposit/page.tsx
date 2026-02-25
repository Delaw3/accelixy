import { DepositForm } from "@/components/dashboard/DepositForm";

export default function DepositPage() {
  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-semibold md:text-3xl">Make Deposit</h3>
      <DepositForm />
    </div>
  );
}
