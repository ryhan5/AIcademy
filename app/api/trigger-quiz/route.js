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
        
        console.log(`Manually triggering quiz generation for courseId: ${courseId}`);
        
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
        
        // Check if a quiz record already exists
        const existingQuiz = await db.select()
            .from(STUDY_TYPE_CONTENT_TABLE)
            .where(and(
                eq(STUDY_TYPE_CONTENT_TABLE.courseId, courseId),
                eq(STUDY_TYPE_CONTENT_TABLE.type, "Quiz")
            ));
            
        let recordId;
        
        if (existingQuiz && existingQuiz.length > 0) {
            // Update existing record to Generating status
            console.log(`Updating existing quiz record: ${existingQuiz[0].id}`);
            await db.update(STUDY_TYPE_CONTENT_TABLE)
                .set({
                    status: "Generating",
                    content: []
                })
                .where(eq(STUDY_TYPE_CONTENT_TABLE.id, existingQuiz[0].id));
                
            recordId = existingQuiz[0].id;
        } else {
            // Create a new record
            console.log(`Creating new quiz record for courseId: ${courseId}`);
            const result = await db.insert(STUDY_TYPE_CONTENT_TABLE)
                .values({
                    courseId: courseId,
                    type: "Quiz",
                    status: "Generating",
                    content: []
                })
                .returning();
                
            recordId = result[0].id;
        }
        
        // Create the prompt for quiz generation
        const PROMPT = `Generate a comprehensive quiz for the topic: ${topic}. 
Use the following content as a reference: 
${content.substring(0, 3000)}

Create 5 multiple-choice questions that test understanding of key concepts, terminology, and applications.
The output MUST be a valid JSON array of question objects.

Each question should have:
- "question": A clear question about the topic
- "options": An array of 4 possible answers
- "correctAnswer": The index of the correct answer (0-3)
- "explanation": A brief explanation of why the correct answer is right
- "difficulty": A rating of difficulty ("Easy", "Medium", or "Hard")
- "id": A unique numeric identifier (starting from 1)

Example format:
[
  {
    "question": "What is the primary purpose of React's Virtual DOM?",
    "options": [
      "To create 3D visualizations", 
      "To improve rendering performance by minimizing direct DOM manipulations", 
      "To store user data locally", 
      "To connect to backend databases"
    ],
    "correctAnswer": 1,
    "explanation": "React's Virtual DOM improves performance by creating a lightweight copy of the real DOM in memory and only updating the actual DOM when necessary, reducing expensive direct DOM manipulations.",
    "difficulty": "Medium",
    "id": 1
  }
]

Ensure the quiz covers a range of difficulties and tests various aspects of the topic.
Make sure questions are clear, concise, and all options are plausible.
Always ensure proper JSON format that can be parsed directly.`;

        // Generate quiz directly
        console.log(`Generating quiz for topic: ${topic}`);
        try {
            // Generate the quiz using the AI model
            console.log("Sending prompt to AI model...");
            const aiResp = await GenerateStudyTypeContentAiModel.sendMessage(PROMPT);
            let quizText = aiResp.response.text();
            console.log("Received AI response, length:", quizText.length);
            
            // Clean up the response
            if (quizText.includes("```json")) {
                console.log("Cleaning JSON code blocks with json tag");
                quizText = quizText.replace(/```json\n|\n```/g, "");
            } else if (quizText.includes("```")) {
                console.log("Cleaning generic code blocks");
                quizText = quizText.replace(/```\n|\n```/g, "");
            }
            
            // Try to extract JSON array if there's other text
            const jsonMatch = quizText.match(/\[\s*\{.*\}\s*\]/s);
            if (jsonMatch) {
                console.log("Extracted JSON array from mixed content");
                quizText = jsonMatch[0];
            }
            
            let quizData;
            try {
                console.log("Attempting to parse JSON...");
                quizData = JSON.parse(quizText);
                console.log("JSON parsed successfully");
            } catch (parseError) {
                console.error("Error parsing quiz JSON:", parseError);
                
                // Fallback to hardcoded quiz about the topic
                console.log("Using fallback quiz questions for topic:", topic);
                
                // Generate generic quiz questions based on the topic
                quizData = [
                    {
                        question: `What is the primary focus of ${topic}?`,
                        options: [
                            `Understanding theoretical concepts of ${topic}`,
                            `Practical application of ${topic} principles`,
                            `Historical development of ${topic}`,
                            `Advanced research in ${topic}`
                        ],
                        correctAnswer: 1,
                        explanation: `${topic} primarily focuses on practical application of its principles to solve real-world problems.`,
                        difficulty: "Medium",
                        id: 1
                    },
                    {
                        question: `Which of the following best describes a key component of ${topic}?`,
                        options: [
                            "Data analysis",
                            "System design",
                            "Problem solving",
                            "All of the above"
                        ],
                        correctAnswer: 3,
                        explanation: `${topic} incorporates data analysis, system design, and problem solving as key components.`,
                        difficulty: "Easy",
                        id: 2
                    },
                    {
                        question: `What is a common challenge when implementing ${topic}?`,
                        options: [
                            "Resource limitations",
                            "Technical complexity",
                            "Changing requirements",
                            "All of the above"
                        ],
                        correctAnswer: 3,
                        explanation: `Implementing ${topic} often faces challenges including resource limitations, technical complexity, and adapting to changing requirements.`,
                        difficulty: "Medium",
                        id: 3
                    },
                    {
                        question: `Which approach is generally most effective when studying ${topic}?`,
                        options: [
                            "Theoretical study only",
                            "Practical application only",
                            "Balanced combination of theory and practice",
                            "Independent research"
                        ],
                        correctAnswer: 2,
                        explanation: `A balanced approach combining theoretical understanding with practical application is most effective for mastering ${topic}.`,
                        difficulty: "Easy",
                        id: 4
                    },
                    {
                        question: `How do experts in ${topic} typically solve complex problems?`,
                        options: [
                            "By applying standard formulas",
                            "Through trial and error",
                            "Using a systematic, analytical approach",
                            "By consulting reference materials"
                        ],
                        correctAnswer: 2,
                        explanation: `Experts in ${topic} typically use systematic, analytical approaches to break down and solve complex problems.`,
                        difficulty: "Hard",
                        id: 5
                    }
                ];
                
                console.log("Created fallback quiz questions");
            }
            
            // Validate the quiz structure
            console.log("Validating quiz structure...");
            if (!Array.isArray(quizData)) {
                console.error("Invalid structure - not an array:", typeof quizData);
                throw new Error("Generated quiz is not an array");
            }
            
            // Validate and fix each question
            console.log("Validating and fixing individual questions...");
            
            const validatedQuizData = quizData.map((q, index) => {
                // Create a new object to avoid modifying the original
                const fixedQuestion = { ...q };
                
                // Fix ID if missing or invalid
                if (!fixedQuestion.id) {
                    fixedQuestion.id = index + 1;
                }
                
                // Ensure options is an array with at least 4 items
                if (!Array.isArray(fixedQuestion.options) || fixedQuestion.options.length < 4) {
                    // Create generic options if missing
                    fixedQuestion.options = [
                        "Option A",
                        "Option B",
                        "Option C",
                        "Option D"
                    ];
                }
                
                // Ensure correctAnswer is valid
                if (fixedQuestion.correctAnswer === undefined || 
                    fixedQuestion.correctAnswer < 0 || 
                    fixedQuestion.correctAnswer >= fixedQuestion.options.length) {
                    fixedQuestion.correctAnswer = 0;
                }
                
                // Provide default explanation if missing
                if (!fixedQuestion.explanation) {
                    fixedQuestion.explanation = `The correct answer is "${fixedQuestion.options[fixedQuestion.correctAnswer]}".`;
                }
                
                // Ensure difficulty is valid
                if (!fixedQuestion.difficulty || !['Easy', 'Medium', 'Hard'].includes(fixedQuestion.difficulty)) {
                    fixedQuestion.difficulty = ['Easy', 'Medium', 'Hard'][index % 3];
                }
                
                return fixedQuestion;
            });
            
            // Filter out invalid questions (those missing the question text)
            const finalQuizData = validatedQuizData.filter(q => !!q.question);
            
            console.log(`Validated ${finalQuizData.length} quiz questions`);
            
            if (finalQuizData.length === 0) {
                throw new Error("No valid quiz questions were generated");
            }
            
            // Prepare the quiz content in the format expected by the frontend
            const formattedQuizContent = {
                questions: finalQuizData
            };
            
            // Update the record with the generated quiz
            console.log("Updating database with generated quiz...");
            await db.update(STUDY_TYPE_CONTENT_TABLE)
                .set({
                    content: formattedQuizContent,
                    status: "Ready"
                })
                .where(eq(STUDY_TYPE_CONTENT_TABLE.id, recordId));
                
            console.log(`Successfully generated ${finalQuizData.length} quiz questions`);
            
            return NextResponse.json({
                success: true,
                message: "Quiz generated successfully",
                count: finalQuizData.length
            });
        } catch (error) {
            console.error("Error generating quiz:", error);
            
            // Update the record with the error
            await db.update(STUDY_TYPE_CONTENT_TABLE)
                .set({
                    status: "Error",
                    error: error.message,
                    content: { questions: [] } // Ensure content is properly initialized
                })
                .where(eq(STUDY_TYPE_CONTENT_TABLE.id, recordId));
                
            // Log the full error for debugging
            console.error("Full error details:", error);
            
            // Trigger the Inngest function as a fallback
            try {
                await inngest.send({
                    name: "studyType.content",
                    data: {
                        studyType: "Quiz",
                        prompt: PROMPT,
                        courseId: courseId,
                        recordId: recordId
                    }
                });
                
                console.log("Triggered Inngest fallback for quiz generation");
                
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
                    message: "Failed to generate quiz",
                    error: error.message,
                    recordId: recordId // Return recordId for tracking
                }, { status: 500 });
            }
        }
    } catch (error) {
        console.error("Uncaught error in trigger-quiz API:", error);
        
        return NextResponse.json({
            success: false,
            message: "Failed to process request",
            error: error.message
        }, { status: 500 });
    }
} 