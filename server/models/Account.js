import mongoose from "mongoose";

const Schema = mongoose.Schema;

const AccountSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["checking", "savings", "credit_card", "cash", "investment"],
      required: true,
    },
    balance: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: "USD",
    },
    color: {
      type: String,
      default: "#12efc8", // Default to primary accent
    },
    icon: {
      type: String,
      default: "account_balance",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

AccountSchema.index({ userId: 1 });

const Account = mongoose.model("Account", AccountSchema);

export default Account;
