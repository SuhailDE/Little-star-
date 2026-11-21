import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Eye, Search, Trash2, UserPlus, X, XCircle } from 'lucide-react';
import { admissionsApi, extractErrorMessage } from '../services/api.js';
import { formatDate } from '../utils/formatters.js';

export default function AdminAdmissions() {
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [notesInput, setNotesInput] = useState('');
  const [busyId, setBusyId] = useState('');

  const loadAdmissions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await admissionsApi.list({ search, status: statusFilter });
      setAdmissions(res.admissions || []);
      setError('');
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    loadAdmissions();
  }, [loadAdmissions]);

  const handleStatusChange = async (id, status) => {
    setBusyId(id);
    setFeedback('');
    try {
      const res = await admissionsApi.updateStatus(id, {
        status,
        ...(selected?._id === id ? { adminNotes: notesInput } : {}),
      });
      setFeedback(res.message);
      if (selected?._id === id) setSelected(res.admission);
      await loadAdmissions();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setBusyId('');
    }
  };

  const handleConvert = async (id) => {
    setBusyId(id);
    setFeedback('');
    try {
      const res = await admissionsApi.convertToStudent(id);
      setFeedback(res.message);
      if (selected?._id === id) setSelected(res.admission);
      await loadAdmissions();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setBusyId('');
    }
  };

  const handleDelete = async (id) => {
    setBusyId(id);
    setFeedback('');
    try {
      await admissionsApi.remove(id);
      if (selected?._id === id) setSelected(null);
      setFeedback('Application deleted.');
      await loadAdmissions();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setBusyId('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-[#24364B]">Admission Management</h1>
          <p className="text-sm text-[#52657A]">
            Review applications, update statuses, and convert approved applicants into student
            records.
          </p>
        </div>
      </div>

      {feedback && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {feedback}
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#52657A] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Application ID, name, phone, or class..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#2876C8]"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-white border border-[#E2E8F0] rounded-xl w-fit">
          {['', 'Pending', 'Approved', 'Rejected'].map((st) => (
            <button
              key={st || 'all'}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === st
                  ? 'bg-[#2876C8] text-white'
                  : 'text-[#52657A] hover:text-[#24364B]'
              }`}
            >
              {st || 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-[#52657A]">Loading applications...</div>
        ) : admissions.length === 0 ? (
          <div className="p-10 text-center text-sm text-[#52657A]">
            No matching admission applications found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-xs text-[#52657A]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Application ID</th>
                  <th className="py-3 px-4 font-semibold">Student</th>
                  <th className="py-3 px-4 font-semibold">Program &amp; Class</th>
                  <th className="py-3 px-4 font-semibold">Guardian Phone</th>
                  <th className="py-3 px-4 font-semibold">Date</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {admissions.map((app) => (
                  <tr key={app._id} className="hover:bg-[#F8FAFC]">
                    <td className="py-3 px-4 font-mono text-xs font-semibold text-[#2876C8] tabular-nums">
                      {app.applicationId}
                    </td>
                    <td className="py-3 px-4 font-medium text-[#24364B]">{app.studentName}</td>
                    <td className="py-3 px-4 text-[#52657A]">
                      {app.applyingClass}
                      <span className="text-xs text-[#52657A]/70 ml-1">
                        ({app.programType === 'special' ? 'Special' : 'Regular'})
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#52657A] tabular-nums">{app.guardianPhone}</td>
                    <td className="py-3 px-4 text-[#52657A] tabular-nums">
                      {formatDate(app.createdAt)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-xs font-semibold ${
                          app.status === 'Approved'
                            ? 'text-[#15803D]'
                            : app.status === 'Rejected'
                              ? 'text-[#DC2626]'
                              : 'text-[#B45309]'
                        }`}
                      >
                        {app.status}
                        {app.convertedStudentRef ? ' · Enrolled' : ''}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setSelected(app);
                            setNotesInput(app.adminNotes || '');
                          }}
                          title="View Details"
                          className="p-1.5 rounded-lg text-[#52657A] hover:bg-[#EAF5FF] hover:text-[#2876C8]"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {app.status !== 'Approved' && (
                          <button
                            type="button"
                            disabled={busyId === app._id}
                            onClick={() => handleStatusChange(app._id, 'Approved')}
                            title="Approve"
                            className="p-1.5 rounded-lg text-[#15803D] hover:bg-emerald-50"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                        {app.status !== 'Rejected' && (
                          <button
                            type="button"
                            disabled={busyId === app._id}
                            onClick={() => handleStatusChange(app._id, 'Rejected')}
                            title="Reject"
                            className="p-1.5 rounded-lg text-[#DC2626] hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                        {app.status === 'Approved' && !app.convertedStudentRef && (
                          <button
                            type="button"
                            disabled={busyId === app._id}
                            onClick={() => handleConvert(app._id)}
                            title="Convert to Student Record"
                            className="p-1.5 rounded-lg text-[#2876C8] hover:bg-[#EAF5FF]"
                          >
                            <UserPlus className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          disabled={busyId === app._id}
                          onClick={() => handleDelete(app._id)}
                          title="Delete Application"
                          className="p-1.5 rounded-lg text-[#52657A] hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-[#0F172A]/60 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-2xl border border-[#E2E8F0] max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-[#E2E8F0] pb-4">
              <div>
                <p className="font-mono text-xs font-semibold text-[#2876C8]">
                  {selected.applicationId}
                </p>
                <h2 className="font-display font-bold text-xl text-[#24364B]">
                  {selected.studentName}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="p-1.5 rounded-lg text-[#52657A] hover:bg-[#F1F5F9]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-[#52657A]">Applying For</p>
                <p className="font-semibold">{selected.applyingClass}</p>
              </div>
              <div>
                <p className="text-xs text-[#52657A]">Date of Birth &amp; Gender</p>
                <p className="font-semibold">
                  {formatDate(selected.dateOfBirth)} &middot; {selected.gender}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#52657A]">Father’s Name</p>
                <p className="font-semibold">{selected.fatherName}</p>
              </div>
              <div>
                <p className="text-xs text-[#52657A]">Mother’s Name</p>
                <p className="font-semibold">{selected.motherName}</p>
              </div>
              <div>
                <p className="text-xs text-[#52657A]">Guardian Phone</p>
                <p className="font-semibold tabular-nums">{selected.guardianPhone}</p>
              </div>
              <div>
                <p className="text-xs text-[#52657A]">Alternative Phone</p>
                <p className="font-semibold tabular-nums">{selected.alternativePhone || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-[#52657A]">Parent Email</p>
                <p className="font-semibold">{selected.parentEmail || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-[#52657A]">Previous School</p>
                <p className="font-semibold">{selected.previousSchool || '—'}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs text-[#52657A]">Present Address</p>
                <p className="font-semibold">{selected.presentAddress}</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#24364B] mb-1.5">
                Administration Note (visible in status tracker)
              </label>
              <textarea
                rows={2}
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                placeholder="Optional note for parents or internal review"
                className="w-full rounded-xl border border-[#CFE0F2] px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2876C8]"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E2E8F0]">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={busyId === selected._id}
                  onClick={() => handleStatusChange(selected._id, 'Approved')}
                  className="px-4 py-2 rounded-xl bg-[#15803D] text-white text-xs font-semibold hover:bg-[#166534]"
                >
                  Approve
                </button>
                <button
                  type="button"
                  disabled={busyId === selected._id}
                  onClick={() => handleStatusChange(selected._id, 'Rejected')}
                  className="px-4 py-2 rounded-xl bg-[#DC2626] text-white text-xs font-semibold hover:bg-[#B91C1C]"
                >
                  Reject
                </button>
                <button
                  type="button"
                  disabled={busyId === selected._id}
                  onClick={() => handleStatusChange(selected._id, 'Pending')}
                  className="px-4 py-2 rounded-xl border border-[#E2E8F0] text-xs font-semibold text-[#24364B]"
                >
                  Mark Pending
                </button>
              </div>

              {selected.status === 'Approved' && !selected.convertedStudentRef && (
                <button
                  type="button"
                  disabled={busyId === selected._id}
                  onClick={() => handleConvert(selected._id)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2876C8] text-white text-xs font-semibold hover:bg-[#1E62AB]"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Convert to Student Record</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
