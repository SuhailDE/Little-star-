import { useEffect, useState } from 'react';
import { ArrowRight, BookOpen, ClipboardList, GraduationCap, Mail, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { extractErrorMessage, studentsApi } from '../services/api.js';
import { formatDate } from '../utils/formatters.js';

export default function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await studentsApi.stats();
        setStats(res.stats);
      } catch (err) {
        setError(extractErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-white border border-[#E2E8F0] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error}
      </div>
    );
  }

  const metrics = [
    { label: 'Total Students', value: stats.totalStudents, icon: Users, to: '/admin/students' },
    {
      label: 'Total Applications',
      value: stats.totalAdmissions,
      icon: ClipboardList,
      to: '/admin/admissions',
    },
    {
      label: 'Pending Admissions',
      value: stats.pendingAdmissions,
      icon: ClipboardList,
      to: '/admin/admissions',
    },
    {
      label: 'Approved Admissions',
      value: stats.approvedAdmissions,
      icon: GraduationCap,
      to: '/admin/admissions',
    },
    { label: 'Regular Classes', value: stats.totalClasses, icon: BookOpen, to: '/admin/academics' },
    {
      label: 'Special Course Enrollments',
      value: stats.specialCourseEnrollments,
      icon: GraduationCap,
      to: '/admin/academics',
    },
  ];

  const statusColor = (status) => {
    if (status === 'Approved') return 'text-[#15803D]';
    if (status === 'Rejected') return 'text-[#DC2626]';
    return 'text-[#B45309]';
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-[#24364B]">Dashboard Overview</h1>
          <p className="text-sm text-[#52657A] mt-0.5">
            Live overview of Little Star students, admissions, classes, and inquiries.
          </p>
        </div>

        {stats.unreadMessages > 0 && (
          <Link
            to="/admin/messages"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#EAF5FF] text-[#2876C8] text-xs font-semibold hover:bg-[#DCECFB]"
          >
            <Mail className="w-4 h-4" />
            <span className="tabular-nums">{stats.unreadMessages} Unread Inquiries</span>
          </Link>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <Link
              key={m.label}
              to={m.to}
              className="bg-white rounded-xl border border-[#E2E8F0] p-5 flex items-center justify-between hover:border-[#2876C8]/50 transition-colors"
            >
              <div>
                <p className="text-xs font-medium text-[#52657A]">{m.label}</p>
                <p className="font-display font-bold text-3xl text-[#24364B] mt-1 tabular-nums">
                  {m.value}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#EAF5FF] text-[#2876C8] flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Applications */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between gap-4">
          <h2 className="font-display font-semibold text-base text-[#24364B]">
            Recent Admission Applications
          </h2>
          <Link
            to="/admin/admissions"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2876C8] hover:underline"
          >
            <span>Manage All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {!stats.recentApplications || stats.recentApplications.length === 0 ? (
          <div className="p-10 text-center text-sm text-[#52657A]">
            No admission applications submitted yet. New applications from parents will appear here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-xs text-[#52657A]">
                <tr>
                  <th className="py-3 px-5 font-semibold">Application ID</th>
                  <th className="py-3 px-5 font-semibold">Student</th>
                  <th className="py-3 px-5 font-semibold">Class / Course</th>
                  <th className="py-3 px-5 font-semibold">Guardian Phone</th>
                  <th className="py-3 px-5 font-semibold">Submitted</th>
                  <th className="py-3 px-5 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {stats.recentApplications.map((app) => (
                  <tr key={app._id} className="hover:bg-[#F8FAFC]">
                    <td className="py-3 px-5 font-mono text-xs font-semibold text-[#2876C8] tabular-nums">
                      {app.applicationId}
                    </td>
                    <td className="py-3 px-5 font-medium text-[#24364B]">{app.studentName}</td>
                    <td className="py-3 px-5 text-[#52657A]">{app.applyingClass}</td>
                    <td className="py-3 px-5 text-[#52657A] tabular-nums">{app.guardianPhone}</td>
                    <td className="py-3 px-5 text-[#52657A] tabular-nums">
                      {formatDate(app.createdAt)}
                    </td>
                    <td className={`py-3 px-5 font-semibold text-xs ${statusColor(app.status)}`}>
                      {app.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
