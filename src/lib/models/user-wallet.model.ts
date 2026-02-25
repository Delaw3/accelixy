import mongoose, { HydratedDocument, Model, Schema, Types } from "mongoose";

export interface IUserWallet {
  userId: Types.ObjectId;
  balance: number;
  currency: "USD";
}

export type UserWalletDocument = HydratedDocument<IUserWallet>;

const userWalletSchema = new Schema<IUserWallet>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    balance: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      default: "USD",
      enum: ["USD"],
    },
  },
  { timestamps: true }
);

const UserWallet =
  (mongoose.models.UserWallet as Model<IUserWallet>) ||
  mongoose.model<IUserWallet>("UserWallet", userWalletSchema);

export default UserWallet;
