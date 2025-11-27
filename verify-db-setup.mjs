import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from current directory
dotenv.config({ path: path.resolve(__dirname, '.env') });

async function verifySetup() {
    console.log('🔍 Verifying Setup...');

    // 1. Check Environment Variables
    const uri = process.env.MONGODB_URI;
    const secret = process.env.AUTH_SECRET;

    if (!uri) {
        console.error('❌ MONGODB_URI is missing in .env');
        process.exit(1);
    } else {
        console.log('✅ MONGODB_URI is present');
    }

    if (!secret) {
        console.warn('⚠️ AUTH_SECRET is missing in .env');
    } else {
        console.log('✅ AUTH_SECRET is present');
    }

    // 2. Test Database Connection
    console.log('⏳ Testing MongoDB Connection...');
    try {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 }); // 5s timeout
        console.log('✅ MongoDB Connected Successfully!');
        await mongoose.disconnect();
        console.log('✅ Disconnected.');
        process.exit(0);
    } catch (error) {
        console.error('❌ MongoDB Connection Failed:', error.message);
        process.exit(1);
    }
}

verifySetup();
