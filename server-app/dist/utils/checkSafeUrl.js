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
exports.isUrlSafe = void 0;
const axios_1 = __importDefault(require("axios"));
const isUrlSafe = (url) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Manual blaock 
        const blockPatterns = ["malware", "phising", "hack", "attack"];
        for (let pattern of blockPatterns) {
            if (url.toLowerCase().includes(pattern)) {
                return false;
            }
        }
        const apiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY;
        const response = yield axios_1.default.post(`https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`, {
            client: {
                clientId: "your-app",
                clientVersion: "1.0"
            },
            threatInfo: {
                threatTypes: ["MALWARE", "SOCIAL_ENGINEERING"],
                platformTypes: ["ANY_PLATFORM"],
                threatEntryTypes: ["URL"],
                threatEntries: [{ url }]
            }
        });
        console.log("Safe Browsing Response:", response.data);
        //If matches exist -> unsafe
        if (response.data && response.data.matches && response.data.matches.length > 0) {
            return false;
        }
        return true;
    }
    catch (error) {
        console.error("Safe Browsing Error:", error);
        return false; //safer to block if error
    }
});
exports.isUrlSafe = isUrlSafe;
