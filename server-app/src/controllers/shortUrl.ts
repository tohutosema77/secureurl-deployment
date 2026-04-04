import express  from "express";
import { urlModel } from "../model/shortUrl";
import { nanoid } from "nanoid";
import * as validator from "validator";
import QRCode from "qrcode";
import Analytics from "../model/analyticsModel";
import useragent from "express-useragent";
import geoip from "geoip-lite";
import { format } from "node:path";
import { isUrlSafe } from "../utils/checkSafeUrl";
import { uploadToS3 } from "../utils/uploadToS3";
export const createUrl = async (req: express.Request,res: express.Response)=>{
    try {
        //attaching a logged-in user

        // console.log("The fullurl is:", req.body.fullUrl); //->just skip for now.
        const { fullUrl, customUrl} =req.body;
        // URL validation
        if(!validator.isURL(fullUrl, { require_protocol: true })){
            return res.status(400).json({ message: "Invalid URL format"});
        }
        // 🔐 STEP: Check if URL is safe
        const safe = await isUrlSafe(fullUrl);
        console.log("Checking URL safety...",safe);
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
        const userId= (req as any).user._id;

        const user = (req as any).user;
        //check if this user already created this url
        const urlFound= await urlModel.findOne({fullUrl, user: userId});
        // if (urlFound.length > 0)

        // if(urlFound){
        //     // res.status(409);
        //     // res.send(urlFound);
        //     return res.status(409).json({
        //         message: "URL already exists for this user",
        //         url: urlFound
        //     });
        // }
        if(urlFound && !user.isPremium){
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
            const existingCustom = await urlModel.findOne({ shortUrl: customUrl});

            if (existingCustom) {
                return res.status(409).json({
                    message: "Custom URL already taken"
                });
            }

            shortUrlValue = customUrl;
        } else{
                //Generate automatically
                shortUrlValue=nanoid(10);
        }
        // const shortUrl = nanoid(10);

        // create the short link
        // const shortLink= 'http://localhost:5001/${shortUrlValue}';
        const shortLink = `${process.env.BASE_URL}/${shortUrlValue}`;

        //Buffer controls to generate QR Code
        const qrBuffer = await QRCode.toBuffer(shortLink);
        ///generate QR Code
        // const qrCode= await QRCode.toDataURL(shortLink);
        const fileName = `qr-${Date.now()}.png`;

        // const qrCodeUrl = await uploadToS3(
        //     qrBuffer, 
        //     `${shortUrlValue}.png`
        // );
        
        const qrCodeUrl = await uploadToS3(qrBuffer,fileName );

        // save URL with QR
        const url= await urlModel.create({
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

    } catch (error){
        console.error("Error creating short URL:", error);
        res.status(500).send({"message": "Something went wrong"});
    }
};
export const getAllUrl = async (req: express.Request,res: express.Response)=>{
    try {
        const shortUrls = await urlModel.find().sort({ createdAt: -1});
        if (shortUrls.length == 0) {
            res.status(404).send({ message: "Short Urls not found!"});
        } else{
            res.status(200).send(shortUrls);
        }
    } catch (error) {
        res.status(500).send({"message": "Something went wrong"});
    }
};
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
export const getUrl = async (req: express.Request, res: express.Response) => {
    try {
        const url = await urlModel.findById(req.params.id);
        if (!url) return res.status(404).json({ message: "URL not found" });

        // Only owner can view this detail (optional)
        const userId = (req as any).user._id;
        if (!url.user) {
            return res.status(403).json({ message: "No owner assigned, cannot access" });
        }
        if (url.user.toString() !== userId.toString())
            return res.status(403).json({ message: "Not authorized" });

        res.status(200).json(url);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong" });
    }
};


// export const deleteUrl = async (req: express.Request,res: express.Response)=>{ 
//     try { 
//         const shortUrl = await urlModel.findByIdAndDelete({_id: req.params.id}); 
//         if (shortUrl) { res.status(200).send({ message: "Requested Url Deleted!"}); } 
//     } catch (error) {
//          res.status(500).send({"message": "Something went wrong"}); 
//     } 
// };

// ------------------- Delete a URL -------------------
export const deleteUrl = async (req: express.Request, res: express.Response) => {
    try {
        const url = await urlModel.findById(req.params.id);
        if (!url) return res.status(404).json({ message: "URL not found" });

        const userId = (req as any).user._id;
        if (!url.user || url.user.toString() !== userId.toString()) {
            return res.status(403).json({ message:  "Not authorized" });
        }
        
        // if (url.user.toString() !== userId.toString())
        //     return res.status(403).json({ message: "Not authorized" });

        await url.deleteOne();
        res.status(200).json({ message: "URL deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

// Get all URLs for the logged-in user
export const getUserUrls = async (req: express.Request,res: express.Response)=>{
    try {
        //req.user is set by the protect middleware
        const userId = (req as any).user._id;

        //Find URLs created by this user
        const urls= await urlModel.find({ user: userId }).sort({ createdAt: -1});

        res.status(200).json(urls);
    } catch (error) {
        console.error("Error fetching user URLs:", error);
        res.status(500).send({"message": "Server error"});
    }
};

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
export const redirectShortUrl = async (req: express.Request, res: express.Response) => {
    try {
        const url = await urlModel.findOne({ shortUrl: req.params.shortUrl });
        if (!url) return res.status(404).json({ message: "Short URL not found" });

        url.clicks += 1;
        await url.save();

        // ------------analytics Logging----------

        const ip=(req.headers['x-forwarded-for'] as string) || req.ip || req.socket.remoteAddress || "unknown";
        const geo=geoip.lookup(ip); // returns { country: 'IN', city: 'Kolkata' } etc.

        await Analytics.create({
            // shortUrl: req.params.shortUrl,
            shortUrl: req.params.shortUrl as string,
            ipAddress: ip,
            country: geo?.country || "Unknown",
            city: geo?.city || "Unknown",
            deviceType: req.useragent?.isMobile
                ? "Mobile"
                : req.useragent?.isTablet
                ? "Tablet"
                : "Desktop",
            browser: req.useragent?.browser || "Unknown",
            os: req.useragent?.os || "Unknown",
        });

        // redirect user
        res.redirect(url.fullUrl);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

// ------------------- Analytics short URL  controller-------------------
export const getAnalytics = async (req: express.Request, res: express.Response) =>{

    try {
        
        const { shortUrl } = req.params;

        //total clicks
        const totalClicks = await Analytics.countDocuments({ shortUrl });

        //clicks by country
        const countryStats= await Analytics.aggregate([
            { $match: { shortUrl}},
            { $group: { _id: "$country", count: { $sum: 1}}}
        ]);

        //clicks by device
        const deviceStats= await Analytics.aggregate([
            { $match: { shortUrl}},
            { $group: { _id: "$deviceType", count: { $sum: 1}}}
        ]);

        // clicks per day
        const dailyStats= await Analytics.aggregate([
            { $match: { shortUrl }},
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt"}
                    },
                    count: { $sum: 1}
                }
            },
            { $sort: {"_id": 1}}
        ]);

        res.json({
            shortUrl,
            totalClicks,
            countryStats,
            deviceStats,
            dailyStats
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching analytics"});
    }
};
