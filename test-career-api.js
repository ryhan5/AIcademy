const fetch = require('node-fetch');

async function testCareerInsightsAPI() {
  console.log('Testing Career Insights API with enhanced market data...');
  
  const sampleProfile = {
    currentRole: 'Frontend Developer',
    goalRole: 'Senior Frontend Architect',
    yearsExperience: 3,
    skills: [
      'JavaScript', 'React', 'HTML/CSS', 'TypeScript', 'Redux'
    ],
    interests: ['UI/UX design', 'Performance optimization', 'Component libraries'],
    communicationSkills: {
      written: 4,
      verbal: 3,
      technicalDocumentation: 3
    },
    education: {
      degree: 'B.S. Computer Science',
      graduationYear: 2020
    }
  };

  try {
    const response = await fetch('http://localhost:3000/api/career-insights', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ profile: sampleProfile }),
    });

    const data = await response.json();
    
    console.log('\n===== CAREER INSIGHTS API RESPONSE =====\n');
    console.log('SUMMARY:');
    console.log(data.summary);
    
    console.log('\nSKILL GAPS:');
    data.skillGaps.forEach((gap, i) => {
      console.log(`${i+1}. ${gap.skill} (${gap.importance}): ${gap.reason}`);
    });
    
    console.log('\nMARKET TRENDS:');
    data.marketTrends.forEach((trend, i) => {
      console.log(`${i+1}. ${trend.trend}`);
      console.log(`   Impact: ${trend.impact}`);
      console.log(`   Action: ${trend.action}`);
    });
    
    console.log('\nSALARY INSIGHTS:');
    console.log(`Current: ${data.salaryInsights.current}`);
    console.log(`Target: ${data.salaryInsights.target}`);
    console.log(`Potential: ${data.salaryInsights.potential}`);
    
    console.log('\nROADMAP HIGHLIGHTS:');
    data.roadmap.forEach((phase, i) => {
      console.log(`${i+1}. ${phase.title} (${phase.timeframe})`);
      console.log(`   Key Tasks: ${phase.tasks[0]}, ${phase.tasks[1]}`);
      console.log(`   Success Metrics: ${phase.outcomeMetrics.join(', ')}`);
    });
    
    console.log('\n=====  END OF API RESPONSE TEST  =====\n');
    
  } catch (error) {
    console.error('Error testing Career Insights API:', error);
  }
}

// Run the test
testCareerInsightsAPI();

/* 
To run this test:
1. Make sure your Next.js app is running (npm run dev)
2. Run this script using: node test-career-api.js
*/ 