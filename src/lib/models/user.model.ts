import mongoose, { HydratedDocument, Model, Schema, Types } from "mongoose";

export interface IUser {
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  country: string;
  phone: string;
  password: string;
  role: "USER" | "ADMIN";
  isActive: boolean;
  referralCode: string;
  referredBy?: Types.ObjectId | null;
  referralRewardPaid: boolean;
  referralFirstDepositRewardedAt?: Date | null;
}

export type UserDocument = HydratedDocument<IUser>;

const userSchema = new Schema<IUser>(
  {
    firstname: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    lastname: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      required: true,
      index: true,
    },
    referralCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
      uppercase: true,
      trim: true,
    },
    referredBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    referralRewardPaid: {
      type: Boolean,
      default: false,
      required: true,
    },
    referralFirstDepositRewardedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const existingModel = mongoose.models.User as Model<IUser> | undefined;

// In dev/hot-reload, mongoose may keep an older cached schema without new fields.
if (
  existingModel &&
  (
    !existingModel.schema.path("role") ||
    !existingModel.schema.path("isActive") ||
    !existingModel.schema.path("referralCode") ||
    !existingModel.schema.path("referredBy")
  )
) {
  delete mongoose.models.User;
}

const User =
  (mongoose.models.User as Model<IUser>) ||
  mongoose.model<IUser>("User", userSchema);

export default User;
