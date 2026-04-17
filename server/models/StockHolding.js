import mongoose from "mongoose";

const Schema = mongoose.Schema;

const StockHoldingSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ticker: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    companyName: {
      type: String,
      default: "",
    },
    shares: {
      type: Number,
      required: true,
      min: 0,
    },
    avgBuyPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    totalInvested: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

StockHoldingSchema.index({ userId: 1, ticker: 1 }, { unique: true });

const StockHolding = mongoose.model("StockHolding", StockHoldingSchema);

export default StockHolding;
