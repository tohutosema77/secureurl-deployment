"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnalytics = exports.redirectShortUrl = exports.getUserUrls = exports.deleteUrl = exports.getUrl = exports.getAllUrl = exports.createUrl = void 0;
const shortUrl_1 = require("../model/shortUrl");
const nanoid_1 = require("nanoid");
const validator = __importStar(require("validator"));
const qrcode_1 = __importDefault(require("qrcode"));
const analyticsModel_1 = __importDefault(require("../model/analyticsModel"));
const geoip_lite_1 = __importDefault(require("geoip-lite"));
const checkSafeUrl_1 = require("../utils/checkSafeUrl");
const uploadToS3_1 = require("../utils/uploadToS3");
const createUrl = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //attaching a logged-in user
        // console.log("The fullurl is:", req.body.fullUrl); //->just skip for now.
        const { fullUrl, customUrl } = req.body;
        // URL validation
        if (!validator.isURL(fullUrl, { require_protocol: true })) {
            return res.status(400).json({ message: "Invalid URL format" });
        }
        // 🔐 STEP: Check if URL is safe
        const safe = yield (0, checkSafeUrl_1.isUrlSafe)(fullUrl);
        console.log("Checking URL safety...", safe);
        if (!safe) {
            console.log("BLOCKED URL 🚫");
            return res.status(400).json({
                message: "This URL is unsafe or malicious"
            });
        }
        // if (!fullUrl)
        // {
        //     return res.status(400).json({ message: "Full URL is required"});
        // }
        //req.user is set by protect middleware
        //every URL belongs to specific USER
        const userId = req.user._id;
        const user = req.user;
        //check if this user already created this url
        const urlFound = yield shortUrl_1.urlModel.findOne({ fullUrl, user: userId });
        // if (urlFound.length > 0)
        // if(urlFound){
        //     // res.status(409);
        //     // res.send(urlFound);
        //     return res.status(409).json({
        //         message: "URL already exists for this user",
        //         url: urlFound
        //     });
        // }
        if (urlFound && !user.isPremium) {
            // res.status(409);
            // res.send(urlFound);
            return res.status(403).json({
                message: "Upgrade to Premium to create duplicate short URLs",
                // url: urlFound
            });
        }
        //Create new short URL
        let shortUrlValue;
        // If user provides custom URL
        if (customUrl) {
            //check if already taken 
            const existingCustom = yield shortUrl_1.urlModel.findOne({ shortUrl: customUrl });
            if (existingCustom) {
                return res.status(409).json({
                    message: "Custom URL already taken"
                });
            }
            shortUrlValue = customUrl;
        }
        else {
            //Generate automatically
            shortUrlValue = (0, nanoid_1.nanoid)(10);
        }
        // const shortUrl = nanoid(10);
        // create the short link
        // const shortLink= 'http://localhost:5001/${shortUrlValue}';
        const shortLink = `${process.env.BASE_URL}/${shortUrlValue}`;
        //Buffer controls to generate QR Code
        const qrBuffer = yield qrcode_1.default.toBuffer(shortLink);
        ///generate QR Code
        // const qrCode= await QRCode.toDataURL(shortLink);
        const fileName = `qr-${Date.now()}.png`;
        // const qrCodeUrl = await uploadToS3(
        //     qrBuffer, 
        //     `${shortUrlValue}.png`
        // );
        const qrCodeUrl = yield (0, uploadToS3_1.uploadToS3)(qrBuffer, fileName);
        // save URL with QR
        const url = yield shortUrl_1.urlModel.create({
            fullUrl,
            shortUrl: shortUrlValue,
            user: userId,
            qrCode: qrCodeUrl
        });
        res.status(201).json(url);
        // const shortUrl= await urlModel.create({
        //     fullUrl,
        //     user: userId
        // });
        // res.status(201).json({
        //     fullUrl:shortUrl.fullUrl,
        //     shortUrl:shortUrl.shortUrl,
        //     user:shortUrl.user,
        //     clicks:shortUrl.clicks
        // });
        // } else {
        //     const shortUrl = await urlModel.create({ fullUrl });
        //     res.status(201).send(shortUrl);
        // }
    }
    catch (error) {
        console.error("Error creating short URL:", error);
        res.status(500).send({ "message": "Something went wrong" });
    }
});
exports.createUrl = createUrl;
const getAllUrl = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const shortUrls = yield shortUrl_1.urlModel.find().sort({ createdAt: -1 });
        if (shortUrls.length == 0) {
            res.status(404).send({ message: "Short Urls not found!" });
        }
        else {
            res.status(200).send(shortUrls);
        }
    }
    catch (error) {
        res.status(500).send({ "message": "Something went wrong" });
    }
});
exports.getAllUrl = getAllUrl;
// export const getUrl = async (req: express.Request,res: express.Response)=>{
//     try {
//         const shortUrl = await urlModel.findOne({shortUrl: req.params.id});
//         if (!shortUrl) {
//             res.status(404).send({ message: "Full Url not found!"});
//         } else {
//             shortUrl.clicks++;
//             await shortUrl.save();
//             res.redirect(`${shortUrl.fullUrl}`);
//         }
//     } catch (error) {
//         res.status(500).send({"message": "Something went wrong"});
//     }
// };
// ------------------- Get one URL by ID -------------------
const getUrl = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const url = yield shortUrl_1.urlModel.findById(req.params.id);
        if (!url)
            return res.status(404).json({ message: "URL not found" });
        // Only owner can view this detail (optional)
        const userId = req.user._id;
        if (!url.user) {
            return res.status(403).json({ message: "No owner assigned, cannot access" });
        }
        if (url.user.toString() !== userId.toString())
            return res.status(403).json({ message: "Not authorized" });
        res.status(200).json(url);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong" });
    }
});
exports.getUrl = getUrl;
// export const deleteUrl = async (req: express.Request,res: express.Response)=>{ 
//     try { 
//         const shortUrl = await urlModel.findByIdAndDelete({_id: req.params.id}); 
//         if (shortUrl) { res.status(200).send({ message: "Requested Url Deleted!"}); } 
//     } catch (error) {
//          res.status(500).send({"message": "Something went wrong"}); 
//     } 
// };
// ------------------- Delete a URL -------------------
const deleteUrl = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const url = yield shortUrl_1.urlModel.findById(req.params.id);
        if (!url)
            return res.status(404).json({ message: "URL not found" });
        const userId = req.user._id;
        if (!url.user || url.user.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }
        // if (url.user.toString() !== userId.toString())
        //     return res.status(403).json({ message: "Not authorized" });
        yield url.deleteOne();
        res.status(200).json({ message: "URL deleted successfully" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong" });
    }
});
exports.deleteUrl = deleteUrl;
// Get all URLs for the logged-in user
const getUserUrls = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //req.user is set by the protect middleware
        const userId = req.user._id;
        //Find URLs created by this user
        const urls = yield shortUrl_1.urlModel.find({ user: userId }).sort({ createdAt: -1 });
        res.status(200).json(urls);
    }
    catch (error) {
        console.error("Error fetching user URLs:", error);
        res.status(500).send({ "message": "Server error" });
    }
});
exports.getUserUrls = getUserUrls;
///alternative to the above link
// export const getUserUrls = async (req: express.Request, res: express.Response) => {
//     try {
//         const urls = await urlModel.find(); // temporarily get all urls
//         res.status(200).json(urls);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({
//             message: "Something went wrong"
//         });
//     }
// };
// ------------------- Redirect short URL -------------------
const redirectShortUrl = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const url = yield shortUrl_1.urlModel.findOne({ shortUrl: req.params.shortUrl });
        if (!url)
            return res.status(404).json({ message: "Short URL not found" });
        url.clicks += 1;
        yield url.save();
        // ------------analytics Logging----------
        const ip = req.headers['x-forwarded-for'] || req.ip || req.socket.remoteAddress || "unknown";
        const geo = geoip_lite_1.default.lookup(ip); // returns { country: 'IN', city: 'Kolkata' } etc.
        yield analyticsModel_1.default.create({
            shortUrl: req.params.shortUrl,
            ipAddress: ip,
            country: (geo === null || geo === void 0 ? void 0 : geo.country) || "Unknown",
            city: (geo === null || geo === void 0 ? void 0 : geo.city) || "Unknown",
            deviceType: ((_a = req.useragent) === null || _a === void 0 ? void 0 : _a.isMobile)
                ? "Mobile"
                : ((_b = req.useragent) === null || _b === void 0 ? void 0 : _b.isTablet)
                    ? "Tablet"
                    : "Desktop",
            browser: ((_c = req.useragent) === null || _c === void 0 ? void 0 : _c.browser) || "Unknown",
            os: ((_d = req.useragent) === null || _d === void 0 ? void 0 : _d.os) || "Unknown",
        });
        // redirect user
        res.redirect(url.fullUrl);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong" });
    }
});
exports.redirectShortUrl = redirectShortUrl;
// ------------------- Analytics short URL  controller-------------------
const getAnalytics = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { shortUrl } = req.params;
        //total clicks
        const totalClicks = yield analyticsModel_1.default.countDocuments({ shortUrl });
        //clicks by country
        const countryStats = yield analyticsModel_1.default.aggregate([
            { $match: { shortUrl } },
            { $group: { _id: "$country", count: { $sum: 1 } } }
        ]);
        //clicks by device
        const deviceStats = yield analyticsModel_1.default.aggregate([
            { $match: { shortUrl } },
            { $group: { _id: "$deviceType", count: { $sum: 1 } } }
        ]);
        // clicks per day
        const dailyStats = yield analyticsModel_1.default.aggregate([
            { $match: { shortUrl } },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);
        res.json({
            shortUrl,
            totalClicks,
            countryStats,
            deviceStats,
            dailyStats
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching analytics" });
    }
});
exports.getAnalytics = getAnalytics;
