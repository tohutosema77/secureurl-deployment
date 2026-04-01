import axios  from "axios";

export const isUrlSafe = async (url: string)=> {
    try {
    
        // Manual blaock 
        const blockPatterns =["malware", "phising","hack","attack"];

        for (let pattern of blockPatterns) {
            if (url.toLowerCase().includes(pattern)) {
                return false;
            }
            
        }
        const apiKey= process.env.GOOGLE_SAFE_BROWSING_API_KEY;

        const response = await axios.post(
            `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`,
            {
                client: {
                    clientId: "your-app",
                    clientVersion:"1.0"
                },
                threatInfo: {
                    threatTypes: ["MALWARE", "SOCIAL_ENGINEERING"],
                    platformTypes: ["ANY_PLATFORM"],
                    threatEntryTypes: ["URL"],
                    threatEntries: [{ url }]
                }
            }
        );

        console.log("Safe Browsing Response:", response.data);
        //If matches exist -> unsafe
        if (response.data && response.data.matches && response.data.matches.length > 0) {
            return false;
        }
        return true;

    } catch (error) {
        console.error("Safe Browsing Error:", error);
        return false; //safer to block if error
    }
};