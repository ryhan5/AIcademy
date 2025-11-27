import Groq from "groq-sdk";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { goal } = await req.json();

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "Groq API Key not configured. Get one at https://console.groq.com/keys" },
        { status: 500 }
      );
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const prompt = `You are an expert technical interviewer. Create a skill assessment quiz for a user who wants to: "${goal}".

Generate 5 multiple-choice questions to evaluate their current knowledge level.
The questions should range from beginner to intermediate difficulty.

Return ONLY valid JSON in the following format (no markdown, no code blocks):
{
  "questions": [
    {
      "id": 1,
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option B"
    }
  ]
}`;

    let result;
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        const chatCompletion = await groq.chat.completions.create({
          messages: [{ role: "user", content: prompt }],
          model: "openai/gpt-oss-120b",
          temperature: 0.7,
          max_tokens: 2000,
        });

        result = chatCompletion.choices[0]?.message?.content || "";
        break;
      } catch (error) {
        if (error.status === 429 && retryCount < maxRetries - 1) {
          const delay = 1000 * (retryCount + 1);
          console.log(`Rate limit hit, retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          retryCount++;
        } else {
          throw error;
        }
      }
    }

    // Clean up markdown if present
    let cleanedText = result.replace(/```json/g, '').replace(/```/g, '').trim();
    const firstBrace = cleanedText.indexOf('{');
    const lastBrace = cleanedText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleanedText = cleanedText.substring(firstBrace, lastBrace + 1);
    }

    const assessment = JSON.parse(cleanedText);

    return NextResponse.json(assessment);
  } catch (error) {
    console.error("Assessment Generation Error:", error);
    const status = error.status === 429 ? 429 : 500;
    return NextResponse.json(
      { error: status === 429 ? "Rate limit exceeded. Please try again." : "Failed to generate assessment" },
      { status }
    );
  }
}
