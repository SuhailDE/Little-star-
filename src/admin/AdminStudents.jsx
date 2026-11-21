import { useCallback, useEffect, useState } from 'react';
import { Edit2, Eye, Plus, Search, Trash2, X } from 'lucide-react';
import { classesApi, coursesApi, extractErrorMessage, studentsApi } from '../services/api.js';
import { formatDate, formatInputDate } from '../utils/formatters.js';

const EMPTY_FORM = {
  name: '',
  dateOfBirth: '',
  gender: 'Male',
  programType: 'regular',
  className: 'Pre-Play',
  fatherName: '',
  motherName: '',
  guardianPhone: '',
  alternativePhone: '',
  previousSchool: '',
  presentAddress: '',
  parentEmail: '',
  status: 'Active',
  notes: '',
};

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');

  const [modalMode, setModalMode] = useState(null); // 'create' | 'edit' | 'view'
  const [activeStudent, setActiveStudent] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [stuRes, clsRes, crsRes] = await Promise.all([
        studentsApi.list({ search, className: classFilter }),
        classesApi.list(),
        coursesApi.list(),
      ]);
      setStudents(stuRes.students || []);
      setClasses(clsRes.classes || []);
      setCourses(crsRes.courses || []);
      setError('');
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [search, classFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setActiveStudent(null);
    setModalMode('create');
  };

  const openEdit = (stu) => {
    setActiveStudent(stu);
    setForm({
      name: stu.name || '',
      dateOfBirth: formatInputDate(stu.dateOfBirth),
      gender: stu.gender || 'Male',
      programType: stu.programType || 'regular',
      className: stu.className || 'Pre-Play',
      fatherName: stu.fatherName || '',
      motherName: stu.motherName || '',
      guardianPhone: stu.guardianPhone || '',
      alternativePhone: stu.alternativePhone || '',
      previousSchool: stu.previousSchool || '',
      presentAddress: stu.presentAddress || '',
      parentEmail: stu.parentEmail || '',
      status: stu.status || 'Active',
      notes: stu.notes || '',
    });
    setModalMode('edit');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setFeedback('');
    try {
      if (modalMode === 'create') {
        await studentsApi.create(form);
        setFeedback('Student record added.');
      } else if (modalMode === 'edit' && activeStudent) {
        await studentsApi.update(activeStudent._id, form);
        setFeedback('Student record updated.');
      }
      setModalMode(null);
      await loadData();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await studentsApi.remove(id);
      setFeedback('Student record deleted.');
      await loadData();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  const classOptions = [
    ...classes.map((c) => c.name),
    ...courses.map((c) => c.title),
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-[#24364B]">Student Management</h1>
          <p className="text-sm text-[#52657A]">
            Add, search, filter, update, and manage enrolled students across classes and programs.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2876C8] text-white text-sm font-semibold hover:bg-[#1E62AB] whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Student</span>
        </button>
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

      {/* Search & Class Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#52657A] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name, ID, or phone..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#2876C8]"
          />
        </div>

        <select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          className="rounded-xl bg-white border border-[#E2E8F0] px-3.5 py-2.5 text-sm text-[#24364B] focus:outline-none focus:ring-2 focus:ring-[#2876C8]"
        >
          <option value="">All Classes &amp; Courses</option>
          {classOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-[#52657A]">Loading students...</div>
        ) : students.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <p className="text-sm text-[#52657A]">
              No student records found yet. Add a student directly or convert an approved admission
              application.
            </p>
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#EAF5FF] text-[#2876C8] text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add First Student</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-xs text-[#52657A]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Student ID</th>
                  <th className="py-3 px-4 font-semibold">Name</th>
                  <th className="py-3 px-4 font-semibold">Class / Course</th>
                  <th className="py-3 px-4 font-semibold">Guardian Phone</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {students.map((stu) => (
                  <tr key={stu._id} className="hover:bg-[#F8FAFC]">
                    <td className="py-3 px-4 font-mono text-xs font-semibold text-[#2876C8] tabular-nums">
                      {stu.studentId}
                    </td>
                    <td className="py-3 px-4 font-medium text-[#24364B]">{stu.name}</td>
                    <td className="py-3 px-4 text-[#52657A]">{stu.className}</td>
                    <td className="py-3 px-4 text-[#52657A] tabular-nums">{stu.guardianPhone}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-xs font-semibold ${
                          stu.status === 'Active'
                            ? 'text-[#15803D]'
                            : stu.status === 'Graduated'
                              ? 'text-[#2876C8]'
                              : 'text-[#52657A]'
                        }`}
                      >
                        {stu.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveStudent(stu);
                            setModalMode('view');
                          }}
                          title="View Profile"
                          className="p-1.5 rounded-lg text-[#52657A] hover:bg-[#EAF5FF] hover:text-[#2876C8]"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEdit(stu)}
                          title="Edit Student"
                          className="p-1.5 rounded-lg text-[#52657A] hover:bg-[#EAF5FF] hover:text-[#2876C8]"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(stu._id)}
                          title="Delete Student"
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

      {/* View Profile Modal */}
      {modalMode === 'view' && activeStudent && (
        <div
          className="fixed inset-0 z-50 bg-[#0F172A]/60 flex items-center justify-center p-4"
          onClick={() => setModalMode(null)}
        >
          <div
            className="bg-white rounded-2xl border border-[#E2E8F0] max-w-xl w-full p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-[#E2E8F0] pb-3">
              <div>
                <p className="font-mono text-xs font-semibold text-[#2876C8]">
                  {activeStudent.studentId}
                </p>
                <h2 className="font-display font-bold text-xl text-[#24364B]">
                  {activeStudent.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="p-1.5 rounded-lg text-[#52657A] hover:bg-[#F1F5F9]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-[#52657A]">Class / Program</p>
                <p className="font-semibold">{activeStudent.className}</p>
              </div>
              <div>
                <p className="text-xs text-[#52657A]">Enrollment Status</p>
                <p className="font-semibold">{activeStudent.status}</p>
              </div>
              <div>
                <p className="text-xs text-[#52657A]">Date of Birth</p>
                <p className="font-semibold">{formatDate(activeStudent.dateOfBirth)}</p>
              </div>
              <div>
                <p className="text-xs text-[#52657A]">Gender</p>
                <p className="font-semibold">{activeStudent.gender}</p>
              </div>
              <div>
                <p className="text-xs text-[#52657A]">Father’s Name</p>
                <p className="font-semibold">{activeStudent.fatherName}</p>
              </div>
              <div>
                <p className="text-xs text-[#52657A]">Mother’s Name</p>
                <p className="font-semibold">{activeStudent.motherName}</p>
              </div>
              <div>
                <p className="text-xs text-[#52657A]">Guardian Phone</p>
                <p className="font-semibold tabular-nums">{activeStudent.guardianPhone}</p>
              </div>
              <div>
                <p className="text-xs text-[#52657A]">Parent Email</p>
                <p className="font-semibold">{activeStudent.parentEmail || '—'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-[#52657A]">Present Address</p>
                <p className="font-semibold">{activeStudent.presentAddress}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {(modalMode === 'create' || modalMode === 'edit') && (
        <div
          className="fixed inset-0 z-50 bg-[#0F172A]/60 flex items-center justify-center p-4"
          onClick={() => setModalMode(null)}
        >
          <form
            onSubmit={handleSave}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl border border-[#E2E8F0] max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h2 className="font-display font-bold text-lg text-[#24364B]">
                {modalMode === 'create' ? 'Add New Student' : 'Edit Student Record'}
              </h2>
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="p-1.5 rounded-lg text-[#52657A] hover:bg-[#F1F5F9]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="block font-semibold mb-1">Student Name *</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-xl border border-[#CFE0F2] px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Date of Birth *</label>
                <input
                  type="date"
                  required
                  value={form.dateOfBirth}
                  onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                  className="w-full rounded-xl border border-[#CFE0F2] px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Gender *</label>
                <select
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  className="w-full rounded-xl border border-[#CFE0F2] px-3 py-2"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">Program Type</label>
                <select
                  value={form.programType}
                  onChange={(e) => setForm({ ...form, programType: e.target.value })}
                  className="w-full rounded-xl border border-[#CFE0F2] px-3 py-2"
                >
                  <option value="regular">Regular Educational Program</option>
                  <option value="special">Special Program (English / ICT)</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">Class / Course *</label>
                <select
                  value={form.className}
                  onChange={(e) => setForm({ ...form, className: e.target.value })}
                  className="w-full rounded-xl border border-[#CFE0F2] px-3 py-2"
                >
                  {classOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">Enrollment Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full rounded-xl border border-[#CFE0F2] px-3 py-2"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Graduated">Graduated</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">Father’s Name *</label>
                <input
                  required
                  value={form.fatherName}
                  onChange={(e) => setForm({ ...form, fatherName: e.target.value })}
                  className="w-full rounded-xl border border-[#CFE0F2] px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Mother’s Name *</label>
                <input
                  required
                  value={form.motherName}
                  onChange={(e) => setForm({ ...form, motherName: e.target.value })}
                  className="w-full rounded-xl border border-[#CFE0F2] px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Guardian Phone *</label>
                <input
                  required
                  value={form.guardianPhone}
                  onChange={(e) => setForm({ ...form, guardianPhone: e.target.value })}
                  className="w-full rounded-xl border border-[#CFE0F2] px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Parent Email</label>
                <input
                  type="email"
                  value={form.parentEmail}
                  onChange={(e) => setForm({ ...form, parentEmail: e.target.value })}
                  className="w-full rounded-xl border border-[#CFE0F2] px-3 py-2"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-semibold mb-1">Present Address *</label>
                <input
                  required
                  value={form.presentAddress}
                  onChange={(e) => setForm({ ...form, presentAddress: e.target.value })}
                  className="w-full rounded-xl border border-[#CFE0F2] px-3 py-2"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="px-4 py-2 rounded-xl border border-[#E2E8F0] text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-[#2876C8] text-white text-sm font-semibold hover:bg-[#1E62AB] disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Student'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
