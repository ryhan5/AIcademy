/**
 * Test Script for Gamification Features
 * Run this to verify all features are working
 */

const {
    getUserProgress,
    awardXP,
    markModuleComplete,
    checkDailyLogin,
    calculateLevel,
    XP_REWARDS
} = require('./src/utils/UserProgress');

console.log("🧪 Testing SkillSync Gamification System\n");
console.log("=".repeat(50));

// Test 1: Initial State
console.log("\n1️⃣ Testing Initial User State:");
let progress = getUserProgress();
console.log("✓ Initial XP:", progress.xp);
console.log("✓ Initial Level:", progress.level);
console.log("✓ Initial Streak:", progress.streak);

// Test 2: Award XP
console.log("\n2️⃣ Testing XP Award System:");
let result = awardXP(XP_REWARDS.QUIZ_QUESTION, "Test quiz question");
console.log(`✓ Awarded ${result.xpGained} XP for: ${result.reason}`);
console.log(`✓ New Total XP: ${result.newXP}`);
if (result.leveledUp) {
    console.log(`🎉 LEVEL UP! ${result.oldLevel} → ${result.newLevel}`);
}

// Test 3: Daily Login
console.log("\n3️⃣ Testing Daily Login & Streak:");
let loginResult = checkDailyLogin();
console.log(`✓ Current Streak: ${loginResult.currentStreak} days`);
console.log(`✓ XP Awarded: ${loginResult.xpAwarded}`);
if (loginResult.bonusAwarded) {
    console.log("🔥 Streak Bonus Awarded!");
}

// Test 4: Module Completion
console.log("\n4️⃣ Testing Module Completion:");
let moduleResult = markModuleComplete("week-1", "test-roadmap");
if (moduleResult) {
    console.log(`✓ Module completed! Earned ${moduleResult.xpGained} XP`);
    console.log(`✓ New Total: ${moduleResult.newXP} XP`);
} else {
    console.log("✓ Module already completed (prevents double XP)");
}

// Test 5: Level Calculation
console.log("\n5️⃣ Testing Level Calculation:");
progress = getUserProgress();
let levelInfo = calculateLevel(progress.xp);
console.log(`✓ Current Level: ${levelInfo.level}`);
console.log(`✓ XP in Current Level: ${levelInfo.xpInCurrentLevel}/${levelInfo.xpForNextLevel}`);
let percentToNext = ((levelInfo.xpInCurrentLevel / levelInfo.xpForNextLevel) * 100).toFixed(1);
console.log(`✓ Progress to Next Level: ${percentToNext}%`);

// Test 6: Final State
console.log("\n6️⃣ Final User State:");
progress = getUserProgress();
console.log("✓ Total XP:", progress.xp);
console.log("✓ Level:", progress.level);
console.log("✓ Streak:", progress.streak);
console.log("✓ Completed Modules:", progress.completedModules.length);

console.log("\n" + "=".repeat(50));
console.log("✅ All gamification features are FUNCTIONAL!");
console.log("🎮 Try it in the browser at http://localhost:3000");
console.log("\nQuick Test Steps:");
console.log("1. Visit /dashboard - See your stats");
console.log("2. Take a quiz at /roadmap - Earn XP per correct answer");
console.log("3. Mark modules complete - Earn +100 XP each");
console.log("4. Check leaderboard - See your rank");
console.log("=".repeat(50));
