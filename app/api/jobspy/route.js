import { NextResponse } from 'next/server';

// Sample job data - in a real app, this would come from a database
export const JOBS_DATA = [
  {
    id: '1',
    title: 'Frontend Developer',
    company: 'TechCorp',
    location: 'New York, NY',
    salary: '$80,000 - $120,000',
    description: 'We are looking for a talented Frontend Developer to join our team. The ideal candidate will have strong experience with React, TypeScript, and modern CSS frameworks.',
    requirements: [
      'Proficiency in React and TypeScript',
      'Strong knowledge of HTML, CSS, and responsive design',
      'Experience with Next.js and state management',
      'Ability to write clean, maintainable code',
      'Experience with UI/UX design principles'
    ],
    skills: ['React', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Next.js', 'Redux', 'TailwindCSS'],
    remote: true,
    date_posted: '2023-05-10',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 24 hours ago
    source: 'linkedin',
    url: 'https://linkedin.com/jobs/1'
  },
  {
    id: '2',
    title: 'Backend Engineer',
    company: 'DataSystems Inc.',
    location: 'San Francisco, CA',
    salary: '$90,000 - $140,000',
    description: 'Join our backend team to build scalable APIs and services. You\'ll work on high-performance systems that handle millions of requests daily.',
    requirements: [
      'Strong knowledge of Node.js and server-side JavaScript',
      'Experience with SQL and NoSQL databases',
      'Understanding of RESTful APIs and microservices architecture',
      'Knowledge of authentication and security best practices',
      'Experience with cloud platforms like AWS or Azure'
    ],
    skills: ['Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'REST API', 'Docker', 'AWS', 'Microservices'],
    remote: true,
    date_posted: '2023-05-15',
    timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(), // 36 hours ago
    source: 'indeed',
    url: 'https://indeed.com/jobs/2'
  },
  {
    id: '3',
    title: 'Full Stack Developer',
    company: 'Innovate Solutions',
    location: 'Austin, TX',
    salary: '$85,000 - $130,000',
    description: 'We need a versatile developer who can work across our entire stack. You\'ll help build features from database to UI and everything in between.',
    requirements: [
      'Experience with both frontend and backend technologies',
      'Knowledge of React, Node.js, and SQL databases',
      'Ability to design and implement RESTful APIs',
      'Understanding of software development lifecycle',
      'Experience with Git and CI/CD workflows'
    ],
    skills: ['React', 'Node.js', 'JavaScript', 'TypeScript', 'MySQL', 'Express', 'Git', 'Redux'],
    remote: false,
    date_posted: '2023-05-12',
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), // 48 hours ago
    source: 'linkedin',
    url: 'https://linkedin.com/jobs/3'
  },
  {
    id: '4',
    title: 'DevOps Engineer',
    company: 'CloudTech',
    location: 'Seattle, WA',
    salary: '$100,000 - $150,000',
    description: 'Help us build and maintain our cloud infrastructure and CI/CD pipelines. You\'ll work on automating deployment processes and ensuring system reliability.',
    requirements: [
      'Experience with cloud providers (AWS/Azure/GCP)',
      'Knowledge of containerization and orchestration tools',
      'Experience with CI/CD tools and processes',
      'Understanding of infrastructure as code principles',
      'Knowledge of Linux administration and scripting'
    ],
    skills: ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'Jenkins', 'GitLab CI', 'Bash', 'Python'],
    remote: true,
    date_posted: '2023-05-20',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    source: 'indeed',
    url: 'https://indeed.com/jobs/4'
  },
  {
    id: '5',
    title: 'Machine Learning Engineer',
    company: 'AI Innovations',
    location: 'Boston, MA',
    salary: '$110,000 - $160,000',
    description: 'Join our AI team to develop machine learning models for real-world applications. You\'ll work on cutting-edge projects in natural language processing and computer vision.',
    requirements: [
      'Strong background in machine learning algorithms and frameworks',
      'Experience with Python and data science libraries',
      'Knowledge of TensorFlow or PyTorch',
      'Understanding of data preprocessing and feature engineering',
      'Experience with model deployment and monitoring'
    ],
    skills: ['Python', 'TensorFlow', 'PyTorch', 'Machine Learning', 'Data Science', 'NLP', 'Computer Vision', 'Mathematics'],
    remote: false,
    date_posted: '2023-05-18',
    timestamp: new Date(Date.now() - 60 * 60 * 60 * 1000).toISOString(), // 60 hours ago
    source: 'linkedin',
    url: 'https://linkedin.com/jobs/5'
  },
  {
    id: '6',
    title: 'UI/UX Designer',
    company: 'CreativeWorks',
    location: 'Los Angeles, CA',
    salary: '$75,000 - $115,000',
    description: 'Design beautiful and intuitive user interfaces for web and mobile applications. You\'ll collaborate with product managers and developers to create exceptional user experiences.',
    requirements: [
      'Portfolio showcasing UI/UX design skills',
      'Proficiency in design tools like Figma or Adobe XD',
      'Understanding of user-centered design principles',
      'Experience with wireframing and prototyping',
      'Knowledge of accessibility standards and best practices'
    ],
    skills: ['UI Design', 'UX Design', 'Figma', 'Adobe XD', 'Wireframing', 'Prototyping', 'User Research', 'Design Systems'],
    remote: true,
    date_posted: '2023-05-22',
    timestamp: new Date(Date.now() - 70 * 60 * 60 * 1000).toISOString(), // 70 hours ago
    source: 'indeed',
    url: 'https://indeed.com/jobs/6'
  },
  {
    id: '7',
    title: 'Data Engineer',
    company: 'DataFlow Systems',
    location: 'Chicago, IL',
    salary: '$95,000 - $145,000',
    description: 'Build and maintain data pipelines to transform and analyze large datasets. You\'ll work closely with data scientists and business analysts to support data-driven decision making.',
    requirements: [
      'Experience with data processing frameworks',
      'Knowledge of SQL and NoSQL databases',
      'Experience with ETL processes and tools',
      'Understanding of data warehousing concepts',
      'Familiarity with Python or Scala'
    ],
    skills: ['Python', 'Spark', 'Hadoop', 'SQL', 'PostgreSQL', 'ETL', 'Data Warehousing', 'AWS Redshift'],
    remote: false,
    date_posted: '2023-05-19',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    source: 'linkedin',
    url: 'https://linkedin.com/jobs/7'
  },
  {
    id: '8',
    title: 'Mobile App Developer',
    company: 'AppWorks',
    location: 'Miami, FL',
    salary: '$85,000 - $125,000',
    description: 'Develop mobile applications for iOS and Android platforms. You\'ll work on creating seamless user experiences and implementing complex features.',
    requirements: [
      'Experience with React Native or Flutter',
      'Understanding of mobile app architecture',
      'Knowledge of state management patterns',
      'Experience with native modules integration',
      'Familiarity with app deployment processes'
    ],
    skills: ['React Native', 'Flutter', 'JavaScript', 'TypeScript', 'iOS', 'Android', 'Mobile Development', 'Redux'],
    remote: true,
    date_posted: '2023-05-17',
    timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(), // 18 hours ago
    source: 'indeed',
    url: 'https://indeed.com/jobs/8'
  }
];

// LinkedIn API integration
async function fetchLinkedInJobs(query = '', location = '', limit = 10) {
  try {
    // Check if LinkedIn API credentials are available
    const linkedInClientId = process.env.LINKEDIN_CLIENT_ID;
    const linkedInClientSecret = process.env.LINKEDIN_CLIENT_SECRET;
    
    if (!linkedInClientId || !linkedInClientSecret) {
      console.log('LinkedIn API credentials not found, using mock data');
      return filterMockLinkedInJobs(query, location);
    }
    
    // In a real implementation, you would use the LinkedIn API client
    // For this example, we're simulating the API call
    console.log(`Fetching LinkedIn jobs for query: ${query}, location: ${location}`);
    
    // Since we can't make real API calls without credentials, return filtered mock data
    return filterMockLinkedInJobs(query, location);
  } catch (error) {
    console.error('Error fetching LinkedIn jobs:', error);
    return [];
  }
}

// Function to filter mock LinkedIn jobs based on query and location
function filterMockLinkedInJobs(query = '', location = '') {
  const normalizedQuery = query.toLowerCase();
  const normalizedLocation = location.toLowerCase();
  
  // Get only LinkedIn jobs from our mock data
  const linkedInJobs = JOBS_DATA.filter(job => 
    job.source.toLowerCase() === 'linkedin' && 
    (normalizedQuery === '' || 
      job.title.toLowerCase().includes(normalizedQuery) ||
      job.company.toLowerCase().includes(normalizedQuery) ||
      job.description.toLowerCase().includes(normalizedQuery) ||
      job.skills.some(skill => skill.toLowerCase().includes(normalizedQuery))) &&
    (normalizedLocation === '' || 
      job.location.toLowerCase().includes(normalizedLocation))
  );
  
  // Add simulated recent timestamps to make them appear as new listings
  return linkedInJobs.map(job => ({
    ...job,
    timestamp: new Date(Date.now() - Math.floor(Math.random() * 72) * 60 * 60 * 1000).toISOString(),
    isRealJob: false // Flag to indicate this is mock data
  }));
}

// Function to calculate skill overlap between job and user skills
export function calculateRelevanceScore(jobSkills, userSkills) {
  if (!userSkills || userSkills.length === 0) {
    return {
      score: 0,
      matchingSkills: []
    };
  }
  
  // Convert all skills to lowercase for case-insensitive matching
  const normalizedJobSkills = jobSkills.map(skill => skill.toLowerCase());
  const normalizedUserSkills = userSkills.map(skill => skill.toLowerCase());
  
  // Count matching skills
  const matchingSkills = normalizedUserSkills.filter(skill => 
    normalizedJobSkills.includes(skill)
  );
  
  // Calculate score: (matching skills / job skills) * 100
  const matchPercentage = (matchingSkills.length / normalizedJobSkills.length) * 100;
  
  return {
    score: matchPercentage,
    matchingSkills: matchingSkills
  };
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  
  // Get query parameters
  const query = searchParams.get('query') || '';
  const location = searchParams.get('location') || '';
  const source = searchParams.get('source') || 'all';
  const remote = searchParams.get('remote') === 'true';
  const userSkills = searchParams.get('skills') ? JSON.parse(searchParams.get('skills')) : [];
  const recentOnly = searchParams.get('recent') === 'true';
  
  // Convert query to lowercase for case-insensitive search
  const normalizedQuery = query.toLowerCase();
  const normalizedLocation = location.toLowerCase();
  
  // Determine if we need to fetch real LinkedIn jobs
  let allJobs = [];
  
  if (source === 'linkedin' || (source === 'all' && recentOnly)) {
    // Fetch real LinkedIn jobs
    const linkedInJobs = await fetchLinkedInJobs(query, location, 20);
    
    // If we're specifically looking for LinkedIn jobs, only use LinkedIn jobs
    if (source === 'linkedin') {
      allJobs = linkedInJobs;
    } else {
      // Otherwise, add LinkedIn jobs to our mock data
      const otherJobs = JOBS_DATA.filter(job => job.source.toLowerCase() !== 'linkedin');
      allJobs = [...linkedInJobs, ...otherJobs];
    }
  } else {
    // Use mock data
    allJobs = JOBS_DATA;
  }
  
  // Filter jobs based on query parameters
  let filteredJobs = allJobs.filter(job => {
    // Filter by search query (check title, company, description, and skills)
    const matchesQuery = normalizedQuery === '' || 
      job.title.toLowerCase().includes(normalizedQuery) ||
      job.company.toLowerCase().includes(normalizedQuery) ||
      job.description.toLowerCase().includes(normalizedQuery) ||
      job.skills.some(skill => skill.toLowerCase().includes(normalizedQuery));
    
    // Filter by location (if provided)
    const matchesLocation = normalizedLocation === '' || 
      job.location.toLowerCase().includes(normalizedLocation);
    
    // Filter by source (if not 'all')
    const matchesSource = source === 'all' || 
      job.source.toLowerCase() === source.toLowerCase();
    
    // Filter by remote status (if true)
    const matchesRemote = !remote || job.remote === true;
    
    // Filter by recency (last 72 hours)
    const matchesRecent = !recentOnly || (
      job.timestamp && 
      new Date(job.timestamp) > new Date(Date.now() - 72 * 60 * 60 * 1000)
    );
    
    return matchesQuery && matchesLocation && matchesSource && matchesRemote && matchesRecent;
  });
  
  // Calculate relevance score based on user skills (if provided)
  filteredJobs = filteredJobs.map(job => {
    const relevance = calculateRelevanceScore(job.skills, userSkills);
    
    // Format the posted date for display
    const postedDate = job.timestamp 
      ? formatTimeAgo(new Date(job.timestamp))
      : 'Recently posted';
    
    return {
      ...job,
      relevanceScore: relevance.score,
      matchingSkills: relevance.matchingSkills,
      posted: postedDate
    };
  });
  
  // Sort jobs by recency first, then relevance score
  filteredJobs.sort((a, b) => {
    // If both have timestamps, sort by most recent
    if (a.timestamp && b.timestamp) {
      // If one is recent (< 72 hours) and the other isn't, prioritize the recent one
      const aIsRecent = new Date(a.timestamp) > new Date(Date.now() - 72 * 60 * 60 * 1000);
      const bIsRecent = new Date(b.timestamp) > new Date(Date.now() - 72 * 60 * 60 * 1000);
      
      if (aIsRecent && !bIsRecent) return -1;
      if (!aIsRecent && bIsRecent) return 1;
      
      // If both are recent or both are not recent, sort by timestamp
      return new Date(b.timestamp) - new Date(a.timestamp);
    }
    
    // Otherwise, sort by relevance score
    return b.relevanceScore - a.relevanceScore;
  });
  
  return NextResponse.json({
    totalCount: filteredJobs.length,
    jobs: filteredJobs
  });
}

// Helper function to format time ago
function formatTimeAgo(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffDay > 0) {
    return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
  }
  if (diffHour > 0) {
    return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
  }
  if (diffMin > 0) {
    return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
  }
  return 'Just now';
}
