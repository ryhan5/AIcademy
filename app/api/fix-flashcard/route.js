import { db } from "@/configs/db";
import { STUDY_TYPE_CONTENT_TABLE } from "@/configs/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { id } = await req.json();
        
        if (!id) {
            return NextResponse.json({ 
                error: "Missing record ID parameter" 
            }, { status: 400 });
        }
        
        console.log(`Fixing flashcard record ID: ${id}`);
        
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
        
        // Update the record directly by ID
        await db.update(STUDY_TYPE_CONTENT_TABLE)
            .set({
                content: testFlashcards,
                status: "Ready"
            })
            .where(eq(STUDY_TYPE_CONTENT_TABLE.id, id));
        
        return NextResponse.json({
            success: true,
            message: "Flashcard record fixed successfully",
            count: testFlashcards.length,
            recordId: id
        });
        
    } catch (error) {
        console.error("Error fixing flashcard record:", error);
        
        return NextResponse.json({
            success: false,
            message: "Failed to fix flashcard record",
            error: error.message
        }, { status: 500 });
    }
} 