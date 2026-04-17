import mongoose from "mongoose";

const Schema = mongoose.Schema;

const PersonalTransactionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    accountId: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    type: {
      type: String,
      enum: ["income", "expense"],
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "salary",
        "freelance",
        "investment_income",
        "other_income",
        "food",
        "transport",
        "entertainment",
        "shopping",
        "bills",
        "rent",
        "healthcare",
        "education",
        "travel",
        "subscriptions",
        "other_expense",
      ],
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

PersonalTransactionSchema.index({ userId: 1, date: -1 });
PersonalTransactionSchema.index({ userId: 1, category: 1 });

const PersonalTransaction = mongoose.model("PersonalTransaction", PersonalTransactionSchema);

export default PersonalTransaction;
