import mongoose, { HydratedDocument, Model, Schema, Types } from "mongoose";

export type WithdrawalStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface IWithdrawal {
  userId: Types.ObjectId;
  amount: number;
  method: string;
  walletAddress: string;
  status: WithdrawalStatus;
  createdAt: Date;
}

export type WithdrawalDocument = HydratedDocument<IWithdrawal>;

const withdrawalSchema = new Schema<IWithdrawal>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    method: {
      type: String,
      required: true,
      trim: true,
    },
    walletAddress: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      required: true,
      default: "PENDING",
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Withdrawal =
  (mongoose.models.Withdrawal as Model<IWithdrawal>) ||
  mongoose.model<IWithdrawal>("Withdrawal", withdrawalSchema);

export default Withdrawal;
