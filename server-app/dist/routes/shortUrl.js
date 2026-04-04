"use strict";
// import express  from "express";
// import { protect } from "../middleware/authMiddleware";
// import { createUrl, deleteUrl, getAllUrl, getUrl,getUserUrls } from "../controllers/shortUrl";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// const router = express.Router();
// // Create a short URL → attach logged-in user
// router.post("/shortUrl", protect, createUrl);
// // router.post("/shortUrl", createUrl);
// // Get all URLs for the logged-in user (dashboard)
// router.get("/shortUrl/myurls", protect, getUserUrls);
// router.get("/shortUrl", getAllUrl);
// router.get("/shortUrl/:id", getUrl);
// router.delete("/shortUrl/:id", deleteUrl);
// export default router;
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const shortUrl_1 = require("../controllers/shortUrl");
const router = express_1.default.Router();
// // Create a short URL → attach logged-in user
// router.post("/shortUrl", protect, createUrl);
console.log("Short URL router loaded");
router.post("/shortUrl", (req, res, next) => {
    console.log("POST /shortUrl HIT", req.body);
    next();
}, authMiddleware_1.protect, shortUrl_1.createUrl);
// Dashboard → URLs of logged-in user
// router.get("/shortUrl/myurls", getUserUrls);
router.get("/shortUrl/myurls", authMiddleware_1.protect, shortUrl_1.getUserUrls);
// Optional → all URLs
router.get("/shortUrl", authMiddleware_1.protect, shortUrl_1.getAllUrl);
// Single URL details (by MongoDB _id)
router.get("/shortUrl/:id", authMiddleware_1.protect, shortUrl_1.getUrl);
// Delete URL by ID
router.delete("/shortUrl/:id", authMiddleware_1.protect, shortUrl_1.deleteUrl);
// Public redirect → catch-all last!
router.get("/:shortUrl", shortUrl_1.redirectShortUrl);
// Optional: get all URLs in the DB (admin use)
// router.get("/shortUrl", protect, getAllUrl);
exports.default = router;
