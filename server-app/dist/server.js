"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const cors_1 = __importDefault(require("cors"));
const dbConfig_1 = __importDefault(require("./config/dbConfig"));
const shortUrl_1 = __importDefault(require("./routes/shortUrl"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const shortUrl_2 = require("./controllers/shortUrl");
const analyticsRoutes_1 = __importDefault(require("./routes/analyticsRoutes"));
// import paymentRoutes from "./routes/paymentRoutes";
// import useragent from "express-useragent";
(0, dbConfig_1.default)();
const paymentRoutes_1 = __importDefault(require("./routes/paymentRoutes"));
const port = process.env.PORT || 5001;
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    // origin: "http://localhost:3000",
    origin: "http://localhost:3000",
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true })); //this is inbuilt
const useragent = require("express-useragent"); // use require
app.use(useragent.express());
// debug middleware
app.use((req, res, next) => {
    console.log("Incoming request:", req.method, req.url);
    next();
});
// ------------------ Routes ------------------
app.use("/api/auth", authRoutes_1.default);
app.use("/api/short", shortUrl_1.default);
app.use("/api/analytics", analyticsRoutes_1.default);
app.use("/api/payment", paymentRoutes_1.default); //Razorpay
// redirect route should be last
app.get("/:shortUrl", shortUrl_2.redirectShortUrl);
// // Add this part for render deployment
const __dirname1 = path_1.default.resolve();
app.use(express_1.default.static(path_1.default.join(__dirname1, "../client-app/url-shortner-app/dist")));
app.get("*", (req, res) => {
    res.sendFile(path_1.default.resolve(__dirname1, "../client-app/url-shortner-app/dist", "index.html"));
});
// app.get("/*", (req, res)=>{
//     res.sendFile(path.resolve(__dirname1,"../client-app/url-shortner-app/dist","index.html" ));
// });
// ------------------ Server ------------------
app.listen(port, () => {
    console.log(`Server started successfully on port : ${port}`);
});
