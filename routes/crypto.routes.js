import { getCoinsPrice,fetchCoinData, getStandardDeviation } from "../controllers/crypto.controllers.js";
import { Router } from "express";
const router = Router();

router.get("/coins", getCoinsPrice);
router.get("/stats", fetchCoinData)
router.get("/deviation", getStandardDeviation)

export default router