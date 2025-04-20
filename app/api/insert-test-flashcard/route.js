import { db } from "@/configs/db";
import { STUDY_TYPE_CONTENT_TABLE } from "@/configs/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { courseId } = await req.json();
        
        if (!courseId) {
            return NextResponse.json({ 
                error: "Missing courseId parameter" 
            }, { status: 400 });
        }
        
        console.log(`Inserting test flashcards for courseId: ${courseId}`);
        
        // Check if a flashcard record already exists
        const existingFlashcards = await db.select()
            .from(STUDY_TYPE_CONTENT_TABLE)
            .where(and(
                eq(STUDY_TYPE_CONTENT_TABLE.courseId, courseId),
                eq(STUDY_TYPE_CONTENT_TABLE.type, "FlashCard")
            ));
            
        let recordId;
        
        // Sample test flashcards that follow the expected structure
        const testFlashcards = [
            {
                id: "fc-1",
                front: "What is React?",
                back: "A JavaScript library for building user interfaces",
                difficulty: "Easy"
            },
            {
                id: "fc-2",
                front: "What is JSX?",
                back: "JSX is a syntax extension for JavaScript that looks similar to HTML and allows you to write HTML-like code in your JavaScript files.",
                difficulty: "Medium"
            },
            {
                id: "fc-3",
                front: "What is a React Component?",
                back: "A component is a reusable piece of code that returns a React element to be rendered to the page.",
                difficulty: "Easy"
            },
            {
                id: "fc-4",
                front: "What is the Virtual DOM?",
                back: "The Virtual DOM is a lightweight copy of the actual DOM that React uses to improve performance by minimizing direct manipulation of the DOM.",
                difficulty: "Medium"
            },
            {
                id: "fc-5",
                front: "What are React Hooks?",
                back: "Hooks are functions that let you use state and other React features without writing a class component. Common hooks include useState, useEffect, useContext, etc.",
                difficulty: "Hard"
            }
        ];
        
        if (existingFlashcards && existingFlashcards.length > 0) {
            // Update existing record
            console.log(`Updating existing flashcard record: ${existingFlashcards[0].id}`);
            await db.update(STUDY_TYPE_CONTENT_TABLE)
                .set({
                    content: testFlashcards,
                    status: "Ready"
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
                    status: "Ready",
                    content: testFlashcards
                })
                .returning();
                
            recordId = result[0].id;
        }
        
        return NextResponse.json({
            success: true,
            message: "Test flashcards inserted successfully",
            count: testFlashcards.length,
            recordId: recordId
        });
        
    } catch (error) {
        console.error("Error inserting test flashcards:", error);
        
        return NextResponse.json({
            success: false,
            message: "Failed to insert test flashcards",
            error: error.message
        }, { status: 500 });
    }
} 