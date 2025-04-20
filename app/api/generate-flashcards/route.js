import { GenerateStudyTypeContentAiModel } from "@/configs/AiModel";
import { db } from "@/configs/db";
import { STUDY_TYPE_CONTENT_TABLE } from "@/configs/schema";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        // Get the data from the request
        const body = await req.json().catch(error => {
            console.error("Error parsing request body:", error);
            return NextResponse.json({ error: "Invalid request body", details: error.message }, { status: 400 });
        });

        console.log("Request data received for flashcards:", body);
        const { courseId, topic } = body;

        // Validate required fields
        if (!courseId || !topic) {
            console.error("Missing required fields:", { courseId, topic });
            return NextResponse.json({ 
                error: "Missing required fields",
                missingFields: !courseId ? "courseId" : "topic"
            }, { status: 400 });
        }

        // Check if AI model is properly initialized
        if (!GenerateStudyTypeContentAiModel) {
            console.error("AI model not initialized - check your NEXT_PUBLIC_GEMINI_API_KEY");
            return NextResponse.json({ error: "AI model not available", hint: "Check NEXT_PUBLIC_GEMINI_API_KEY" }, { status: 500 });
        }

        const PROMPT = `Generate flashcards about: ${topic}. 
Create exactly 10 flashcards with clear questions on the front and comprehensive answers on the back.
Focus on the most important concepts related to this topic.
Output MUST be a valid JSON array with each card having 'front' and 'back' properties.
Example format: [{"front":"What is React?","back":"A JavaScript library for building user interfaces"}]
Always ensure proper JSON format that can be parsed directly.`;

        console.log("Sending prompt to AI model for flashcards:", PROMPT);
        
        // Call AI model with proper error handling
        let aiResp;
        try {
            aiResp = await GenerateStudyTypeContentAiModel.sendMessage(PROMPT);
            console.log("Received AI response for flashcards");
        } catch (error) {
            console.error("Error calling AI model:", error);
            return NextResponse.json({ 
                error: "Failed to generate flashcards with AI model", 
                details: error.message,
                hint: "Check your NEXT_PUBLIC_GEMINI_API_KEY" 
            }, { status: 500 });
        }

        let aiResponseText = aiResp.response.text();
        console.log("AI Response Text for flashcards:", aiResponseText.substring(0, 200) + "..."); // Log beginning of response
        
        // Clean up JSON if it contains markdown code blocks
        if (aiResponseText.includes("```json")) {
            aiResponseText = aiResponseText.replace(/```json\n|\n```/g, "");
        } else if (aiResponseText.includes("```")) {
            // Handle case where code block doesn't specify json but contains json
            aiResponseText = aiResponseText.replace(/```\n|\n```/g, "");
        }
        
        // Attempt to extract JSON if there's other text around it
        const jsonMatch = aiResponseText.match(/\[.*\]/s);
        if (jsonMatch) {
            aiResponseText = jsonMatch[0];
            console.log("Extracted JSON array pattern from response");
        }
        
        let flashcards;
        try {
            flashcards = JSON.parse(aiResponseText);
            console.log(`Successfully parsed ${flashcards.length} flashcards`);
            
            // Validate the structure of the flashcards
            if (!Array.isArray(flashcards)) {
                throw new Error("Flashcards should be an array");
            }
            
            // Verify and normalize the flashcard format
            flashcards = flashcards.map(card => ({
              front: card.front || card.question || "",
              back: card.back || card.answer || ""
            }));
            
            // Make sure every card has both front and back content
            for (const card of flashcards) {
                if (!card.front || !card.back) {
                    throw new Error("Each flashcard must have 'front' and 'back' properties");
                }
            }
        } catch (error) {
            console.error("Error parsing AI response for flashcards:", error);
            console.error("AI response raw text:", aiResponseText);
            return NextResponse.json({ 
                error: "Invalid flashcards format from AI", 
                details: error.message,
                responsePreview: aiResponseText.substring(0, 500) // First 500 chars to help debug
            }, { status: 500 });
        }

        console.log("Successfully parsed flashcards response to JSON");

        //save the result in the database
        let dbResult;
        try {
            dbResult = await db.insert(STUDY_TYPE_CONTENT_TABLE).values({
                courseId: courseId,
                type: "FlashCard",
                content: flashcards,
                status: "Ready"
            }).returning();
            
            console.log("Successfully inserted flashcards data into database");
        } catch (dbError) {
            console.error("Database insertion error for flashcards:", dbError);
            return NextResponse.json({ 
                error: "Failed to save flashcards to database", 
                details: dbError.message,
                hint: "Check database connection and schema" 
            }, { status: 500 });
        }

        return NextResponse.json({ 
            message: "Flashcards generated successfully",
            flashcardsId: dbResult[0].id,
            flashcardsCount: flashcards.length
        });
    } catch (error) {
        console.error("Uncaught error in flashcards generation:", error);
        return NextResponse.json({ 
            error: "Internal Server Error", 
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
} 