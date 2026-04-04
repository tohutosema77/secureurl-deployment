"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const analyticsSchema = new mongoose_1.default.Schema({
    shortUrl: { type: String, required: true },
    ipAddress: { type: String, required: true },
    userAgent: { type: String },
    country: { type: String, default: "Unknown" },
    city: { type: String, default: "Unknown" },
    deviceType: { type: String, default: "Unknown" },
    browser: { type: String, default: "Unknown" },
    os: { type: String, default: "Unknown" },
}, { timestamps: true });
const Analytics = mongoose_1.default.model("Analytics", analyticsSchema);
exports.default = Analytics;
