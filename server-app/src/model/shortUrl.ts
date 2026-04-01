import mongoose from "mongoose";
import { nanoid } from "nanoid";

const shortUrlSchema = new mongoose.Schema({
    fullUrl: {
        type: String,
        required: true,
    },
    shortUrl: {
        type: String,
        required: true,
        unique:true,
        default: () => nanoid().substring(0, 10),
        index: true
    },
    clicks: {
        type: Number,
        default: 0
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    qrCode: {
        type: String
    }
},{
    timestamps: true
});

// shortUrlSchema.index({ fullUrl: 1, user: 1 }, { unique: true });
export const urlModel= mongoose.model("shortUrl", shortUrlSchema);