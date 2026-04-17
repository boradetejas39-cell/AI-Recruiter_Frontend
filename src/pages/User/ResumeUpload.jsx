import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import {
  DocumentTextIcon,
  ArrowUpTrayIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  SparklesIcon,
  ClockIcon,
  TrashIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  DocumentArrowDownIcon,
} from '@heroicons/react/24/outline';

const UserResumeUpload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [expandedResume, setExpandedResume] = useState(null);

  // Fetch user's resumes
  const fetchResumes = useCallback(async () => {
    try {
      setLoadingResumes(true);
      const response = await api.get('/resumes/my');
      setResumes(response.data.data?.resumes || []);
    } catch (err) {
      console.error('Error fetching resumes:', err);
    } finally {
      setLoadingResumes(false);
    }
  }, []);

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
      ];
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Please upload a PDF or Word document');
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setUploading(true);
    setError(null);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('resume', file);

      const response = await api.post('/resumes/user-upload', formData, {
        timeout: 60000,
      });

      setUploadResult(response.data.data);
      setFile(null);
      // Re-fetch resumes to show the new one
      fetchResumes();
    } catch (error) {
      console.error('Upload error:', error);
      setError(
        error.response?.data?.message || 'Upload failed. Please try again.'
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (resumeId) => {
    if (!window.confirm('Are you sure you want to delete this resume?')) return;
    try {
      await api.delete(`/resumes/${resumeId}`);
      fetchResumes();
    } catch (err) {
      console.error('Delete error:', err);
      alert(err.response?.data?.message || 'Failed to delete resume');
    }
  };

  const toggleExpand = (id) => {
    setExpandedResume(expandedResume === id ? null : id);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Present';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Resumes</h1>
        <p className="text-gray-500 mt-1">
          Upload and manage your resumes. All parsed data is displayed below.
        </p>
      </div>

      {/* ── Upload Section ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-primary-50 to-indigo-50">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <ArrowUpTrayIcon className="h-5 w-5 text-primary-600" />
            Upload New Resume
          </h2>
        </div>
        <div className="p-6">
          <form onSubmit={handleUpload} className="space-y-5">
            {/* Drop Zone */}
            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-primary-400 transition-all duration-200">
              <input
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
              />
              {file ? (
                <div className="flex flex-col items-center">
                  <DocumentTextIcon className="h-10 w-10 text-primary-500" />
                  <p className="mt-2 text-sm font-medium text-gray-700">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <ArrowUpTrayIcon className="h-10 w-10 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-400">
                    PDF or Word documents up to 10MB
                  </p>
                </div>
              )}
            </label>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Upload Success */}
            {uploadResult && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-green-800">
                      Upload Successful!
                    </h3>
                    <p className="text-sm text-green-700 mt-1">
                      <span className="font-medium">Name:</span>{' '}
                      {uploadResult.candidateName}
                    </p>
                    <p className="text-sm text-green-700">
                      <span className="font-medium">Skills:</span>{' '}
                      {uploadResult.skills?.join(', ') || 'None detected'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit */}
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={!file || uploading}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Uploading & Parsing...
                  </>
                ) : (
                  <>
                    <ArrowUpTrayIcon className="h-4 w-4" />
                    Upload Resume
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ── My Resumes List ── */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <DocumentTextIcon className="h-6 w-6 text-primary-600" />
          Uploaded Resumes
          {resumes.length > 0 && (
            <span className="text-sm font-normal text-gray-500">
              ({resumes.length})
            </span>
          )}
        </h2>

        {loadingResumes ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
          </div>
        ) : resumes.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
            <DocumentTextIcon className="h-16 w-16 text-gray-300 mx-auto" />
            <p className="mt-4 text-gray-500 font-medium">
              No resumes uploaded yet
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Upload your first resume above to get started
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {resumes.map((resume) => {
              const isExpanded = expandedResume === (resume._id || resume.id);
              return (
                <div
                  key={resume._id || resume.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300"
                >
                  {/* Resume Header */}
                  <div
                    className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleExpand(resume._id || resume.id)}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="h-12 w-12 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                        <span className="text-white font-bold text-lg">
                          {(resume.candidateName || 'U').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base font-semibold text-gray-900 truncate">
                          {resume.candidateName || 'Unknown'}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                          <span className="flex items-center gap-1">
                            <DocumentTextIcon className="h-3.5 w-3.5" />
                            {resume.fileName || 'resume'}
                          </span>
                          <span className="flex items-center gap-1">
                            <ClockIcon className="h-3.5 w-3.5" />
                            {formatDate(resume.createdAt)}
                          </span>
                          {resume.totalExperience > 0 && (
                            <span className="flex items-center gap-1">
                              <BriefcaseIcon className="h-3.5 w-3.5" />
                              {resume.totalExperience} yrs exp
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                          resume.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : resume.status === 'hired'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {resume.status || 'new'}
                      </span>
                      {isExpanded ? (
                        <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Skills Preview (always visible) */}
                  {resume.skills?.length > 0 && (
                    <div className="px-6 pb-3 flex flex-wrap gap-1.5">
                      {resume.skills.slice(0, isExpanded ? undefined : 8).map((skill, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700 border border-primary-100"
                        >
                          {skill}
                        </span>
                      ))}
                      {!isExpanded && resume.skills.length > 8 && (
                        <span className="text-xs text-gray-400 self-center">
                          +{resume.skills.length - 8} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 px-6 py-5 space-y-6 bg-gray-50/50">
                      {/* Personal Info */}
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                          <UserIcon className="h-4 w-4 text-primary-500" />
                          Personal Information
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {resume.candidateName && (
                            <InfoItem
                              icon={UserIcon}
                              label="Full Name"
                              value={resume.candidateName}
                            />
                          )}
                          {resume.email && (
                            <InfoItem
                              icon={EnvelopeIcon}
                              label="Email"
                              value={resume.email}
                            />
                          )}
                          {resume.phone && (
                            <InfoItem
                              icon={PhoneIcon}
                              label="Phone"
                              value={resume.phone}
                            />
                          )}
                          {resume.currentLocation && (
                            <InfoItem
                              icon={MapPinIcon}
                              label="Location"
                              value={resume.currentLocation}
                            />
                          )}
                          {resume.totalExperience > 0 && (
                            <InfoItem
                              icon={BriefcaseIcon}
                              label="Total Experience"
                              value={`${resume.totalExperience} years`}
                            />
                          )}
                        </div>
                      </div>

                      {/* Experience */}
                      {resume.experience?.length > 0 && (
                        <div>
                          <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                            <BriefcaseIcon className="h-4 w-4 text-primary-500" />
                            Work Experience
                          </h4>
                          <div className="space-y-3">
                            {resume.experience.map((exp, i) => (
                              <div
                                key={i}
                                className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm"
                              >
                                <div className="flex items-start justify-between">
                                  <div>
                                    <p className="font-semibold text-gray-900">
                                      {exp.position || 'Position not specified'}
                                    </p>
                                    <p className="text-sm text-primary-600 font-medium">
                                      {exp.company || 'Company not specified'}
                                    </p>
                                  </div>
                                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md whitespace-nowrap">
                                    {formatDate(exp.startDate)} –{' '}
                                    {formatDate(exp.endDate)}
                                  </span>
                                </div>
                                {exp.location && (
                                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                    <MapPinIcon className="h-3 w-3" />
                                    {exp.location}
                                  </p>
                                )}
                                {exp.description && (
                                  <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                                    {exp.description}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Education */}
                      {resume.education?.length > 0 && (
                        <div>
                          <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                            <AcademicCapIcon className="h-4 w-4 text-primary-500" />
                            Education
                          </h4>
                          <div className="space-y-3">
                            {resume.education.map((edu, i) => (
                              <div
                                key={i}
                                className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm"
                              >
                                <div className="flex items-start justify-between">
                                  <div>
                                    <p className="font-semibold text-gray-900">
                                      {edu.degree || 'Degree not specified'}
                                      {edu.field ? ` in ${edu.field}` : ''}
                                    </p>
                                    <p className="text-sm text-primary-600 font-medium">
                                      {edu.institution ||
                                        'Institution not specified'}
                                    </p>
                                  </div>
                                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md whitespace-nowrap">
                                    {edu.year ||
                                      `${formatDate(edu.startDate)} – ${formatDate(
                                        edu.endDate
                                      )}`}
                                  </span>
                                </div>
                                {edu.gpa > 0 && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    GPA: {edu.gpa}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* All Skills */}
                      {resume.skills?.length > 0 && (
                        <div>
                          <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                            <SparklesIcon className="h-4 w-4 text-primary-500" />
                            All Skills ({resume.skills.length})
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {resume.skills.map((skill, i) => (
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

                      {/* Actions */}
                      <div className="flex items-center gap-3 pt-2 border-t border-gray-200">
                        {resume.filePath && (
                          <a
                            href={`${api.defaults.baseURL?.replace('/api', '')}/${resume.filePath}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-primary-700 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
                          >
                            <DocumentArrowDownIcon className="h-4 w-4" />
                            Download Resume
                          </a>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(resume._id || resume.id);
                          }}
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          <TrashIcon className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// Small helper component for info items
const InfoItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-2 bg-white rounded-lg p-3 border border-gray-200">
    <Icon className="h-4 w-4 text-primary-500 mt-0.5 flex-shrink-0" />
    <div className="min-w-0">
      <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">
        {label}
      </p>
      <p className="text-sm text-gray-900 font-medium truncate">{value}</p>
    </div>
  </div>
);

export default UserResumeUpload;
