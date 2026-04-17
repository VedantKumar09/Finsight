import mongoose from "mongoose";

const Schema = mongoose.Schema;

const StockTradeSchema = new Schema(
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
    type: {
      type: String,
      enum: ["buy", "sell"],
      required: true,
    },
    shares: {
      type: Number,
      required: true,
      min: 0,
    },
    pricePerShare: {
      type: Number,
      required: true,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    profitLoss: {
      type: Number,
      default: 0, // Only for sell trades
    },
  },
  { timestamps: true }
);

StockTradeSchema.index({ userId: 1, createdAt: -1 });

const StockTrade = mongoose.model("StockTrade", StockTradeSchema);

export default StockTrade;
