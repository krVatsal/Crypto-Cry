import { ApiError } from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js"
import CoinPrice from "../models/crypto.model.js";
import dotenv from "dotenv";

dotenv.config();

const BASE_URL = process.env.BASE_URL || "https://api.coingecko.com/api/v3";

const getCoinsPrice = async () => {
    try {
        const url = `${BASE_URL}/simple/price?ids=bitcoin,ethereum,matic-network&vs_currencies=usd&include_market_cap=true&include_24hr_change=true`;

        const response = await fetch(url, {
            headers: {
                'x-cg-pro-api-key': process.env.COINGECKO_API_KEY
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new ApiError(
                response.status,
                error.message || "Failed to fetch cryptocurrency prices"
            );
        }

        const data = await response.json();
        console.log(data)

        const formattedData = {
            coins: Object.keys(data).map(coinId => ({
                id: coinId,
                price_usd: data[coinId]?.usd || 0,
                market_cap_usd: data[coinId]?.usd_market_cap || 0,
                change_24h: data[coinId]?.usd_24h_change || 0
            }))
        };
        
console.log(formattedData)
        // Save to database
        const savedData = await CoinPrice.create(formattedData);

        console.log("Prices saved successfully:", savedData)

        return res.status(200).json({savedData});

    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }

        // Handle rate limiting
        if (error.status === 429) {
            throw new ApiError(
                429,
                "Rate limit exceeded. Please try again later."
            );
        }

        // Handle other API-specific errors
        if (error.status === 401) {
            throw new ApiError(
                401,
                "Invalid API key or unauthorized access"
            );
        }

        // Handle network errors
        if (error.name === 'FetchError') {
            throw new ApiError(
                503,
                "Service unavailable. Please try again later."
            );
        }

        // Handle any other unexpected errors
        throw new ApiError(
            500,
            "Internal server error while fetching cryptocurrency prices"
        );
    }
};

const fetchCoinData= async(req,res)=>{
    const { coin } = req.query; 
    if (!coin) {
        return res.status(400).json({ message: "Coin parameter is required" });
    }

    try {
        const latestData = await CoinPrice.findOne().sort({ timestamp: -1 }).exec();

        if (!latestData) {
            return res.status(404).json({ message: "No data found" });
        }

        const coinData = latestData.coins.find(c => c.id === coin);

        if (!coinData) {
            return res.status(404).json({ message: `${coin} data not found` });
        }

        // Respond with the formatted data
        return res.status(200).json({
            price: coinData.price_usd,
            marketCap: coinData.market_cap_usd,
            "24hChange": coinData.change_24h
        });

    } catch (error) {
        return res.status(500).json({ message: "Error fetching data", error: error.message });
    }
}
const getStandardDeviation = async (req, res) => {
    try {
        const { coin } = req.query;

        if (!coin) {
            throw new ApiError(400, "Coin parameter is required.");
        }

        const records = await CoinPrice.find({
            "coins.id": coin
        })
            .sort({ timestamp: -1 })  
            .limit(100); 

        if (records.length === 0) {
            throw new ApiError(404, "No records found for the requested coin.");
        }

        const prices = records.map(record =>
            record.coins.find(coinRecord => coinRecord.id === coin)?.price_usd
        ).filter(price => price !== undefined);

        if (prices.length === 0) {
            throw new ApiError(404, `No price data found for ${coin}.`);
        }

        const mean = prices.reduce((acc, price) => acc + price, 0) / prices.length;
        const variance = prices.reduce((acc, price) => acc + Math.pow(price - mean, 2), 0) / prices.length;
        const deviation = Math.sqrt(variance);

        return res.status(200).json(
            new ApiResponse(200, { deviation: deviation.toFixed(2) }, "Standard deviation calculated successfully.")
        );
    } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.status).json(error);
        }

        return res.status(500).json(new ApiResponse(500, null, "Internal Server Error"));
    }
};

export { getCoinsPrice, fetchCoinData, getStandardDeviation};
