import { NextResponse } from 'next/server';
import { calculateRelevanceScore } from '../jobspy/route';

// Skill clusters for recommendations
const SKILL_CLUSTERS = {
  'frontend': ['react', 'javascript', 'typescript', 'html', 'css', 'tailwindcss', 'next.js', 'vue', 'angular'],
  'backend': ['node.js', 'express', 'python', 'django', 'flask', 'java', 'spring', 'php', 'laravel', 'c#', '.net'],
  'database': ['sql', 'postgresql', 'mysql', 'mongodb', 'nosql', 'redis', 'graphql', 'oracle', 'firebase'],
  'devops': ['docker', 'kubernetes', 'aws', 'azure', 'gcp', 'ci/cd', 'jenkins', 'terraform', 'linux', 'networking'],
  'mobile': ['react native', 'flutter', 'swift', 'ios', 'android', 'kotlin', 'xamarin', 'mobile development'],
  'data': ['python', 'sql', 'r', 'data analysis', 'pandas', 'data visualization', 'tableau', 'power bi', 'jupyter'],
  'ai/ml': ['python', 'machine learning', 'tensorflow', 'pytorch', 'nlp', 'computer vision', 'data science', 'algorithms'],
  'design': ['ui design', 'ux design', 'figma', 'adobe xd', 'sketch', 'wireframing', 'prototyping', 'design systems'],
};

// Additional related skills to suggest
function getRelatedSkills(skills) {
  if (!skills || !Array.isArray(skills) || skills.length === 0) {
    return [];
  }
  
  const normalizedSkills = skills.map(s => s.toLowerCase());
  const skillClusters = Object.keys(SKILL_CLUSTERS);
  const relatedSkills = new Set();
  
  // Find which clusters the user's skills belong to
  const userClusters = skillClusters.filter(cluster => 
    SKILL_CLUSTERS[cluster].some(skill => normalizedSkills.includes(skill))
  );
  
  // Add related skills from those clusters
  userClusters.forEach(cluster => {
    SKILL_CLUSTERS[cluster].forEach(skill => {
      if (!normalizedSkills.includes(skill)) {
        relatedSkills.add(skill);
      }
    });
  });
  
  // Return up to 10 related skills
  return Array.from(relatedSkills).slice(0, 10);
}

// Imported job data (in a real app, this would come from a database)
// We'll import from the jobspy route to maintain consistency
import { JOBS_DATA } from '../jobspy/route';

export async function POST(request) {
  try {
    const body = await request.json();
    const { profile } = body;
    
    if (!profile) {
      return NextResponse.json({ error: 'No profile data provided' }, { status: 400 });
    }
    
    // Extract skills and other profile information
    const userSkills = profile.skills || [];
    const experience = profile.experience || [];
    const education = profile.education || [];
    
    console.log(`Processing job recommendations for user with ${userSkills.length} skills`);
    
    // Get related skills that the user might want to add
    const suggestedSkills = getRelatedSkills(userSkills);
    
    // Find jobs that match user's skills
    let recommendedJobs = JOBS_DATA.map(job => {
      // Calculate relevance score for each job
      const relevance = calculateRelevanceScore(job.skills, userSkills);
      
      return {
        ...job,
        relevanceScore: relevance.score,
        matchingSkills: relevance.matchingSkills
      };
    });
    
    // Filter out jobs with no skill match
    recommendedJobs = recommendedJobs.filter(job => job.relevanceScore > 0);
    
    // Sort by relevance score
    recommendedJobs.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    // Limit to top 5 recommendations
    recommendedJobs = recommendedJobs.slice(0, 5);
    
    // Analyze career path based on skills and recommend next steps
    const careerPath = analyzeCareerPath(userSkills, experience);
    
    return NextResponse.json({
      recommendedJobs,
      suggestedSkills,
      careerPath,
      skillsAnalysis: {
        totalSkills: userSkills.length,
        topSkillClusters: getTopSkillClusters(userSkills),
        skillGaps: identifySkillGaps(userSkills, recommendedJobs)
      }
    });
  } catch (error) {
    console.error('Error processing job recommendations:', error);
    return NextResponse.json({ error: 'Failed to process recommendations' }, { status: 500 });
  }
}

// Identify which skill clusters the user's skills belong to
function getTopSkillClusters(skills) {
  if (!skills || skills.length === 0) return [];
  
  const normalizedSkills = skills.map(s => s.toLowerCase());
  const clusters = {};
  
  // Count skills in each cluster
  Object.keys(SKILL_CLUSTERS).forEach(cluster => {
    const clusterSkills = SKILL_CLUSTERS[cluster];
    const matchingSkills = normalizedSkills.filter(skill => 
      clusterSkills.includes(skill)
    );
    
    if (matchingSkills.length > 0) {
      clusters[cluster] = {
        count: matchingSkills.length,
        percentage: (matchingSkills.length / clusterSkills.length) * 100,
        skills: matchingSkills
      };
    }
  });
  
  // Convert to array and sort by count
  return Object.keys(clusters)
    .map(key => ({ 
      name: key, 
      ...clusters[key] 
    }))
    .sort((a, b) => b.count - a.count);
}

// Identify skill gaps compared to job requirements
function identifySkillGaps(userSkills, recommendedJobs) {
  if (!userSkills || !recommendedJobs || recommendedJobs.length === 0) {
    return [];
  }
  
  const normalizedUserSkills = userSkills.map(s => s.toLowerCase());
  const missingSkills = new Set();
  
  // For each job, find skills the user doesn't have
  recommendedJobs.forEach(job => {
    const jobSkills = job.skills || [];
    jobSkills.forEach(skill => {
      if (!normalizedUserSkills.includes(skill.toLowerCase())) {
        missingSkills.add(skill);
      }
    });
  });
  
  return Array.from(missingSkills);
}

// Analyze career path based on skills and experience
function analyzeCareerPath(skills, experience) {
  if (!skills || skills.length === 0) {
    return {
      currentLevel: 'Unknown',
      recommendations: ['Add skills to your profile to get career path recommendations']
    };
  }
  
  const normalizedSkills = skills.map(s => s.toLowerCase());
  const yearsOfExperience = experience?.length > 0 
    ? Math.max(...experience.map(exp => exp.years || 0))
    : 0;
  
  // Determine skill concentration
  const skillClusters = getTopSkillClusters(normalizedSkills);
  const primaryCluster = skillClusters.length > 0 ? skillClusters[0].name : null;
  
  // Determine career level
  let currentLevel = 'Entry Level';
  if (yearsOfExperience >= 5 || normalizedSkills.length >= 12) {
    currentLevel = 'Senior Level';
  } else if (yearsOfExperience >= 2 || normalizedSkills.length >= 8) {
    currentLevel = 'Mid Level';
  }
  
  // Generate recommendations
  const recommendations = [];
  
  if (primaryCluster) {
    // Add cluster-specific recommendations
    if (primaryCluster === 'frontend') {
      recommendations.push(
        'Consider learning state management libraries like Redux or Zustand',
        'Add testing skills such as Jest and React Testing Library',
        'Learn about performance optimization in React'
      );
    } else if (primaryCluster === 'backend') {
      recommendations.push(
        'Add database design and optimization skills',
        'Learn about API security best practices',
        'Consider studying scalable architecture patterns'
      );
    } else if (primaryCluster === 'devops') {
      recommendations.push(
        'Deepen your knowledge of container orchestration',
        'Learn about infrastructure as code tools',
        'Study cloud security best practices'
      );
    } else if (primaryCluster === 'data' || primaryCluster === 'ai/ml') {
      recommendations.push(
        'Add more specialized machine learning techniques',
        'Learn about big data processing frameworks',
        'Study feature engineering and model optimization'
      );
    }
  }
  
  // Add general recommendations
  if (normalizedSkills.length < 5) {
    recommendations.push('Add more skills to your profile to get better job matches');
  }
  
  if (yearsOfExperience < 2) {
    recommendations.push('Consider adding more details about your work experience');
  }
  
  // Add certification recommendations based on skill set
  recommendations.push('Consider relevant certifications to validate your skills');
  
  return {
    currentLevel,
    primaryFocus: primaryCluster || 'General',
    recommendations: recommendations.slice(0, 5) // Limit to 5 recommendations
  };
} 