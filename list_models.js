const Groq = require('groq-sdk');
require('dotenv').config({ path: '.env.local' }); // Try .env.local first
require('dotenv').config(); // Fallback to .env

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

async function listModels() {
    try {
        const models = await groq.models.list();
        console.log('Available Models:');
        models.data.forEach(model => {
            if (model.id.includes('vision')) {
                console.log(`- ${model.id} (VISION)`);
            } else {
                console.log(`- ${model.id}`);
            }
        });
    } catch (error) {
        console.error('Error listing models:', error);
    }
}

listModels();
