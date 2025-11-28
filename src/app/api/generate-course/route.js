import Groq from "groq-sdk";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Course from "@/models/Course";
import User from "@/models/User";
import { searchYouTubeVideos } from "@/lib/youtubeService";

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

VIDEO SEARCH QUERIES:
- For each chapter, provide 2-3 YouTube SEARCH QUERIES (NOT video IDs)
- These will be used to find REAL videos via YouTube API
- Make queries specific and targeted (e.g., "React Hooks complete tutorial", "JavaScript async await explained")
- Include popular channel names in queries when relevant (freeCodeCamp, Traversy Media, etc.)

FLASHCARDS (IMPORTANT):
- Instead of external links, generate 3-5 FLASHCARDS for each chapter.
- These should test key concepts from the chapter.
- Format: { "front": "Concept/Question", "back": "Definition/Answer" }

QUIZ REQUIREMENTS:
- Each chapter must have 3-5 quiz questions SPECIFICALLY about the chapter topic
- Questions should test actual knowledge about ${topic}
- Provide clear explanations for correct answers

IMPORTANT: Return PURE VALID JSON. 
- Do NOT use string concatenation or comments
- Use double quotes for all JSON keys/values
- Ensure arrays are actual JSON arrays

Return ONLY this JSON structure:
{
  "title": "Complete ${topic} Course",
  "description": "Master ${topic} from fundamentals to advanced concepts",
  "chapters": [
    {
      "id": 1,
      "title": "Chapter title about specific ${topic} concept",
      "description": "What students will learn",
      "videoSearchQueries": [
        "Specific search query for ${topic} tutorial",
        "Another search query for ${topic}"
      ],
      "flashcards": [
        {
          "front": "Key Concept",
          "back": "Clear, concise definition or explanation of the concept."
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

    // Fetch real YouTube videos for each chapter
    console.log('========================================');
    console.log('FETCHING REAL YOUTUBE VIDEOS...');
    console.log('========================================');

    for (let i = 0; i < courseData.chapters.length; i++) {
      const chapter = courseData.chapters[i];
      console.log(`\nChapter ${i + 1}: ${chapter.title}`);
      console.log('videoSearchQueries:', chapter.videoSearchQueries);

      const videos = [];

      if (chapter.videoSearchQueries && Array.isArray(chapter.videoSearchQueries)) {
        console.log(`Found ${chapter.videoSearchQueries.length} search queries`);

        // Fetch videos for each search query
        for (const query of chapter.videoSearchQueries) {
          console.log(`  Searching YouTube for: "${query}"`);
          try {
            const youtubeResults = await searchYouTubeVideos(query, 1);
            console.log(`  Results found: ${youtubeResults?.length || 0}`);

            if (youtubeResults && youtubeResults.length > 0) {
              console.log(`  ✅ Added video: ${youtubeResults[0].title} (ID: ${youtubeResults[0].videoId})`);
              videos.push(youtubeResults[0]);
            } else {
              console.log(`  ❌ No videos found for query`);
            }
          } catch (error) {
            console.error(`  ❌ Error fetching videos for query "${query}":`, error.message);
          }
        }
      } else {
        console.log('⚠️  NO videoSearchQueries found in chapter! AI did not generate search queries.');
      }

      console.log(`Final videos count for chapter: ${videos.length}`);

      // Replace videoSearchQueries with actual videos array
      delete chapter.videoSearchQueries;
      chapter.videos = videos.length > 0 ? videos : [
        // Fallback video structure if YouTube API fails
        {
          title: `${chapter.title} - Tutorial`,
          searchQuery: `${chapter.title} ${topic} tutorial`,
          creator: 'Educational Content'
        }
      ];

      console.log(`Saved videos:`, chapter.videos.map(v => ({ title: v.title, videoId: v.videoId || 'NO ID' })));
    }

    console.log('\n========================================');
    console.log('YOUTUBE VIDEO FETCHING COMPLETE');
    console.log('========================================\n');

    // Sanitize data before saving
    // NOTE: We skip 'videos' field since we just populated it with clean YouTube API data
    courseData.chapters = courseData.chapters.map(chapter => {
      // Ensure arrays are actually arrays (but skip videos - it's already clean)
      ['flashcards', 'quiz', 'keyConcepts'].forEach(field => {
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
