import mongoose from 'mongoose';

const coinSchema = new mongoose.Schema({
    id: { type: String, required: true }, 
    price_usd: { type: Number, required: true },
    market_cap_usd: { type: Number, required: true },
    change_24h: { type: Number, required: true }
}, { _id: false });

const coinPriceSchema = new mongoose.Schema({
    timestamp: { type: Date, default: Date.now },
    coins: [coinSchema] 
});

const CoinPrice = mongoose.model('CoinPrice', coinPriceSchema);
export default CoinPrice;
