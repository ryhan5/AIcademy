/**
 * Environment Variables Checker
 * Run with: node scripts/check-env.js
 */

const dotenv = require('dotenv');
dotenv.config();

// Check critical environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_DATABASE_CONNECTION_STRING',
  'NEXT_PUBLIC_GEMINI_API_KEY'
];

console.log('Environment Variables Check:\n');

let hasErrors = false;
requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    console.error(`❌ ${varName} is missing`);
    hasErrors = true;
  } else {
    // Show masked values for security
    const value = process.env[varName];
    const maskedValue = value.length > 8 
      ? `${value.substring(0, 4)}...${value.substring(value.length - 4)}`
      : '********';
    console.log(`✅ ${varName} is set (${maskedValue})`);
  }
});

if (hasErrors) {
  console.log('\n⚠️ Some required environment variables are missing. Please check your .env file.');
} else {
  console.log('\n✅ All required environment variables are set.');
}

// Attempt database connection test if environment is set correctly
if (process.env.NEXT_PUBLIC_DATABASE_CONNECTION_STRING) {
  console.log('\nAttempting database connection test...');
  
  const { neon } = require('@neondatabase/serverless');
  const { drizzle } = require('drizzle-orm/neon-http');
  
  try {
    const sql = neon(process.env.NEXT_PUBLIC_DATABASE_CONNECTION_STRING);
    const db = drizzle(sql);
    
    console.log('✅ Database client initialized successfully');
    console.log('  Attempting a basic query...');
    
    // Try a simple query to verify connection
    async function testConnection() {
      try {
        // Just run a simple query to test connection
        await sql`SELECT 1 as test`;
        console.log('✅ Database connection successful!');
      } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        if (error.message.includes('authentication')) {
          console.log('  This appears to be an authentication issue. Check your connection string credentials.');
        } else if (error.message.includes('connect')) {
          console.log('  This appears to be a connection issue. Check your network or database host.');
        }
      }
    }
    
    testConnection();
  } catch (error) {
    console.error('❌ Error initializing database client:', error.message);
  }
}

// Test Google AI API if key is available
if (process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
  console.log('\nAttempting to initialize Google Generative AI...');
  
  const { GoogleGenerativeAI } = require('@google/generative-ai');
  
  try {
    const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    console.log('✅ Google Generative AI client initialized successfully');
    console.log('  Attempting a simple request...');
    
    async function testAiRequest() {
      try {
        // Simple request to test API key
        const result = await model.generateContent('Say "Connection successful"');
        const text = result.response.text();
        console.log(`✅ AI API connection successful! Response: "${text.substring(0, 30)}..."`);
      } catch (error) {
        console.error('❌ AI API request failed:', error.message);
        if (error.message.includes('API key')) {
          console.log('  This appears to be an API key issue. Check if your key is valid.');
        }
      }
    }
    
    testAiRequest();
  } catch (error) {
    console.error('❌ Error initializing Google Generative AI client:', error.message);
  }
} 