import mongoose from "mongoose";

const Schema = mongoose.Schema;

const WatchlistSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tickers: [
      {
        symbol: {
          type: String,
          required: true,
          uppercase: true,
          trim: true,
        },
        companyName: {
          type: String,
          default: "",
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

WatchlistSchema.index({ userId: 1 }, { unique: true });

const Watchlist = mongoose.model("Watchlist", WatchlistSchema);

export default Watchlist;
