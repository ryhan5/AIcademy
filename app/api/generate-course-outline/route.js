import { courseOutlineAiModel } from "@/configs/AiModel";
import { db, testConnection } from "@/configs/db";
import { STUDY_MATERIAL_TABLE } from "@/configs/schema";
import { inngest } from "@/inngest/client";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        // Get the data from the request
        const body = await req.json().catch(error => {
            console.error("Error parsing request body:", error);
            return NextResponse.json({ error: "Invalid request body", details: error.message }, { status: 400 });
        });

        console.log("Request data received:", body);
        const { courseId, topic, courseType, difficultyLevel, createdBy } = body;

        // Validate required fields
        if (!courseId || !topic || !courseType || !difficultyLevel || !createdBy) {
            console.error("Missing required fields:", { courseId, topic, courseType, difficultyLevel, createdBy });
            return NextResponse.json({ 
                error: "Missing required fields",
                missingFields: !courseId ? "courseId" : !topic ? "topic" : !courseType ? "courseType" : 
                               !difficultyLevel ? "difficultyLevel" : "createdBy" 
            }, { status: 400 });
        }

        // Check if AI model is properly initialized
        if (!courseOutlineAiModel) {
            console.error("AI model not initialized - check your NEXT_PUBLIC_GEMINI_API_KEY");
            return NextResponse.json({ error: "AI model not available", hint: "Check NEXT_PUBLIC_GEMINI_API_KEY" }, { status: 500 });
        }

        const PROMPT = `Generate a study material outline for "${topic}" for ${courseType} students with ${difficultyLevel} difficulty level. The response must follow this exact JSON structure:
{
  "courseTitle": string,
  "courseSummary": string,
  "chapters": [
    {
      "chapterTitle": string,
      "chapterSummary": string,
      "topics": [string]
    }
  ]
}

Include at least 5 chapters, each with 5-8 topics. Each chapter should have a clear title, a detailed summary, and a list of specific topics to cover.`;

        console.log("Sending prompt to AI model:", PROMPT);
        
        // Call AI model with proper error handling
        let aiResp;
        try {
            aiResp = await courseOutlineAiModel.sendMessage(PROMPT);
            console.log("Received AI response");
        } catch (error) {
            console.error("Error calling AI model:", error);
            return NextResponse.json({ 
                error: "Failed to generate content with AI model", 
                details: error.message,
                hint: "Check your NEXT_PUBLIC_GEMINI_API_KEY" 
            }, { status: 500 });
        }

        let aiResponseText = aiResp.response.text();
        console.log("AI Response Text:", aiResponseText.substring(0, 200) + "..."); // Log beginning of response
        
        // Clean up JSON if it contains markdown code blocks
        if (aiResponseText.includes("```json")) {
            aiResponseText = aiResponseText.replace(/```json\n|\n```/g, "");
        } else if (aiResponseText.includes("```")) {
            // Handle case where code block doesn't specify json but contains json
            aiResponseText = aiResponseText.replace(/```\n|\n```/g, "");
        }
        
        // Try to extract a JSON object if text has extra content
        const jsonMatch = aiResponseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            console.log("Found JSON object in response, extracting it");
            aiResponseText = jsonMatch[0];
        }
        
        let aiResult;
        try {
            aiResult = JSON.parse(aiResponseText);
            
            // Validate expected structure
            if (!aiResult.courseTitle) {
                console.warn("Generated JSON missing courseTitle");
                aiResult.courseTitle = topic;
            }
            
            if (!aiResult.courseSummary) {
                console.warn("Generated JSON missing courseSummary");
                aiResult.courseSummary = `A course about ${topic} for ${courseType} with ${difficultyLevel} difficulty.`;
            }
            
            if (!aiResult.chapters || !Array.isArray(aiResult.chapters) || aiResult.chapters.length === 0) {
                console.error("Generated JSON has invalid or empty chapters array");
                return NextResponse.json({ 
                    error: "Invalid AI response: missing chapters", 
                    responsePreview: aiResponseText.substring(0, 500)
                }, { status: 500 });
            }
            
            // Ensure each chapter has required fields
            aiResult.chapters = aiResult.chapters.map((chapter, index) => {
                return {
                    chapterTitle: chapter.chapterTitle || `Chapter ${index + 1}`,
                    chapterSummary: chapter.chapterSummary || `Content for chapter ${index + 1}`,
                    topics: Array.isArray(chapter.topics) ? chapter.topics : ["Topic 1", "Topic 2"]
                };
            });
            
        } catch (error) {
            console.error("Error parsing AI response:", error);
            console.error("AI response raw text:", aiResponseText);
            return NextResponse.json({ 
                error: "Invalid AI response format", 
                details: error.message,
                responsePreview: aiResponseText.substring(0, 500) // First 500 chars to help debug
            }, { status: 500 });
        }

        console.log("Successfully parsed AI response to JSON");

        // Check database connection before attempting insert
        try {
            // Test database connection
            if (typeof testConnection === 'function') {
                const connected = await testConnection();
                if (!connected) {
                    return NextResponse.json({ 
                        error: "Database connection failed", 
                        hint: "Check NEXT_PUBLIC_DATABASE_CONNECTION_STRING" 
                    }, { status: 500 });
                }
            }
        } catch (dbConnError) {
            console.error("Database connection test failed:", dbConnError);
            return NextResponse.json({ 
                error: "Database connection error", 
                details: dbConnError.message,
                hint: "Check NEXT_PUBLIC_DATABASE_CONNECTION_STRING and database configuration" 
            }, { status: 500 });
        }

        //save the result along with user input
        let dbResult;
        try {
            dbResult = await db.insert(STUDY_MATERIAL_TABLE).values({
                courseId: courseId,
                courseType: courseType,
                createdBy: createdBy,
                topic: topic,
                difficultyLevel: difficultyLevel,
                courseLayout: aiResult,
                status: 'Generating' // Add status field
            }).returning();
            
            console.log("Successfully inserted course data into database");
        } catch (dbError) {
            console.error("Database insertion error:", dbError);
            return NextResponse.json({ 
                error: "Failed to save course to database", 
                details: dbError.message,
                sqlState: dbError.sqlState || 'unknown',
                hint: "Check database connection and schema" 
            }, { status: 500 });
        }

        try {
            await inngest.send({
                name: 'notes.generate',
                data: {
                    course: {
                        courseId: courseId,
                        courseType: courseType,
                        topic: topic,
                        difficultyLevel: difficultyLevel,
                        courseLayout: aiResult
                    }
                }
            });
            console.log("Successfully sent event to Inngest");
        } catch (inngestError) {
            console.error("Error sending event to Inngest:", inngestError);
            // Continue even if Inngest fails - the data is already saved
            // But log the error for debugging
        }

        return NextResponse.json({ 
            success: true, 
            result: {
                courseId: courseId,
                topic: topic,
                courseType: courseType,
                difficultyLevel: difficultyLevel,
                status: 'Generating',
                courseLayout: aiResult
            }
        });
    } catch (error) {
        console.error("Uncaught error in generate-course-outline:", error);
        return NextResponse.json({ 
            error: "Internal Server Error", 
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}

// export async function POST(req) {
//     try {
//         const { courseId, topic, courseType, difficultyLevel, createdBy } = await req.json();

//         if (!courseId || !topic || !courseType || !difficultyLevel || !createdBy) {
//             console.error("Validation Error: Missing required fields");
//             return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
//         }

//         const PROMPT = `Generate a study material for ${topic} for ${courseType} and level of difficulty will be ${difficultyLevel} with summary of course, list of chapters along with summary for each chapter, topic list in each chapter. All result in JSON format`;

//         console.log("Generated Prompt:", PROMPT);

//         const aiResp = await courseOutlineAiModel.sendMessage(PROMPT);
//         console.log("AI Response:", aiResp);

//         let aiResult;
//         try {
//             aiResult = JSON.parse(aiResp.response.text());
//         } catch (error) {
//             console.error("Error parsing AI response:", error);
//             return NextResponse.json({ error: "Invalid AI response format" }, { status: 500 });
//         }

//         console.log("AI Result:", aiResult);

//         const dbResult = await db.insert(STUDY_MATERIAL_TABLE).values({
//             courseId,
//             courseType,
//             createdBy,
//             topic,
//             courseLayout: aiResult,
//         }).returning("*");

//         console.log("Database Result:", dbResult);

//         return NextResponse.json({ result: dbResult[0] });
//     } catch (error) {
//         console.error("Server Error:", error);
//         return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//     }
// }
