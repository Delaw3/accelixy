import mongoose, { HydratedDocument, Model, Schema, Types } from "mongoose";

export type ReferralRewardStatus = "PENDING" | "PAID";

export interface IReferral {
  referrerId: Types.ObjectId;
  referredUserId: Types.ObjectId;
  code: string;
  firstDepositAmount?: number;
  rewardAmount?: number;
  rewardStatus: ReferralRewardStatus;
  rewardedAt?: Date;
}

export type ReferralDocument = HydratedDocument<IReferral>;

const referralSchema = new Schema<IReferral>(
  {
    referrerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    referredUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    firstDepositAmount: {
      type: Number,
      min: 0,
    },
    rewardAmount: {
      type: Number,
      min: 0,
    },
    rewardStatus: {
      type: String,
      enum: ["PENDING", "PAID"],
      default: "PENDING",
      required: true,
      index: true,
    },
    rewardedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

const Referral =
  (mongoose.models.Referral as Model<IReferral>) ||
  mongoose.model<IReferral>("Referral", referralSchema);

export default Referral;
