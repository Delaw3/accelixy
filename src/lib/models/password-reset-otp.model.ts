import mongoose, { Model, Schema, Types } from "mongoose";

export interface IPasswordResetOtp {
  userId: Types.ObjectId;
  email: string;
  otpHash: string;
  attempts: number;
  expiresAt: Date;
  consumedAt?: Date | null;
}

const passwordResetOtpSchema = new Schema<IPasswordResetOtp>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    otpHash: {
      type: String,
      required: true,
    },
    attempts: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    consumedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

passwordResetOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const PasswordResetOtp =
  (mongoose.models.PasswordResetOtp as Model<IPasswordResetOtp>) ||
  mongoose.model<IPasswordResetOtp>("PasswordResetOtp", passwordResetOtpSchema);

export default PasswordResetOtp;
