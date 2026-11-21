import { useEffect, useState } from 'react';
import { Save, Upload } from 'lucide-react';
import { useSettings } from '../context/SettingsContext.jsx';
import { extractErrorMessage, settingsApi } from '../services/api.js';

export default function AdminSettings() {
  const { settings, setSettings, refreshSettings } = useSettings();
  const [form, setForm] = useState({
    institutionName: '',
    logoUrl: '',
    tagline: '',
    directorName: '',
    phones: '',
    whatsappNumber: '',
    facebookUrl: '',
    address: '',
    googleMapsUrl: '',
    admissionStatus: 'Open',
    minimumAge: 4,
    heroHeading: '',
    heroSubtitle: '',
    heroSupportingText: '',
    aboutIntro: '',
    mission: '',
    vision: '',
    teachingPhilosophy: '',
    learningEnvironment: '',
  });
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (settings) {
      setForm({
        institutionName: settings.institutionName || 'Little Star',
        logoUrl: settings.logoUrl || '',
        tagline: settings.tagline || 'A Caring Place for Young Learners',
        directorName: settings.directorName || 'Selina Parveen (Munni)',
        phones: Array.isArray(settings.phones)
          ? settings.phones.join(', ')
          : settings.phones || '01636-021582, 01682-225117',
        whatsappNumber: settings.whatsappNumber || '01636-021582',
        facebookUrl: settings.facebookUrl || '',
        address: settings.address || '',
        googleMapsUrl: settings.googleMapsUrl || '',
        admissionStatus: settings.admissionStatus || 'Open',
        minimumAge: settings.minimumAge ?? 4,
        heroHeading: settings.heroHeading || 'Every Child Is a Little Star',
        heroSubtitle: settings.heroSubtitle || 'A Caring Place for Young Learners',
        heroSupportingText: settings.heroSupportingText || '',
        aboutIntro: settings.aboutIntro || '',
        mission: settings.mission || '',
        vision: settings.vision || '',
        teachingPhilosophy: settings.teachingPhilosophy || '',
        learningEnvironment: settings.learningEnvironment || '',
      });
    }
  }, [settings]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback('');
    setError('');
    try {
      const payload = {
        ...form,
        minimumAge: Number(form.minimumAge) || 4,
        phones: form.phones
          .split(',')
          .map((p) => p.trim())
          .filter(Boolean),
      };
      const res = await settingsApi.update(payload);
      if (res.settings) setSettings(res.settings);
      await refreshSettings();
      setFeedback('Website settings saved. Public pages are now updated.');
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    setError('');
    setFeedback('');
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await settingsApi.uploadLogo(fd);
      if (res.settings) setSettings(res.settings);
      setForm((prev) => ({ ...prev, logoUrl: res.logoUrl || '' }));
      setFeedback('Institution logo uploaded successfully.');
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setUploadingLogo(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-[#24364B]">Website Settings</h1>
        <p className="text-sm text-[#52657A]">
          Update institutional branding, contact numbers, location, Google Maps URL, Facebook link,
          and hero content. Changes appear immediately across the public website.
        </p>
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

      <form onSubmit={handleSave} className="space-y-6 text-sm">
        {/* Institution Identity & Logo */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 space-y-5">
          <h2 className="font-display font-bold text-lg text-[#24364B]">
            Institution Identity &amp; Admissions
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">Institution Name</label>
              <input
                value={form.institutionName}
                onChange={(e) => setForm({ ...form, institutionName: e.target.value })}
                className="w-full rounded-xl border border-[#CFE0F2] px-3.5 py-2"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Tagline</label>
              <input
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                className="w-full rounded-xl border border-[#CFE0F2] px-3.5 py-2"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Director Name</label>
              <input
                value={form.directorName}
                onChange={(e) => setForm({ ...form, directorName: e.target.value })}
                className="w-full rounded-xl border border-[#CFE0F2] px-3.5 py-2"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1">Admission Status</label>
                <select
                  value={form.admissionStatus}
                  onChange={(e) => setForm({ ...form, admissionStatus: e.target.value })}
                  className="w-full rounded-xl border border-[#CFE0F2] px-3.5 py-2"
                >
                  <option value="Open">Open</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">Min Age (Years)</label>
                <input
                  type="number"
                  min={3}
                  max={12}
                  value={form.minimumAge}
                  onChange={(e) => setForm({ ...form, minimumAge: e.target.value })}
                  className="w-full rounded-xl border border-[#CFE0F2] px-3.5 py-2"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#F1F5F9]">
            <div>
              <label className="block font-semibold mb-1">Custom Logo URL (Optional)</label>
              <input
                value={form.logoUrl}
                onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                placeholder="Leave blank to use default Little Star emblem"
                className="w-full rounded-xl border border-[#CFE0F2] px-3.5 py-2"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Upload Custom Logo Image</label>
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#EAF5FF] text-[#2876C8] font-semibold cursor-pointer hover:bg-[#DCECFB]">
                <Upload className="w-4 h-4" />
                <span>{uploadingLogo ? 'Uploading...' : 'Choose Logo File'}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Contact, Location & Social */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 space-y-4">
          <h2 className="font-display font-bold text-lg text-[#24364B]">
            Contact Numbers, Location &amp; Social Links
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">Phone Numbers (comma-separated)</label>
              <input
                value={form.phones}
                onChange={(e) => setForm({ ...form, phones: e.target.value })}
                className="w-full rounded-xl border border-[#CFE0F2] px-3.5 py-2"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Official WhatsApp Number</label>
              <input
                value={form.whatsappNumber}
                onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
                className="w-full rounded-xl border border-[#CFE0F2] px-3.5 py-2"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Official Facebook Page URL</label>
              <input
                type="url"
                placeholder="https://www.facebook.com/..."
                value={form.facebookUrl}
                onChange={(e) => setForm({ ...form, facebookUrl: e.target.value })}
                className="w-full rounded-xl border border-[#CFE0F2] px-3.5 py-2"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">
                Google Maps Embed or Share URL
              </label>
              <input
                type="url"
                placeholder="https://www.google.com/maps/embed?pb=..."
                value={form.googleMapsUrl}
                onChange={(e) => setForm({ ...form, googleMapsUrl: e.target.value })}
                className="w-full rounded-xl border border-[#CFE0F2] px-3.5 py-2"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-semibold mb-1">Campus Address</label>
              <input
                placeholder="Enter full Little Star campus address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full rounded-xl border border-[#CFE0F2] px-3.5 py-2"
              />
            </div>
          </div>
        </div>

        {/* Hero & About Content */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 space-y-4">
          <h2 className="font-display font-bold text-lg text-[#24364B]">
            Hero Section &amp; Institutional Copy
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">Hero Heading</label>
              <input
                value={form.heroHeading}
                onChange={(e) => setForm({ ...form, heroHeading: e.target.value })}
                className="w-full rounded-xl border border-[#CFE0F2] px-3.5 py-2"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Hero Subtitle</label>
              <input
                value={form.heroSubtitle}
                onChange={(e) => setForm({ ...form, heroSubtitle: e.target.value })}
                className="w-full rounded-xl border border-[#CFE0F2] px-3.5 py-2"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-semibold mb-1">Hero Supporting Text</label>
              <textarea
                rows={2}
                value={form.heroSupportingText}
                onChange={(e) => setForm({ ...form, heroSupportingText: e.target.value })}
                className="w-full rounded-xl border border-[#CFE0F2] px-3.5 py-2"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-semibold mb-1">About Introduction</label>
              <textarea
                rows={3}
                value={form.aboutIntro}
                onChange={(e) => setForm({ ...form, aboutIntro: e.target.value })}
                className="w-full rounded-xl border border-[#CFE0F2] px-3.5 py-2"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Mission</label>
              <textarea
                rows={3}
                value={form.mission}
                onChange={(e) => setForm({ ...form, mission: e.target.value })}
                className="w-full rounded-xl border border-[#CFE0F2] px-3.5 py-2"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Vision</label>
              <textarea
                rows={3}
                value={form.vision}
                onChange={(e) => setForm({ ...form, vision: e.target.value })}
                className="w-full rounded-xl border border-[#CFE0F2] px-3.5 py-2"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#2876C8] text-white font-semibold hover:bg-[#1E62AB] disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Settings...' : 'Save Website Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
