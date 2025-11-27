import Groq from "groq-sdk";
import { NextResponse } from "next/server";

// Fallback mock data generator
const getMockRoadmap = (goal, experience, timeline) => {
  return {
    weeks: Array.from({ length: timeline }, (_, i) => ({
      week: i + 1,
      title: `Week ${i + 1}: ${goal} Fundamentals`,
      topics: [
        `Core Concept ${i + 1}.1`,
        `Core Concept ${i + 1}.2`,
        `Practical Application`,
        `Project Work`
      ],
      resources: [
        {
          title: `${goal} Crash Course Part ${i + 1} - 20 min`,
          type: "Video",
          url: "https://youtube.com/watch?v=dQw4w9WgXcQ"
        },
        {
          title: `Official ${goal} Documentation`,
          type: "Documentation",
          url: "https://developer.mozilla.org"
        },
        {
          title: `Best Practices for Week ${i + 1}`,
          type: "Article",
          url: "https://dev.to"
        }
      ]
    }))
  };
};

export async function POST(req) {
  try {
    const { goal, experience = 'beginner', timeline = 4 } = await req.json();

    if (!process.env.GROQ_API_KEY) {
      console.log("No Groq API key, using mock data");
      return NextResponse.json(getMockRoadmap(goal, experience, timeline));
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const experienceMap = {
      'beginner': 'Beginner - No prior experience',
      'intermediate': 'Intermediate - Knows basics',
      'advanced': 'Advanced - Experienced developer'
    };

    const prompt = `Create a ${timeline}-week learning roadmap for "${goal}" (${experienceMap[experience]}).

Return ONLY valid JSON with this structure:
{
  "weeks": [
    {
      "week": 1,
      "title": "Week Title",
      "topics": ["Topic 1", "Topic 2"],
      "resources": [
        {
          "title": "Resource Title (Duration)", 
          "type": "Video|Article|Documentation",
          "url": "https://real-url.com"
        }
      ]
    }
  ]
}

REQUIREMENTS:
1. Generate EXACTLY ${timeline} weeks.
2. For "url" in resources, generate a YouTube Search URL: "https://www.youtube.com/results?search_query=TOPIC+CHANNEL_NAME".
   - Example: "https://www.youtube.com/results?search_query=React+Crash+Course+Traversy+Media"
   - This ensures links never break.
3. Use REAL Documentation links.
4. Keep it practical and structured.`;

    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.3-70b-versatile",
        temperature: 0.5,
        max_tokens: 8000,
      });

      let result = chatCompletion.choices[0]?.message?.content || "";

      // Clean JSON
      result = result.trim();
      result = result.replace(/```json\s*/gi, '').replace(/```\s*/g, '');

      const firstBrace = result.indexOf('{');
      const lastBrace = result.lastIndexOf('}');

      if (firstBrace !== -1 && lastBrace !== -1) {
        result = result.substring(firstBrace, lastBrace + 1);
      }

      // Fix common JSON issues
      result = result.replace(/,(\s*[}\]])/g, '$1');

      const roadmap = JSON.parse(result);

      // Validate structure
      if (!roadmap.weeks || !Array.isArray(roadmap.weeks) || roadmap.weeks.length === 0) {
        throw new Error('Invalid roadmap structure');
      }

      return NextResponse.json(roadmap);

    } catch (aiError) {
      console.error("AI Generation Error:", aiError.message);
      console.log("Falling back to mock data");
      return NextResponse.json(getMockRoadmap(goal, experience, timeline));
    }

  } catch (error) {
    console.error("Roadmap API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate roadmap" },
      { status: 500 }
    );
  }
}
