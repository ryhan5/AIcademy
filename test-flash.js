const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env' });

async function testFlash() {
    console.log("Testing Gemini 1.5 Flash Latest...\n");

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

        const result = await model.generateContent("Say hello in one word");
        const response = await result.response;
        const text = response.text();

        console.log("✅ SUCCESS with gemini-1.5-flash-latest!");
        console.log("Response:", text);
        process.exit(0);
    } catch (error) {
        console.log("❌ FAILED with gemini-1.5-flash-latest");
        console.log("Error:", error.message);
        process.exit(1);
    }
}

testFlash();
