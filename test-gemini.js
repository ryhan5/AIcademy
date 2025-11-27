const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env' });

async function testGemini() {
    console.log("Testing Gemini API...");

    if (!process.env.GEMINI_API_KEY) {
        console.error("Error: GEMINI_API_KEY not found in environment variables.");
        return;
    }

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Try the requested model
        const modelName = "gemini-pro";
        console.log(`Using model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });

        const prompt = "Hello, are you working?";
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log("Success! Response:", text);
    } catch (error) {
        console.error("Gemini API Error:", error.message);
        if (error.response) {
            console.error("Error Details:", JSON.stringify(error.response, null, 2));
        }
    }
}

testGemini();
