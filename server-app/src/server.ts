import express from "express";
import dotenv from "dotenv";
import path from "path";
dotenv.config();

import cors from "cors";
import connectDb from "./config/dbConfig";

import shortUrl from "./routes/shortUrl";
import authRoutes from "./routes/authRoutes";
import { redirectShortUrl } from "./controllers/shortUrl";
import analyticsRoutes from "./routes/analyticsRoutes";
// import paymentRoutes from "./routes/paymentRoutes";
// import useragent from "express-useragent";

connectDb();
import paymentRoutes from "./routes/paymentRoutes";

const port = process.env.PORT || 5001;

const app= express();

app.use(
    cors({
        // origin: "http://localhost:3000",
        origin: "http://localhost:3000",
        credentials: true,
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true })); //this is inbuilt

const useragent = require("express-useragent"); // use require
app.use(useragent.express());
// debug middleware
app.use((req, res, next) => {
    console.log("Incoming request:", req.method, req.url);
    next();
});

// ------------------ Routes ------------------
app.use("/api/auth", authRoutes);
app.use("/api/short", shortUrl);
app.use("/api/analytics", analyticsRoutes);

app.use("/api/payment", paymentRoutes);//Razorpay
// redirect route should be last
app.get("/:shortUrl", redirectShortUrl);

// // Add this part for render deployment
const __dirname1 = path.resolve();

app.use(express.static(path.join(__dirname1, "../client-app/url-shortner-app/dist")));

// app.get("*", (req, res)=>{
//     res.sendFile(path.resolve(__dirname1,"../client-app/url-shortner-app/dist","index.html" ));
// });
app.get("/*", (req, res)=>{
    res.sendFile(path.resolve(__dirname1,"../client-app/url-shortner-app/dist","index.html" ));
});

// ------------------ Server ------------------
app.listen(port, () =>{
    console.log(`Server started successfully on port : ${port}`);
});