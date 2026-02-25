import mongoose, { HydratedDocument, Model, Schema, Types } from "mongoose";

export interface IUserWalletAddress {
  userId: Types.ObjectId;
  bitcoinBTC?: string;
  usdtTRC20?: string;
  usdtBEP20?: string;
}

export type UserWalletAddressDocument = HydratedDocument<IUserWalletAddress>;

const userWalletAddressSchema = new Schema<IUserWalletAddress>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    bitcoinBTC: {
      type: String,
      trim: true,
      default: "",
    },
    usdtTRC20: {
      type: String,
      trim: true,
      default: "",
    },
    usdtBEP20: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

const UserWalletAddress =
  (mongoose.models.UserWalletAddress as Model<IUserWalletAddress>) ||
  mongoose.model<IUserWalletAddress>("UserWalletAddress", userWalletAddressSchema);

export default UserWalletAddress;
