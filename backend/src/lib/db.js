import mongoose from 'mongoose';
import { log } from './logger.js';

export const connectDB = async () => {
    try {
        const conn= await mongoose.connect(process.env.MONGO_URI);
        log.info(`MongoDB connected: ${conn.connection.host}`);
    }catch(error){
        log.info("Error in connecting to MongoDB", error);
        process.exit(1);
    }
}