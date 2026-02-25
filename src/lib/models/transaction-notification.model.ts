import mongoose, { HydratedDocument, Model, Schema, Types } from "mongoose";

export type NotificationType = "deposit" | "withdrawal" | "investment";
export type NotificationStatus = "PENDING" | "APPROVED" | "REJECTED" | "INFO";

export interface ITransactionNotification {
  userId: Types.ObjectId;
  type: NotificationType;
  message: string;
  amount: number;
  status: NotificationStatus;
  read: boolean;
}

export type TransactionNotificationDocument =
  HydratedDocument<ITransactionNotification>;

const transactionNotificationSchema = new Schema<ITransactionNotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["deposit", "withdrawal", "investment"],
      required: true,
      index: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "INFO"],
      required: true,
      default: "INFO",
      index: true,
    },
    read: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true }
);

const TransactionNotification =
  (mongoose.models.TransactionNotification as Model<ITransactionNotification>) ||
  mongoose.model<ITransactionNotification>(
    "TransactionNotification",
    transactionNotificationSchema
  );

export default TransactionNotification;
