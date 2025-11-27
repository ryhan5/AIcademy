const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
require('dotenv').config({ path: '.env' });

async function testGemini() {
    const log = [];

    log.push("Testing Gemini 1.5 Pro API...\n");

    if (!process.env.GEMINI_API_KEY) {
        log.push("ERROR: GEMINI_API_KEY not found\n");
        fs.writeFileSync('error-log.txt', log.join(''));
        console.log(log.join(''));
        return;
    }

    log.push(`API Key found: ${process.env.GEMINI_API_KEY.substring(0, 10)}...\n`);

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        // Try gemini-1.5-pro
        log.push("\nTrying gemini-1.5-pro...\n");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        const result = await model.generateContent("Say hello");
        const response = await result.response;
        const text = response.text();

        log.push(`✅ SUCCESS with gemini-1.5-pro!\n`);
        log.push(`Response: ${text}\n`);
    } catch (error) {
        log.push(`\n❌ FAILED with gemini-1.5-pro\n`);
        log.push(`Error Type: ${error.constructor.name}\n`);
        log.push(`Error Message: ${error.message}\n`);
        log.push(`Full Error: ${JSON.stringify(error, null, 2)}\n`);
        if (error.stack) {
            log.push(`Stack: ${error.stack}\n`);
        }
    }

    fs.writeFileSync('error-log.txt', log.join(''));
    console.log(log.join(''));
}

testGemini();
