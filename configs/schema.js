// Correct import for PostgreSQL
import { pgTable, serial, varchar, boolean, json, text, integer, timestamp } from "drizzle-orm/pg-core";


// User table definition

export const USER_TABLE = pgTable('users', {
    id: serial('id').primaryKey(),
    name: varchar('name').notNull(),
    email: varchar('email').notNull().unique(),
    isMember: boolean().default(false),
    customerId:varchar()
});

// Study material table definition
export const STUDY_MATERIAL_TABLE = pgTable('studyMaterial', {
    id: serial().primaryKey(),
    courseId: varchar().notNull(),
    courseType: varchar().notNull(),
    topic: varchar().notNull(),
    difficultyLevel: varchar().default('Easy'),
    courseLayout: json(), // Correct type for JSON data
    createdBy: varchar().notNull(),
    status:varchar().default('Generating')
});



export const CHAPTER_NOTES_TABLE=pgTable('chapterNotes',{
    id:serial().primaryKey(),
    courseId:varchar().notNull(),
    chapterId:integer().notNull(),
    notes:text()
});

export const STUDY_TYPE_CONTENT_TABLE = pgTable('studyTypeContent', {
    id: serial().primaryKey(),
    courseId: varchar().notNull(),
    type: varchar().notNull(),
    content: json(),
    status: varchar().default('Generating'),
    
});


export const PAYMENT_RECORD_TABLE=pgTable('paymentRecord',{
    id:serial().primaryKey(),
    customerId:varchar(),
    sessionId:varchar(),
})

// User skills table definition
export const USER_SKILLS_TABLE = pgTable('userSkills', {
    id: serial('id').primaryKey(),
    userId: varchar('userId').notNull(),
    skill: varchar('skill').notNull(),
    proficiency: integer('proficiency').default(1), // 1-5 scale
    yearsExperience: integer('yearsExperience').default(0),
    isVerified: boolean('isVerified').default(false),
    dateAdded: timestamp('dateAdded').defaultNow(),
    lastUpdated: timestamp('lastUpdated').defaultNow()
});