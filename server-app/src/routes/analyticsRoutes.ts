import express from "express";
import { getAnalytics } from "../controllers/shortUrl";

const router = express.Router();

router.get("/:shortUrl", getAnalytics);

export default router;