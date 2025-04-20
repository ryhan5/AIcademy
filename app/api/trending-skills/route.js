import { NextResponse } from 'next/server';

// This would ideally be fetched from a real-time job market analysis database
// For now, we'll return a static list based on current market trends
export async function GET(request) {
  try {
    // Sample trending skills data structured by category
    const trendingSkills = {
      programming: [
        { name: "JavaScript", growth: 12, jobCount: 56000 },
        { name: "Python", growth: 18, jobCount: 48000 },
        { name: "React", growth: 15, jobCount: 42000 },
        { name: "TypeScript", growth: 22, jobCount: 38000 },
        { name: "Node.js", growth: 14, jobCount: 36000 }
      ],
      cloud: [
        { name: "AWS", growth: 20, jobCount: 52000 },
        { name: "Azure", growth: 24, jobCount: 48000 },
        { name: "Google Cloud", growth: 18, jobCount: 32000 },
        { name: "Kubernetes", growth: 30, jobCount: 28000 },
        { name: "Docker", growth: 16, jobCount: 35000 }
      ],
      data: [
        { name: "SQL", growth: 8, jobCount: 62000 },
        { name: "MongoDB", growth: 12, jobCount: 28000 },
        { name: "Data Science", growth: 22, jobCount: 34000 },
        { name: "Machine Learning", growth: 26, jobCount: 32000 },
        { name: "TensorFlow", growth: 20, jobCount: 18000 }
      ],
      softSkills: [
        { name: "Communication", growth: 10, jobCount: 72000 },
        { name: "Problem Solving", growth: 12, jobCount: 68000 },
        { name: "Teamwork", growth: 8, jobCount: 70000 },
        { name: "Time Management", growth: 14, jobCount: 58000 },
        { name: "Leadership", growth: 16, jobCount: 46000 }
      ]
    };

    // Get user parameters
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    
    let response;
    
    // If category is specified, return only that category
    if (category && trendingSkills[category]) {
      response = {
        category,
        skills: trendingSkills[category].slice(0, limit)
      };
    } 
    // Otherwise return all categories with their skills
    else {
      response = {
        categories: Object.keys(trendingSkills),
        skills: {}
      };
      
      // Apply limit to each category
      for (const cat in trendingSkills) {
        response.skills[cat] = trendingSkills[cat].slice(0, limit);
      }
    }
    
    return NextResponse.json({
      success: true,
      ...response,
      updated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching trending skills:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch trending skills' 
    }, { status: 500 });
  }
} 