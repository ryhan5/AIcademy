/**
 * UserProgress - Central utility for managing gamification features
 * Handles XP, levels, streaks, and progress tracking using localStorage
 */

const STORAGE_KEY = 'skillsync_user_progress';

// XP required for each level (multiplier-based progression)
const XP_PER_LEVEL = (level) => level * 200;

// XP rewards for different actions
export const XP_REWARDS = {
    QUIZ_QUESTION: 10,
    QUIZ_COMPLETE: 50,
    WEEK_COMPLETE: 100,
    ROADMAP_COMPLETE: 500,
    DAILY_LOGIN: 20,
    STREAK_7_DAYS: 100,
    STREAK_30_DAYS: 500,
};

// Initialize default user progress
const getDefaultProgress = () => ({
    userId: 'local',
    xp: 0,
    level: 1,
    streak: 0,
    lastLoginDate: null,
    completedModules: [],
    completedRoadmaps: [],
    achievements: [],
    totalStudyTime: 0,
    isVerified: false,
    createdAt: new Date().toISOString(),
});

/**
 * Get current user progress from localStorage
 */
export const getUserProgress = () => {
    if (typeof window === 'undefined') return getDefaultProgress();

    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
        const defaultProgress = getDefaultProgress();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultProgress));
        return defaultProgress;
    }

    return JSON.parse(stored);
};

/**
 * Save user progress to localStorage
 */
const saveProgress = (progress) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
};

/**
 * Calculate level from XP
 */
export const calculateLevel = (xp) => {
    let level = 1;
    let requiredXP = 0;

    while (xp >= requiredXP + XP_PER_LEVEL(level)) {
        requiredXP += XP_PER_LEVEL(level);
        level++;
    }

    return { level, xpInCurrentLevel: xp - requiredXP, xpForNextLevel: XP_PER_LEVEL(level) };
};

/**
 * Award XP to user and handle level ups
 * Returns: { newXP, leveledUp, newLevel, xpGained }
 */
export const awardXP = (amount, reason = 'Activity completed') => {
    const progress = getUserProgress();
    const oldLevel = progress.level;
    const newXP = progress.xp + amount;

    const { level: newLevel } = calculateLevel(newXP);
    const leveledUp = newLevel > oldLevel;

    progress.xp = newXP;
    progress.level = newLevel;

    saveProgress(progress);

    return {
        newXP,
        leveledUp,
        newLevel,
        oldLevel,
        xpGained: amount,
        reason,
    };
};

/**
 * Verify user (Capstone completion)
 */
export const verifyUser = () => {
    const progress = getUserProgress();
    if (!progress.isVerified) {
        progress.isVerified = true;
        saveProgress(progress);
        return true;
    }
    return false;
};

/**
 * Check if user is verified
 */
export const isUserVerified = () => {
    const progress = getUserProgress();
    return !!progress.isVerified;
};

/**
 * Mark a module/week as complete
 */
export const markModuleComplete = (moduleId, roadmapId = 'current') => {
    const progress = getUserProgress();

    const completionKey = `${roadmapId}_${moduleId}`;
    if (!progress.completedModules.includes(completionKey)) {
        progress.completedModules.push(completionKey);
        saveProgress(progress);

        // Award XP for completing the module
        return awardXP(XP_REWARDS.WEEK_COMPLETE, `Completed module: ${moduleId}`);
    }

    return null;
};

/**
 * Check if a module is completed
 */
export const isModuleComplete = (moduleId, roadmapId = 'current') => {
    const progress = getUserProgress();
    const completionKey = `${roadmapId}_${moduleId}`;
    return progress.completedModules.includes(completionKey);
};

/**
 * Mark entire roadmap as complete
 */
export const markRoadmapComplete = (roadmapId) => {
    const progress = getUserProgress();

    if (!progress.completedRoadmaps.includes(roadmapId)) {
        progress.completedRoadmaps.push(roadmapId);
        saveProgress(progress);

        return awardXP(XP_REWARDS.ROADMAP_COMPLETE, 'Completed full roadmap!');
    }

    return null;
};

/**
 * Check and update daily login streak
 * Returns: { streakContinued, currentStreak, xpAwarded, bonusAwarded }
 */
export const checkDailyLogin = () => {
    const progress = getUserProgress();
    const today = new Date().toISOString().split('T')[0];
    const lastLogin = progress.lastLoginDate;

    let streakContinued = false;
    let bonusAwarded = false;
    let xpAwarded = 0;

    if (lastLogin !== today) {
        // Check if streak continues
        if (lastLogin) {
            const lastDate = new Date(lastLogin);
            const todayDate = new Date(today);
            const dayDiff = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));

            if (dayDiff === 1) {
                // Streak continues
                progress.streak += 1;
                streakContinued = true;
            } else if (dayDiff > 1) {
                // Streak broken
                progress.streak = 1;
            }
        } else {
            // First login
            progress.streak = 1;
        }

        progress.lastLoginDate = today;

        // Award daily login XP
        const loginReward = awardXP(XP_REWARDS.DAILY_LOGIN, 'Daily login');
        xpAwarded = loginReward.xpGained;

        // Check for streak bonuses
        if (progress.streak === 7) {
            const bonus = awardXP(XP_REWARDS.STREAK_7_DAYS, '7-day streak bonus!');
            xpAwarded += bonus.xpGained;
            bonusAwarded = true;
        } else if (progress.streak === 30) {
            const bonus = awardXP(XP_REWARDS.STREAK_30_DAYS, '30-day streak bonus!');
            xpAwarded += bonus.xpGained;
            bonusAwarded = true;
        }

        saveProgress(progress);
    }

    return {
        streakContinued,
        currentStreak: progress.streak,
        xpAwarded,
        bonusAwarded,
    };
};

/**
 * Get leaderboard data (simulated for localStorage)
 * In a real app, this would fetch from a server
 */
export const getLeaderboardData = () => {
    const currentUser = getUserProgress();

    // For MVP, create simulated leaderboard with current user
    const simulatedUsers = [
        { userId: 'user1', username: 'CodeMaster', xp: 2500, level: 13 },
        { userId: 'user2', username: 'DevPro', xp: 1800, level: 9 },
        { userId: 'user3', username: 'LearningNinja', xp: 1500, level: 8 },
        { userId: currentUser.userId, username: 'You', xp: currentUser.xp, level: currentUser.level },
        { userId: 'user4', username: 'StudyBuddy', xp: 1200, level: 6 },
        { userId: 'user5', username: 'QuickLearner', xp: 900, level: 5 },
    ];

    // Sort by XP
    const sorted = simulatedUsers.sort((a, b) => b.xp - a.xp);

    // Find user rank
    const userRank = sorted.findIndex(u => u.userId === currentUser.userId) + 1;

    return {
        topUsers: sorted.slice(0, 10),
        userRank,
        totalUsers: sorted.length,
    };
};

/**
 * Reset all progress (for testing/debugging)
 */
export const resetProgress = () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
    return getDefaultProgress();
};
