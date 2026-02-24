import mongoose, { HydratedDocument, Model, Schema } from "mongoose";

export interface IUser {
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  country: string;
  phone: string;
  password: string;
  role: "admin" | "client";
  wallets: {
    bitcoinBTC?: string;
    usdtTRC20?: string;
    usdtBEP20?: string;
  };
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
      enum: ["admin", "client"],
      default: "client",
      required: true,
    },
    wallets: {
      type: new Schema(
        {
          bitcoinBTC: {
            type: String,
            trim: true,
          },
          usdtTRC20: {
            type: String,
            trim: true,
          },
          usdtBEP20: {
            type: String,
            trim: true,
          },
        },
        { _id: false }
      ),
      default: {},
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
  (!existingModel.schema.path("role") || !existingModel.schema.path("wallets"))
) {
  delete mongoose.models.User;
}

const User =
  (mongoose.models.User as Model<IUser>) ||
  mongoose.model<IUser>("User", userSchema);

export default User;
