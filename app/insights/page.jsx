'use client';

import React, { useState, useEffect } from 'react';
import Header from '../dashboard/Header';
import { Button } from '@/components/ui/button';
import { 
  Loader, Award, BookOpen, CheckCircle, ChevronRight, Target, 
  MessageSquare, BarChart, Briefcase, LineChart, ThumbsUp, ThumbsDown 
} from 'lucide-react';

export default function CareerInsightsPage() {
  // State for form fields
  const [currentRole, setCurrentRole] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');
  const [skills, setSkills] = useState('');
  const [goalRole, setGoalRole] = useState('');
  const [communicationSkills, setCommunicationSkills] = useState({
    written: 3,
    verbal: 3,
    presentation: 3,
    teamwork: 3,
    leadership: 3
  });
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState(null);
  const [activeTab, setActiveTab] = useState('career');
  const [profile, setProfile] = useState({});
  const [selectedSkill, setSelectedSkill] = useState('');
  const [verifyMethod, setVerifyMethod] = useState('assessment');
  const [verifyingSkill, setVerifyingSkill] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  // Load profile from localStorage if exists
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('profile') || '{}');
    setProfile(stored);
    
    // Pre-fill form if profile exists
    if (stored.currentRole) setCurrentRole(stored.currentRole);
    if (stored.skills) setSkills(stored.skills.join(', '));
    if (stored.communicationSkills) setCommunicationSkills(stored.communicationSkills);

    // Also fetch skills from database if we have a userId
    if (stored.userId) {
      fetchUserSkills(stored.userId);
    }
  }, []);

  // Fetch user skills from the database
  const fetchUserSkills = async (userId) => {
    try {
      const response = await fetch(`/api/user-skills?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.skills && data.skills.length > 0) {
          // Update the skills input with database skills
          const skillNames = data.skills.map(s => s.skill);
          setSkills(skillNames.join(', '));
          
          // Also update in the profile
          const updatedProfile = { ...profile };
          updatedProfile.skills = skillNames;
          setProfile(updatedProfile);
        }
      }
    } catch (error) {
      console.error('Error fetching user skills:', error);
    }
  };

  // Save profile to localStorage
  const saveProfile = (data) => {
    localStorage.setItem('profile', JSON.stringify(data));
  };

  // Save skills to database if we have a userId
  const saveSkillsToDatabase = async (userId, skillsArray) => {
    try {
      const response = await fetch('/api/user-skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId, 
          skills: skillsArray.map(skill => ({ skill }))
        }),
      });
      
      if (!response.ok) {
        console.error('Failed to save skills to database');
      }
    } catch (error) {
      console.error('Error saving skills:', error);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Parse skills into array
    const skillsArray = skills.split(',')
      .map(skill => skill.trim())
      .filter(skill => skill !== ''); // Filter out empty strings
    
    // Create profile object
    const updatedProfile = {
      ...profile,
      userId: profile.userId || `user-${Date.now()}`, // Generate a userId if not exists
      currentRole,
      yearsExperience: parseInt(yearsExperience) || 0,
      skills: skillsArray,
      goalRole,
      communicationSkills
    };
    
    // Save to localStorage
    saveProfile(updatedProfile);
    
    // First try to save skills to database, but continue even if it fails
    try {
      await saveSkillsToDatabase(updatedProfile.userId, skillsArray);
    } catch (skillSaveError) {
      console.error('Error saving skills to database:', skillSaveError);
      // Continue with the insights API call even if skills saving failed
    }
    
    // Call the skill-insights API with error handling
    try {
      const skillParams = new URLSearchParams({
        userId: updatedProfile.userId,
        currentRole: currentRole,
        goalRole: goalRole
      });
      
      const response = await fetch(`/api/skill-insights?${skillParams}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        console.error('Skill insights API error:', response.status);
        throw new Error('Failed to get insights');
      }
      
      const data = await response.json();
      
      if (!data.success) {
        console.error('API returned unsuccessful response:', data);
        throw new Error(data.error || 'API returned unsuccessful response');
      }
      
      // Transform skill insights to match the existing UI format
      const transformedInsights = {
        summary: data.insights.careerPath?.recommendedRoles?.[0]?.alignment || 
                'Based on your skills, here is a personalized career assessment.',
        
        skillGaps: data.insights.learningPlan?.prioritySkills?.map(skill => ({
          skill: skill.skill,
          importance: skill.difficulty === "Advanced" ? "High" : 
                    skill.difficulty === "Intermediate" ? "Medium" : "Low",
          reason: skill.reason
        })) || [],
        
        // Continue with rest of transformation
        marketTrends: [
          {
            trend: "Skill Demand Trends",
            impact: data.insights.marketInsights?.demandTrends || "Technology skills continue to be in high demand.",
            action: "Focus on developing in-demand skills to increase your marketability."
          },
          {
            trend: "Salary Impact of Skills",
            impact: data.insights.marketInsights?.salaryImpact || "Specialized skills can significantly increase earning potential.",
            action: "Prioritize learning the skills with highest salary impact."
          },
          {
            trend: "Geographic Opportunities",
            impact: data.insights.marketInsights?.geographicOpportunities || "Remote work opportunities continue to grow in the tech industry.",
            action: "Consider developing skills that enable remote work flexibility."
          }
        ],
        
        salaryInsights: {
          current: `The average salary for a ${currentRole} varies based on your skills and location.`,
          target: `The average salary for a ${goalRole} depends on your skill proficiency and experience.`,
          potential: data.insights.marketInsights?.salaryImpact || "Specialized skills can increase salary potential by 15-25%",
          negotiationTips: [
            "Quantify the impact of your work when discussing compensation",
            "Research industry-specific salary data based on your skillset",
            "Highlight your verified and high-proficiency skills during negotiations",
            "Discuss non-salary benefits that matter to you"
          ]
        },
        
        communicationAssessment: {
          strengths: ["Written communication", "Teamwork"],
          improvements: ["Technical presentations", "Leadership communication"],
          tips: [
            "Practice explaining complex technical concepts to non-technical audiences",
            "Volunteer to present at team meetings to develop presentation skills",
            "Document your technical decisions with clear reasoning",
            "Seek feedback on your communication from peers and mentors"
          ],
          industryContext: `Strong communication skills complement your technical abilities and become increasingly important as you advance toward ${goalRole}.`
        },
        
        roadmap: [
          {
            title: "Skill Development Phase",
            timeframe: "0-3 months",
            tasks: data.insights.learningPlan?.prioritySkills?.slice(0, 3).map(skill => 
              `Develop proficiency in ${skill.skill}`
            ) || ["Improve your highest priority skills"],
            outcomeMetrics: ["Increased skill proficiency", "Portfolio projects demonstrating skills"]
          },
          {
            title: "Application & Experience",
            timeframe: "3-6 months",
            tasks: [
              `Apply your skills in real-world projects`,
              `Build portfolio pieces showcasing your abilities`,
              `Network with professionals in your target role`
            ],
            outcomeMetrics: ["Completed projects", "Expanded professional network"]
          },
          {
            title: "Career Transition",
            timeframe: "6-12 months",
            tasks: [
              `Target roles that match your skill profile`,
              `Showcase your portfolio and verified skills`,
              `Negotiate based on your unique skill combination`
            ],
            outcomeMetrics: ["Interview success rate", "Job offers aligned with goals"]
          }
        ],
        
        recommendedResources: data.insights.learningPlan?.recommendedResources?.map(resource => ({
          title: resource.title || "Learning resource",
          url: resource.link || "#",
          type: resource.type || "Resource",
          reason: resource.reason || `Recommended to help you develop key skills for your career progression`
        })) || [],
        
        feedbackAreas: [
          {
            area: "Technical skill proficiency",
            from: "Senior developers or technical leads",
            questions: [
              "What areas of my technical skills need improvement?",
              "How do my skills compare to others at my desired level?",
              "What projects would help me demonstrate my skills more effectively?"
            ]
          },
          {
            area: "Career progression",
            from: `Professionals in ${goalRole} positions`,
            questions: [
              `What skills were most valuable in your progression to ${goalRole}?`,
              "What do you wish you had focused on earlier in your career?",
              "What skills do you think will be most important in the next 2-3 years?"
            ]
          }
        ]
      };
      
      // Also fetch user's full skill data including proficiency
      try {
        if (updatedProfile.userId) {
          const skillResponse = await fetch(`/api/user-skills?userId=${updatedProfile.userId}`);
          if (skillResponse.ok) {
            const skillData = await skillResponse.json();
            if (skillData.skills?.length > 0) {
              // Add user's verified and top skills to the insights
              const verifiedSkills = skillData.skills.filter(s => s.isVerified).map(s => s.skill);
              const topSkills = skillData.skills
                .sort((a, b) => (b.proficiency || 0) - (a.proficiency || 0))
                .slice(0, 5)
                .map(s => ({
                  name: s.skill,
                  proficiency: s.proficiency || 1,
                  isVerified: s.isVerified || false
                }));
              
              transformedInsights.userSkillData = {
                verifiedSkills,
                topSkills
              };
            }
          }
        }
      } catch (skillError) {
        console.error('Error fetching detailed skill data:', skillError);
      }
      
      // Set the insights with skill data included
      setInsights(transformedInsights);
      
    } catch (error) {
      console.error('Error getting insights:', error);
      
      // Instead of falling back to hardcoded insights, show error message to user
      setLoading(false);
      // Don't set insights at all, which will indicate to user that generation failed
      return;
    } finally {
      setLoading(false);
    }
  };

  // Handle communication skill rating
  const handleSkillRating = (skill, value) => {
    setCommunicationSkills(prev => ({
      ...prev,
      [skill]: value
    }));
  };

  // Render skill rating component
  const SkillRating = ({ skill, label }) => {
    return (
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-medium mb-2">
          {label}
        </label>
        <div className="flex items-center">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => handleSkillRating(skill, value)}
              className={`w-8 h-8 rounded-full mx-1 flex items-center justify-center ${
                communicationSkills[skill] >= value
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {value}
            </button>
          ))}
          <span className="ml-2 text-sm text-gray-500">
            {getSkillLevelText(communicationSkills[skill])}
          </span>
        </div>
      </div>
    );
  };
  
  // Helper function to get the text for skill level
  const getSkillLevelText = (value) => {
    if (value === 1) return 'Beginner';
    if (value === 2) return 'Basic';
    if (value === 3) return 'Intermediate';
    if (value === 4) return 'Advanced';
    return 'Expert';
  };
  
  const tabItems = [
    { id: 'career', label: 'Career Path', icon: <Briefcase className="h-4 w-4 mr-1" /> },
    { id: 'skills', label: 'Skills Gap', icon: <Award className="h-4 w-4 mr-1" /> },
    { id: 'communication', label: 'Communication', icon: <MessageSquare className="h-4 w-4 mr-1" /> },
    { id: 'market', label: 'Market Trends', icon: <LineChart className="h-4 w-4 mr-1" /> },
    { id: 'salary', label: 'Salary', icon: <BarChart className="h-4 w-4 mr-1" /> },
    { id: 'feedback', label: 'Feedback', icon: <MessageSquare className="h-4 w-4 mr-1" /> }
  ];

  const verifySkill = async () => {
    if (!selectedSkill) return;
    
    setVerifyingSkill(true);
    setVerificationResult(null);
    
    try {
      // Prepare mock proof data based on verification method
      let proofData = {};
      
      switch (verifyMethod) {
        case 'assessment':
          proofData = { 
            answers: Array(10).fill(0).map(() => Math.floor(Math.random() * 4)) 
          };
          break;
        case 'certification':
          proofData = { 
            certificationId: `CERT-${Math.floor(Math.random() * 10000)}`,
            issuer: 'AiCademy Learning',
            expiryDate: new Date(Date.now() + 31536000000).toISOString() // 1 year from now
          };
          break;
        case 'portfolio':
          proofData = { 
            examples: [
              { title: 'Project 1', url: 'https://github.com/example/project1' },
              { title: 'Project 2', url: 'https://github.com/example/project2' }
            ]
          };
          break;
        case 'endorsement':
          proofData = { 
            endorsers: [
              { name: 'Jane Doe', relation: 'Manager', title: 'Senior Developer' },
              { name: 'John Smith', relation: 'Colleague', title: 'Team Lead' },
              { name: 'Alex Chen', relation: 'Mentor', title: 'Engineering Manager' }
            ]
          };
          break;
      }
      
      const response = await fetch('/api/verify-skill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: profile.userId,
          skill: selectedSkill,
          verificationMethod: verifyMethod,
          proofData
        })
      });
      
      const result = await response.json();
      setVerificationResult(result);
      
      // If verification was successful, update the profile
      if (result.success) {
        // Wait a moment to show success message
        setTimeout(() => {
          // Refresh user skills
          fetchUserSkills(profile.userId);
          // Clear selection
          setSelectedSkill('');
          setVerificationResult(null);
        }, 3000);
      }
    } catch (error) {
      console.error('Error verifying skill:', error);
      setVerificationResult({
        success: false,
        message: 'Failed to verify skill due to an error'
      });
    } finally {
      setVerifyingSkill(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="pt-28 pb-10 max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-2 text-blue-700">AI Career Insights</h1>
        <p className="text-gray-600 mb-8">Get personalized career advice, communication assessment, and a roadmap to reach your professional goals</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 mb-4 sticky top-24">
              <h2 className="text-xl font-semibold mb-4">Your Career Profile</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="currentRole">
                    Current Role
                  </label>
                  <input
                    id="currentRole"
                    type="text"
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    placeholder="e.g. Junior Developer"
                    value={currentRole}
                    onChange={(e) => setCurrentRole(e.target.value)}
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="yearsExperience">
                    Years of Experience
                  </label>
                  <input
                    id="yearsExperience"
                    type="number"
                    min="0"
                    max="50"
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    placeholder="e.g. 2"
                    value={yearsExperience}
                    onChange={(e) => setYearsExperience(e.target.value)}
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="skills">
                    Technical Skills
                  </label>
                  <textarea
                    id="skills"
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    placeholder="e.g. JavaScript, React, Node.js"
                    rows="2"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    required
                  ></textarea>
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="goalRole">
                    Target Role
                  </label>
                  <input
                    id="goalRole"
                    type="text"
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    placeholder="e.g. Senior Frontend Developer"
                    value={goalRole}
                    onChange={(e) => setGoalRole(e.target.value)}
                    required
                  />
                </div>
                
                <div className="mb-6">
                  <h3 className="font-medium text-gray-800 mb-3">Communication Skills</h3>
                  <p className="text-sm text-gray-500 mb-4">Rate your skills from 1 (beginner) to 5 (expert)</p>
                  
                  <SkillRating skill="written" label="Written Communication" />
                  <SkillRating skill="verbal" label="Verbal Communication" />
                  <SkillRating skill="presentation" label="Presentation Skills" />
                  <SkillRating skill="teamwork" label="Teamwork & Collaboration" />
                  <SkillRating skill="leadership" label="Leadership Communication" />
                </div>
                
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Target className="mr-2 h-4 w-4" />}
                  {loading ? 'Analyzing Your Career...' : 'Generate Comprehensive Insights'}
                </Button>
              </form>
            </div>
          </div>
          
          {/* Results Section */}
          <div className="lg:col-span-2">
            {insights ? (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                  <h2 className="text-xl font-bold text-white">Your Career Analysis</h2>
                </div>
                
                <div className="border-b border-gray-200">
                  <nav className="flex overflow-x-auto px-6 py-2">
                    {tabItems.map(tab => (
                      <button
                        key={tab.id}
                        className={`px-3 py-2 font-medium text-sm rounded-md mr-2 flex items-center whitespace-nowrap ${
                          activeTab === tab.id 
                            ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                        }`}
                        onClick={() => setActiveTab(tab.id)}
                      >
                        {tab.icon} {tab.label}
                      </button>
                    ))}
                  </nav>
                </div>
                
                <div className="p-6">
                  {/* Career Overview Tab */}
                  {activeTab === 'career' && (
                    <div>
                      <div className="mb-6">
                        <h3 className="font-medium text-xl text-gray-900 mb-3">Career Overview</h3>
                        <p className="text-gray-700">{insights.summary}</p>
                      </div>
                      
                      {/* Add User Skills Display here */}
                      {insights.userSkillData && (
                        <div className="mb-6 bg-gray-50 border rounded-lg p-4">
                          <h3 className="text-lg font-semibold flex items-center text-blue-700 mb-3">
                            <Award className="mr-2 h-5 w-5" /> Your Skills Profile
                          </h3>
                          
                          {insights.userSkillData.verifiedSkills?.length > 0 && (
                            <div className="mb-4">
                              <h4 className="font-medium text-gray-800 mb-2">Verified Skills</h4>
                              <div className="flex flex-wrap gap-2">
                                {insights.userSkillData.verifiedSkills.map((skill, i) => (
                                  <span 
                                    key={i} 
                                    className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center"
                                  >
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          <div>
                            <h4 className="font-medium text-gray-800 mb-2">Top Skills</h4>
                            <div className="space-y-2">
                              {insights.userSkillData.topSkills?.map((skill, i) => (
                                <div key={i} className="flex items-center">
                                  <span className="w-24 text-sm text-gray-600">{skill.name}</span>
                                  <div className="flex-1 h-2 bg-gray-200 rounded-full mx-2">
                                    <div 
                                      className={`h-2 rounded-full ${skill.isVerified ? 'bg-green-500' : 'bg-blue-500'}`}
                                      style={{ width: `${skill.proficiency * 20}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-xs text-gray-500">
                                    {skill.proficiency}/5 {skill.isVerified && '✓'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold flex items-center text-blue-700 mb-3">
                          <Target className="mr-2 h-5 w-5" /> Development Roadmap
                        </h3>
                        <div className="space-y-4">
                          {insights.roadmap.map((phase, index) => (
                            <div key={index} className="border-l-2 border-blue-500 pl-4 pb-1">
                              <h4 className="font-medium text-blue-800">{phase.title} <span className="text-sm font-normal text-gray-500">({phase.timeframe})</span></h4>
                              <ul className="mt-2 space-y-1">
                                {phase.tasks.map((task, taskIndex) => (
                                  <li key={taskIndex} className="text-sm text-gray-700 flex items-start">
                                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 shrink-0" />
                                    <span>{task}</span>
                                  </li>
                                ))}
                              </ul>
                              
                              {phase.outcomeMetrics && (
                                <div className="mt-3 bg-blue-50 p-2 rounded">
                                  <p className="text-xs font-medium text-blue-700 mb-1">Success Metrics:</p>
                                  <ul className="space-y-1">
                                    {phase.outcomeMetrics.map((metric, metricIndex) => (
                                      <li key={metricIndex} className="text-xs text-blue-800 flex items-start">
                                        <span>• {metric}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Skills Gap Tab */}
                  {activeTab === 'skills' && (
                    <div>
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold flex items-center text-blue-700 mb-3">
                          <Award className="mr-2 h-5 w-5" /> Skills Gap Analysis
                        </h3>
                        <p className="text-gray-600 mb-4">Based on your current skills and career goals, we recommend focusing on developing these skills:</p>
                        
                        <div className="space-y-4">
                          {Array.isArray(insights.skillGaps) && insights.skillGaps.map((skillGap, index) => {
                            // Handle both old and new format
                            if (typeof skillGap === 'string') {
                              return (
                                <div key={index} className="flex items-start">
                                  <ChevronRight className="h-5 w-5 text-blue-500 mr-2 shrink-0" />
                                  <span>{skillGap}</span>
                                </div>
                              );
                            } else {
                              // New format with importance and reason
                              return (
                                <div key={index} className="border rounded-lg p-3 bg-white">
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium text-gray-800">{skillGap.skill}</span>
                                    <span className={`text-xs px-2 py-1 rounded ${
                                      skillGap.importance === 'High' 
                                        ? 'bg-red-100 text-red-700' 
                                        : skillGap.importance === 'Medium'
                                          ? 'bg-yellow-100 text-yellow-700'
                                          : 'bg-green-100 text-green-700'
                                    }`}>
                                      {skillGap.importance} Priority
                                    </span>
                                  </div>
                                  {skillGap.reason && (
                                    <p className="text-sm text-gray-600 mt-2">{skillGap.reason}</p>
                                  )}
                                </div>
                              );
                            }
                          })}
                        </div>
                      </div>
                      
                      {profile.userId && (
                        <div className="mb-6 p-4 border rounded-lg bg-blue-50">
                          <h3 className="text-lg font-semibold flex items-center text-blue-700 mb-3">
                            <CheckCircle className="mr-2 h-5 w-5" /> Verify Your Skills
                          </h3>
                          <p className="text-gray-600 mb-4">Verified skills increase your credibility and can help match you with better opportunities.</p>
                          
                          {verificationResult ? (
                            <div className={`p-4 rounded-lg mb-4 ${verificationResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              <p className="font-medium">{verificationResult.message}</p>
                              {verificationResult.verificationDetails?.feedback && (
                                <p className="mt-2 text-sm">{verificationResult.verificationDetails.feedback}</p>
                              )}
                            </div>
                          ) : null}
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="block text-gray-700 text-sm font-medium mb-2">
                                Select Skill to Verify
                              </label>
                              <select
                                value={selectedSkill}
                                onChange={(e) => setSelectedSkill(e.target.value)}
                                className="w-full border border-gray-300 rounded px-3 py-2"
                              >
                                <option value="">Select a skill</option>
                                {profile.skills?.map((skill, i) => (
                                  <option key={i} value={skill}>{skill}</option>
                                ))}
                              </select>
                            </div>
                            
                            <div>
                              <label className="block text-gray-700 text-sm font-medium mb-2">
                                Verification Method
                              </label>
                              <select
                                value={verifyMethod}
                                onChange={(e) => setVerifyMethod(e.target.value)}
                                className="w-full border border-gray-300 rounded px-3 py-2"
                              >
                                <option value="assessment">Skill Assessment</option>
                                <option value="certification">Certification</option>
                                <option value="portfolio">Portfolio Examples</option>
                                <option value="endorsement">Peer Endorsements</option>
                              </select>
                            </div>
                          </div>
                          
                          <div className="flex justify-end">
                            <Button
                              onClick={verifySkill}
                              disabled={!selectedSkill || verifyingSkill}
                              className="flex items-center"
                            >
                              {verifyingSkill ? (
                                <Loader className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle className="mr-2 h-4 w-4" />
                              )}
                              {verifyingSkill ? 'Verifying...' : 'Verify Skill'}
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      <div>
                        <h3 className="text-lg font-semibold flex items-center text-blue-700 mb-3">
                          <BookOpen className="mr-2 h-5 w-5" /> Recommended Resources
                        </h3>
                        <div className="space-y-3">
                          {insights.recommendedResources.map((resource, index) => {
                            // Handle both old and new format
                            if (!resource.type) {
                              return (
                                <div key={index}>
                                  <a 
                                    href={resource.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline flex items-center"
                                  >
                                    <ChevronRight className="h-4 w-4 mr-1" />
                                    {resource.title}
                                  </a>
                                </div>
                              );
                            } else {
                              // New enhanced format
                              return (
                                <div key={index} className="border rounded-lg p-3 bg-white">
                                  <div className="flex justify-between items-start">
                                    <a 
                                      href={resource.url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline font-medium"
                                    >
                                      {resource.title}
                                    </a>
                                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                      {resource.type}
                                    </span>
                                  </div>
                                  {resource.reason && (
                                    <p className="text-sm text-gray-600 mt-2">{resource.reason}</p>
                                  )}
                                </div>
                              );
                            }
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Communication Tab */}
                  {activeTab === 'communication' && (
                    <div>
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold flex items-center text-blue-700 mb-3">
                          <MessageSquare className="mr-2 h-5 w-5" /> Communication Skills Assessment
                        </h3>
                        
                        {insights.communicationAssessment?.industryContext && (
                          <div className="bg-blue-50 p-4 rounded-lg mb-4">
                            <p className="text-gray-700 text-sm italic">{insights.communicationAssessment.industryContext}</p>
                          </div>
                        )}
                        
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-800 mb-2 flex items-center">
                            <ThumbsUp className="h-4 w-4 text-green-500 mr-2" /> Your Strengths
                          </h4>
                          <ul className="ml-6 list-disc text-gray-700">
                            {insights.communicationAssessment?.strengths.map((item, i) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-800 mb-2 flex items-center">
                            <ThumbsDown className="h-4 w-4 text-amber-500 mr-2" /> Areas for Improvement
                          </h4>
                          <ul className="ml-6 list-disc text-gray-700">
                            {insights.communicationAssessment?.improvements.map((item, i) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <h4 className="font-medium text-blue-700 mb-2">Tips to Improve:</h4>
                          <ul className="space-y-2">
                            {insights.communicationAssessment?.tips.map((tip, i) => (
                              <li key={i} className="flex items-start">
                                <CheckCircle className="h-4 w-4 text-blue-500 mr-2 shrink-0" />
                                <span className="text-gray-700">{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Market Trends Tab */}
                  {activeTab === 'market' && (
                    <div>
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold flex items-center text-blue-700 mb-3">
                          <LineChart className="mr-2 h-5 w-5" /> Industry & Market Trends
                        </h3>
                        <p className="text-gray-600 mb-4">Current trends that could impact your career trajectory:</p>
                        
                        <div className="space-y-4">
                          {Array.isArray(insights.marketTrends) && insights.marketTrends.map((trend, index) => {
                            // Handle both old and new format
                            if (typeof trend === 'string') {
                              return (
                                <div key={index} className="bg-gray-50 p-3 rounded-lg">
                                  <p className="text-gray-700">{trend}</p>
                                </div>
                              );
                            } else {
                              // New enhanced format
                              return (
                                <div key={index} className="border rounded-lg overflow-hidden">
                                  <div className="bg-gray-50 p-3">
                                    <p className="font-medium text-gray-800">{trend.trend}</p>
                                  </div>
                                  <div className="p-3 bg-white">
                                    <div className="mb-2">
                                      <span className="text-xs font-medium text-gray-500">IMPACT:</span>
                                      <p className="text-sm text-gray-700">{trend.impact}</p>
                                    </div>
                                    <div>
                                      <span className="text-xs font-medium text-blue-600">RECOMMENDED ACTION:</span>
                                      <p className="text-sm text-gray-700">{trend.action}</p>
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Salary Tab */}
                  {activeTab === 'salary' && (
                    <div>
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold flex items-center text-blue-700 mb-3">
                          <BarChart className="mr-2 h-5 w-5" /> Salary Insights
                        </h3>
                        
                        <div className="space-y-4">
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-medium text-gray-800 mb-1">Current Role</h4>
                            <p className="text-gray-700">{insights.salaryInsights?.current}</p>
                          </div>
                          
                          <div className="p-4 bg-blue-50 rounded-lg">
                            <h4 className="font-medium text-blue-700 mb-1">Target Role</h4>
                            <p className="text-gray-700">{insights.salaryInsights?.target}</p>
                          </div>
                          
                          <div className="p-4 bg-green-50 rounded-lg">
                            <h4 className="font-medium text-green-700 mb-1">Your Potential</h4>
                            <p className="text-gray-700">{insights.salaryInsights?.potential}</p>
                          </div>
                          
                          {insights.salaryInsights?.negotiationTips && (
                            <div className="mt-4 border rounded-lg p-4">
                              <h4 className="font-medium text-gray-800 mb-2">Negotiation Tips</h4>
                              <ul className="space-y-2">
                                {insights.salaryInsights.negotiationTips.map((tip, i) => (
                                  <li key={i} className="flex items-start">
                                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 shrink-0" />
                                    <span className="text-gray-700 text-sm">{tip}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Feedback Tab */}
                  {activeTab === 'feedback' && insights.feedbackAreas && (
                    <div>
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold flex items-center text-blue-700 mb-3">
                          <MessageSquare className="mr-2 h-5 w-5" /> Strategic Feedback Areas
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Seeking targeted feedback is critical for career growth. Here are key areas where you should proactively solicit feedback:
                        </p>
                        
                        <div className="space-y-6">
                          {insights.feedbackAreas.map((feedbackArea, index) => (
                            <div key={index} className="bg-white rounded-lg border p-4">
                              <div className="flex items-start">
                                <div className="bg-blue-100 p-2 rounded-full mr-3">
                                  <MessageSquare className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-800">{feedbackArea.area}</h4>
                                  <p className="text-sm text-gray-600 mt-1">
                                    <span className="font-medium">Request from:</span> {feedbackArea.from}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="mt-3 pl-12">
                                <h5 className="text-sm font-medium text-gray-700 mb-2">Questions to ask:</h5>
                                <ul className="space-y-2">
                                  {feedbackArea.questions.map((question, qIndex) => (
                                    <li key={qIndex} className="text-sm text-gray-700 flex items-start">
                                      <span className="text-blue-500 mr-2">•</span>
                                      <span>{question}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8 flex flex-col items-center justify-center h-full">
                <img 
                  src="/path-illustration.svg" 
                  alt="Career path illustration" 
                  className="w-64 h-64 mb-6 opacity-80"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                <h3 className="text-xl font-semibold text-blue-800 mb-2 text-center">Comprehensive Career Analysis</h3>
                <p className="text-center text-gray-600 max-w-md">
                  Complete your profile to receive personalized insights on your career path, skill gaps, communication abilities, market trends, and salary potential.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 