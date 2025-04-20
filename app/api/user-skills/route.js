import { NextResponse } from 'next/server';
import { db } from "@/configs/db";
import { USER_SKILLS_TABLE } from "@/configs/schema";
import { eq, and, sql } from 'drizzle-orm';

// GET endpoint - Fetch all skills for a user
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
    }
    
    // Query the database for user skills
    const userSkills = await db
      .select()
      .from(USER_SKILLS_TABLE)
      .where(eq(USER_SKILLS_TABLE.userId, userId));
    
    return NextResponse.json({
      success: true,
      skills: userSkills
    });
  } catch (error) {
    console.error('Error fetching user skills:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch user skills' 
    }, { status: 500 });
  }
}

// POST endpoint - Add new skills for a user
export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, skills } = body;
    
    if (!userId) {
      return NextResponse.json({ 
        error: 'Missing userId parameter' 
      }, { status: 400 });
    }
    
    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      return NextResponse.json({ 
        success: true,
        message: 'No skills to add',
        addedCount: 0
      });
    }
    
    // Get existing skills to avoid duplicates
    let existingSkillNames = [];
    try {
      const existingSkills = await db
        .select({ skill: USER_SKILLS_TABLE.skill })
        .from(USER_SKILLS_TABLE)
        .where(eq(USER_SKILLS_TABLE.userId, userId));
      
      existingSkillNames = existingSkills.map(s => (s.skill || '').toLowerCase());
    } catch (dbError) {
      console.warn('Error fetching existing skills, proceeding with insert:', dbError);
    }
    
    // Filter out skills that user already has and ensure valid skills
    const newSkills = skills.filter(skill => {
      if (!skill) return false;
      const skillName = typeof skill === 'string' ? skill : (skill.skill || '');
      if (!skillName.trim()) return false;
      return !existingSkillNames.includes(skillName.toLowerCase());
    });
    
    if (newSkills.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No new skills to add',
        addedCount: 0
      });
    }
    
    // Prepare skills for insertion with null/undefined protection
    const skillsToInsert = newSkills.map(skill => {
      if (typeof skill === 'string') {
        return {
          userId,
          skill: skill.trim(),
          proficiency: 1,
          yearsExperience: 0,
          isVerified: false,
          dateAdded: new Date(),
          lastUpdated: new Date()
        };
      } else {
        return {
          userId,
          skill: (skill.skill || '').trim(),
          proficiency: parseInt(skill.proficiency || 1),
          yearsExperience: parseInt(skill.yearsExperience || 0),
          isVerified: Boolean(skill.isVerified),
          dateAdded: new Date(),
          lastUpdated: new Date()
        };
      }
    }).filter(item => item.skill && item.skill.length > 0);
    
    if (skillsToInsert.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No valid skills to add',
        addedCount: 0
      });
    }
    
    // Insert new skills
    try {
      await db.insert(USER_SKILLS_TABLE).values(skillsToInsert);
    
      return NextResponse.json({
        success: true,
        message: `Added ${skillsToInsert.length} new skills`,
        addedSkills: skillsToInsert.map(s => s.skill)
      });
    } catch (insertError) {
      console.error('Database insert error:', insertError);
      return NextResponse.json({ 
        error: 'Failed to add skills to database',
        details: insertError.message 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error processing skill addition:', error);
    return NextResponse.json({ 
      error: 'Failed to process skill addition request',
      details: error.message 
    }, { status: 500 });
  }
}

// PUT endpoint - Update existing skills
export async function PUT(request) {
  try {
    const body = await request.json();
    const { userId, skill, updates } = body;
    
    if (!userId || !skill || !updates) {
      return NextResponse.json({ 
        error: 'Missing userId, skill, or updates parameters' 
      }, { status: 400 });
    }
    
    // Check if skill exists
    const existingSkill = await db
      .select()
      .from(USER_SKILLS_TABLE)
      .where(
        and(
          eq(USER_SKILLS_TABLE.userId, userId),
          eq(USER_SKILLS_TABLE.skill, skill)
        )
      )
      .limit(1);
    
    if (existingSkill.length === 0) {
      return NextResponse.json({ 
        error: 'Skill not found for this user' 
      }, { status: 404 });
    }
    
    // Update the skill
    await db
      .update(USER_SKILLS_TABLE)
      .set({
        ...updates,
        lastUpdated: new Date()
      })
      .where(
        and(
          eq(USER_SKILLS_TABLE.userId, userId),
          eq(USER_SKILLS_TABLE.skill, skill)
        )
      );
    
    // Get the updated skill
    const updatedSkill = await db
      .select()
      .from(USER_SKILLS_TABLE)
      .where(
        and(
          eq(USER_SKILLS_TABLE.userId, userId),
          eq(USER_SKILLS_TABLE.skill, skill)
        )
      )
      .limit(1);
    
    return NextResponse.json({
      success: true,
      message: 'Skill updated successfully',
      skill: updatedSkill[0]
    });
  } catch (error) {
    console.error('Error updating skill:', error);
    return NextResponse.json({ 
      error: 'Failed to update skill' 
    }, { status: 500 });
  }
}

// DELETE endpoint - Remove skills
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const skill = searchParams.get('skill');
    
    if (!userId) {
      return NextResponse.json({ 
        error: 'Missing userId parameter' 
      }, { status: 400 });
    }
    
    // If skill parameter is provided, delete specific skill
    if (skill) {
      const result = await db
        .delete(USER_SKILLS_TABLE)
        .where(
          and(
            eq(USER_SKILLS_TABLE.userId, userId),
            eq(USER_SKILLS_TABLE.skill, skill)
          )
        );
      
      return NextResponse.json({
        success: true,
        message: `Skill "${skill}" removed successfully`
      });
    } 
    // If no skill parameter, delete all skills for the user
    else {
      const result = await db
        .delete(USER_SKILLS_TABLE)
        .where(eq(USER_SKILLS_TABLE.userId, userId));
      
      return NextResponse.json({
        success: true,
        message: `All skills removed for user`
      });
    }
  } catch (error) {
    console.error('Error removing skills:', error);
    return NextResponse.json({ 
      error: 'Failed to remove skills' 
    }, { status: 500 });
  }
} 