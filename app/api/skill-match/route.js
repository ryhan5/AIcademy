import { NextResponse } from 'next/server';
import { db } from "@/configs/db";
import { USER_SKILLS_TABLE } from "@/configs/schema";
import { eq } from 'drizzle-orm';

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, jobRequirements } = body;

    if (!userId) {
      return NextResponse.json({ 
        error: 'Missing userId parameter' 
      }, { status: 400 });
    }

    if (!jobRequirements || !Array.isArray(jobRequirements) || jobRequirements.length === 0) {
      return NextResponse.json({ 
        error: 'Job requirements must be provided as a non-empty array' 
      }, { status: 400 });
    }

    // Fetch user skills
    const userSkills = await db
      .select()
      .from(USER_SKILLS_TABLE)
      .where(eq(USER_SKILLS_TABLE.userId, userId));

    if (!userSkills || userSkills.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No skills found for this user',
        matchScore: 0,
        matches: [],
        gaps: jobRequirements
      });
    }

    // Extract skill names and create a map for quick lookup
    const userSkillNames = userSkills.map(skill => skill.skill.toLowerCase());
    const userSkillMap = Object.fromEntries(
      userSkills.map(skill => [skill.skill.toLowerCase(), skill])
    );

    // Calculate matches and gaps
    const matches = [];
    const gaps = [];
    let totalScore = 0;
    
    // Process each job requirement
    jobRequirements.forEach(req => {
      // Handle both simple string requirements and objects with attributes
      const reqName = typeof req === 'string' ? req : req.skill;
      const reqImportance = typeof req === 'object' && req.importance ? req.importance : 1;
      const reqLevel = typeof req === 'object' && req.level ? req.level : 1;

      const normalizedReqName = reqName.toLowerCase();
      
      // Check if user has this skill
      if (userSkillNames.includes(normalizedReqName)) {
        const userSkill = userSkillMap[normalizedReqName];
        const userLevel = userSkill.proficiency || 1;
        
        // Calculate match quality (0.5 to 1.5 based on proficiency difference)
        const levelDifference = userLevel - reqLevel;
        const matchQuality = Math.max(0.5, Math.min(1.5, 1 + (levelDifference * 0.1)));
        
        // Add to match score based on requirement importance and match quality
        const score = reqImportance * matchQuality;
        totalScore += score;
        
        matches.push({
          skill: reqName,
          userLevel,
          requiredLevel: reqLevel,
          importance: reqImportance,
          score
        });
      } else {
        // Add to gaps
        gaps.push({
          skill: reqName,
          requiredLevel: reqLevel,
          importance: reqImportance
        });
      }
    });
    
    // Calculate overall match percentage
    const maxPossibleScore = jobRequirements.reduce((total, req) => {
      const importance = typeof req === 'object' && req.importance ? req.importance : 1;
      return total + (importance * 1.5); // Max possible score with highest match quality
    }, 0);
    
    const matchPercentage = Math.round((totalScore / maxPossibleScore) * 100);
    
    // Generate recommendations based on gaps
    const recommendations = gaps.map(gap => {
      return {
        skill: gap.skill,
        reason: `This skill is ${gap.importance > 1 ? 'highly important' : 'important'} for this role`,
        resources: [
          {
            type: "course",
            name: `Learn ${gap.skill}`,
            url: `#/courses/${gap.skill.toLowerCase().replace(/\s+/g, '-')}`
          }
        ]
      };
    }).sort((a, b) => b.importance - a.importance);
    
    return NextResponse.json({
      success: true,
      matchScore: matchPercentage,
      matches,
      gaps,
      recommendations
    });
  } catch (error) {
    console.error('Error matching skills:', error);
    return NextResponse.json({ 
      error: 'Failed to match skills' 
    }, { status: 500 });
  }
} 