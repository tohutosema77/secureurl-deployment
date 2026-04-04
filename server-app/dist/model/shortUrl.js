"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.urlModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const nanoid_1 = require("nanoid");
const shortUrlSchema = new mongoose_1.default.Schema({
    fullUrl: {
        type: String,
        required: true,
    },
    shortUrl: {
        type: String,
        required: true,
        unique: true,
        default: () => (0, nanoid_1.nanoid)().substring(0, 10),
        index: true
    },
    clicks: {
        type: Number,
        default: 0
    },
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User"
    },
    qrCode: {
        type: String
    }
}, {
    timestamps: true
});
// shortUrlSchema.index({ fullUrl: 1, user: 1 }, { unique: true });
exports.urlModel = mongoose_1.default.model("shortUrl", shortUrlSchema);
