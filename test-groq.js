const Groq = require("groq-sdk");
require('dotenv').config({ path: '.env' });

async function testGroq() {
    console.log("Testing Groq API...\n");

    if (!process.env.GROQ_API_KEY) {
        console.error("❌ GROQ_API_KEY not found in .env file");
        console.log("\nTo fix this:");
        console.log("1. Go to https://console.groq.com/keys");
        console.log("2. Create a free account (if you don't have one)");
        console.log("3. Generate an API key");
        console.log("4. Add it to your .env file as:");
        console.log("   GROQ_API_KEY=your_key_here");
        return;
    }

    console.log("✓ API Key found");
    console.log("Testing with llama-3.3-70b-versatile...\n");

    try {
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: "user", content: "Say hello in JSON format: {\"message\": \"hello\"}" }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.5,
        });

        const response = chatCompletion.choices[0]?.message?.content || "";

        console.log("✅ SUCCESS!");
        console.log("Response:", response);
        console.log("\n🎉 Groq is working! Your app is ready to use.");
    } catch (error) {
        console.error("❌ Error:", error.message);
        if (error.status === 401) {
            console.log("\nYour API key is invalid. Please:");
            console.log("1. Go to https://console.groq.com/keys");
            console.log("2. Generate a new API key");
            console.log("3. Update your .env file");
        }
    }
}

testGroq();
