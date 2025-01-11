import mongoose from "mongoose";

const CoinPriceSchema = new mongoose.Schema({
    coins: [
        {
            id: { type: String, required: true },
            price_usd: { type: Number, required: true },
            market_cap_usd: { type: Number, required: true },
            change_24h: { type: Number, required: true }
        }
    ],
    timestamp: { type: Date, default: Date.now }
});

const CoinPrice = mongoose.model("CoinPrice", CoinPriceSchema);

export default CoinPrice;
