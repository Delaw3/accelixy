import mongoose, { HydratedDocument, Model, Schema, Types } from "mongoose";

export interface IUserStats {
  userId: Types.ObjectId;
  totalEarnings: number;
  totalWithdrawals: number;
}

export type UserStatsDocument = HydratedDocument<IUserStats>;

const userStatsSchema = new Schema<IUserStats>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    totalEarnings: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    totalWithdrawals: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

const UserStats =
  (mongoose.models.UserStats as Model<IUserStats>) ||
  mongoose.model<IUserStats>("UserStats", userStatsSchema);

export default UserStats;
