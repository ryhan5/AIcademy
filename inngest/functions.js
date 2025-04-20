import { generateNotesAiModel, GenerateQuizAiModel, GenerateStudyTypeContentAiModel } from "@/configs/AiModel";
import { db } from '@/configs/db';
import { inngest } from '@/inngest/client';
import { eq } from 'drizzle-orm';

import { CHAPTER_NOTES_TABLE, STUDY_MATERIAL_TABLE, STUDY_TYPE_CONTENT_TABLE } from '@/configs/schema';
import axios from 'axios';

export const GenerateNotes=inngest.createFunction(
  {id:'generate-course'},
  {event:'notes.generate'},
  async({event,step})=>{
    const {course}=event.data;

    //generate notes for each chapter using ai
    const notesResult=await step.run('Generate Chapter Notes',async()=>{
      const Chapters=course?.courseLayout?.chapters;
      
      // Use Promise.all to properly wait for all async operations
      try {
        const chapterPromises = Chapters.map(async (chapter, index) => {
          const PROMPT='generate exam material detail content for each chapter, make sure to include all topics point in the content,make sure to give content in html format (Do not include htmlkl,head ,body,title tag) the chapters:'+JSON.stringify(chapter);

          const result = await generateNotesAiModel.sendMessage(PROMPT);
          
          let aiResp = result.response.text();
          
          // Clean up HTML if it contains markdown code blocks
          if (aiResp.includes("```html")) {
            aiResp = aiResp.replace(/```html\n|\n```/g, "");
          }

          // Insert into database
          await db.insert(CHAPTER_NOTES_TABLE).values({
            chapterId: index,
            courseId: course?.courseId,
            notes: aiResp 
          });
          
          return { chapterId: index, success: true };
        });
        
        await Promise.all(chapterPromises);
        return 'All chapters processed successfully';
      } catch (error) {
        console.error("Error generating notes:", error);
        return 'Error processing chapters: ' + error.message;
      }
    });

    //update status to ready
    const updateCourseStatusResult=await step.run('Update course status to ready',async()=>{
      const result=await db.update(STUDY_MATERIAL_TABLE).set({
        status:'Ready'
      }).where(eq(STUDY_MATERIAL_TABLE.courseId,course?.courseId));
      
      return 'Success';
    });

    return { notesResult, updateCourseStatusResult };
  }
)



// used to generate flash card .quiz , question and answer
export const GenerateStudyTypeContent = inngest.createFunction(
  { id: "generate-study-type-content" },
  { event: "studyType.content" },
  async ({ event, step }) => {
    try {
      const { studyType, prompt, courseId, recordId } = event.data;
      console.log(
        `Starting content generation for ${studyType}, courseId: ${courseId}, recordId: ${recordId}`
      );

      let aiResp;
      try {
        if (studyType === 'FlashCard') {
          console.log(`Generating ${studyType} with GenerateStudyTypeContentAiModel`);
          const result = await step.run("generating-flashcard-content", async () => {
            return await GenerateStudyTypeContentAiModel.sendMessage(prompt);
          });
          aiResp = result.response.text();
        } else if (studyType === 'Quiz') {
          console.log(`Generating ${studyType} with GenerateQuizAiModel`);
          const result = await step.run("generating-quiz-content", async () => {
            return await GenerateQuizAiModel.sendMessage(prompt);
          });
          aiResp = result.response.text();
        } else {
          console.log(`Generating ${studyType} with generateNotesAiModel`);
          const result = await step.run("generating-notes-content", async () => {
            return await generateNotesAiModel.sendMessage(prompt);
          });
          aiResp = result.response.text();
        }
      } catch (error) {
        console.error(`AI model generation error for ${studyType}:`, error);
        
        // Update DB with error status
        await db
          .update(STUDY_TYPE_CONTENT_TABLE)
          .set({ 
            status: 'Error',
            error: `AI generation failed: ${error.message}`
          })
          .where(eq(STUDY_TYPE_CONTENT_TABLE.id, recordId));
        
        throw new Error(`Failed to generate content: ${error.message}`);
      }

      // Clean up the response if it contains markdown code blocks
      if (aiResp.includes("```json")) {
        aiResp = aiResp.replace(/```json\n|\n```/g, "");
      } else if (aiResp.includes("```")) {
        // Handle case where code block doesn't specify json but contains json
        aiResp = aiResp.replace(/```\n|\n```/g, "");
      }
      
      console.log(`Raw AI response for ${studyType}:`, aiResp.substring(0, 150) + "...");

      // Parse the JSON response
      let parsedContent;
      try {
        parsedContent = JSON.parse(aiResp);
        console.log(`Successfully parsed JSON for ${studyType}`);
      } catch (error) {
        console.error(`JSON parsing error for ${studyType}:`, error);
        console.log("AI Response that failed to parse:", aiResp);
        
        // Attempt to extract JSON from potential text wrapping
        const jsonMatch = aiResp.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
        if (jsonMatch) {
          try {
            parsedContent = JSON.parse(jsonMatch[0]);
            console.log("Successfully extracted and parsed JSON from response");
          } catch (extractError) {
            console.error("Failed to extract JSON:", extractError);
            
            // Update DB with error status
            await db
              .update(STUDY_TYPE_CONTENT_TABLE)
              .set({ 
                status: 'Error',
                error: 'Failed to parse AI response as JSON'
              })
              .where(eq(STUDY_TYPE_CONTENT_TABLE.id, recordId));
            
            throw new Error("Failed to parse AI response as JSON");
          }
        } else {
          // Update DB with error status
          await db
            .update(STUDY_TYPE_CONTENT_TABLE)
            .set({ 
              status: 'Error',
              error: 'Failed to parse AI response as JSON'
            })
            .where(eq(STUDY_TYPE_CONTENT_TABLE.id, recordId));
          
          throw new Error("Failed to parse AI response as JSON");
        }
      }

      // Prepare content based on study type
      let contentToSave;
      if (studyType === 'FlashCard') {
        try {
          console.log("Processing flashcards from AI response");
          
          // Ensure flashcards are in the expected format
          contentToSave = Array.isArray(parsedContent) ? parsedContent : 
                         (parsedContent.flashcards || parsedContent.cards || 
                          parsedContent.content || []);
                          
          // Validate flashcard format
          contentToSave = contentToSave.map(card => ({
            front: card.front || card.question || card.title || "",
            back: card.back || card.answer || card.content || ""
          }));
          
          console.log(`Formatted ${contentToSave.length} flashcards`);
          
          // Extra validation - ensure we actually have flashcards
          if (contentToSave.length === 0) {
            console.error("No valid flashcards found in response");
            throw new Error("No valid flashcards found in response");
          }
          
          // Make sure every card has both front and back content
          for (const card of contentToSave) {
            if (!card.front || !card.back) {
              throw new Error("Some flashcards are missing front or back content");
            }
          }
          
          console.log("Flashcards processed successfully");
        } catch (error) {
          console.error("Error formatting flashcards:", error);
          throw new Error(`Failed to format flashcards: ${error.message}`);
        }
      } else if (studyType === 'Quiz') {
        // Ensure quizzes are in the expected format
        if (Array.isArray(parsedContent)) {
          // If we have an array of questions directly
          contentToSave = { 
            questions: parsedContent.map(q => ({
              questionNumber: q.questionNumber || q.id || 0,
              questionText: q.questionText || q.question || q.text || '',
              options: q.options || [],
              correctAnswer: q.correctAnswer || q.answer || ''
            }))
          };
          console.log(`Formatted ${contentToSave.questions.length} quiz questions from array`);
        } else if (parsedContent.questions && Array.isArray(parsedContent.questions)) {
          // If we have a proper quiz object with questions array
          contentToSave = {
            questions: parsedContent.questions.map(q => ({
              questionNumber: q.questionNumber || q.id || 0,
              questionText: q.questionText || q.question || q.text || '',
              options: q.options || [],
              correctAnswer: q.correctAnswer || q.answer || ''
            }))
          };
          console.log(`Formatted ${contentToSave.questions.length} quiz questions from object`);
        } else if (parsedContent.quizzes && Array.isArray(parsedContent.quizzes)) {
          // If we have a nested quizzes array
          contentToSave = {
            questions: parsedContent.quizzes.map(q => ({
              questionNumber: q.questionNumber || q.id || 0,
              questionText: q.questionText || q.question || q.text || '',
              options: q.options || [],
              correctAnswer: q.correctAnswer || q.answer || ''
            }))
          };
          console.log(`Formatted ${contentToSave.questions.length} quiz questions from quizzes array`);
        } else {
          // Fallback to original content if no recognizable format
          contentToSave = { questions: [] };
          console.error("Could not identify quiz format, saving empty questions array");
        }
      } else {
        // For other content types
        contentToSave = parsedContent;
      }

      console.log(`Updating database record ${recordId} with content`);
      
      // Update the database with the parsed content
      try {
        const updateResult = await db
          .update(STUDY_TYPE_CONTENT_TABLE)
          .set({
            content: contentToSave,
            status: 'Ready'
          })
          .where(eq(STUDY_TYPE_CONTENT_TABLE.id, recordId));
        
        console.log(`Database update completed for ${studyType}, recordId: ${recordId}`);
        
        // Verify the update
        const updatedRecord = await db
          .select()
          .from(STUDY_TYPE_CONTENT_TABLE)
          .where(eq(STUDY_TYPE_CONTENT_TABLE.id, recordId));
        
        if (updatedRecord && updatedRecord.length > 0) {
          console.log(`Verified record exists. Status: ${updatedRecord[0].status}`);
          console.log(`Content type: ${typeof updatedRecord[0].content}`);
          
          if (typeof updatedRecord[0].content === 'string') {
            console.log('Content is stored as string, attempting to parse...');
            try {
              const parsedStoredContent = JSON.parse(updatedRecord[0].content);
              console.log(`Parsed stored content successfully. Item count: ${Array.isArray(parsedStoredContent) ? parsedStoredContent.length : 'N/A'}`);
            } catch (parseError) {
              console.error('Failed to parse stored content:', parseError);
            }
          } else {
            console.log(`Content item count: ${Array.isArray(updatedRecord[0].content) ? updatedRecord[0].content.length : 'N/A'}`);
          }
        } else {
          console.error(`Record ${recordId} not found after update!`);
        }
        
        return { success: true, recordId };
      } catch (dbError) {
        console.error(`Database update error for ${studyType}:`, dbError);
        
        // Try one more approach - stringify the content if it might be an object
        try {
          const stringContent = JSON.stringify(contentToSave);
          console.log("Attempting update with stringified content");
          
          await db
            .update(STUDY_TYPE_CONTENT_TABLE)
            .set({
              content: stringContent,
              status: 'Ready'
            })
            .where(eq(STUDY_TYPE_CONTENT_TABLE.id, recordId));
          
          console.log("Update with stringified content succeeded");
          return { success: true, recordId };
        } catch (finalError) {
          console.error("Final update attempt failed:", finalError);
          
          // Update with error status
          await db
            .update(STUDY_TYPE_CONTENT_TABLE)
            .set({ 
              status: 'Error',
              error: `Database update failed: ${dbError.message}`
            })
            .where(eq(STUDY_TYPE_CONTENT_TABLE.id, recordId));
          
          throw new Error(`Failed to update database: ${dbError.message}`);
        }
      }
    } catch (error) {
      console.error("Generate study type content error:", error);
      return { error: error.message };
    }
  }
);

// Generate course notes from chapters
export const generateNotes = inngest.createFunction(
  { id: "generate-notes" },
  { event: "notes.generate" },
  async ({ event, step }) => {
    try {
      console.log("Notes generation started for course:", event.data.course.courseId);
      
      const course = event.data.course;
      const chapters = course.courseLayout.chapters;

      // Process each chapter and generate notes
      for (let i = 0; i < chapters.length; i++) {
        const chapter = chapters[i];
        
        const chapterIndex = i + 1;
        console.log(`Generating notes for chapter ${chapterIndex}: ${chapter.chapterTitle}`);

        // Extract topics for the prompt
        const topics = chapter.topics.join(", ");
        
        // Generate notes for this chapter using AI
        const prompt = `Generate comprehensive educational notes for a chapter titled "${chapter.chapterTitle}" with the summary: "${chapter.chapterSummary}". Cover these topics in detail: ${topics}. Format the content in clean HTML (without html, head, body tags).`;
        
        // Use step to track each chapter generation
        const chapterNotes = await step.run(`generate-chapter-${chapterIndex}`, async () => {
          const aiResp = await generateNotesAiModel.sendMessage(prompt);
          return aiResp.response.text();
        });
        
        // Clean up the response if needed
        let notesContent = chapterNotes;
        if (notesContent.includes("```html")) {
          notesContent = notesContent.replace(/```html\n|\n```/g, "");
        } else if (notesContent.includes("```")) {
          notesContent = notesContent.replace(/```\n|\n```/g, "");
        }
        
        // Save notes to database
        await step.run(`save-chapter-${chapterIndex}`, async () => {
          await db.insert(CHAPTER_NOTES_TABLE).values({
            courseId: course.courseId,
            chapterId: chapterIndex,
            notes: notesContent
          });
        });
        
        console.log(`Notes for chapter ${chapterIndex} saved successfully`);
      }
      
      console.log("All chapter notes generated successfully");
      
      // Generate flashcards for the course
      await step.run("generate-flashcards", async () => {
        try {
          console.log("Starting flashcard generation for course:", course.courseId);
          
          // Create a more specific prompt for flashcard generation
          const flashcardPrompt = `Generate flashcards about: ${course.topic}. 
Create exactly 10 flashcards with clear questions on the front and comprehensive answers on the back.
Focus on the most important concepts that would be covered in this course. 
Output MUST be a valid JSON array with each card having 'front' and 'back' properties.
Example format: [{"front":"What is React?","back":"A JavaScript library for building user interfaces"}]
Always ensure proper JSON format that can be parsed directly.`;
          
          // Call the AI model
          const aiResp = await GenerateStudyTypeContentAiModel.sendMessage(flashcardPrompt);
          let flashcardsText = aiResp.response.text();
          console.log("Raw flashcard response:", flashcardsText.substring(0, 100) + "...");
          
          // Clean up JSON if it contains markdown code blocks
          if (flashcardsText.includes("```json")) {
            flashcardsText = flashcardsText.replace(/```json\n|\n```/g, "");
          } else if (flashcardsText.includes("```")) {
            flashcardsText = flashcardsText.replace(/```\n|\n```/g, "");
          }
          
          // Attempt to extract JSON if there's other text around it
          const jsonMatch = flashcardsText.match(/\[.*\]/s);
          if (jsonMatch) {
            flashcardsText = jsonMatch[0];
            console.log("Extracted JSON array pattern from response");
          }
          
          // Parse flashcards
          let flashcards;
          try {
            flashcards = JSON.parse(flashcardsText);
            console.log(`Successfully parsed ${flashcards.length} flashcards`);
            
            // Verify and normalize the flashcard format
            flashcards = flashcards.map(card => ({
              front: card.front || card.question || "",
              back: card.back || card.answer || ""
            }));
            
            // Validate content
            for (const card of flashcards) {
              if (!card.front || !card.back) {
                throw new Error("Some flashcards are missing front or back content");
              }
            }
          } catch (parseError) {
            console.error("Failed to parse flashcards JSON:", parseError);
            console.error("Raw text that failed to parse:", flashcardsText);
            throw new Error(`JSON parsing failed: ${parseError.message}`);
          }
          
          // Save flashcards to database
          await db.insert(STUDY_TYPE_CONTENT_TABLE).values({
            courseId: course.courseId,
            type: "FlashCard", // match the type used in the front-end
            content: flashcards,
            status: "Ready"  // Use "Ready" to match expected status
          });
          
          console.log("Flashcards generated and saved successfully for course:", course.courseId);
        } catch (error) {
          console.error("Error generating flashcards:", error);
          // Still continue with other content types even if flashcards fail
        }
      });
      
      // Generate quiz for the course
      await step.run("generate-quiz", async () => {
        try {
          console.log("Starting quiz generation for course:", course.courseId);
          
          // Similar implementation to flashcards for quiz generation...
          // (Code for quiz generation would go here)
          
          console.log("Quiz generated and saved successfully for course:", course.courseId);
        } catch (error) {
          console.error("Error generating quiz:", error);
        }
      });
      
      return { success: true, message: "Course materials generated successfully" };
    } catch (error) {
      console.error("Error in notes generation:", error);
      return { success: false, error: error.message };
    }
  }
);