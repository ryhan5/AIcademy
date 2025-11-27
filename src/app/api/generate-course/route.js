import Groq from "groq-sdk";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Course from "@/models/Course";
import User from "@/models/User";

export async function POST(req) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { topic, duration = 'standard' } = await req.json();
    const chapterCount = duration === 'quick' ? 3 : duration === 'standard' ? 5 : 8;

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "Groq API Key not configured" },
        { status: 500 }
      );
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const prompt = `You are creating a comprehensive online course about "${topic}".

Generate a JSON course structure with EXACTLY ${chapterCount} chapters.

IMPORTANT REQUIREMENTS:
1. Each chapter must have 2-3 REAL YouTube video recommendations
   - Search for actual popular tutorials from: Traversy Media, freeCodeCamp, Fireship, Web Dev Simplified, The Net Ninja, Programming with Mosh
   - For "url", generate a YouTube Search URL: "https://www.youtube.com/results?search_query=TOPIC%20CHANNEL_NAME"
   - Example: "https://www.youtube.com/results?search_query=React%20Crash%20Course%20Traversy%20Media"
   - This ensures links never break.
   - Include video duration in title

2. Each chapter must have 3-5 quiz questions SPECIFICALLY about the chapter topic
   - Questions should test actual knowledge about ${topic}
   - Provide clear explanations for correct answers
   - Make questions practical and relevant

3. Include real documentation links (MDN, official docs, etc.)

IMPORTANT: Return PURE VALID JSON. 
- Do NOT use string concatenation (e.g. ' + ').
- Do NOT use single quotes for JSON keys/values (use double quotes).
- Do NOT use comments.
- Ensure arrays like "materials" are actual JSON arrays of objects, not strings.

Return ONLY this JSON structure:
{
  "title": "Complete ${topic} Course",
  "description": "Master ${topic} from fundamentals to advanced concepts",
  "chapters": [
    {
      "id": 1,
      "title": "Chapter title about specific ${topic} concept",
      "description": "What students will learn",
      "videos": [
        {
          "title": "Specific video title - 25min",
          "url": "https://youtube.com/watch?v=REAL_VIDEO_ID",
          "creator": "Actual YouTube Channel Name"
        }
      ],
      "materials": [
        {
          "title": "Resource name",
          "type": "Documentation",
          "url": "https://real-documentation-url.com"
        }
      ],
      "keyConcepts": ["Specific concept 1", "Specific concept 2"],
      "quiz": [
        {
          "question": "Specific question about ${topic}?",
          "options": ["Specific option A", "Specific option B", "Specific option C", "Specific option D"],
          "correctAnswer": "The correct specific option",
          "explanation": "Detailed explanation why this is correct for ${topic}"
        }
      ]
    }
  ]
}`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 10000,
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

    let courseData;
    try {
      courseData = JSON.parse(result);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError.message);
      console.error("Raw JSON:", result);
      throw new Error(`Failed to parse course data: ${parseError.message}`);
    }

    // Validate structure
    if (!courseData.title || !courseData.chapters || !Array.isArray(courseData.chapters)) {
      throw new Error('Invalid course structure');
    }

    // Save to Database
    await dbConnect();

    // Find user by email to get ID (session.user.id might be missing if using JWT strategy without callback mapping)
    // But we mapped it in auth.config.js/auth.js so session.user.id should be there.
    // To be safe let's use the email to find the user if ID is missing or just rely on session.user.id

    let userId = session.user.id;
    if (!userId) {
      const user = await User.findOne({ email: session.user.email });
      if (user) userId = user._id;
    }

    if (!userId) {
      throw new Error("User not found");
    }

    // Sanitize data before saving
    courseData.chapters = courseData.chapters.map(chapter => {
      // Ensure arrays are actually arrays
      ['videos', 'materials', 'quiz', 'keyConcepts'].forEach(field => {
        let items = chapter[field];

        // 1. Handle if the entire field is a string
        if (typeof items === 'string') {
          try {
            items = JSON.parse(items);
          } catch (e) {
            console.warn(`Failed to parse ${field} for chapter ${chapter.id}:`, items);
            items = [];
          }
        }

        // 2. Ensure it's an array
        if (!Array.isArray(items)) {
          items = [];
        }

        // 3. Process items (handle nested stringified JSON)
        const processedItems = [];

        if (field === 'keyConcepts') {
          items.forEach(item => {
            if (typeof item === 'string') {
              processedItems.push(item);
            } else if (Array.isArray(item)) {
              item.forEach(subItem => processedItems.push(String(subItem)));
            }
          });
        } else {
          items.forEach(item => {
            if (typeof item === 'string') {
              try {
                const parsed = JSON.parse(item);
                if (Array.isArray(parsed)) {
                  processedItems.push(...parsed);
                } else if (typeof parsed === 'object' && parsed !== null) {
                  processedItems.push(parsed);
                }
              } catch (e) {
                console.warn(`Failed to parse item in ${field} for chapter ${chapter.id}:`, item);
              }
            } else if (typeof item === 'object' && item !== null) {
              processedItems.push(item);
            }
          });
        }

        chapter[field] = processedItems;
      });
      return chapter;
    });

    const newCourse = await Course.create({
      userId,
      topic,
      title: courseData.title,
      description: courseData.description,
      chapters: courseData.chapters
    });

    return NextResponse.json(newCourse);
  } catch (error) {
    console.error("Course Generation Error:", error.message);
    return NextResponse.json(
      { error: `Failed to generate course: ${error.message}` },
      { status: 500 }
    );
  }
}
