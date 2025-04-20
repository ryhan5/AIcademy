/**
 * Service to fetch job and company data to enhance career insights
 * This service helps provide real-world context for AI-generated career insights
 */

// Function to fetch market data for a specific role
export async function fetchMarketData(role) {
  try {
    // In a real implementation, this would call an external API
    // For now, we'll use a simulated response with realistic data
    console.log(`Fetching market data for role: ${role}`);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Dynamically generate data based on the role
    const data = generateMarketDataForRole(role);
    return data;
  } catch (error) {
    console.error('Error fetching market data:', error);
    return null;
  }
}

// Function to fetch company data for salary insights
export async function fetchCompanyData(companies = ['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple']) {
  try {
    console.log(`Fetching company data for: ${companies.join(', ')}`);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Return simulated company data
    return companies.map(company => ({
      name: company,
      averageSalary: generateRandomSalary(120000, 220000),
      benefits: getRandomBenefits(),
      growth: Math.floor(Math.random() * 40) + 5 // 5-45% growth
    }));
  } catch (error) {
    console.error('Error fetching company data:', error);
    return [];
  }
}

// Function to fetch trending skills based on job listings
export async function fetchTrendingSkills(category = 'software') {
  try {
    console.log(`Fetching trending skills for category: ${category}`);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const skillsData = {
      software: [
        { name: 'React', demandGrowth: 35, averageSalaryImpact: 15000 },
        { name: 'TypeScript', demandGrowth: 42, averageSalaryImpact: 18000 },
        { name: 'Docker', demandGrowth: 28, averageSalaryImpact: 12000 },
        { name: 'Kubernetes', demandGrowth: 49, averageSalaryImpact: 22000 },
        { name: 'AWS', demandGrowth: 32, averageSalaryImpact: 20000 },
        { name: 'GraphQL', demandGrowth: 25, averageSalaryImpact: 14000 },
        { name: 'Python', demandGrowth: 30, averageSalaryImpact: 17000 },
        { name: 'Machine Learning', demandGrowth: 65, averageSalaryImpact: 25000 }
      ],
      design: [
        { name: 'Figma', demandGrowth: 55, averageSalaryImpact: 10000 },
        { name: 'UX Research', demandGrowth: 40, averageSalaryImpact: 15000 },
        { name: 'Design Systems', demandGrowth: 35, averageSalaryImpact: 12000 }
      ],
      marketing: [
        { name: 'SEO', demandGrowth: 20, averageSalaryImpact: 8000 },
        { name: 'Content Strategy', demandGrowth: 25, averageSalaryImpact: 12000 },
        { name: 'Analytics', demandGrowth: 30, averageSalaryImpact: 15000 }
      ],
      product: [
        { name: 'Agile', demandGrowth: 22, averageSalaryImpact: 10000 },
        { name: 'User Research', demandGrowth: 35, averageSalaryImpact: 14000 },
        { name: 'Product Analytics', demandGrowth: 40, averageSalaryImpact: 18000 }
      ]
    };
    
    return skillsData[category] || skillsData.software;
  } catch (error) {
    console.error('Error fetching trending skills:', error);
    return [];
  }
}

// Helper function to generate random salary in a range
function generateRandomSalary(min, max) {
  const salary = Math.floor(Math.random() * (max - min + 1)) + min;
  // Round to nearest thousand
  return Math.round(salary / 1000) * 1000;
}

// Helper function to generate market data based on role
function generateMarketDataForRole(role) {
  // Normalize the role name to match against known roles
  const normalizedRole = role?.toLowerCase() || '';
  
  // Default data
  let data = {
    demandGrowth: 15, // 15% YoY growth
    averageSalary: generateRandomSalary(90000, 120000),
    remotePercentage: 65,
    topSkills: ['JavaScript', 'HTML', 'CSS', 'React', 'Node.js'],
    industryOutlook: 'Positive growth expected in the next 5 years',
    competitiveness: 'Medium'
  };
  
  // Customize based on role
  if (normalizedRole.includes('frontend') || normalizedRole.includes('front-end') || normalizedRole.includes('front end')) {
    data = {
      demandGrowth: 22,
      averageSalary: generateRandomSalary(95000, 130000),
      remotePercentage: 75,
      topSkills: ['React', 'TypeScript', 'JavaScript', 'HTML/CSS', 'Redux'],
      industryOutlook: 'Strong growth with increasing demand for sophisticated UIs',
      competitiveness: 'Medium-High'
    };
  } else if (normalizedRole.includes('backend') || normalizedRole.includes('back-end') || normalizedRole.includes('back end')) {
    data = {
      demandGrowth: 18,
      averageSalary: generateRandomSalary(100000, 140000),
      remotePercentage: 70,
      topSkills: ['Node.js', 'Python', 'Java', 'SQL', 'AWS'],
      industryOutlook: 'Stable growth with emphasis on scalable architecture',
      competitiveness: 'Medium'
    };
  } else if (normalizedRole.includes('full stack') || normalizedRole.includes('fullstack')) {
    data = {
      demandGrowth: 25,
      averageSalary: generateRandomSalary(105000, 145000),
      remotePercentage: 72,
      topSkills: ['JavaScript', 'React', 'Node.js', 'SQL', 'TypeScript'],
      industryOutlook: 'High demand for versatile developers who can work across the stack',
      competitiveness: 'Medium'
    };
  } else if (normalizedRole.includes('devops') || normalizedRole.includes('sre')) {
    data = {
      demandGrowth: 35,
      averageSalary: generateRandomSalary(120000, 160000),
      remotePercentage: 80,
      topSkills: ['Kubernetes', 'Docker', 'AWS/Azure/GCP', 'CI/CD', 'Terraform'],
      industryOutlook: 'Rapidly growing field with emphasis on automation and cloud expertise',
      competitiveness: 'Medium-Low'
    };
  } else if (normalizedRole.includes('data') && (normalizedRole.includes('scientist') || normalizedRole.includes('analyst'))) {
    data = {
      demandGrowth: 40,
      averageSalary: generateRandomSalary(110000, 150000),
      remotePercentage: 68,
      topSkills: ['Python', 'SQL', 'Machine Learning', 'Data Visualization', 'Statistics'],
      industryOutlook: 'High growth as companies increasingly rely on data-driven decisions',
      competitiveness: 'High'
    };
  } else if (normalizedRole.includes('machine learning') || normalizedRole.includes('ai engineer')) {
    data = {
      demandGrowth: 55,
      averageSalary: generateRandomSalary(130000, 180000),
      remotePercentage: 65,
      topSkills: ['Python', 'TensorFlow/PyTorch', 'Deep Learning', 'NLP', 'Computer Vision'],
      industryOutlook: 'Explosive growth with AI integration across all industries',
      competitiveness: 'High'
    };
  } else if (normalizedRole.includes('product manager') || normalizedRole.includes('product owner')) {
    data = {
      demandGrowth: 20,
      averageSalary: generateRandomSalary(110000, 160000),
      remotePercentage: 60,
      topSkills: ['Product Strategy', 'User Research', 'Agile', 'Data Analysis', 'Roadmapping'],
      industryOutlook: 'Stable demand with emphasis on technical product managers',
      competitiveness: 'High'
    };
  }
  
  return data;
}

// Helper function to get random company benefits
function getRandomBenefits() {
  const allBenefits = [
    'Unlimited PTO',
    'Remote Work',
    'Health Insurance',
    'Dental Insurance',
    'Vision Insurance',
    '401(k) Matching',
    'Stock Options',
    'Flexible Hours',
    'Wellness Programs',
    'Professional Development Budget',
    'Home Office Stipend',
    'Gym Membership',
    'Parental Leave',
    'Mental Health Benefits',
    'Education Reimbursement'
  ];
  
  // Select 4-7 random benefits
  const count = Math.floor(Math.random() * 4) + 4;
  const benefits = [];
  
  while (benefits.length < count) {
    const benefit = allBenefits[Math.floor(Math.random() * allBenefits.length)];
    if (!benefits.includes(benefit)) {
      benefits.push(benefit);
    }
  }
  
  return benefits;
} 