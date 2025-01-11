import { ApiError } from "../utils/ApiError.js";
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

        const formattedData = Object.keys(data).map(coinId => ({
            id: coinId,
            price_usd: data[coinId]?.usd || 0,
            market_cap_usd: data[coinId]?.usd_market_cap || 0,
            change_24h: data[coinId]?.usd_24h_change || 0
        }));

        // Save to database
        const savedData = await CoinPrice.create({ coins: formattedData });

        console.log("Prices saved successfully:", savedData);

        return savedData;

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

const fetchCoinData= async()=>{
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
export { getCoinsPrice, fetchCoinData };
