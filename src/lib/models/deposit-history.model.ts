import mongoose, { HydratedDocument, Model, Schema, Types } from "mongoose";
import type { DepositMethod } from "@/lib/deposit/payment-methods";

export type DepositStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface IDepositHistory {
  userId: Types.ObjectId;
  method: DepositMethod;
  amountUsd: number;
  address: string;
  qrCodeUrl: string;
  status: DepositStatus;
  reference: string;
  userMarkedDone: boolean;
}

export type DepositHistoryDocument = HydratedDocument<IDepositHistory>;

const depositHistorySchema = new Schema<IDepositHistory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    method: {
      type: String,
      enum: ["USDT_BEP20", "USDT_TRC20", "BTC"],
      required: true,
      index: true,
    },
    amountUsd: {
      type: Number,
      required: true,
      min: 1,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    qrCodeUrl: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
      required: true,
      index: true,
    },
    reference: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userMarkedDone: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  { timestamps: true }
);

const DepositHistory =
  (mongoose.models.DepositHistory as Model<IDepositHistory>) ||
  mongoose.model<IDepositHistory>("DepositHistory", depositHistorySchema);

export default DepositHistory;
