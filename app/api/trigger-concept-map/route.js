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
        
        console.log(`Manually triggering concept map generation for courseId: ${courseId}`);
        
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
        
        // Check if a concept map record already exists
        const existingConceptMap = await db.select()
            .from(STUDY_TYPE_CONTENT_TABLE)
            .where(and(
                eq(STUDY_TYPE_CONTENT_TABLE.courseId, courseId),
                eq(STUDY_TYPE_CONTENT_TABLE.type, "ConceptMap")
            ));
            
        let recordId;
        
        if (existingConceptMap && existingConceptMap.length > 0) {
            // Update existing record to Generating status
            console.log(`Updating existing concept map record: ${existingConceptMap[0].id}`);
            await db.update(STUDY_TYPE_CONTENT_TABLE)
                .set({
                    status: "Generating",
                    content: { nodes: [], edges: [] }
                })
                .where(eq(STUDY_TYPE_CONTENT_TABLE.id, existingConceptMap[0].id));
                
            recordId = existingConceptMap[0].id;
        } else {
            // Create a new record
            console.log(`Creating new concept map record for courseId: ${courseId}`);
            const result = await db.insert(STUDY_TYPE_CONTENT_TABLE)
                .values({
                    courseId: courseId,
                    type: "ConceptMap",
                    status: "Generating",
                    content: { nodes: [], edges: [] }
                })
                .returning();
                
            recordId = result[0].id;
        }
        
        // Create the prompt for concept map generation
        const PROMPT = `Generate a concept map about: ${topic}. 
Create a concept map with 10-15 important concepts and their relationships.
The output MUST be a valid JSON object with "nodes" and "edges" arrays.
Each node should have: "id" (string), "label" (string), and "description" (short explanation).
Each edge should have: "source" (node id), "target" (node id), and "label" (relationship description).
Example format:
{
  "nodes": [
    {
      "id": "node1",
      "label": "React",
      "description": "A JavaScript library for building user interfaces"
    }
  ],
  "edges": [
    {
      "source": "node1",
      "target": "node2",
      "label": "is based on"
    }
  ]
}
Always ensure proper JSON format that can be parsed directly.`;

        // Generate concept map directly
        console.log(`Generating concept map for topic: ${topic}`);
        try {
            // Generate the concept map using the AI model
            const aiResp = await GenerateStudyTypeContentAiModel.sendMessage(PROMPT);
            let conceptMapText = aiResp.response.text();
            
            // Clean up the response
            if (conceptMapText.includes("```json")) {
                conceptMapText = conceptMapText.replace(/```json\n|\n```/g, "");
            } else if (conceptMapText.includes("```")) {
                conceptMapText = conceptMapText.replace(/```\n|\n```/g, "");
            }
            
            // Try to extract JSON object if there's other text
            const jsonMatch = conceptMapText.match(/\{.*\}/s);
            if (jsonMatch) {
                conceptMapText = jsonMatch[0];
            }
            
            // Parse the concept map
            const conceptMapData = JSON.parse(conceptMapText);
            
            // Validate the concept map structure
            if (!conceptMapData.nodes || !Array.isArray(conceptMapData.nodes)) {
                throw new Error("Invalid concept map format: missing nodes array");
            }
            if (!conceptMapData.edges || !Array.isArray(conceptMapData.edges)) {
                throw new Error("Invalid concept map format: missing edges array");
            }
            
            // Validate each node and edge
            conceptMapData.nodes.forEach((node, index) => {
                if (!node.id) {
                    throw new Error(`Node ${index + 1} is missing id`);
                }
                if (!node.label) {
                    throw new Error(`Node ${index + 1} is missing label`);
                }
            });
            
            conceptMapData.edges.forEach((edge, index) => {
                if (!edge.source) {
                    throw new Error(`Edge ${index + 1} is missing source`);
                }
                if (!edge.target) {
                    throw new Error(`Edge ${index + 1} is missing target`);
                }
                if (!edge.label) {
                    throw new Error(`Edge ${index + 1} is missing label`);
                }
            });
            
            // Update the record with the generated concept map
            await db.update(STUDY_TYPE_CONTENT_TABLE)
                .set({
                    content: conceptMapData,
                    status: "Ready"
                })
                .where(eq(STUDY_TYPE_CONTENT_TABLE.id, recordId));
                
            console.log(`Successfully generated concept map with ${conceptMapData.nodes.length} nodes and ${conceptMapData.edges.length} edges`);
            
            return NextResponse.json({
                success: true,
                message: "Concept map generated successfully",
                nodeCount: conceptMapData.nodes.length,
                edgeCount: conceptMapData.edges.length
            });
        } catch (error) {
            console.error("Error generating concept map:", error);
            
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
                        studyType: "ConceptMap",
                        prompt: PROMPT,
                        courseId: courseId,
                        recordId: recordId
                    }
                });
                
                console.log("Triggered Inngest fallback for concept map generation");
                
                return NextResponse.json({
                    success: false,
                    message: "Direct generation failed, triggered background generation",
                    error: error.message
                });
            } catch (inngestError) {
                console.error("Error triggering Inngest fallback:", inngestError);
                
                return NextResponse.json({
                    success: false,
                    message: "Failed to generate concept map",
                    error: error.message
                }, { status: 500 });
            }
        }
    } catch (error) {
        console.error("Uncaught error in trigger-concept-map API:", error);
        
        return NextResponse.json({
            success: false,
            message: "Failed to process request",
            error: error.message
        }, { status: 500 });
    }
} 