import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import {
  BriefcaseIcon,
  DocumentTextIcon,
  UserGroupIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { Card, CardHeader, CardBody, StatCard } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';

const HRDashboard = () => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/overview');
        setStats(res.data.data.stats || {});
      } catch (error) {
        console.error('Error fetching HR stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">HR Workspace</h1>
          <p className="text-gray-600 mt-1">Manage your active jobs and matches.</p>
        </div>
        <Link to="/app/jobs/new">
          <Button variant="primary" size="md">
            <PlusIcon className="h-5 w-5 mr-2" />
            Post New Job
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={BriefcaseIcon}
          label="My Active Jobs"
          value={stats.activeJobs || 0}
          trendColor="blue"
        />
        <StatCard
          icon={DocumentTextIcon}
          label="Recent Resumes"
          value={stats.totalResumes || 0}
          trendColor="green"
        />
        <StatCard
          icon={UserGroupIcon}
          label="Total Matches"
          value={stats.matchedCandidates || 0}
          trendColor="purple"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Welcome to your HR Dashboard</h3>
        <p className="text-gray-500 mb-6">Use the sidebar to manage jobs, screen resumes, and review matches.</p>
        <div className="flex gap-4 justify-center">
          <Link to="/app/jobs" className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">View Jobs</Link>
          <Link to="/app/resumes" className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">Browse Resumes</Link>
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;
