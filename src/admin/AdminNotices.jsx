import { useEffect, useState } from 'react';
import { Edit2, Plus, Trash2, X } from 'lucide-react';
import { extractErrorMessage, noticesApi } from '../services/api.js';
import { formatDate, formatInputDate } from '../utils/formatters.js';

const EMPTY_NOTICE = {
  title: '',
  category: 'Admission',
  content: '',
  publishDate: new Date().toISOString().split('T')[0],
  isActive: true,
  isPinned: false,
};

export default function AdminNotices() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_NOTICE);
  const [saving, setSaving] = useState(false);

  const loadNotices = async () => {
    setLoading(true);
    try {
      const res = await noticesApi.list();
      setNotices(res.notices || []);
      setError('');
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotices();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY_NOTICE, publishDate: new Date().toISOString().split('T')[0] });
    setShowModal(true);
  };

  const openEdit = (notice) => {
    setEditing(notice);
    setForm({
      title: notice.title || '',
      category: notice.category || 'Announcement',
      content: notice.content || '',
      publishDate: formatInputDate(notice.publishDate || notice.createdAt),
      isActive: notice.isActive !== false,
      isPinned: Boolean(notice.isPinned),
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setFeedback('');
    try {
      if (editing) {
        await noticesApi.update(editing._id, form);
        setFeedback('Notice updated.');
      } else {
        await noticesApi.create(form);
        setFeedback('Notice published.');
      }
      setShowModal(false);
      await loadNotices();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await noticesApi.remove(id);
      setFeedback('Notice deleted.');
      await loadNotices();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-[#24364B]">Notice Management</h1>
          <p className="text-sm text-[#52657A]">
            Publish admission, examination, holiday, and general announcements for parents.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2876C8] text-white text-sm font-semibold hover:bg-[#1E62AB] whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Publish Notice</span>
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

      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center text-sm text-[#52657A]">Loading notices...</div>
        ) : notices.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-10 text-center text-sm text-[#52657A]">
            No notices published yet.
          </div>
        ) : (
          notices.map((notice) => (
            <div
              key={notice._id}
              className="bg-white rounded-xl border border-[#E2E8F0] p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#52657A]">
                  <span className="font-semibold text-[#2876C8]">{notice.category}</span>
                  <span>&middot;</span>
                  <span className="tabular-nums">
                    {formatDate(notice.publishDate || notice.createdAt)}
                  </span>
                  <span>&middot;</span>
                  <span className={notice.isActive ? 'text-[#15803D] font-medium' : 'text-[#DC2626]'}>
                    {notice.isActive ? 'Active' : 'Hidden'}
                  </span>
                  {notice.isPinned && (
                    <>
                      <span>&middot;</span>
                      <span className="font-semibold text-[#B45309]">Pinned</span>
                    </>
                  )}
                </div>
                <h2 className="font-display font-bold text-base text-[#24364B]">{notice.title}</h2>
                <p className="text-sm text-[#52657A] leading-relaxed">{notice.content}</p>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => openEdit(notice)}
                  className="p-2 rounded-lg text-[#52657A] hover:bg-[#EAF5FF] hover:text-[#2876C8]"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(notice._id)}
                  className="p-2 rounded-lg text-[#52657A] hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div
          className="fixed inset-0 z-50 bg-[#0F172A]/60 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <form
            onSubmit={handleSave}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl border border-[#E2E8F0] max-w-lg w-full p-6 space-y-4 text-sm"
          >
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h2 className="font-display font-bold text-lg text-[#24364B]">
                {editing ? 'Edit Notice' : 'Publish New Notice'}
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-[#52657A] hover:bg-[#F1F5F9]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block font-semibold mb-1">Notice Title *</label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-xl border border-[#CFE0F2] px-3 py-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full rounded-xl border border-[#CFE0F2] px-3 py-2"
                >
                  <option value="Admission">Admission</option>
                  <option value="Examination">Examination</option>
                  <option value="Holiday">Holiday</option>
                  <option value="Announcement">Announcement</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">Publish Date</label>
                <input
                  type="date"
                  value={form.publishDate}
                  onChange={(e) => setForm({ ...form, publishDate: e.target.value })}
                  className="w-full rounded-xl border border-[#CFE0F2] px-3 py-2"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1">Notice Details *</label>
              <textarea
                required
                rows={4}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="w-full rounded-xl border border-[#CFE0F2] px-3 py-2"
              />
            </div>

            <div className="flex items-center gap-6">
              <label className="inline-flex items-center gap-2 font-medium">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                />
                <span>Visible on Public Site</span>
              </label>
              <label className="inline-flex items-center gap-2 font-medium">
                <input
                  type="checkbox"
                  checked={form.isPinned}
                  onChange={(e) => setForm({ ...form, isPinned: e.target.checked })}
                />
                <span>Pin to Top</span>
              </label>
            </div>

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
                {saving ? 'Saving...' : 'Save Notice'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
