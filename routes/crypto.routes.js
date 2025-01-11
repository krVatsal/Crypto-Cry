import { getCoinsPrice } from "../controllers/crypto.controllers.js";
import { Router } from "express";
const router = Router();

router.get("/coins", getCoinsPrice);

export default router