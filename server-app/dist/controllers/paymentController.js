"use strict";
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
exports.verifyPayment = exports.createOrder = void 0;
const razorpay_1 = __importDefault(require("../utils/razorpay"));
const crypto_1 = __importDefault(require("crypto"));
const userModel_1 = __importDefault(require("../model/userModel"));
const createOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const options = {
            amount: 500, // 5 in paise
            currency: "INR",
            receipt: `receipt_${Date.now()}`
        };
        const order = yield razorpay_1.default.orders.create(options);
        // res.status(200).json(order);
        res.status(200).json({
            order,
            key: process.env.RAZORPAY_KEY_ID //Send this to frontend
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error creating order" });
    }
});
exports.createOrder = createOrder;
const verifyPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto_1.default
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");
        if (expectedSignature === razorpay_signature) {
            // Payment verified =>upgarde user
            //Todo: Update user.ispremium =true
            const userId = req.user._id;
            // 🔥 NEW: Check if already premium
            const user = yield userModel_1.default.findById(userId);
            if (user === null || user === void 0 ? void 0 : user.isPremium) {
                return res.json({
                    success: true,
                    message: "Already premium"
                });
            }
            //Upgrage user
            yield userModel_1.default.findByIdAndUpdate(userId, {
                isPremium: true
            });
            res.json({
                success: true,
                message: "Payment verified. User upgraded to premium."
            });
        }
        else {
            res.status(400).json({ success: false });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Verification failed" });
    }
});
exports.verifyPayment = verifyPayment;
