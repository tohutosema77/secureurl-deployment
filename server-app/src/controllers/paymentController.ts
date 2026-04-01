import { Request, Response } from "express";
import razorpay from "../utils/razorpay";
import crypto from "crypto";
import userModel from "../model/userModel";
export const createOrder = async (req: Request, res: Response)=>{
    
    try{
        const options ={
            amount: 500, // 5 in paise
            currency: "INR",
            receipt: `receipt_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);
        // res.status(200).json(order);
        res.status(200).json({
            order,
            key: process.env.RAZORPAY_KEY_ID //Send this to frontend
        });
    } catch(error){
        console.error(error);
        res.status(500).json({ message: "Error creating order"});
    }
};

export const verifyPayment= async (req: Request, res: Response)=>{
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        }= req.body;

        const body = razorpay_order_id + "|"+ razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
            .update(body.toString())
            .digest("hex");

        if (expectedSignature === razorpay_signature) {
            // Payment verified =>upgarde user
            //Todo: Update user.ispremium =true
            const userId = (req as any).user._id;

            // 🔥 NEW: Check if already premium
            const user = await userModel.findById(userId);

            if (user?.isPremium) {
                return res.json({
                    success: true,
                    message: "Already premium"
                });
            }

            //Upgrage user
            await userModel.findByIdAndUpdate(userId, {
                isPremium: true
            });
            res.json({ 
                success: true,
                message:"Payment verified. User upgraded to premium."
            });
        }else{
            res.status(400).json({ success: false});
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Verification failed"});
    }
};