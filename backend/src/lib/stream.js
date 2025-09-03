import {StreamChat} from "stream-chat";
import "dotenv/config";

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

if(!apiKey || !apiSecret){
    console.error("Stream Api key or secret is missing");
    throw new Error("Stream configuration is incomplete");
}

let streamClient;
try {
    streamClient = StreamChat.getInstance(apiKey, apiSecret);
    // Configure timeout for HTTP requests
    streamClient.axiosInstance.defaults.timeout = 10000; // 10 seconds
} catch (error) {
    console.error("Failed to initialize Stream client:", error);
    throw error;
}

export const upsertStreamUser = async (userData) => {
    try{
        const result = await streamClient.upsertUsers([userData]);
        return result;
    }catch(error){
        console.error("Error upserting Stream user:", error.message || error);
        throw error; // Re-throw to handle in calling function
    }
}
export const generateStreamToken = (userId) => {
    try{
        const userIdStr = userId.toString();
        return streamClient.createToken(userIdStr);
    }catch(error){
        console.error("Error generating Stream token", error);
    }
}