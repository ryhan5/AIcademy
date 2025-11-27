const Groq = require("groq-sdk");
require('dotenv').config({ path: '.env' });

async function testModel() {
    console.log("Testing openai/gpt-oss-120b model...\n");

    if (!process.env.GROQ_API_KEY) {
        console.error("❌ GROQ_API_KEY not found in .env file");
        return;
    }

    console.log("✓ API Key found");
    console.log("Testing with openai/gpt-oss-120b...\n");

    try {
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: "user", content: "Say hello in JSON format: {\"message\": \"hello\"}" }],
            model: "openai/gpt-oss-120b",
            temperature: 0.5,
        });

        const response = chatCompletion.choices[0]?.message?.content || "";

        console.log("✅ SUCCESS!");
        console.log("Response:", response);
        console.log("\n🎉 openai/gpt-oss-120b is working!");
    } catch (error) {
        console.error("❌ Error:", error.message);
        if (error.status === 401) {
            console.log("\nYour API key is invalid.");
        } else if (error.status === 404) {
            console.log("\n⚠️  Model 'openai/gpt-oss-120b' not found on Groq.");
            console.log("Available models you can try:");
            console.log("- llama-3.3-70b-versatile");
            console.log("- llama-3.1-70b-versatile");
            console.log("- mixtral-8x7b-32768");
        }
    }
}

testModel();
