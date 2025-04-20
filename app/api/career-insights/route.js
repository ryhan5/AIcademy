import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { fetchMarketData, fetchTrendingSkills } from "@/app/services/job-data-service";

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { profile } = await req.json();
    
    if (!profile) {
      return NextResponse.json(
        { error: 'Profile data is required' },
        { status: 400 }
      );
    }

    // Log the request
    console.log('Career insights request received for profile:', {
      currentRole: profile.currentRole,
      yearsExperience: profile.yearsExperience,
      skillsCount: profile.skills?.length || 0,
      goalRole: profile.goalRole
    });

    // Enhance profile with real market data
    const enhancedProfile = await enhanceProfileWithMarketData(profile);

    // Prepare prompt for Gemini
    const prompt = generatePrompt(enhancedProfile);

    // If Gemini API key is not available, return mock data
    if (!process.env.GEMINI_API_KEY) {
      console.log('Gemini API key not available, returning mock data');
      return NextResponse.json(generateMockResponse(enhancedProfile));
    }

    // Call Gemini API
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      // Parse the JSON output from the model
      // Note: Gemini might return the JSON with surrounding text, so we need to extract it
      const jsonMatch = text.match(/({[\s\S]*})/);
      const jsonText = jsonMatch ? jsonMatch[0] : text;
      
      try {
        const responseData = JSON.parse(jsonText);
        return NextResponse.json(responseData);
      } catch (jsonError) {
        console.error('Error parsing JSON from Gemini response:', jsonError);
        console.log('Raw response:', text);
        return NextResponse.json(generateMockResponse(enhancedProfile));
      }
    } catch (aiError) {
      console.error('Error calling Gemini API:', aiError);
      return NextResponse.json(generateMockResponse(enhancedProfile));
    }

  } catch (error) {
    console.error('Error in career insights API:', error);
    return NextResponse.json(
      { error: 'Failed to process request', details: error.message },
      { status: 500 }
    );
  }
}

// New function to enhance profile with market data
async function enhanceProfileWithMarketData(profile) {
  try {
    // Create a copy of the profile to enhance
    const enhancedProfile = { ...profile };
    
    // Fetch real market data for current and target roles
    const currentRoleData = profile.currentRole 
      ? await fetchMarketData(profile.currentRole)
      : null;
    
    const targetRoleData = profile.goalRole 
      ? await fetchMarketData(profile.goalRole) 
      : null;
      
    // Determine the category based on roles
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

function generatePrompt(profile) {
  // Get the current date for industry trend relevance
  const currentDate = new Date().toISOString().split('T')[0];
  
  // Current tech industry context that can be used for more relevant insights
  const techIndustryContext = `
    Key tech industry context as of ${currentDate}:
    - AI/ML technologies are transforming software development with tools like GitHub Copilot and ChatGPT
    - Cloud-native development continues to dominate with microservices architecture
    - DevOps and SRE roles are expanding with emphasis on automation and observability
    - Remote and hybrid work models have become standard in the industry
    - Cybersecurity skills are in high demand across all technology sectors
    - Web3 and blockchain technologies are creating new specialization opportunities
    - Low-code/no-code platforms are growing but not replacing traditional development
  `;

  // Format the market data for inclusion in the prompt
  let marketDataContext = '';
  
  if (profile.marketData) {
    const { currentRole, targetRole, trendingSkills } = profile.marketData;
    
    if (currentRole) {
      marketDataContext += `
        Current Role Market Data:
        - Industry Growth: ${currentRole.demandGrowth}% year-over-year
        - Average Salary: $${currentRole.averageSalary.toLocaleString()}
        - Remote Percentage: ${currentRole.remotePercentage}% of positions are remote
        - In-demand Skills: ${currentRole.topSkills.join(', ')}
        - Industry Outlook: ${currentRole.industryOutlook}
        - Market Competitiveness: ${currentRole.competitiveness}
      `;
    }
    
    if (targetRole) {
      marketDataContext += `
        Target Role Market Data:
        - Industry Growth: ${targetRole.demandGrowth}% year-over-year
        - Average Salary: $${targetRole.averageSalary.toLocaleString()}
        - Remote Percentage: ${targetRole.remotePercentage}% of positions are remote
        - Required Skills: ${targetRole.topSkills.join(', ')}
        - Industry Outlook: ${targetRole.industryOutlook}
        - Market Competitiveness: ${targetRole.competitiveness}
      `;
    }
    
    if (trendingSkills && trendingSkills.length > 0) {
      marketDataContext += `
        Top Trending Skills (with demand growth):
        ${trendingSkills.slice(0, 5).map(skill => 
          `- ${skill.name}: ${skill.demandGrowth}% growth, +$${skill.averageSalaryImpact.toLocaleString()} salary impact`
        ).join('\n')}
      `;
    }
  }

  return `
    Please analyze the following career profile and provide detailed, actionable insights tailored specifically to this individual. Return your response in VALID JSON format only:

    ${techIndustryContext}

    ${marketDataContext ? `Real Market Data:\n${marketDataContext}` : ''}

    Current Role: ${profile.currentRole || 'Not specified'}
    Years of Experience: ${profile.yearsExperience || 'Not specified'}
    Technical Skills: ${profile.skills?.join(', ') || 'Not specified'}
    Target Role: ${profile.goalRole || 'Not specified'}
    Communication Skills Assessment:
    - Written: ${profile.communicationSkills?.written || 3}/5
    - Verbal: ${profile.communicationSkills?.verbal || 3}/5
    - Presentation: ${profile.communicationSkills?.presentation || 3}/5
    - Teamwork: ${profile.communicationSkills?.teamwork || 3}/5
    - Leadership: ${profile.communicationSkills?.leadership || 3}/5

    Based on this profile and the real market data provided, create a comprehensive career analysis with specific, actionable feedback that is uniquely tailored to this person's background, skills, and goals. Your analysis should reference the provided market data where relevant to make the insights more specific and data-driven.

    Return the following JSON format, with no additional text or explanations outside the JSON:
    {
      "summary": "A personalized overview of their career situation, strengths, and path to their target role",
      "skillGaps": [
        {
          "skill": "Name of skill to develop",
          "importance": "High/Medium/Low",
          "reason": "Brief explanation of why this skill is important for their target role"
        },
        // 3-5 skill gaps with this structure
      ],
      "marketTrends": [
        {
          "trend": "Description of market trend",
          "impact": "How this specifically impacts their career goals",
          "action": "What they should do about it"
        },
        // 3-4 trends with this structure
      ],
      "salaryInsights": {
        "current": "Estimated salary range for current role",
        "target": "Estimated salary range for target role",
        "potential": "Their salary potential given their skills and experience",
        "negotiationTips": ["3-4 specific salary negotiation tips based on their profile"]
      },
      "communicationAssessment": {
        "strengths": ["List of 2-3 communication strengths based on their ratings"],
        "improvements": ["List of 2-3 areas for improvement"],
        "tips": ["3-4 specific tips to improve their communication skills"],
        "industryContext": "How communication skills impact success in their specific field"
      },
      "roadmap": [
        {
          "title": "Phase 1 title",
          "timeframe": "e.g. 0-3 months",
          "tasks": ["List of 3-4 specific tasks or goals for this phase"],
          "outcomeMetrics": ["How to measure success for this phase"]
        },
        {
          "title": "Phase 2 title",
          "timeframe": "e.g. 3-6 months",
          "tasks": ["List of tasks for this phase"],
          "outcomeMetrics": ["How to measure success for this phase"]
        },
        {
          "title": "Phase 3 title",
          "timeframe": "e.g. 6-12 months",
          "tasks": ["List of tasks for this phase"],
          "outcomeMetrics": ["How to measure success for this phase"]
        }
      ],
      "recommendedResources": [
        {
          "title": "Resource title",
          "url": "URL for resource",
          "type": "Course/Book/Tool/Community",
          "reason": "Why this resource is particularly valuable for them"
        },
        // 4-5 resources with this structure
      ],
      "feedbackAreas": [
        {
          "area": "Area where they should seek feedback",
          "from": "Who they should seek feedback from",
          "questions": ["Specific questions they should ask to get valuable feedback"]
        },
        // 2-3 feedback areas
      ]
    }
  `;
}

function generateMockResponse(profile) {
  // Extract market data if available
  const marketData = profile.marketData || {};
  const currentRoleData = marketData.currentRole || {};
  const targetRoleData = marketData.targetRole || {};
  const trendingSkills = marketData.trendingSkills || [];
  
  // Generate a more personalized summary
  const currentRoleSalary = currentRoleData.averageSalary 
    ? `$${currentRoleData.averageSalary.toLocaleString()}`
    : '$85,000 - $110,000';
    
  const targetRoleSalary = targetRoleData.averageSalary
    ? `$${targetRoleData.averageSalary.toLocaleString()}`
    : '$120,000 - $150,000';
    
  const currentRoleGrowth = currentRoleData.demandGrowth || 15;
  const targetRoleGrowth = targetRoleData.demandGrowth || 25;
  
  // Create skill gaps based on trending skills if available
  const skillGaps = trendingSkills.length > 0
    ? trendingSkills.slice(0, 4).map(skill => ({
        skill: skill.name,
        importance: skill.demandGrowth > 40 ? "High" : skill.demandGrowth > 25 ? "Medium" : "Low",
        reason: `Growing at ${skill.demandGrowth}% with potential salary impact of +$${skill.averageSalaryImpact.toLocaleString()} annually. ${
          skill.demandGrowth > 40 ? 'This is one of the fastest growing skills in the industry.' : 
          'Important for staying competitive in the job market.'
        }`
      }))
    : [
        {
          skill: "Advanced JavaScript",
          importance: "High",
          reason: "Essential for frontend and full-stack roles, particularly for complex application architecture"
        },
        {
          skill: "System Design",
          importance: "High",
          reason: "Critical for scaling applications and advancing to senior technical positions"
        },
        {
          skill: "CI/CD Pipelines",
          importance: "Medium",
          reason: "Modern development teams rely on automated workflows for quality and efficiency"
        },
        {
          skill: "Cloud Architecture",
          importance: "Medium",
          reason: "Most applications now leverage cloud infrastructure, making this knowledge valuable across roles"
        }
      ];
  
  // Personalize market trends based on role data
  const marketTrends = [
    {
      trend: currentRoleData.remotePercentage > 70 
        ? "High remote work adoption in your field"
        : "Remote work opportunities expanding",
      impact: `With ${currentRoleData.remotePercentage || 65}% of ${profile.currentRole || 'roles in your field'} being remote, you have increased geographic flexibility but also face wider competition`,
      action: "Develop strong async communication skills and build an online presence showcasing your expertise"
    },
    {
      trend: `Growing demand for ${profile.goalRole || 'your target role'}`,
      impact: `With ${targetRoleGrowth}% annual growth, there are expanding opportunities but also increasing specialization requirements`,
      action: currentRoleData.topSkills 
        ? `Focus on developing skills in ${currentRoleData.topSkills.slice(0, 3).join(', ')}`
        : "Gain practical experience with in-demand technologies for your target role"
    },
    {
      trend: "AI and automation tools reshaping development processes",
      impact: "Routine coding tasks are being automated, emphasizing higher-level problem solving and system design",
      action: "Focus on architectural skills and AI integration rather than routine coding tasks that may become automated"
    }
  ];
  
  return {
    summary: `Based on your ${profile.yearsExperience || 'N/A'} years of experience as a ${profile.currentRole || 'professional'} and your goal to become a ${profile.goalRole || 'more senior role'}, you're entering a field with ${targetRoleGrowth}% annual growth. Your current skillset shows promise, but targeted development in specific technical and soft skills will accelerate your career growth, potentially increasing your salary from ${currentRoleSalary} to ${targetRoleSalary}.`,
    
    skillGaps,
    
    marketTrends,
    
    salaryInsights: {
      current: currentRoleData.averageSalary 
        ? `The average salary for a ${profile.currentRole || 'professional at your level'} is ${currentRoleSalary} with ${currentRoleData.remotePercentage}% remote opportunities`
        : `The average salary for a ${profile.currentRole || 'professional at your level'} is ${currentRoleSalary}`,
      target: targetRoleData.averageSalary
        ? `The average salary for a ${profile.goalRole || 'your target role'} is ${targetRoleSalary} with market growth of ${targetRoleGrowth}% annually`
        : `The average salary for a ${profile.goalRole || 'your target role'} is ${targetRoleSalary}`,
      potential: `With your skills and experience focused on high-growth areas, you could potentially reach ${
        targetRoleData.averageSalary 
          ? `$${(targetRoleData.averageSalary * 1.1).toLocaleString()} - $${(targetRoleData.averageSalary * 1.25).toLocaleString()}`
          : '$130,000 - $160,000'
      } in the next 1-2 years`,
      negotiationTips: [
        "Quantify your achievements with metrics and business impact when discussing compensation",
        "Research industry-specific salary data for your location and experience level",
        "Discuss non-salary benefits that matter to you (remote work, learning budget, flexible hours)",
        "Highlight specialized skills that differentiate you from other candidates"
      ]
    },
    
    communicationAssessment: {
      strengths: determineStrengths(profile.communicationSkills),
      improvements: determineImprovements(profile.communicationSkills),
      tips: [
        "Record yourself in mock presentations to identify areas for improvement",
        "Practice explaining complex technical concepts to non-technical audiences",
        "Seek speaking opportunities at team meetings or local tech meetups",
        "Get feedback on written documentation from peers with different expertise levels"
      ],
      industryContext: `Strong communication is critical in the ${
        currentRoleData.industryOutlook 
          ? currentRoleData.industryOutlook.toLowerCase().includes('growing') 
            ? 'rapidly evolving' 
            : 'competitive'
          : 'tech'
      } industry, particularly as you advance toward a ${profile.goalRole || 'senior role'} where collaborating across teams and explaining technical decisions become core responsibilities.`
    },
    
    roadmap: [
      {
        title: "Build Technical Foundation",
        timeframe: "0-3 months",
        tasks: [
          `Complete an advanced course in ${currentRoleData.topSkills ? currentRoleData.topSkills[0] : 'your primary technology stack'}`,
          "Build a project that demonstrates your understanding of system design principles",
          "Implement CI/CD in your personal or work projects",
          "Contribute to an open-source project related to your target role"
        ],
        outcomeMetrics: [
          "Project completion with documentation",
          "Contributions accepted to open source",
          "Ability to explain architectural decisions"
        ]
      },
      {
        title: "Expand Practical Experience",
        timeframe: "3-6 months",
        tasks: [
          "Take ownership of a challenging feature at work or in a personal project",
          "Create a portfolio showcasing your recent technical growth",
          `Learn and implement ${skillGaps[0]?.skill || 'a new technology from your skill gaps list'}`,
          "Begin writing technical articles or documentation to demonstrate expertise"
        ],
        outcomeMetrics: [
          "Completed feature with measurable impact",
          "Portfolio with 2-3 robust projects",
          "Published technical content"
        ]
      },
      {
        title: "Specialize and Network Strategically",
        timeframe: "6-12 months",
        tasks: [
          targetRoleData.topSkills 
            ? `Obtain certification in ${targetRoleData.topSkills[0]}`
            : "Obtain a certification relevant to your target role",
          "Attend industry conferences or meetups to build connections",
          "Request specific responsibilities at work that align with your target role",
          "Mentor junior team members to develop leadership skills"
        ],
        outcomeMetrics: [
          "Earned certification",
          "Expanded professional network by 15-20 relevant connections",
          "Positive feedback from mentees"
        ]
      }
    ],
    
    recommendedResources: [
      {
        title: trendingSkills.length > 0 
          ? `${trendingSkills[0].name} Advanced Course`
          : "Advanced JavaScript Patterns Course",
        url: "https://frontendmasters.com/courses/javascript-patterns/",
        type: "Course",
        reason: trendingSkills.length > 0 
          ? `Focus on ${trendingSkills[0].name} which is growing at ${trendingSkills[0].demandGrowth}% with salary impact of $${trendingSkills[0].averageSalaryImpact}`
          : "Addresses your need for advanced JavaScript with practical patterns used in production"
      },
      {
        title: "System Design Interview Guide",
        url: "https://github.com/donnemartin/system-design-primer",
        type: "Repository",
        reason: "Comprehensive resource for learning system design principles with practical examples"
      },
      {
        title: "CI/CD with GitHub Actions",
        url: "https://docs.github.com/en/actions/learn-github-actions",
        type: "Documentation",
        reason: "Hands-on way to implement CI/CD in your projects using widely-adopted tools"
      },
      {
        title: targetRoleData.topSkills
          ? `${targetRoleData.topSkills[0]} Certification`
          : "AWS Cloud Practitioner Certification",
        url: "https://aws.amazon.com/certification/certified-cloud-practitioner/",
        type: "Certification",
        reason: targetRoleData.topSkills
          ? `${targetRoleData.topSkills[0]} is one of the most in-demand skills for ${profile.goalRole || 'your target role'}`
          : "Entry-level cloud certification that provides a strong foundation for cloud concepts"
      },
      {
        title: "Tech Career Growth Community",
        url: "https://www.reddit.com/r/ExperiencedDevs/",
        type: "Community",
        reason: "Forum of experienced developers sharing career advice and industry insights"
      }
    ],
    
    feedbackAreas: [
      {
        area: "Technical decision making",
        from: "Senior engineers or technical leads",
        questions: [
          "What factors am I not considering in my technical decisions?",
          "How could my solutions be more scalable or maintainable?",
          "What would you do differently and why?"
        ]
      },
      {
        area: "Communication effectiveness",
        from: "Cross-functional teammates (product managers, designers)",
        questions: [
          "Is my technical explanation clear and focused on relevant details?",
          "What could I do to make my written documentation more useful?",
          "How well am I understanding and addressing your requirements?"
        ]
      },
      {
        area: "Career progression",
        from: `Professionals in the ${profile.goalRole || 'target role'} position`,
        questions: [
          `What skills gap do you see between my current abilities and ${profile.goalRole || 'the role I want'}?`,
          "What experiences were most valuable in your career progression?",
          "What do you wish you had focused on earlier in your career?"
        ]
      }
    ]
  };
}

function determineStrengths(communicationSkills) {
  if (!communicationSkills) return ['Teamwork', 'Written communication'];
  
  const skills = {
    written: { name: 'Written communication', value: communicationSkills.written || 3 },
    verbal: { name: 'Verbal communication', value: communicationSkills.verbal || 3 },
    presentation: { name: 'Presentation skills', value: communicationSkills.presentation || 3 },
    teamwork: { name: 'Teamwork', value: communicationSkills.teamwork || 3 },
    leadership: { name: 'Leadership communication', value: communicationSkills.leadership || 3 }
  };
  
  return Object.values(skills)
    .sort((a, b) => b.value - a.value)
    .slice(0, 2)
    .map(skill => skill.name);
}

function determineImprovements(communicationSkills) {
  if (!communicationSkills) return ['Public speaking', 'Executive presentations'];
  
  const skills = {
    written: { name: 'Written communication', value: communicationSkills.written || 3 },
    verbal: { name: 'Verbal communication', value: communicationSkills.verbal || 3 },
    presentation: { name: 'Presentation skills', value: communicationSkills.presentation || 3 },
    teamwork: { name: 'Teamwork', value: communicationSkills.teamwork || 3 },
    leadership: { name: 'Leadership communication', value: communicationSkills.leadership || 3 }
  };
  
  return Object.values(skills)
    .sort((a, b) => a.value - b.value)
    .slice(0, 2)
    .map(skill => skill.name);
} 