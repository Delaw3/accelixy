import mongoose, { HydratedDocument, Model, Schema, Types } from "mongoose";

export type InvestmentStatus = "ACTIVE" | "COMPLETED" | "CANCELLED" | "PAID";

export interface IInvestment {
  userId: Types.ObjectId;
  planName: string;
  amount: number;
  roiPercent: number;
  status: InvestmentStatus;
  startedAt: Date;
  endsAt: Date;
  expectedReturn: number;
}

export type InvestmentDocument = HydratedDocument<IInvestment>;

const investmentSchema = new Schema<IInvestment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    planName: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    roiPercent: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "COMPLETED", "CANCELLED", "PAID"],
      required: true,
      default: "ACTIVE",
      index: true,
    },
    startedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endsAt: {
      type: Date,
      required: true,
    },
    expectedReturn: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

const Investment =
  (mongoose.models.Investment as Model<IInvestment>) ||
  mongoose.model<IInvestment>("Investment", investmentSchema);

export default Investment;
