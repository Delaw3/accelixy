import { TransactionNotificationsPager } from "@/components/dashboard/TransactionNotificationsPager";

export default function TransactionNotificationsPage() {
  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-semibold md:text-3xl">
        Transaction Notifications
      </h3>
      <TransactionNotificationsPager />
    </div>
  );
}
