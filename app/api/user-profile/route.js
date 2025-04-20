import { NextResponse } from 'next/server';

// In a real app, this would interact with a database
// For now, we'll use a simple in-memory store as an example
const profiles = new Map();

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  
  if (!userId) {
    return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
  }
  
  // Get user profile from our "database"
  const profile = profiles.get(userId) || null;
  
  if (!profile) {
    return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
  }
  
  return NextResponse.json(profile);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, profile } = body;
    
    if (!userId || !profile) {
      return NextResponse.json({ 
        error: 'Missing userId or profile data' 
      }, { status: 400 });
    }
    
    // In a real app, validate profile data
    // For this example, we'll assume the profile has a basic structure with skills
    if (!profile.skills || !Array.isArray(profile.skills)) {
      profile.skills = [];
    }
    
    // Save to our "database"
    profiles.set(userId, {
      ...profile,
      updatedAt: new Date().toISOString()
    });
    
    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      profile: profiles.get(userId)
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ 
      error: 'Failed to update profile' 
    }, { status: 500 });
  }
}

// Endpoint to specifically add/update skills
export async function PUT(request) {
  try {
    const body = await request.json();
    const { userId, skills } = body;
    
    if (!userId) {
      return NextResponse.json({ 
        error: 'Missing userId parameter' 
      }, { status: 400 });
    }
    
    if (!skills || !Array.isArray(skills)) {
      return NextResponse.json({ 
        error: 'Skills must be provided as an array' 
      }, { status: 400 });
    }
    
    // Get existing profile or create new one
    let profile = profiles.get(userId);
    if (!profile) {
      profile = { 
        userId,
        name: '',
        email: '',
        skills: [],
        experience: [],
        education: [],
        createdAt: new Date().toISOString()
      };
    }
    
    // Update skills
    // Deduplicate skills (case-insensitive)
    const normalizedExistingSkills = profile.skills.map(s => s.toLowerCase());
    const uniqueNewSkills = skills.filter(
      skill => !normalizedExistingSkills.includes(skill.toLowerCase())
    );
    
    // Combine existing and new skills
    profile.skills = [...profile.skills, ...uniqueNewSkills];
    profile.updatedAt = new Date().toISOString();
    
    // Save to our "database"
    profiles.set(userId, profile);
    
    return NextResponse.json({
      success: true,
      message: `Added ${uniqueNewSkills.length} new skills`,
      profile
    });
  } catch (error) {
    console.error('Error updating skills:', error);
    return NextResponse.json({ 
      error: 'Failed to update skills' 
    }, { status: 500 });
  }
}

// Endpoint to remove skills
export async function DELETE(request) {
  try {
    const body = await request.json();
    const { userId, skillsToRemove } = body;
    
    if (!userId) {
      return NextResponse.json({ 
        error: 'Missing userId parameter' 
      }, { status: 400 });
    }
    
    if (!skillsToRemove || !Array.isArray(skillsToRemove) || skillsToRemove.length === 0) {
      return NextResponse.json({ 
        error: 'Skills to remove must be provided as a non-empty array' 
      }, { status: 400 });
    }
    
    // Get existing profile
    const profile = profiles.get(userId);
    if (!profile) {
      return NextResponse.json({ 
        error: 'User profile not found' 
      }, { status: 404 });
    }
    
    // Convert skills to remove to lowercase for case-insensitive comparison
    const skillsToRemoveLower = skillsToRemove.map(s => s.toLowerCase());
    
    // Filter out skills to remove
    const originalSkillCount = profile.skills.length;
    profile.skills = profile.skills.filter(
      skill => !skillsToRemoveLower.includes(skill.toLowerCase())
    );
    
    const removedCount = originalSkillCount - profile.skills.length;
    profile.updatedAt = new Date().toISOString();
    
    // Save to our "database"
    profiles.set(userId, profile);
    
    return NextResponse.json({
      success: true,
      message: `Removed ${removedCount} skills`,
      profile
    });
  } catch (error) {
    console.error('Error removing skills:', error);
    return NextResponse.json({ 
      error: 'Failed to remove skills' 
    }, { status: 500 });
  }
} 