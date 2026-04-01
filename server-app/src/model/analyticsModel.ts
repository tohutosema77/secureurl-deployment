import mongoose from "mongoose";

export interface IAnalytics extends Document {
  shortUrl: string;
  ipAddress: string;
  userAgent?: string;
  country?: string;
  city?: string;
  deviceType?: string;
  browser?: string;
  os?: string;
  createdAt: Date;
  updatedAt: Date;
}

const analyticsSchema = new mongoose.Schema(
  {
    shortUrl: { type: String, required: true },
    ipAddress: { type: String, required: true },
    userAgent: { type: String },
    country: { type: String, default: "Unknown" },
    city: { type: String, default: "Unknown" },
    deviceType: { type: String, default: "Unknown" },
    browser: { type: String, default: "Unknown" },
    os: { type: String, default: "Unknown" },
  },
  { timestamps: true }
);

const Analytics = mongoose.model("Analytics", analyticsSchema);
export default Analytics;