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
        
        console.log(`Manually triggering MCQ generation for courseId: ${courseId}`);
        
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
        
        // Check if an MCQ record already exists
        const existingMCQ = await db.select()
            .from(STUDY_TYPE_CONTENT_TABLE)
            .where(and(
                eq(STUDY_TYPE_CONTENT_TABLE.courseId, courseId),
                eq(STUDY_TYPE_CONTENT_TABLE.type, "MCQs")
            ));
            
        let recordId;
        
        if (existingMCQ && existingMCQ.length > 0) {
            // Update existing record to Generating status
            console.log(`Updating existing MCQ record: ${existingMCQ[0].id}`);
            await db.update(STUDY_TYPE_CONTENT_TABLE)
                .set({
                    status: "Generating",
                    content: []
                })
                .where(eq(STUDY_TYPE_CONTENT_TABLE.id, existingMCQ[0].id));
                
            recordId = existingMCQ[0].id;
        } else {
            // Create a new record
            console.log(`Creating new MCQ record for courseId: ${courseId}`);
            const result = await db.insert(STUDY_TYPE_CONTENT_TABLE)
                .values({
                    courseId: courseId,
                    type: "MCQs",
                    status: "Generating",
                    content: []
                })
                .returning();
                
            recordId = result[0].id;
        }
        
        // Create the prompt for MCQ generation
        const PROMPT = `Generate multiple choice questions for the topic: ${topic}. 
Use the following content as a reference: 
${content.substring(0, 6000)}

Create 10-15 challenging multiple choice questions that test understanding of key concepts.
Each question should have one correct answer and three plausible but incorrect options.
The output MUST be a valid JSON array of question objects.

Each question should have:
- "question": The question text
- "options": Array of 4 possible answers
- "correctIndex": Index of the correct answer (0-3)
- "explanation": Brief explanation of why the correct answer is right

Example format:
[
  {
    "question": "What is the primary purpose of React?",
    "options": [
      "A JavaScript library for building user interfaces",
      "A server-side programming language",
      "A database management system",
      "A testing framework for JavaScript"
    ],
    "correctIndex": 0,
    "explanation": "React is a JavaScript library developed by Facebook specifically for building user interfaces, particularly single-page applications."
  }
]

Always ensure proper JSON format that can be parsed directly.`;

        // Generate MCQs directly
        console.log(`Generating MCQs for topic: ${topic}`);
        try {
            // Generate the MCQs using the AI model
            const aiResp = await GenerateStudyTypeContentAiModel.sendMessage(PROMPT);
            let mcqText = aiResp.response.text();
            
            // Clean up the response
            if (mcqText.includes("```json")) {
                mcqText = mcqText.replace(/```json\n|\n```/g, "");
            } else if (mcqText.includes("```")) {
                mcqText = mcqText.replace(/```\n|\n```/g, "");
            }
            
            // Try to extract JSON array if there's other text
            const jsonMatch = mcqText.match(/\[.*\]/s);
            if (jsonMatch) {
                mcqText = jsonMatch[0];
            }
            
            // Parse the MCQs
            const mcqData = JSON.parse(mcqText);
            
            // Validate the MCQs structure
            if (!Array.isArray(mcqData)) {
                throw new Error("Invalid MCQ format: not an array");
            }
            
            // Validate each MCQ
            mcqData.forEach((mcq, index) => {
                if (!mcq.question) {
                    throw new Error(`MCQ ${index + 1} is missing a question`);
                }
                if (!Array.isArray(mcq.options) || mcq.options.length !== 4) {
                    throw new Error(`MCQ ${index + 1} should have exactly 4 options`);
                }
                if (mcq.correctIndex === undefined || mcq.correctIndex < 0 || mcq.correctIndex > 3) {
                    throw new Error(`MCQ ${index + 1} has an invalid correctIndex`);
                }
                if (!mcq.explanation) {
                    throw new Error(`MCQ ${index + 1} is missing an explanation`);
                }
            });
            
            // Update the record with the generated MCQs
            await db.update(STUDY_TYPE_CONTENT_TABLE)
                .set({
                    content: mcqData,
                    status: "Ready"
                })
                .where(eq(STUDY_TYPE_CONTENT_TABLE.id, recordId));
                
            console.log(`Successfully generated ${mcqData.length} MCQs`);
            
            return NextResponse.json({
                success: true,
                message: "MCQs generated successfully",
                count: mcqData.length
            });
        } catch (error) {
            console.error("Error generating MCQs:", error);
            
            // Update the record with the error
            await db.update(STUDY_TYPE_CONTENT_TABLE)
                .set({
                    status: "Error",
                    error: error.message
                })
                .where(eq(STUDY_TYPE_CONTENT_TABLE.id, recordId));
                
            // Trigger the Inngest function as a fallback
            try {
                await inngest.send({
                    name: "studyType.content",
                    data: {
                        studyType: "MCQs",
                        prompt: PROMPT,
                        courseId: courseId,
                        recordId: recordId
                    }
                });
                
                console.log("Triggered Inngest fallback for MCQ generation");
                
                return NextResponse.json({
                    success: false,
                    message: "Direct generation failed, triggered background generation",
                    error: error.message
                });
            } catch (inngestError) {
                console.error("Error triggering Inngest fallback:", inngestError);
                
                return NextResponse.json({
                    success: false,
                    message: "Failed to generate MCQs",
                    error: error.message
                }, { status: 500 });
            }
        }
    } catch (error) {
        console.error("Uncaught error in trigger-mcq API:", error);
        
        return NextResponse.json({
            success: false,
            message: "Failed to process request",
            error: error.message
        }, { status: 500 });
    }
} 