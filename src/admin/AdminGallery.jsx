import { useEffect, useState } from 'react';
import { Edit2, Plus, Trash2, Upload, X } from 'lucide-react';
import ResilientImage from '../components/ResilientImage.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import { extractErrorMessage, galleryApi } from '../services/api.js';

export default function AdminGallery() {
  const { settings, refreshSettings } = useSettings();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Classroom');
  const [customCategory, setCustomCategory] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadGallery = async () => {
    setLoading(true);
    try {
      const res = await galleryApi.list();
      setItems(res.gallery || []);
      setError('');
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGallery();
  }, []);

  const categories = settings.galleryCategories || [
    'Classroom',
    'Learning Activities',
    'Student Activities',
    'Events',
    'Institution',
  ];

  const openCreate = () => {
    setEditingItem(null);
    setTitle('');
    setCategory(categories[0] || 'Classroom');
    setCustomCategory('');
    setDescription('');
    setFile(null);
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setTitle(item.title || '');
    setCategory(item.category || 'Classroom');
    setCustomCategory('');
    setDescription(item.description || '');
    setFile(null);
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setFeedback('');

    try {
      const finalCategory = customCategory.trim() || category;
      const formData = new FormData();
      formData.append('title', title);
      formData.append('category', finalCategory);
      formData.append('description', description);
      if (file) {
        formData.append('image', file);
      }

      if (editingItem) {
        await galleryApi.update(editingItem._id, formData);
        setFeedback('Gallery photo updated.');
      } else {
        await galleryApi.create(formData);
        setFeedback('Photo uploaded to gallery.');
      }

      setShowModal(false);
      await Promise.all([loadGallery(), refreshSettings()]);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await galleryApi.remove(id);
      setFeedback('Photo deleted from gallery.');
      await loadGallery();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-[#24364B]">Gallery Management</h1>
          <p className="text-sm text-[#52657A]">
            Upload actual Little Star photographs (JPG, PNG, WebP up to 5 MB), organize categories,
            or replace demo references.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2876C8] text-white text-sm font-semibold hover:bg-[#1E62AB] whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Photo</span>
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
        <div className="p-8 text-center text-sm text-[#52657A]">Loading gallery...</div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-10 text-center space-y-3">
          <p className="text-sm text-[#52657A]">No photos in gallery yet.</p>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#EAF5FF] text-[#2876C8] text-xs font-semibold"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload First Photo</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden flex flex-col justify-between"
            >
              <div className="aspect-[4/3] bg-[#EAF5FF]">
                <ResilientImage
                  src={item.imageUrl}
                  alt={item.title}
                  fallbackTitle={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <p className="text-xs font-medium text-[#2876C8]">
                    {item.category}
                    {item.isDemo ? ' · Demo Reference' : ''}
                  </p>
                  <h2 className="font-display font-semibold text-base text-[#24364B]">
                    {item.title}
                  </h2>
                  {item.description && (
                    <p className="text-xs text-[#52657A] line-clamp-2 mt-1">{item.description}</p>
                  )}
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-[#F1F5F9]">
                  <button
                    type="button"
                    onClick={() => openEdit(item)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#24364B] hover:bg-[#EAF5FF]"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item._id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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
                {editingItem ? 'Edit Gallery Photo' : 'Upload New Photo'}
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
              <label className="block font-semibold mb-1">Photo Title *</label>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Morning Reading Circle"
                className="w-full rounded-xl border border-[#CFE0F2] px-3 py-2"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-[#CFE0F2] px-3 py-2"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">Or Create Category</label>
                <input
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Optional new category"
                  className="w-full rounded-xl border border-[#CFE0F2] px-3 py-2"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1">Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-[#CFE0F2] px-3 py-2"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">
                Image File {editingItem ? '(Leave empty to keep current)' : '*'} (JPG, PNG, WebP ·
                max 5 MB)
              </label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                required={!editingItem}
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-[#52657A] file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-[#EAF5FF] file:text-[#2876C8] file:font-semibold"
              />
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
                {saving ? 'Uploading...' : 'Save Photo'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
