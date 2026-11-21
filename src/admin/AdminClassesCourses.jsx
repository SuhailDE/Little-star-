import { useEffect, useState } from 'react';
import { Edit2, Plus, Trash2, X } from 'lucide-react';
import { classesApi, coursesApi, extractErrorMessage } from '../services/api.js';

export default function AdminClassesCourses() {
  const [tab, setTab] = useState('regular');
  const [classes, setClasses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');

  const [editingClass, setEditingClass] = useState(null);
  const [classForm, setClassForm] = useState({
    name: '',
    order: 1,
    description: '',
    suitableAge: '',
    learningObjectives: '',
    subjects: '',
    eligibilityNote: '',
    isAvailable: true,
  });

  const [editingCourse, setEditingCourse] = useState(null);
  const [courseForm, setCourseForm] = useState({
    title: '',
    subject: 'English',
    targetClasses: 'Class 3–8',
    order: 1,
    description: '',
    learningObjectives: '',
    eligibilityNote: '',
    isAvailable: true,
  });

  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [clsRes, crsRes] = await Promise.all([classesApi.list(), coursesApi.list()]);
      setClasses(clsRes.classes || []);
      setCourses(crsRes.courses || []);
      setError('');
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const openNewClass = () => {
    setEditingClass(null);
    setClassForm({
      name: '',
      order: classes.length + 1,
      description: '',
      suitableAge: '',
      learningObjectives: '',
      subjects: '',
      eligibilityNote: '',
      isAvailable: true,
    });
    setShowModal(true);
  };

  const openEditClass = (item) => {
    setEditingClass(item);
    setClassForm({
      name: item.name || '',
      order: item.order ?? 1,
      description: item.description || '',
      suitableAge: item.suitableAge || '',
      learningObjectives: (item.learningObjectives || []).join('\n'),
      subjects: (item.subjects || []).join(', '),
      eligibilityNote: item.eligibilityNote || '',
      isAvailable: item.isAvailable !== false,
    });
    setShowModal(true);
  };

  const openNewCourse = () => {
    setEditingCourse(null);
    setCourseForm({
      title: '',
      subject: 'English',
      targetClasses: 'Class 3–8',
      order: courses.length + 1,
      description: '',
      learningObjectives: '',
      eligibilityNote: '',
      isAvailable: true,
    });
    setShowModal(true);
  };

  const openEditCourse = (item) => {
    setEditingCourse(item);
    setCourseForm({
      title: item.title || '',
      subject: item.subject || '',
      targetClasses: item.targetClasses || '',
      order: item.order ?? 1,
      description: item.description || '',
      learningObjectives: (item.learningObjectives || []).join('\n'),
      eligibilityNote: item.eligibilityNote || '',
      isAvailable: item.isAvailable !== false,
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setFeedback('');
    try {
      if (tab === 'regular') {
        const payload = {
          ...classForm,
          order: Number(classForm.order) || 1,
          learningObjectives: classForm.learningObjectives
            .split(/\r?\n/)
            .map((s) => s.trim())
            .filter(Boolean),
          subjects: classForm.subjects
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
        };
        if (editingClass) {
          await classesApi.update(editingClass._id, payload);
          setFeedback('Regular class updated.');
        } else {
          await classesApi.create(payload);
          setFeedback('Regular class added.');
        }
      } else {
        const payload = {
          ...courseForm,
          order: Number(courseForm.order) || 1,
          learningObjectives: courseForm.learningObjectives
            .split(/\r?\n/)
            .map((s) => s.trim())
            .filter(Boolean),
        };
        if (editingCourse) {
          await coursesApi.update(editingCourse._id, payload);
          setFeedback('Special course updated.');
        } else {
          await coursesApi.create(payload);
          setFeedback('Special course added.');
        }
      }
      setShowModal(false);
      await loadAll();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      if (tab === 'regular') {
        await classesApi.remove(id);
        setFeedback('Class removed.');
      } else {
        await coursesApi.remove(id);
        setFeedback('Course removed.');
      }
      await loadAll();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-[#24364B]">
            Classes &amp; Special Courses
          </h1>
          <p className="text-sm text-[#52657A]">
            Manage Regular Educational Program classes and Special English / ICT courses separately.
          </p>
        </div>

        <button
          type="button"
          onClick={tab === 'regular' ? openNewClass : openNewCourse}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2876C8] text-white text-sm font-semibold hover:bg-[#1E62AB] whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{tab === 'regular' ? 'Add Regular Class' : 'Add Special Course'}</span>
        </button>
      </div>

      {/* Category Switcher */}
      <div className="inline-flex items-center gap-1 p-1 bg-white border border-[#E2E8F0] rounded-xl">
        <button
          type="button"
          onClick={() => setTab('regular')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            tab === 'regular' ? 'bg-[#2876C8] text-white' : 'text-[#52657A] hover:text-[#24364B]'
          }`}
        >
          Regular Educational Program ({classes.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('special')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            tab === 'special' ? 'bg-[#2876C8] text-white' : 'text-[#52657A] hover:text-[#24364B]'
          }`}
        >
          Special English &amp; ICT Programs ({courses.length})
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

      {loading ? (
        <div className="p-8 text-center text-sm text-[#52657A]">Loading programs...</div>
      ) : tab === 'regular' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {classes.map((cls) => (
            <div
              key={cls._id}
              className="bg-white rounded-xl border border-[#E2E8F0] p-6 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display font-bold text-lg text-[#24364B]">{cls.name}</h2>
                    <p className="text-xs text-[#2876C8]">
                      {cls.suitableAge || 'Age configurable'} &middot;{' '}
                      {cls.isAvailable ? 'Available' : 'Unavailable'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditClass(cls)}
                      className="p-1.5 rounded-lg text-[#52657A] hover:bg-[#EAF5FF] hover:text-[#2876C8]"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(cls._id)}
                      className="p-1.5 rounded-lg text-[#52657A] hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-[#52657A]">{cls.description}</p>
                {cls.subjects?.length > 0 && (
                  <p className="text-xs text-[#52657A]">
                    <strong>Subjects:</strong> {cls.subjects.join(', ')}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {courses.map((course) => (
            <div
              key={course._id}
              className="bg-white rounded-xl border border-[#E2E8F0] p-6 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display font-bold text-lg text-[#24364B]">
                      {course.title}
                    </h2>
                    <p className="text-xs text-[#2876C8]">
                      {course.subject} &middot; {course.targetClasses} &middot;{' '}
                      {course.isAvailable ? 'Available' : 'Unavailable'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditCourse(course)}
                      className="p-1.5 rounded-lg text-[#52657A] hover:bg-[#EAF5FF] hover:text-[#2876C8]"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(course._id)}
                      className="p-1.5 rounded-lg text-[#52657A] hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-[#52657A]">{course.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 bg-[#0F172A]/60 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <form
            onSubmit={handleSave}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl border border-[#E2E8F0] max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 text-sm"
          >
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h2 className="font-display font-bold text-lg text-[#24364B]">
                {tab === 'regular'
                  ? editingClass
                    ? 'Edit Regular Class'
                    : 'Add Regular Class'
                  : editingCourse
                    ? 'Edit Special Course'
                    : 'Add Special Course'}
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-[#52657A] hover:bg-[#F1F5F9]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {tab === 'regular' ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold mb-1">Class Name *</label>
                    <input
                      required
                      value={classForm.name}
                      onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                      className="w-full rounded-xl border border-[#CFE0F2] px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Suitable Age</label>
                    <input
                      value={classForm.suitableAge}
                      onChange={(e) => setClassForm({ ...classForm, suitableAge: e.target.value })}
                      placeholder="e.g. 4+ years"
                      className="w-full rounded-xl border border-[#CFE0F2] px-3 py-2"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Description *</label>
                  <textarea
                    required
                    rows={3}
                    value={classForm.description}
                    onChange={(e) => setClassForm({ ...classForm, description: e.target.value })}
                    className="w-full rounded-xl border border-[#CFE0F2] px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">
                    Learning Objectives (one per line)
                  </label>
                  <textarea
                    rows={3}
                    value={classForm.learningObjectives}
                    onChange={(e) =>
                      setClassForm({ ...classForm, learningObjectives: e.target.value })
                    }
                    className="w-full rounded-xl border border-[#CFE0F2] px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Subjects (comma-separated)</label>
                  <input
                    value={classForm.subjects}
                    onChange={(e) => setClassForm({ ...classForm, subjects: e.target.value })}
                    className="w-full rounded-xl border border-[#CFE0F2] px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Eligibility / Age Note</label>
                  <input
                    value={classForm.eligibilityNote}
                    onChange={(e) =>
                      setClassForm({ ...classForm, eligibilityNote: e.target.value })
                    }
                    className="w-full rounded-xl border border-[#CFE0F2] px-3 py-2"
                  />
                </div>
                <label className="inline-flex items-center gap-2 font-medium">
                  <input
                    type="checkbox"
                    checked={classForm.isAvailable}
                    onChange={(e) => setClassForm({ ...classForm, isAvailable: e.target.checked })}
                  />
                  <span>Open for Admission</span>
                </label>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block font-semibold mb-1">Course Title *</label>
                  <input
                    required
                    value={courseForm.title}
                    onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                    className="w-full rounded-xl border border-[#CFE0F2] px-3 py-2"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold mb-1">Subject *</label>
                    <input
                      required
                      value={courseForm.subject}
                      onChange={(e) => setCourseForm({ ...courseForm, subject: e.target.value })}
                      className="w-full rounded-xl border border-[#CFE0F2] px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Target Classes *</label>
                    <input
                      required
                      value={courseForm.targetClasses}
                      onChange={(e) =>
                        setCourseForm({ ...courseForm, targetClasses: e.target.value })
                      }
                      className="w-full rounded-xl border border-[#CFE0F2] px-3 py-2"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Description *</label>
                  <textarea
                    required
                    rows={3}
                    value={courseForm.description}
                    onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                    className="w-full rounded-xl border border-[#CFE0F2] px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">
                    Learning Objectives (one per line)
                  </label>
                  <textarea
                    rows={3}
                    value={courseForm.learningObjectives}
                    onChange={(e) =>
                      setCourseForm({ ...courseForm, learningObjectives: e.target.value })
                    }
                    className="w-full rounded-xl border border-[#CFE0F2] px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Eligibility Note</label>
                  <input
                    value={courseForm.eligibilityNote}
                    onChange={(e) =>
                      setCourseForm({ ...courseForm, eligibilityNote: e.target.value })
                    }
                    className="w-full rounded-xl border border-[#CFE0F2] px-3 py-2"
                  />
                </div>
                <label className="inline-flex items-center gap-2 font-medium">
                  <input
                    type="checkbox"
                    checked={courseForm.isAvailable}
                    onChange={(e) =>
                      setCourseForm({ ...courseForm, isAvailable: e.target.checked })
                    }
                  />
                  <span>Open for Enrollment</span>
                </label>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl border border-[#E2E8F0] font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-[#2876C8] text-white font-semibold hover:bg-[#1E62AB] disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
