import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        maxlength: [60, 'Name cannot be more than 60 characters'],
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email',
        ],
    },
    password: {
        type: String,
        required: false,
        select: false, // Don't return password by default
    },
    image: {
        type: String,
    },
    // Gamification & Progress Fields
    xp: {
        type: Number,
        default: 0,
    },
    level: {
        type: Number,
        default: 1,
    },
    streak: {
        type: Number,
        default: 0,
    },
    lastLoginDate: {
        type: String, // Storing as YYYY-MM-DD string for easy comparison
    },
    completedModules: {
        type: [String], // Array of module IDs
        default: [],
    },
    completedRoadmaps: {
        type: [String], // Array of roadmap IDs
        default: [],
    },
    achievements: {
        type: [String],
        default: [],
    },
    skills: {
        type: [{
            subject: String,
            score: Number
        }],
        default: [
            { subject: 'Frontend', score: 50 },
            { subject: 'Backend', score: 30 },
            { subject: 'Design', score: 20 },
            { subject: 'DevOps', score: 10 },
            { subject: 'AI/ML', score: 10 },
            { subject: 'Mobile', score: 10 }
        ]
    },
    portfolioProjects: {
        type: [{
            title: String,
            desc: String,
            tags: [String],
            color: String,
            unlockedAt: { type: Date, default: Date.now },
            progress: { type: Number, default: 0 }, // 0 to 100
            status: { type: String, default: 'active', enum: ['active', 'completed'] }
        }],
        default: []
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
