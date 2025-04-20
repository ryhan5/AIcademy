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
        
        console.log(`Manually triggering summary generation for courseId: ${courseId}`);
        
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
        
        // Check if a summary record already exists
        const existingSummary = await db.select()
            .from(STUDY_TYPE_CONTENT_TABLE)
            .where(and(
                eq(STUDY_TYPE_CONTENT_TABLE.courseId, courseId),
                eq(STUDY_TYPE_CONTENT_TABLE.type, "Summary")
            ));
            
        let recordId;
        
        if (existingSummary && existingSummary.length > 0) {
            // Update existing record to Generating status
            console.log(`Updating existing summary record: ${existingSummary[0].id}`);
            await db.update(STUDY_TYPE_CONTENT_TABLE)
                .set({
                    status: "Generating",
                    content: null
                })
                .where(eq(STUDY_TYPE_CONTENT_TABLE.id, existingSummary[0].id));
                
            recordId = existingSummary[0].id;
        } else {
            // Create a new record
            console.log(`Creating new summary record for courseId: ${courseId}`);
            const result = await db.insert(STUDY_TYPE_CONTENT_TABLE)
                .values({
                    courseId: courseId,
                    type: "Summary",
                    status: "Generating",
                    content: null
                })
                .returning();
                
            recordId = result[0].id;
        }
        
        // Create the prompt for summary generation
        const PROMPT = `Create a comprehensive summary of the following content about "${topic}":

${content.substring(0, 6000)}

Your summary should:
1. Be well-structured with clear section headings
2. Highlight the key concepts, principles, and important information
3. Include bullet points for lists of important items where appropriate
4. Be approximately 500-800 words in length
5. Use markdown formatting for headings, bullet points, and emphasis
6. Include a brief "Key Takeaways" section at the end

Format your response as plain text with markdown formatting. Do not include any code blocks or JSON formatting.`;

        // Generate summary directly
        console.log(`Generating summary for topic: ${topic}`);
        try {
            // Generate the summary using the AI model
            const aiResp = await GenerateStudyTypeContentAiModel.sendMessage(PROMPT);
            let summaryText = aiResp.response.text();
            
            // Clean up the response
            if (summaryText.includes("```markdown")) {
                summaryText = summaryText.replace(/```markdown\n|\n```/g, "");
            } else if (summaryText.includes("```")) {
                summaryText = summaryText.replace(/```\n|\n```/g, "");
            }
            
            // Update the record with the generated summary
            await db.update(STUDY_TYPE_CONTENT_TABLE)
                .set({
                    content: summaryText,
                    status: "Ready"
                })
                .where(eq(STUDY_TYPE_CONTENT_TABLE.id, recordId));
                
            console.log(`Successfully generated summary`);
            
            return NextResponse.json({
                success: true,
                message: "Summary generated successfully",
                length: summaryText.length
            });
        } catch (error) {
            console.error("Error generating summary:", error);
            
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
                        studyType: "Summary",
                        prompt: PROMPT,
                        courseId: courseId,
                        recordId: recordId
                    }
                });
                
                console.log("Triggered Inngest fallback for summary generation");
                
                return NextResponse.json({
                    success: false,
                    message: "Direct generation failed, triggered background generation",
                    error: error.message
                });
            } catch (inngestError) {
                console.error("Error triggering Inngest fallback:", inngestError);
                
                return NextResponse.json({
                    success: false,
                    message: "Failed to generate summary",
                    error: error.message
                }, { status: 500 });
            }
        }
    } catch (error) {
        console.error("Uncaught error in trigger-summary API:", error);
        
        return NextResponse.json({
            success: false,
            message: "Failed to process request",
            error: error.message
        }, { status: 500 });
    }
} 