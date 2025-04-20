"use client";
import React, { useState, useEffect } from "react";
import Header from "../dashboard/Header";
import { Briefcase, MapPin, Building, ExternalLink, Filter, Search, Clock, ChevronDown, X, CheckSquare, Square, AlertCircle } from 'lucide-react';
import Image from 'next/image';

export default function JobsPage() {
  // User profile state
  const [profile, setProfile] = useState({});
  
  // Search states
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [isRemoteOnly, setIsRemoteOnly] = useState(false);
  const [selectedSource, setSelectedSource] = useState('all');
  const [recentLinkedInOnly, setRecentLinkedInOnly] = useState(false);
  
  // Results states
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [totalJobs, setTotalJobs] = useState(0);
  
  // LinkedIn API status
  const [linkedInConnected, setLinkedInConnected] = useState(false);
  const [apiStatusChecked, setApiStatusChecked] = useState(false);
  
  // Load profile from localStorage if exists and check LinkedIn connection
  useEffect(() => {
    // Check LinkedIn API status
    const enableRealLinkedIn = process.env.NEXT_PUBLIC_ENABLE_REAL_LINKEDIN === 'true';
    setLinkedInConnected(enableRealLinkedIn);
    setApiStatusChecked(true);
    
    // Load user profile
    const stored = JSON.parse(localStorage.getItem('profile') || '{}');
    setProfile(stored);
    
    // If we have profile skills, use the first one as initial search
    if (stored?.skills?.length > 0) {
      setSearch(stored.skills[0]);
      fetchJobs(stored.skills[0], '', 'all', false);
    } else {
      // Otherwise, just fetch some jobs
      fetchJobs('', '', 'all', false);
    }
  }, []);

  // Fetch Gemini suggestions based on profile
  const fetchSuggestions = async () => {
    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile }),
      });
      const data = await res.json();
      setSuggestions(data);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  // Fetch jobs from API
  const fetchJobs = async (query, loc, source, remote) => {
    setLoading(true);
    
    try {
      const params = new URLSearchParams();
      if (query) params.append('query', query);
      if (loc) params.append('location', loc);
      if (source) params.append('source', source);
      if (remote) params.append('remote', 'true');
      if (recentLinkedInOnly) {
        params.append('recent', 'true');
        if (source === 'all') params.append('source', 'linkedin');
      }
      
      const res = await fetch(`/api/jobspy?${params.toString()}`);
      const data = await res.json();
      
      setJobs(data.jobs || []);
      setTotalJobs(data.totalCount || 0);
      setSelectedJob(data.jobs?.length > 0 ? data.jobs[0] : null);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setLoading(false);
    }
  };

  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    fetchJobs(search, location, selectedSource, isRemoteOnly);
    fetchSuggestions();
  };

  // Apply filters
  const applyFilters = () => {
    // If recent LinkedIn is selected, enforce LinkedIn as source
    if (recentLinkedInOnly && selectedSource !== 'linkedin') {
      setSelectedSource('linkedin');
    }
    fetchJobs(search, location, selectedSource, isRemoteOnly);
    setFilterOpen(false);
  };

  // Reset filters
  const resetFilters = () => {
    setSelectedSource('all');
    setIsRemoteOnly(false);
    setRecentLinkedInOnly(false);
    setFilterOpen(false);
    fetchJobs(search, location, 'all', false);
  };

  // Get the source logo for job listings
  const getSourceLogo = (source) => {
    if (source?.toLowerCase() === 'linkedin') {
      return "/icons/linkedin.png";
    } else if (source?.toLowerCase() === 'indeed') {
      return "/icons/indeed.png";
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="pt-24 pb-10">
        {/* Top section with search */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2 text-blue-700">AI Job Search</h1>
                {apiStatusChecked && (
                  <div className="flex items-center mt-1">
                    {linkedInConnected ? (
                      <div className="flex items-center text-sm text-green-600">
                        <CheckSquare size={16} className="mr-1" />
                        Connected to LinkedIn API
                      </div>
                    ) : (
                      <div className="flex items-center text-sm text-amber-600">
                        <AlertCircle size={16} className="mr-1" />
                        Using sample job data (LinkedIn API not configured)
                      </div>
                    )}
                  </div>
                )}
              </div>
              <a href="/insights" className="inline-block bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded shadow transition">
                Career Insights
              </a>
            </div>
            
            {/* Search form */}
            <form onSubmit={handleSearch} className="w-full">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="md:flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Job title, skills, or company"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="md:w-64">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Location"
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    type="button" 
                    onClick={() => setFilterOpen(!filterOpen)}
                    className="px-4 py-3 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
                  >
                    <Filter size={18} className="mr-1" />
                    Filters
                  </button>
                  
                  <button 
                    type="submit" 
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex-shrink-0"
                  >
                    Search Jobs
                  </button>
                </div>
              </div>
              
              {/* Filter panel */}
              {filterOpen && (
                <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium">Filter Results</h3>
                    <button 
                      onClick={() => setFilterOpen(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-6">
                    <div className="flex flex-col space-y-2">
                      <span className="text-sm font-medium text-gray-700">Job Source</span>
                      <div className="flex flex-wrap gap-2">
                        <button 
                          onClick={() => setSelectedSource('all')}
                          className={`px-3 py-1 rounded-full text-sm ${
                            selectedSource === 'all' 
                              ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          All Sources
                        </button>
                        <button 
                          onClick={() => setSelectedSource('linkedin')}
                          className={`px-3 py-1 rounded-full text-sm ${
                            selectedSource === 'linkedin' 
                              ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          LinkedIn
                        </button>
                        <button 
                          onClick={() => setSelectedSource('indeed')}
                          className={`px-3 py-1 rounded-full text-sm ${
                            selectedSource === 'indeed' 
                              ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          Indeed
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-3">
                      <div className="flex items-center">
                        <button 
                          onClick={() => setIsRemoteOnly(!isRemoteOnly)}
                          className="flex items-center"
                        >
                          {isRemoteOnly ? <CheckSquare size={20} className="text-blue-600 mr-2" /> : <Square size={20} className="text-gray-400 mr-2" />}
                          <span className="text-sm font-medium text-gray-700">Remote Only</span>
                        </button>
                      </div>
                      
                      <div className="flex items-center">
                        <button 
                          onClick={() => setRecentLinkedInOnly(!recentLinkedInOnly)}
                          className="flex items-center"
                        >
                          {recentLinkedInOnly ? <CheckSquare size={20} className="text-blue-600 mr-2" /> : <Square size={20} className="text-gray-400 mr-2" />}
                          <span className="text-sm font-medium text-gray-700">LinkedIn Jobs (Last 72 hours)</span>
                          {!linkedInConnected && recentLinkedInOnly && (
                            <span className="ml-2 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                              Using sample data
                            </span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2 mt-4">
                    <button 
                      onClick={resetFilters} 
                      className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
                    >
                      Reset
                    </button>
                    <button 
                      onClick={applyFilters} 
                      className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
        
        {/* Job listings section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="bg-white rounded-lg shadow-sm p-8 flex justify-center">
              <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
          ) : jobs.length > 0 ? (
            <div className="flex flex-col md:flex-row gap-6">
              {/* Job list */}
              <div className="md:w-2/5">
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-gray-200">
                    <h2 className="font-semibold text-gray-800">
                      {totalJobs} Jobs Found 
                      {recentLinkedInOnly && " • Recent LinkedIn Jobs"}
                      {!recentLinkedInOnly && selectedSource !== 'all' && ` • ${selectedSource}`}
                    </h2>
                  </div>
                  
                  <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
                    {jobs.map(job => (
                      <div 
                        key={job.id} 
                        className={`p-4 cursor-pointer hover:bg-blue-50 transition-colors ${selectedJob?.id === job.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                        onClick={() => setSelectedJob(job)}
                      >
                        <div className="flex items-start">
                          <div className="flex-1">
                            <h3 className="font-medium text-blue-700">{job.title}</h3>
                            <div className="flex items-center text-sm text-gray-600 mt-1 space-x-4">
                              <span className="flex items-center">
                                <Building size={14} className="mr-1" />
                                {job.company}
                              </span>
                              <span className="flex items-center">
                                <MapPin size={14} className="mr-1" />
                                {job.location}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                              <Clock size={14} className="inline mr-1" />
                              {job.posted}
                              {job.isRealJob === false && (
                                <span className="ml-2 text-xs bg-amber-50 text-amber-600 px-1 py-0.5 rounded">
                                  Sample
                                </span>
                              )}
                            </p>
                          </div>
                          
                          {job.source && (
                            <div className="ml-2 flex-shrink-0">
                              {getSourceLogo(job.source) ? (
                                <div className="w-6 h-6 relative">
                                  <Image
                                    src={getSourceLogo(job.source)}
                                    alt={job.source}
                                    width={24}
                                    height={24}
                                    style={{ objectFit: 'contain' }}
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                    }}
                                  />
                                </div>
                              ) : (
                                <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                                  {job.source}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Job details */}
              <div className="md:w-3/5">
                {selectedJob ? (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">{selectedJob.title}</h2>
                        <div className="flex items-center mt-2">
                          <span className="text-lg font-medium text-gray-700">{selectedJob.company}</span>
                          {selectedJob.source && (
                            <span className="ml-3 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              via {selectedJob.source}
                            </span>
                          )}
                          {selectedJob.isRealJob === false && (
                            <span className="ml-2 px-2 py-1 bg-amber-50 text-amber-600 text-xs rounded">
                              Sample Data
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <a 
                        href={selectedJob.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center"
                      >
                        Apply <ExternalLink size={16} className="ml-1" />
                      </a>
                    </div>
                    
                    <div className="mt-4 flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center text-gray-700">
                        <MapPin size={18} className="mr-1" />
                        {selectedJob.location}
                      </div>
                      
                      {selectedJob.salary && (
                        <div className="flex items-center text-gray-700">
                          <span className="font-medium">{selectedJob.salary}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center text-gray-700">
                        <Clock size={18} className="mr-1" />
                        {selectedJob.posted}
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Job Description</h3>
                      <p className="text-gray-700 whitespace-pre-line">{selectedJob.description}</p>
                    </div>
                    
                    {selectedJob.requirements && (
                      <div className="mt-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Requirements</h3>
                        <ul className="list-disc pl-5 space-y-1">
                          {Array.isArray(selectedJob.requirements) 
                            ? selectedJob.requirements.map((req, index) => (
                                <li key={index} className="text-gray-700">{req}</li>
                              ))
                            : <li className="text-gray-700">{selectedJob.requirements}</li>
                          }
                        </ul>
                      </div>
                    )}
                    
                    <div className="mt-8 pt-4 border-t border-gray-200">
                      <a 
                        href={selectedJob.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                      >
                        View full job on {selectedJob.source} <ExternalLink size={16} className="ml-1" />
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                    <p className="text-gray-500">Select a job to view details</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <p className="text-gray-500">No jobs found. Try a different search.</p>
            </div>
          )}
          
          {/* Personalized suggestions section */}
          {suggestions && (
            <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-blue-800 mb-4">Personalized Job Suggestions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-800 mb-2">Recommended Roles</h3>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.roles?.map((role, index) => (
                      <button 
                        key={index}
                        onClick={() => {
                          setSearch(role);
                          fetchJobs(role, location, selectedSource, isRemoteOnly);
                        }}
                        className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-full text-sm"
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 mb-2">Skill Gaps to Address</h3>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.skillGaps?.map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
