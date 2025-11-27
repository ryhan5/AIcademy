const Groq = require("groq-sdk");
require('dotenv').config({ path: '.env' });

async function testCourseAPI() {
    console.log("Testing Course Generation API...\n");

    try {
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

        const prompt = `Create a simple 3-chapter course on "JavaScript Basics".

Return ONLY valid JSON:
{
  "title": "JavaScript Basics",
  "description": "Learn JavaScript fundamentals",
  "chapters": [
    {
      "id": 1,
      "title": "Variables and Data Types",
      "description": "Learn about variables",
      "videos": [
        {
          "title": "JS Variables - 10 min",
          "url": "https://youtube.com/watch?v=example",
          "creator": "freeCodeCamp"
        }
      ],
      "materials": [
        {
          "title": "MDN Variables",
          "type": "Documentation",
          "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types"
        }
      ],
      "keyConcepts": ["var", "let", "const"],
      "quiz": [
        {
          "question": "What keyword declares a constant?",
          "options": ["var", "let", "const", "function"],
          "correctAnswer": "const",
          "explanation": "const declares constants that cannot be reassigned"
        }
      ]
    }
  ]
}`;

        console.log("Sending request to Groq...");

        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "openai/gpt-oss-120b",
            temperature: 0.7,
            max_tokens: 6000,
        });

        const result = chatCompletion.choices[0]?.message?.content || "";

        console.log("\n✅ Got response!");
        console.log("Raw response length:", result.length);
        console.log("\nFirst 500 chars:", result.substring(0, 500));

        // Try parsing
        let cleanedText = result.replace(/```json/g, '').replace(/```/g, '').trim();
        const firstBrace = cleanedText.indexOf('{');
        const lastBrace = cleanedText.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
            cleanedText = cleanedText.substring(firstBrace, lastBrace + 1);
        }

        console.log("\nCleaned text length:", cleanedText.length);

        const parsed = JSON.parse(cleanedText);
        console.log("\n✅ Successfully parsed JSON!");
        console.log("Course title:", parsed.title);
        console.log("Number of chapters:", parsed.chapters?.length);

    } catch (error) {
        console.error("\n❌ Error:", error.message);
        console.error("Stack:", error.stack);
    }
}

testCourseAPI();
