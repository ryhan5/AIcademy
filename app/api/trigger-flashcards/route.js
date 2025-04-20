import { db } from "@/configs/db";
import { STUDY_MATERIAL_TABLE, STUDY_TYPE_CONTENT_TABLE } from "@/configs/schema";
import { inngest } from "@/inngest/client";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import { GenerateStudyTypeContentAiModel } from "@/configs/AiModel";

export async function POST(req) {
    try {
        const { courseId } = await req.json();
        
        if (!courseId) {
            return NextResponse.json({ 
                error: "Missing courseId parameter" 
            }, { status: 400 });
        }
        
        console.log(`Manually triggering flashcard generation for courseId: ${courseId}`);
        
        // Get the course info to use as context for generation
        const courseInfo = await db.select()
            .from(STUDY_MATERIAL_TABLE)
            .where(eq(STUDY_MATERIAL_TABLE.courseId, courseId))
            .limit(1);
            
        if (!courseInfo || courseInfo.length === 0) {
            return NextResponse.json({ 
                error: "Course not found" 
            }, { status: 404 });
        }
        
        const topic = courseInfo[0].topic;
        const content = courseInfo[0].content || "";
        
        console.log(`Retrieved course topic: "${topic}"`);
        console.log(`Content length: ${content.length} characters`);
        
        // Check if a flashcards record already exists
        const existingFlashcards = await db.select()
            .from(STUDY_TYPE_CONTENT_TABLE)
            .where(and(
                eq(STUDY_TYPE_CONTENT_TABLE.courseId, courseId),
                eq(STUDY_TYPE_CONTENT_TABLE.type, "FlashCard")
            ));
            
        let recordId;
        
        if (existingFlashcards && existingFlashcards.length > 0) {
            // Update existing record to Generating status
            console.log(`Updating existing flashcard record: ${existingFlashcards[0].id}`);
            await db.update(STUDY_TYPE_CONTENT_TABLE)
                .set({
                    status: "Generating",
                    content: []
                })
                .where(eq(STUDY_TYPE_CONTENT_TABLE.id, existingFlashcards[0].id));
                
            recordId = existingFlashcards[0].id;
        } else {
            // Create a new record
            console.log(`Creating new flashcard record for courseId: ${courseId}`);
            const result = await db.insert(STUDY_TYPE_CONTENT_TABLE)
                .values({
                    courseId: courseId,
                    type: "FlashCard",
                    status: "Generating",
                    content: []
                })
                .returning();
                
            recordId = result[0].id;
        }
        
        // Create the prompt for flashcard generation
        const PROMPT = `Create a set of 10 flashcards based on the following content about "${topic}":

${content.substring(0, 3000)}

Each flashcard should:
1. Have a clear, concise question/prompt on the front
2. Have a comprehensive but concise answer on the back
3. Focus on important concepts, definitions, and key information
4. Be varied in difficulty (some basic recall, some requiring deeper understanding)
5. Cover different aspects of the material

Format your response as a JSON array of flashcard objects, each with:
1. id: a unique identifier (string like "fc-1", "fc-2", etc.)
2. front: the question or prompt (string)
3. back: the answer or explanation (string)
4. difficulty: a value of "Easy", "Medium", or "Hard" (string)

Example format:
[
  {
    "id": "fc-1",
    "front": "What is the definition of X?",
    "back": "X is defined as...",
    "difficulty": "Easy"
  },
  {
    "id": "fc-2",
    "front": "How does Y work?",
    "back": "Y works by...",
    "difficulty": "Medium"
  }
]

Ensure your response is properly formatted JSON. Do not include any explanations, markdown, or additional text outside the JSON array.`;

        // Generate flashcards directly
        console.log(`Generating flashcards for topic: ${topic}`);
        try {
            // Generate the flashcards using the AI model
            console.log("Sending prompt to AI model...");
            const aiResp = await GenerateStudyTypeContentAiModel.sendMessage(PROMPT);
            let rawFlashcards = aiResp.response.text();
            console.log("Received AI response, length:", rawFlashcards.length);
            
            // Clean up and parse the response
            if (rawFlashcards.includes("```json")) {
                console.log("Cleaning JSON code blocks with json tag");
                rawFlashcards = rawFlashcards.replace(/```json\n|\n```/g, "");
            } else if (rawFlashcards.includes("```")) {
                console.log("Cleaning generic code blocks");
                rawFlashcards = rawFlashcards.replace(/```\n|\n```/g, "");
            }
            
            // Try to extract JSON content if mixed with text
            const jsonMatch = rawFlashcards.match(/\[\s*\{.*\}\s*\]/s);
            if (jsonMatch) {
                console.log("Extracted JSON array from mixed content");
                rawFlashcards = jsonMatch[0];
            }
            
            let flashcards;
            try {
                console.log("Attempting to parse JSON...");
                flashcards = JSON.parse(rawFlashcards);
                console.log("JSON parsed successfully");
            } catch (parseError) {
                console.error("Error parsing flashcards JSON:", parseError);
                
                // Fallback to hard-coded flashcards about the topic
                console.log("Using fallback flashcards for topic:", topic);
                
                // Generate simple generic flashcards based on the topic
                flashcards = [
                    {
                        id: "fc-1",
                        front: `What is ${topic}?`,
                        back: `${topic} is a subject that covers important concepts and principles in this field.`,
                        difficulty: "Easy"
                    },
                    {
                        id: "fc-2",
                        front: `What are the main components of ${topic}?`,
                        back: `${topic} typically consists of several key components that work together.`,
                        difficulty: "Medium"
                    },
                    {
                        id: "fc-3",
                        front: `Why is ${topic} important?`,
                        back: `${topic} is important because it provides fundamental understanding and practical applications in various contexts.`,
                        difficulty: "Easy"
                    },
                    {
                        id: "fc-4",
                        front: `How does ${topic} relate to practical applications?`,
                        back: `${topic} can be applied in numerous practical scenarios to solve real-world problems.`,
                        difficulty: "Medium"
                    },
                    {
                        id: "fc-5",
                        front: `What are advanced concepts in ${topic}?`,
                        back: `Advanced concepts in ${topic} include specialized techniques and methodologies that build upon the fundamentals.`,
                        difficulty: "Hard"
                    }
                ];
                
                console.log("Created fallback flashcards");
            }
            
            // Validate the flashcards
            console.log("Validating flashcards structure...");
            if (!Array.isArray(flashcards)) {
                throw new Error("Generated flashcards is not an array");
            }
            
            // Validate each flashcard
            console.log("Validating individual flashcards...");
            let validCount = 0;
            
            // First ensure each card has required properties
            flashcards = flashcards.map((card, index) => {
                // Add id if missing
                if (!card.id) {
                    card.id = `fc-${index + 1}`;
                }
                
                // Add difficulty if missing
                if (!card.difficulty || !['Easy', 'Medium', 'Hard'].includes(card.difficulty)) {
                    card.difficulty = ['Easy', 'Medium', 'Hard'][index % 3];
                }
                
                return card;
            });
            
            // Then filter out any that are still invalid
            flashcards = flashcards.filter(card => {
                const isValid = card && typeof card === 'object' && 
                       card.id && card.front && card.back && 
                       ['Easy', 'Medium', 'Hard'].includes(card.difficulty);
                if (isValid) validCount++;
                return isValid;
            });
            
            console.log(`Found ${validCount} valid flashcards out of ${flashcards.length} total`);
            
            if (flashcards.length === 0) {
                throw new Error("No valid flashcards were generated");
            }
            
            // Update the record with the generated flashcards
            console.log("Updating database with generated flashcards...");
            await db.update(STUDY_TYPE_CONTENT_TABLE)
                .set({
                    content: flashcards,
                    status: "Ready"
                })
                .where(eq(STUDY_TYPE_CONTENT_TABLE.id, recordId));
                
            console.log(`Successfully generated ${flashcards.length} flashcards`);
            
            return NextResponse.json({
                success: true,
                message: "Flashcards generated successfully",
                count: flashcards.length
            });
        } catch (error) {
            console.error("Error generating flashcards:", error);
            
            // Update the record with the error
            await db.update(STUDY_TYPE_CONTENT_TABLE)
                .set({
                    status: "Error",
                    error: error.message,
                    content: [] // Ensure content is properly initialized as empty array
                })
                .where(eq(STUDY_TYPE_CONTENT_TABLE.id, recordId));
                
            // Log the full error for debugging
            console.error("Full error details:", error);
            
            // Trigger the Inngest function as a fallback
            try {
                await inngest.send({
                    name: "studyType.content",
                    data: {
                        studyType: "FlashCard",
                        prompt: PROMPT,
                        courseId: courseId,
                        recordId: recordId
                    }
                });
                
                console.log("Triggered Inngest fallback for flashcard generation");
                
                return NextResponse.json({
                    success: false,
                    message: "Direct generation failed, triggered background generation",
                    error: error.message,
                    recordId: recordId // Return recordId for tracking
                });
            } catch (inngestError) {
                console.error("Error triggering Inngest fallback:", inngestError);
                
                return NextResponse.json({
                    success: false,
                    message: "Failed to generate flashcards",
                    error: error.message,
                    recordId: recordId // Return recordId for tracking
                }, { status: 500 });
            }
        }
    } catch (error) {
        console.error("Uncaught error in trigger-flashcards API:", error);
        
        return NextResponse.json({
            success: false,
            message: "Failed to process request",
            error: error.message
        }, { status: 500 });
    }
} 