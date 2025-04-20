const fetch = require('node-fetch');

async function testSkillInsightsAPI() {
  console.log('Testing Skill Insights API with Gemini integration...');
  
  const userId = 'test-user-123';
  const currentRole = 'Frontend Developer';
  const goalRole = 'Senior Full Stack Engineer';
  
  try {
    // First, make sure we have some skills for the test user
    await setupTestUserSkills(userId);
    
    // Test the actual API endpoint
    const url = `http://localhost:3000/api/skill-insights?userId=${userId}&currentRole=${encodeURIComponent(currentRole)}&goalRole=${encodeURIComponent(goalRole)}`;
    
    console.log(`Making request to: ${url}`);
    const response = await fetch(url);
    const data = await response.json();
    
    if (!response.ok) {
      console.error('API returned an error:', data.error);
      return;
    }
    
    console.log('\n===== SKILL INSIGHTS API RESPONSE =====\n');
    
    // Display user profile
    console.log('USER PROFILE:');
    console.log(`Current Role: ${data.profile.currentRole}`);
    console.log(`Target Role: ${data.profile.goalRole}`);
    console.log(`Skills (${data.profile.skills.length}): ${data.profile.skills.join(', ')}`);
    
    // Display skill assessment
    console.log('\nSKILL ASSESSMENT:');
    console.log('Strengths:');
    data.insights.skillAssessment.strengths.forEach((strength, i) => {
      console.log(`${i+1}. ${strength.skill}: ${strength.reason}`);
      console.log(`   Market Value: ${strength.marketValue}`);
    });
    
    console.log('\nImprovement Areas:');
    data.insights.skillAssessment.improvementAreas.forEach((area, i) => {
      console.log(`${i+1}. ${area.skill}: ${area.recommendation}`);
      console.log(`   Resources: ${area.resources.join(', ')}`);
    });
    
    // Display career path
    console.log('\nCAREER PATH:');
    console.log('Recommended Roles:');
    data.insights.careerPath.recommendedRoles.forEach((role, i) => {
      console.log(`${i+1}. ${role.role}`);
      console.log(`   Alignment: ${role.alignment}`);
      console.log(`   Skill Gap: ${role.skillGap}`);
    });
    
    console.log('\nCareer Progression:');
    console.log(`Short Term (0-6 months): ${data.insights.careerPath.progression.shortTerm}`);
    console.log(`Medium Term (6-12 months): ${data.insights.careerPath.progression.mediumTerm}`);
    console.log(`Long Term (1-2 years): ${data.insights.careerPath.progression.longTerm}`);
    
    // Display learning plan
    console.log('\nLEARNING PLAN:');
    console.log('Priority Skills:');
    data.insights.learningPlan.prioritySkills.forEach((skill, i) => {
      console.log(`${i+1}. ${skill.skill} (${skill.difficulty}): ${skill.reason}`);
      console.log(`   Time Estimate: ${skill.timeEstimate}`);
    });
    
    console.log('\nRecommended Resources:');
    data.insights.learningPlan.recommendedResources.forEach((resource, i) => {
      console.log(`${i+1}. ${resource.title} (${resource.type})`);
      console.log(`   Link: ${resource.link}`);
    });
    
    // Display market insights
    console.log('\nMARKET INSIGHTS:');
    console.log(`Demand Trends: ${data.insights.marketInsights.demandTrends}`);
    console.log(`Salary Impact: ${data.insights.marketInsights.salaryImpact}`);
    console.log(`Geographic Opportunities: ${data.insights.marketInsights.geographicOpportunities}`);
    
    console.log('\n=====  END OF API RESPONSE TEST  =====\n');
    
  } catch (error) {
    console.error('Error testing Skill Insights API:', error);
  }
}

async function setupTestUserSkills(userId) {
  console.log(`Setting up test skills for user: ${userId}`);
  
  // Sample skills for testing
  const testSkills = [
    { skill: 'JavaScript', proficiency: 4, yearsExperience: 3, isVerified: true },
    { skill: 'React', proficiency: 4, yearsExperience: 2, isVerified: true },
    { skill: 'CSS', proficiency: 3, yearsExperience: 3, isVerified: false },
    { skill: 'HTML', proficiency: 4, yearsExperience: 3, isVerified: false },
    { skill: 'Node.js', proficiency: 2, yearsExperience: 1, isVerified: false },
    { skill: 'TypeScript', proficiency: 3, yearsExperience: 1, isVerified: false },
    { skill: 'Git', proficiency: 3, yearsExperience: 2, isVerified: false }
  ];
  
  try {
    // First delete any existing skills for this test user
    await fetch(`http://localhost:3000/api/user-skills?userId=${userId}`, {
      method: 'DELETE'
    });
    
    // Then add the test skills
    const response = await fetch('http://localhost:3000/api/user-skills', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        userId, 
        skills: testSkills 
      }),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log(`Successfully added ${data.addedSkills?.length || 0} test skills`);
    } else {
      console.error('Failed to add test skills:', data.error);
    }
  } catch (error) {
    console.error('Error setting up test user skills:', error);
  }
}

// Run the test
testSkillInsightsAPI();

/* 
To run this test:
1. Make sure your Next.js app is running (npm run dev)
2. Run this script using: node test-skill-insights.js
*/ 