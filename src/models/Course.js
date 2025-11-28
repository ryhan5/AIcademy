import mongoose from 'mongoose';

const VideoSchema = new mongoose.Schema({
    videoId: String,        // YouTube video ID (e.g., "dQw4w9WgXcQ")
    title: String,          // Video title
    url: String,            // Legacy field (kept for backwards compatibility)
    creator: String,        // Channel name
    searchQuery: String,    // Fallback search query
    duration: String,       // Video duration (e.g., "15min", "1hr")
    thumbnail: String       // Video thumbnail URL
});

const MaterialSchema = new mongoose.Schema({
    title: String,
    type: String,
    url: String
});

const QuizSchema = new mongoose.Schema({
    question: String,
    options: [String],
    correctAnswer: String,
    explanation: String
});

const FlashcardSchema = new mongoose.Schema({
    front: String,
    back: String
});

const ChapterSchema = new mongoose.Schema({
    id: Number,
    title: String,
    description: String,
    videos: [VideoSchema],
    materials: [MaterialSchema], // Keeping for backward compatibility
    flashcards: [FlashcardSchema],
    keyConcepts: [String],
    quiz: [QuizSchema]
});

const CourseSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    topic: {
        type: String,
        required: true
    },
    title: String,
    description: String,
    chapters: [ChapterSchema],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Force model recompilation in development to handle schema changes
if (process.env.NODE_ENV === 'development') {
    delete mongoose.models.Course_v2;
}

export default mongoose.models.Course_v2 || mongoose.model('Course_v2', CourseSchema);
