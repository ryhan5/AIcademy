import { db } from "@/configs/db";
import { CHAPTER_NOTES_TABLE, STUDY_TYPE_CONTENT_TABLE } from "@/configs/schema";
import { inngest } from "@/inngest/client";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { generateNotesAiModel } from "@/configs/AiModel";

export async function POST(req) {
    try {
        const { chapters, courseId, type } = await req.json();
        
        // Validate required fields
        if (!chapters || !courseId || !type) {
            return NextResponse.json({
                error: "Missing required fields",
                message: "chapters, courseId, and type are required"
            }, { status: 400 });
        }
        
        console.log(`Generating content for type: ${type}, courseId: ${courseId}`);
        
        // Special handling for testing - if chapters contains "TEST_DATA", use test data
        if (chapters.includes("TEST_DATA") && type !== 'FlashCard') {
            if (type === 'FlashCard') {
                // We're no longer using test data for flashcards - always use Gemini
                console.log("Flashcards will use Gemini generation instead of test data");
            } else {
                const testFlashcards = [
                    {
                        front: "What is React?",
                        back: "A JavaScript library for building user interfaces"
                    },
                    {
                        front: "What is JSX?",
                        back: "JavaScript XML - a syntax extension for JavaScript that looks similar to HTML"
                    },
                    {
                        front: "What is a component in React?",
                        back: "A reusable piece of code that returns a React element to be rendered"
                    }
                ];
                
                // Check for existing record
                const existingRecords = await db
                    .select()
                    .from(STUDY_TYPE_CONTENT_TABLE)
                    .where(eq(STUDY_TYPE_CONTENT_TABLE.courseId, courseId))
                    .where(eq(STUDY_TYPE_CONTENT_TABLE.type, type));
                    
                if (existingRecords && existingRecords.length > 0) {
                    // Update existing record
                    await db
                        .update(STUDY_TYPE_CONTENT_TABLE)
                        .set({
                            content: testFlashcards,
                            status: 'Ready'
                        })
                        .where(eq(STUDY_TYPE_CONTENT_TABLE.id, existingRecords[0].id));
                        
                    return NextResponse.json({
                        message: "Test data updated successfully",
                        id: existingRecords[0].id
                    });
                } else {
                    // Insert new record
                    const result = await db
                        .insert(STUDY_TYPE_CONTENT_TABLE)
                        .values({
                            courseId: courseId,
                            type: type,
                            content: testFlashcards,
                            status: 'Ready'
                        })
                        .returning({ id: STUDY_TYPE_CONTENT_TABLE.id });
                        
                    return NextResponse.json({
                        message: "Test data inserted successfully",
                        id: result[0].id
                    });
                }
            }
        }
        
        // Special handling for notes type
        if (type === 'notes') {
            try {
                let chaptersData;
                try {
                    chaptersData = JSON.parse(chapters);
                } catch (e) {
                    chaptersData = [{ chapterTitle: chapters, chapterSummary: chapters }];
                }
                
                // Delete any existing notes for this course to avoid duplicates
                await db.delete(CHAPTER_NOTES_TABLE)
                    .where(eq(CHAPTER_NOTES_TABLE.courseId, courseId));
                
                // Generate notes for each chapter
                let index = 0;
                for (const chapter of chaptersData) {
                    const PROMPT = 'generate exam material detail content for each chapter, make sure to include all topics point in the content, make sure to give content in html format (Do not include html, head, body, title tag) the chapters:' + JSON.stringify(chapter);
                    
                    const result = await generateNotesAiModel.sendMessage(PROMPT);
                    let aiResp = result.response.text(); 
                    
                    // Clean up HTML if it contains markdown code blocks
                    if (aiResp.includes("```html")) {
                        aiResp = aiResp.replace(/```html\n|\n```/g, "");
                    }
                    
                    await db.insert(CHAPTER_NOTES_TABLE).values({
                        chapterId: index,
                        courseId: courseId,
                        notes: aiResp 
                    });
                    
                    index++;
                }
                
                return NextResponse.json({
                    message: "Notes generated successfully"
                });
            } catch (error) {
                console.error("Error generating notes:", error);
                return NextResponse.json({
                    error: "Failed to generate notes",
                    message: error.message
                }, { status: 500 });
            }
        }
        
        // For FlashCard, Quiz, etc.
        let PROMPT;
        if (type === 'FlashCard') {
            PROMPT = `Generate flashcards about: ${chapters}. 
Create exactly 10 flashcards with clear questions on the front and comprehensive answers on the back.
Focus on the most important concepts related to this topic.
Output MUST be a valid JSON array with each card having 'front' and 'back' properties.
Example format: [{"front":"What is React?","back":"A JavaScript library for building user interfaces"}]
Always ensure proper JSON format that can be parsed directly.`;
        } else if (type === 'Quiz') {
            PROMPT = `Generate a quiz about: ${chapters}. 
Create exactly 8-10 quiz questions with 4 options each and one correct answer.
Output MUST be valid JSON with the following structure:
{
  "questions": [
    {
      "questionNumber": 1,
      "questionText": "Question text here?",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctAnswer": "Option that is correct"
    }
  ]
}`;
        } else {
            PROMPT = 'Generate content on topic : ' + chapters;
        }

        // Insert record to db changing status to generating
        const result = await db.insert(STUDY_TYPE_CONTENT_TABLE).values({
            courseId: courseId,
            type: type,
            status: 'Generating',
            // Initialize with empty array to ensure it's a valid JSON structure
            content: type === 'FlashCard' ? [] : {questions: []}
        }).returning({ id: STUDY_TYPE_CONTENT_TABLE.id });

        // Trigger inngest function and await the result
        try {
            console.log(`Triggering inngest function for ${type}`);
            
            const inngestResponse = await inngest.send({
                name: 'studyType.content',
                data: {
                    studyType: type,
                    prompt: PROMPT,
                    courseId: courseId,
                    recordId: result[0].id
                }
            });
            
            console.log("Inngest function triggered successfully");
            
            return NextResponse.json({
                id: result[0].id,
                message: "Content generation initiated. Please check back in a moment to view the content."
            });
        } catch (inngestError) {
            console.error("Error triggering Inngest function:", inngestError);
            
            // Update the status to error
            await db.update(STUDY_TYPE_CONTENT_TABLE)
                .set({ status: 'Error' })
                .where(eq(STUDY_TYPE_CONTENT_TABLE.id, result[0].id));
                
            return NextResponse.json({
                error: "Failed to initiate content generation",
                message: inngestError.message
            }, { status: 500 });
        }
    } catch (error) {
        console.error("Error in study-type-content API:", error);
        return NextResponse.json({
            error: "Failed to generate content",
            message: error.message
        }, { status: 500 });
    }
}