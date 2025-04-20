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
        
        console.log(`Manually triggering notes generation for courseId: ${courseId}`);
        
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
        
        // Check if a notes record already exists
        const existingNotes = await db.select()
            .from(STUDY_TYPE_CONTENT_TABLE)
            .where(and(
                eq(STUDY_TYPE_CONTENT_TABLE.courseId, courseId),
                eq(STUDY_TYPE_CONTENT_TABLE.type, "Notes")
            ));
            
        let recordId;
        
        if (existingNotes && existingNotes.length > 0) {
            // Update existing record to Generating status
            console.log(`Updating existing notes record: ${existingNotes[0].id}`);
            await db.update(STUDY_TYPE_CONTENT_TABLE)
                .set({
                    status: "Generating",
                    content: []
                })
                .where(eq(STUDY_TYPE_CONTENT_TABLE.id, existingNotes[0].id));
                
            recordId = existingNotes[0].id;
        } else {
            // Create a new record
            console.log(`Creating new notes record for courseId: ${courseId}`);
            const result = await db.insert(STUDY_TYPE_CONTENT_TABLE)
                .values({
                    courseId: courseId,
                    type: "Notes",
                    status: "Generating",
                    content: []
                })
                .returning();
                
            recordId = result[0].id;
        }
        
        // Create the prompt for notes generation
        const PROMPT = `Generate comprehensive study notes for the topic: ${topic}. 
Use the following content as a reference: 
${content.substring(0, 6000)}

Create well-structured, detailed notes that summarize the key concepts, definitions, examples, and important points.
The notes should be organized in a way that makes them easy to study from.
The output MUST be a valid JSON array of section objects.

Each section should have:
- "title": A descriptive section title
- "content": The detailed notes content for that section
- "order": Numerical order of the section (starting from 0)

Example format:
[
  {
    "title": "Introduction to React",
    "content": "React is a JavaScript library developed by Facebook for building user interfaces. It uses a component-based architecture and a virtual DOM to efficiently update the UI. React was first released in 2013 and has become one of the most popular front-end libraries.",
    "order": 0
  },
  {
    "title": "Key React Concepts",
    "content": "1. Components: The building blocks of React applications\\n2. JSX: A syntax extension that looks like HTML but works within JavaScript\\n3. Props: How data is passed between components\\n4. State: Internal component data that can change over time",
    "order": 1
  }
]

Always ensure proper JSON format that can be parsed directly.`;

        // Generate notes directly
        console.log(`Generating notes for topic: ${topic}`);
        try {
            // Generate the notes using the AI model
            const aiResp = await GenerateStudyTypeContentAiModel.sendMessage(PROMPT);
            let notesText = aiResp.response.text();
            
            // Clean up the response
            if (notesText.includes("```json")) {
                notesText = notesText.replace(/```json\n|\n```/g, "");
            } else if (notesText.includes("```")) {
                notesText = notesText.replace(/```\n|\n```/g, "");
            }
            
            // Try to extract JSON array if there's other text
            const jsonMatch = notesText.match(/\[.*\]/s);
            if (jsonMatch) {
                notesText = jsonMatch[0];
            }
            
            // Parse the notes
            const notesData = JSON.parse(notesText);
            
            // Validate the notes structure
            if (!Array.isArray(notesData)) {
                throw new Error("Invalid notes format: not an array");
            }
            
            // Validate each section
            notesData.forEach((section, index) => {
                if (!section.title) {
                    throw new Error(`Section ${index + 1} is missing a title`);
                }
                if (!section.content) {
                    throw new Error(`Section ${index + 1} is missing content`);
                }
                if (section.order === undefined) {
                    section.order = index; // Add order if missing
                }
            });
            
            // Sort sections by order
            notesData.sort((a, b) => a.order - b.order);
            
            // Update the record with the generated notes
            await db.update(STUDY_TYPE_CONTENT_TABLE)
                .set({
                    content: notesData,
                    status: "Ready"
                })
                .where(eq(STUDY_TYPE_CONTENT_TABLE.id, recordId));
                
            console.log(`Successfully generated ${notesData.length} note sections`);
            
            return NextResponse.json({
                success: true,
                message: "Notes generated successfully",
                count: notesData.length
            });
        } catch (error) {
            console.error("Error generating notes:", error);
            
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
                        studyType: "Notes",
                        prompt: PROMPT,
                        courseId: courseId,
                        recordId: recordId
                    }
                });
                
                console.log("Triggered Inngest fallback for notes generation");
                
                return NextResponse.json({
                    success: false,
                    message: "Direct generation failed, triggered background generation",
                    error: error.message
                });
            } catch (inngestError) {
                console.error("Error triggering Inngest fallback:", inngestError);
                
                return NextResponse.json({
                    success: false,
                    message: "Failed to generate notes",
                    error: error.message
                }, { status: 500 });
            }
        }
    } catch (error) {
        console.error("Uncaught error in trigger-notes API:", error);
        
        return NextResponse.json({
            success: false,
            message: "Failed to process request",
            error: error.message
        }, { status: 500 });
    }
} 