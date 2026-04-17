import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import {
  BriefcaseIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CalendarIcon,
  FunnelIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  BuildingOfficeIcon,
  SparklesIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

const formatSalary = (salary) => {
  if (!salary) return 'Not specified';
  if (typeof salary === 'string') return salary;
  if (typeof salary === 'object') {
    const cur = salary.currency || 'USD';
    const symbol = cur === 'INR' ? '₹' : cur === 'EUR' ? '€' : '$';
    const min = salary.min ? `${symbol}${salary.min.toLocaleString()}` : '';
    const max = salary.max ? `${symbol}${salary.max.toLocaleString()}` : '';
    if (min && max) return `${min} – ${max}`;
    if (min) return `From ${min}`;
    if (max) return `Up to ${max}`;
    return 'Not specified';
  }
  return String(salary);
};

const formatExperience = (exp) => {
  if (!exp) return null;
  if (typeof exp === 'string') return exp;
  if (typeof exp === 'object') {
    const unit = exp.experienceType || 'years';
    if (exp.min === 0 && exp.max === 0) return 'Freshers welcome';
    if (exp.min === exp.max) return `${exp.min} ${unit}`;
    if (exp.min && exp.max) return `${exp.min}–${exp.max} ${unit}`;
    if (exp.min) return `${exp.min}+ ${unit}`;
    if (exp.max) return `Up to ${exp.max} ${unit}`;
    return null;
  }
  return null;
};

const jobTypeBadge = {
  'full-time': 'bg-green-100 text-green-700',
  'part-time': 'bg-yellow-100 text-yellow-700',
  contract: 'bg-purple-100 text-purple-700',
  internship: 'bg-blue-100 text-blue-700',
  remote: 'bg-teal-100 text-teal-700',
};

const priorityDot = {
  urgent: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-yellow-400',
  low: 'bg-gray-400',
};

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedJob, setExpandedJob] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    jobType: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.keys(filters).forEach((key) => {
        if (filters[key]) params.append(key, filters[key]);
      });
      const response = await api.get(`/jobs?${params.toString()}`);
      const jobsData = response?.data?.data?.jobs || [];
      setJobs(jobsData);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const toggleExpand = (id) => {
    setExpandedJob(expandedJob === id ? null : id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Browse Jobs</h1>
        <p className="text-gray-500 mt-1">
          Discover opportunities that match your skills
        </p>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title, company, or keywords..."
                className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors flex items-center gap-2"
            >
              <MagnifyingGlassIcon className="h-4 w-4" />
              Search
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors flex items-center gap-2 ${
                showFilters
                  ? 'bg-primary-50 border-primary-200 text-primary-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FunnelIcon className="h-4 w-4" />
              Filters
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Location
                </label>
                <input
                  type="text"
                  placeholder="City or State"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Job Type
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={filters.jobType}
                  onChange={(e) => handleFilterChange('jobType', e.target.value)}
                >
                  <option value="">All Types</option>
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                  <option value="remote">Remote</option>
                </select>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          <span className="font-semibold text-gray-900">{jobs.length}</span>{' '}
          job{jobs.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Jobs List */}
      {jobs.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
          <BriefcaseIcon className="mx-auto h-16 w-16 text-gray-300" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No jobs found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filter criteria
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => {
            const isExpanded = expandedJob === (job._id || job.id);
            const expDisplay = formatExperience(job.experienceRequired);

            return (
              <div
                key={job._id || job.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
              >
                {/* Job Card Header */}
                <div
                  className="p-5 cursor-pointer"
                  onClick={() => toggleExpand(job._id || job.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Title Row */}
                      <div className="flex items-center gap-3 mb-2">
                        {job.priority && priorityDot[job.priority] && (
                          <span
                            className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${priorityDot[job.priority]}`}
                            title={`${job.priority} priority`}
                          />
                        )}
                        <h3 className="text-lg font-semibold text-gray-900 leading-tight">
                          {job.title}
                        </h3>
                      </div>

                      {/* Meta Row */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-gray-500">
                        {job.department && (
                          <span className="flex items-center gap-1">
                            <BuildingOfficeIcon className="h-4 w-4" />
                            {job.department}
                          </span>
                        )}
                        {job.location && (
                          <span className="flex items-center gap-1">
                            <MapPinIcon className="h-4 w-4" />
                            {job.location}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <CurrencyDollarIcon className="h-4 w-4" />
                          {formatSalary(job.salary)}
                        </span>
                        {expDisplay && (
                          <span className="flex items-center gap-1">
                            <ClockIcon className="h-4 w-4" />
                            {expDisplay}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="h-4 w-4" />
                          {formatDate(job.createdAt)}
                        </span>
                      </div>

                      {/* Badges */}
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        {job.jobType && (
                          <span
                            className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${
                              jobTypeBadge[job.jobType] || 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {job.jobType.replace('-', ' ')}
                          </span>
                        )}
                        {job.status && (
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                              job.status === 'active'
                                ? 'bg-green-50 text-green-700 border border-green-200'
                                : 'bg-gray-50 text-gray-500 border border-gray-200'
                            }`}
                          >
                            {job.status}
                          </span>
                        )}
                      </div>

                      {/* Description Preview */}
                      {!isExpanded && job.description && (
                        <p className="mt-3 text-sm text-gray-600 line-clamp-2 leading-relaxed">
                          {job.description}
                        </p>
                      )}

                      {/* Skills Preview */}
                      {job.requiredSkills?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {job.requiredSkills
                            .slice(0, isExpanded ? undefined : 6)
                            .map((skill, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700 border border-primary-100"
                              >
                                {skill}
                              </span>
                            ))}
                          {!isExpanded && job.requiredSkills.length > 6 && (
                            <span className="text-xs text-gray-400 self-center">
                              +{job.requiredSkills.length - 6} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right Side */}
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <Link
                        to={`/app/user/apply/${job._id || job.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 px-5 py-2 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors shadow-sm"
                      >
                        Apply
                        <ArrowRightIcon className="h-3.5 w-3.5" />
                      </Link>
                      {isExpanded ? (
                        <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Full Description */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50/50">
                    {/* Full Description */}
                    {job.description && (
                      <div className="px-5 pt-5 pb-4">
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                          <BriefcaseIcon className="h-4 w-4 text-primary-500" />
                          Job Description
                        </h4>
                        <div className="bg-white rounded-xl border border-gray-200 p-4">
                          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                            {job.description}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* All Skills */}
                    {job.requiredSkills?.length > 0 && (
                      <div className="px-5 pb-4">
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                          <SparklesIcon className="h-4 w-4 text-primary-500" />
                          Required Skills ({job.requiredSkills.length})
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {job.requiredSkills.map((skill, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-gradient-to-r from-primary-50 to-indigo-50 text-primary-700 border border-primary-100"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Job Details Grid */}
                    <div className="px-5 pb-5">
                      <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">
                        Job Details
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        <DetailItem label="Location" value={job.location} />
                        <DetailItem label="Job Type" value={job.jobType?.replace('-', ' ')} capitalize />
                        <DetailItem label="Salary" value={formatSalary(job.salary)} />
                        {expDisplay && <DetailItem label="Experience" value={expDisplay} />}
                        {job.department && <DetailItem label="Department" value={job.department} />}
                        {job.priority && <DetailItem label="Priority" value={job.priority} capitalize />}
                        <DetailItem label="Posted" value={formatDate(job.createdAt)} />
                        {job.applicantCount > 0 && (
                          <DetailItem label="Applicants" value={`${job.applicantCount}`} />
                        )}
                      </div>
                    </div>

                    {/* Apply CTA */}
                    <div className="px-5 pb-5 flex justify-center">
                      <Link
                        to={`/app/user/apply/${job._id || job.id}`}
                        className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-primary-600 to-indigo-600 text-white rounded-xl text-sm font-bold hover:from-primary-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
                      >
                        Apply for this Position
                        <ArrowRightIcon className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Helper component for detail items
const DetailItem = ({ label, value, capitalize }) => (
  <div className="bg-white rounded-lg p-3 border border-gray-200">
    <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">
      {label}
    </p>
    <p className={`text-sm font-medium text-gray-900 mt-0.5 ${capitalize ? 'capitalize' : ''}`}>
      {value || 'N/A'}
    </p>
  </div>
);

export default JobList;
