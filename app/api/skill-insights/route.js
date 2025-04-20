import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/configs/db";
import { USER_SKILLS_TABLE } from "@/configs/schema";
import { eq } from 'drizzle-orm';
import { fetchTrendingSkills, fetchMarketData } from "@/app/services/job-data-service";

// Initialize Gemini client
const genAI = process.env.NEXT_PUBLIC_GEMINI_API_KEY 
  ? new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY)
  : null;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const currentRole = searchParams.get('currentRole');
    const goalRole = searchParams.get('goalRole');
    
    if (!userId) {
      return NextResponse.json({ 
        error: 'Missing userId parameter' 
      }, { status: 400 });
    }
    
    // Fetch user skills - with proper error handling
    let userSkills = [];
    try {
      userSkills = await db
        .select()
        .from(USER_SKILLS_TABLE)
        .where(eq(USER_SKILLS_TABLE.userId, userId));
    } catch (dbError) {
      console.error('Database error fetching user skills:', dbError);
      // Continue with empty skills array instead of failing
    }
    
    // If we have no skills but the request included skills in the currentRole
    // Generate mock insights rather than returning an error
    if (!userSkills || userSkills.length === 0) {
      console.log(`No skills found in database for user ${userId}, generating mock insights`);
      
      // Create mock skills from the role if possible
      const mockSkills = [];
      if (currentRole) {
        // Extract potential skills from the role title
        const roleParts = currentRole.toLowerCase().split(/[\s,]+/);
        const techKeywords = [
          'javascript', 'python', 'java', 'react', 'node', 'angular', 'vue',
          'frontend', 'backend', 'fullstack', 'data', 'machine', 'learning',
          'ai', 'developer', 'engineer', 'designer', 'ux', 'ui'
        ];
        
        // Add role-based skills
        techKeywords.forEach(keyword => {
          if (roleParts.includes(keyword) || currentRole.toLowerCase().includes(keyword)) {
            mockSkills.push(keyword);
          }
        });
        
        // Add default skills based on role categories
        if (currentRole.toLowerCase().includes('front')) {
          mockSkills.push('HTML', 'CSS', 'JavaScript');
        } else if (currentRole.toLowerCase().includes('back')) {
          mockSkills.push('APIs', 'Databases', 'Server Management');
        } else if (currentRole.toLowerCase().includes('data')) {
          mockSkills.push('SQL', 'Data Analysis', 'Statistics');
        }
      }
      
      // Ensure we have at least some skills
      if (mockSkills.length === 0) {
        mockSkills.push('Communication', 'Problem Solving', 'Teamwork');
      }
      
      // Create a profile with mock skills
      const mockProfile = {
        skills: [...new Set(mockSkills)], // Remove duplicates
        currentRole: currentRole || 'Not specified',
        goalRole: goalRole || 'Not specified',
        skillProficiencies: Object.fromEntries(
          mockSkills.map(skill => [skill, 3]) // Medium proficiency for mock skills
        ),
        verifiedSkills: []
      };
      
      // Generate mock insights
      const mockInsights = generateMockInsights(mockProfile);
      
      return NextResponse.json({
        success: true,
        profile: mockProfile,
        insights: mockInsights,
        notice: "Using generated mock data as no skills were found for this user"
      });
    }

    // Create a profile object with the user's skills
    const profile = {
      skills: userSkills.map(s => s.skill),
      currentRole: currentRole || 'Not specified',
      goalRole: goalRole || 'Not specified',
      skillProficiencies: Object.fromEntries(
        userSkills.map(s => [s.skill, s.proficiency || 1])
      ),
      verifiedSkills: userSkills
        .filter(s => s.isVerified)
        .map(s => s.skill)
    };

    // Enhance the profile with market data - with error handling
    let enhancedProfile;
    try {
      enhancedProfile = await enhanceProfileWithMarketData(profile);
    } catch (marketError) {
      console.error('Error enhancing profile with market data:', marketError);
      enhancedProfile = profile; // Fall back to original profile without market data
    }

    // Generate insights using Gemini
    let insights;
    try {
      insights = await generateSkillInsights(enhancedProfile);
    } catch (insightError) {
      console.error('Error generating AI insights:', insightError);
      insights = generateMockInsights(enhancedProfile); // Fall back to mock insights
    }
    
    return NextResponse.json({
      success: true,
      profile: enhancedProfile,
      insights
    });
  } catch (error) {
    console.error('Error generating skill insights:', error);
    
    // Generate fallback response with mock data
    const fallbackProfile = {
      skills: ['Problem Solving', 'Communication', 'Teamwork'],
      currentRole: 'Professional',
      goalRole: 'Senior Position',
      skillProficiencies: {
        'Problem Solving': 3,
        'Communication': 3,
        'Teamwork': 3
      },
      verifiedSkills: []
    };
    
    return NextResponse.json({ 
      success: true,
      profile: fallbackProfile,
      insights: generateMockInsights(fallbackProfile),
      error: 'Used fallback data due to an error',
      details: error.message
    });
  }
}

// Function to enhance profile with market data
async function enhanceProfileWithMarketData(profile) {
  try {
    // Create a copy of the profile to enhance
    const enhancedProfile = { ...profile };
    
    // Fetch real market data for current and target roles
    const currentRoleData = profile.currentRole !== 'Not specified'
      ? await fetchMarketData(profile.currentRole)
      : null;
    
    const targetRoleData = profile.goalRole !== 'Not specified'
      ? await fetchMarketData(profile.goalRole) 
      : null;
    
    // Determine the relevant category for trending skills
    let category = 'software';
    const roleText = `${profile.currentRole} ${profile.goalRole}`.toLowerCase();
    if (roleText.includes('design') || roleText.includes('ux') || roleText.includes('ui')) {
      category = 'design';
    } else if (roleText.includes('product') || roleText.includes('manager')) {
      category = 'product';
    } else if (roleText.includes('market') || roleText.includes('seo') || roleText.includes('content')) {
      category = 'marketing';
    }
    
    // Fetch trending skills for the determined category
    const trendingSkills = await fetchTrendingSkills(category);
    
    // Add this market data to the profile
    enhancedProfile.marketData = {
      currentRole: currentRoleData,
      targetRole: targetRoleData,
      trendingSkills
    };
    
    return enhancedProfile;
  } catch (error) {
    console.error('Error enhancing profile with market data:', error);
    // Return original profile if enhancement fails
    return profile;
  }
}

// Function to generate insights using Gemini
async function generateSkillInsights(profile) {
  // If Gemini API key is not available or invalid, return mock data
  if (!genAI) {
    console.log('Gemini API client not initialized, returning mock data');
    return generateMockInsights(profile);
  }

  try {
    // Prepare the prompt for Gemini
    const prompt = generatePrompt(profile);
    
    // Call Gemini API
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Parse the JSON output from the model
    try {
      const jsonMatch = text.match(/({[\s\S]*})/);
      const jsonText = jsonMatch ? jsonMatch[0] : text;
      const responseData = JSON.parse(jsonText);
      return responseData;
    } catch (jsonError) {
      console.error('Error parsing JSON from Gemini response:', jsonError);
      console.log('Raw response:', text);
      return generateMockInsights(profile);
    }
  } catch (aiError) {
    console.error('Error calling Gemini API:', aiError);
    return generateMockInsights(profile);
  }
}

function generatePrompt(profile) {
  // Format the user's skills with proficiency levels
  const skillsWithProficiency = profile.skills.map(skill => {
    const proficiency = profile.skillProficiencies[skill] || 1;
    const isVerified = profile.verifiedSkills.includes(skill);
    return `${skill} (Proficiency: ${proficiency}/5${isVerified ? ', Verified' : ''})`;
  }).join('\n- ');

  // Format market data for the prompt
  let marketDataContext = '';
  if (profile.marketData) {
    const { currentRole, targetRole, trendingSkills } = profile.marketData;
    
    if (currentRole) {
      marketDataContext += `
        Current Role Market Data:
        - Average Salary: $${currentRole.averageSalary.toLocaleString()}
        - Required Skills: ${currentRole.topSkills.join(', ')}
        - Market Growth: ${currentRole.demandGrowth}% annually
        - Remote Work: ${currentRole.remotePercentage}% of positions
      `;
    }
    
    if (targetRole) {
      marketDataContext += `
        Target Role Market Data:
        - Average Salary: $${targetRole.averageSalary.toLocaleString()}
        - Required Skills: ${targetRole.topSkills.join(', ')}
        - Market Growth: ${targetRole.demandGrowth}% annually
        - Remote Work: ${targetRole.remotePercentage}% of positions
      `;
    }
    
    if (trendingSkills && trendingSkills.length > 0) {
      marketDataContext += `
        Top Trending Skills in Related Field:
        ${trendingSkills.slice(0, 5).map(skill => 
          `- ${skill.name}: ${skill.demandGrowth}% growth, +$${skill.averageSalaryImpact.toLocaleString()} salary impact`
        ).join('\n')}
      `;
    }
  }

  return `
    Analyze this user's skills and provide detailed, actionable career insights. 
    Return your response in JSON format only.

    User Profile:
    - Current Role: ${profile.currentRole}
    - Target Role: ${profile.goalRole}
    - Skills:
      - ${skillsWithProficiency}

    ${marketDataContext ? `Market Data:\n${marketDataContext}` : ''}

    Based on this profile and the market data, provide the following insights in JSON format:
    {
      "skillAssessment": {
        "strengths": [
          {
            "skill": "Name of skill",
            "reason": "Why this is a strength",
            "marketValue": "Current market value/demand"
          }
        ],
        "improvementAreas": [
          {
            "skill": "Name of skill",
            "recommendation": "How to improve",
            "resources": ["Resource 1", "Resource 2"]
          }
        ]
      },
      "careerPath": {
        "recommendedRoles": [
          {
            "role": "Role title",
            "alignment": "How the user's skills align with this role",
            "skillGap": "Skills needed for this role"
          }
        ],
        "progression": {
          "shortTerm": "0-6 month goals",
          "mediumTerm": "6-12 month goals",
          "longTerm": "1-2 year goals"
        }
      },
      "learningPlan": {
        "prioritySkills": [
          {
            "skill": "Skill to learn",
            "reason": "Why this skill is important",
            "difficulty": "Beginner/Intermediate/Advanced",
            "timeEstimate": "Estimated time to learn basics"
          }
        ],
        "recommendedResources": [
          {
            "title": "Resource title",
            "type": "Course/Book/Project/Community",
            "link": "URL or description"
          }
        ]
      },
      "marketInsights": {
        "demandTrends": "Analysis of skill demand trends",
        "salaryImpact": "How skills affect salary potential",
        "geographicOpportunities": "Remote work or location-specific insights"
      }
    }
  `;
}

function generateMockInsights(profile) {
  return {
    error: {
      message: "Unable to generate AI insights at this time. Please try again later.",
      details: "AI insight generation is required for this feature."
    },
    skillAssessment: {
      strengths: [],
      improvementAreas: []
    },
    careerPath: {
      recommendedRoles: [],
      progression: {
        shortTerm: "AI generation required",
        mediumTerm: "AI generation required",
        longTerm: "AI generation required"
      }
    },
    learningPlan: {
      prioritySkills: [],
      recommendedResources: []
    },
    marketInsights: {
      demandTrends: "AI generation required",
      salaryImpact: "AI generation required",
      geographicOpportunities: "AI generation required"
    }
  };
} 