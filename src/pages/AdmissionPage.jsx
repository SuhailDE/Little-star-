import { useEffect, useState } from 'react';
import { CheckCircle2, ClipboardCheck, Search, ShieldAlert } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext.jsx';
import { admissionsApi, classesApi, coursesApi, extractErrorMessage } from '../services/api.js';
import { calculateAgeYears, formatDate } from '../utils/formatters.js';

export default function AdmissionPage() {
  const { settings } = useSettings();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'track' ? 'track' : 'apply';
  const [activeTab, setActiveTab] = useState(initialTab);

  const [classes, setClasses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submittedRecord, setSubmittedRecord] = useState(null);

  const [trackIdInput, setTrackIdInput] = useState(searchParams.get('id') || '');
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState('');
  const [trackedApp, setTrackedApp] = useState(null);

  const minAge = settings.minimumAge ?? 4;
  const isAdmissionOpen = settings.admissionStatus !== 'Closed';

  const preselectedProgram = searchParams.get('program') === 'special' ? 'special' : 'regular';
  const preselectedClass = searchParams.get('class') || '';

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      programType: preselectedProgram,
      applyingClass: preselectedClass,
      gender: '',
    },
  });

  const programType = watch('programType');
  const dobValue = watch('dateOfBirth');
  const computedAge = calculateAgeYears(dobValue);

  useEffect(() => {
    setActiveTab(searchParams.get('tab') === 'track' ? 'track' : 'apply');
  }, [searchParams]);

  useEffect(() => {
    async function loadOptions() {
      try {
        const [clsRes, crsRes] = await Promise.all([
          classesApi.list(true),
          coursesApi.list(true),
        ]);
        setClasses(clsRes.classes || []);
        setCourses(crsRes.courses || []);
      } catch {
        // Fallback options if needed
      }
    }
    loadOptions();
  }, []);

  useEffect(() => {
    if (preselectedClass) {
      setValue('applyingClass', preselectedClass);
    }
  }, [preselectedClass, setValue]);

  const onSubmitAdmission = async (values) => {
    setSubmitError('');
    setSubmitting(true);
    try {
      const res = await admissionsApi.submit(values);
      setSubmittedRecord(res.admission);
      reset();
    } catch (err) {
      setSubmitError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleTrackSubmit = async (e) => {
    e.preventDefault();
    const cleaned = trackIdInput.trim();
    if (!cleaned) {
      setTrackingError('Please enter your Application ID.');
      return;
    }
    setTrackingError('');
    setTrackedApp(null);
    setTrackingLoading(true);
    try {
      const res = await admissionsApi.track(cleaned);
      setTrackedApp(res.application);
    } catch (err) {
      setTrackingError(extractErrorMessage(err, 'Application not found.'));
    } finally {
      setTrackingLoading(false);
    }
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    setSearchParams(tab === 'track' ? { tab: 'track' } : {});
  };

  const statusTone = (status) => {
    if (status === 'Approved') return 'text-[#15803D] bg-emerald-50 border-emerald-200';
    if (status === 'Rejected') return 'text-[#DC2626] bg-red-50 border-red-200';
    return 'text-[#B45309] bg-amber-50 border-amber-200';
  };

  return (
    <div>
      <section className="bg-[#EAF5FF] border-b border-[#DCE8F5] py-14 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <p className="text-sm font-semibold text-[#2876C8]">
            Admissions &middot; Status: {settings.admissionStatus || 'Open'}
          </p>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-[#24364B]">
            Admission Application &amp; Status Tracker
          </h1>
          <p className="text-base text-[#52657A] max-w-2xl">
            Apply online for Regular Classes (Pre-Play to Class 4, minimum age{' '}
            <span className="font-semibold text-[#24364B]">{minAge} years</span>) or Special English
            &amp; ICT Classes (Class 3–8).
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Segmented Tab Switcher */}
          <div className="inline-flex items-center gap-1 p-1.5 bg-[#F4F8FC] border border-[#DCE8F5] rounded-xl">
            <button
              type="button"
              onClick={() => switchTab('apply')}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'apply'
                  ? 'bg-[#2876C8] text-white shadow-sm'
                  : 'text-[#52657A] hover:text-[#24364B]'
              }`}
            >
              Apply for Admission
            </button>
            <button
              type="button"
              onClick={() => switchTab('track')}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'track'
                  ? 'bg-[#2876C8] text-white shadow-sm'
                  : 'text-[#52657A] hover:text-[#24364B]'
              }`}
            >
              Check Application Status
            </button>
          </div>

          {activeTab === 'apply' ? (
            <>
              {!isAdmissionOpen && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-900">
                    <p className="font-semibold">Admissions are currently marked as Closed</p>
                    <p className="mt-1">
                      Please contact Little Star directly at{' '}
                      {(settings.phones || ['01636-021582']).join(' / ')} for upcoming admission
                      dates.
                    </p>
                  </div>
                </div>
              )}

              {submittedRecord ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-8 space-y-5">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-[#15803D] shrink-0 mt-0.5" />
                    <div>
                      <h2 className="font-display font-bold text-2xl text-[#24364B]">
                        Application Submitted Successfully
                      </h2>
                      <p className="text-sm text-[#52657A] mt-1">
                        Save your unique Application ID below to track review progress.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl bg-white border border-emerald-200 p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-[#52657A]">Application ID</p>
                      <p className="font-mono font-bold text-lg text-[#2876C8] tabular-nums">
                        {submittedRecord.applicationId}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#52657A]">Current Status</p>
                      <p className="font-semibold text-[#B45309]">{submittedRecord.status}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#52657A]">Student Name</p>
                      <p className="font-semibold text-[#24364B]">{submittedRecord.studentName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#52657A]">Applying Class / Course</p>
                      <p className="font-semibold text-[#24364B]">
                        {submittedRecord.applyingClass}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setTrackIdInput(submittedRecord.applicationId);
                        switchTab('track');
                      }}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2876C8] text-white text-sm font-semibold hover:bg-[#1E62AB]"
                    >
                      <ClipboardCheck className="w-4 h-4" />
                      <span>Track This Application</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSubmittedRecord(null)}
                      className="px-5 py-2.5 rounded-xl bg-white border border-[#DCE8F5] text-sm font-semibold text-[#24364B] hover:bg-[#F8FBFF]"
                    >
                      Submit Another Application
                    </button>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit(onSubmitAdmission)}
                  noValidate
                  className="rounded-2xl border border-[#DCE8F5] bg-white p-6 sm:p-8 space-y-6"
                >
                  <div className="space-y-1 pb-4 border-b border-[#EFF5FB]">
                    <h2 className="font-display font-bold text-xl text-[#24364B]">
                      Student Admission Form
                    </h2>
                    <p className="text-xs sm:text-sm text-[#52657A]">
                      Minimum student age for the regular educational program is{' '}
                      <span className="font-semibold text-[#24364B]">{minAge} years</span>.
                    </p>
                  </div>

                  {submitError && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {submitError}
                    </div>
                  )}

                  {/* Program Selection */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-[#24364B] mb-1.5">
                        Program Category *
                      </label>
                      <select
                        {...register('programType', { required: true })}
                        onChange={(e) => {
                          setValue('programType', e.target.value);
                          setValue('applyingClass', '');
                        }}
                        className="w-full rounded-xl border border-[#CFE0F2] px-3.5 py-2.5 text-sm text-[#24364B] focus:outline-none focus:ring-2 focus:ring-[#2876C8]"
                      >
                        <option value="regular">Regular Program (Pre-Play to Class 4)</option>
                        <option value="special">Special Programs (English / ICT Class 3–8)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#24364B] mb-1.5">
                        Applying Class / Course *
                      </label>
                      <select
                        {...register('applyingClass', {
                          required: 'Please select a class or course.',
                        })}
                        className="w-full rounded-xl border border-[#CFE0F2] px-3.5 py-2.5 text-sm text-[#24364B] focus:outline-none focus:ring-2 focus:ring-[#2876C8]"
                      >
                        <option value="">Select class or course</option>
                        {programType === 'regular'
                          ? (classes.length > 0
                              ? classes
                              : [
                                  { _id: '1', name: 'Pre-Play' },
                                  { _id: '2', name: 'Play' },
                                  { _id: '3', name: 'Class 1' },
                                  { _id: '4', name: 'Class 2' },
                                  { _id: '5', name: 'Class 3' },
                                  { _id: '6', name: 'Class 4' },
                                ]
                            ).map((c) => (
                              <option key={c._id} value={c.name}>
                                {c.name}
                              </option>
                            ))
                          : (courses.length > 0
                              ? courses
                              : [
                                  { _id: 's1', title: 'Special English Classes (Class 3–8)' },
                                  { _id: 's2', title: 'Special ICT Classes (Class 3–8)' },
                                ]
                            ).map((c) => (
                              <option key={c._id} value={c.title}>
                                {c.title}
                              </option>
                            ))}
                      </select>
                      {errors.applyingClass && (
                        <p className="text-xs text-red-600 mt-1">{errors.applyingClass.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Student Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div className="sm:col-span-1">
                      <label className="block text-sm font-semibold text-[#24364B] mb-1.5">
                        Student Name *
                      </label>
                      <input
                        type="text"
                        placeholder="Full name"
                        {...register('studentName', {
                          required: 'Student name is required.',
                          minLength: { value: 2, message: 'Enter at least 2 characters.' },
                        })}
                        className="w-full rounded-xl border border-[#CFE0F2] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2876C8]"
                      />
                      {errors.studentName && (
                        <p className="text-xs text-red-600 mt-1">{errors.studentName.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#24364B] mb-1.5">
                        Date of Birth *
                      </label>
                      <input
                        type="date"
                        {...register('dateOfBirth', {
                          required: 'Date of birth is required.',
                          validate: (val) => {
                            const age = calculateAgeYears(val);
                            if (age === null || age < 1 || age > 25) {
                              return 'Please enter a valid date of birth.';
                            }
                            if (programType === 'regular' && age < minAge) {
                              return `Minimum age for regular program is ${minAge} years.`;
                            }
                            return true;
                          },
                        })}
                        className="w-full rounded-xl border border-[#CFE0F2] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2876C8]"
                      />
                      {computedAge !== null && !errors.dateOfBirth && (
                        <p className="text-xs text-[#52657A] mt-1 tabular-nums">
                          Age: {computedAge} years
                        </p>
                      )}
                      {errors.dateOfBirth && (
                        <p className="text-xs text-red-600 mt-1">{errors.dateOfBirth.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#24364B] mb-1.5">
                        Gender *
                      </label>
                      <select
                        {...register('gender', { required: 'Please select gender.' })}
                        className="w-full rounded-xl border border-[#CFE0F2] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2876C8]"
                      >
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                      {errors.gender && (
                        <p className="text-xs text-red-600 mt-1">{errors.gender.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Parents */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-[#24364B] mb-1.5">
                        Father’s Name *
                      </label>
                      <input
                        type="text"
                        placeholder="Father's full name"
                        {...register('fatherName', { required: "Father's name is required." })}
                        className="w-full rounded-xl border border-[#CFE0F2] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2876C8]"
                      />
                      {errors.fatherName && (
                        <p className="text-xs text-red-600 mt-1">{errors.fatherName.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#24364B] mb-1.5">
                        Mother’s Name *
                      </label>
                      <input
                        type="text"
                        placeholder="Mother's full name"
                        {...register('motherName', { required: "Mother's name is required." })}
                        className="w-full rounded-xl border border-[#CFE0F2] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2876C8]"
                      />
                      {errors.motherName && (
                        <p className="text-xs text-red-600 mt-1">{errors.motherName.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Contact Numbers & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-[#24364B] mb-1.5">
                        Guardian Phone Number *
                      </label>
                      <input
                        type="tel"
                        placeholder="01XXXXXXXXX"
                        {...register('guardianPhone', {
                          required: 'Guardian phone number is required.',
                          pattern: {
                            value: /^[0-9+\-\s()]{8,18}$/,
                            message: 'Enter a valid phone number.',
                          },
                        })}
                        className="w-full rounded-xl border border-[#CFE0F2] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2876C8]"
                      />
                      {errors.guardianPhone && (
                        <p className="text-xs text-red-600 mt-1">{errors.guardianPhone.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#24364B] mb-1.5">
                        Alternative Phone (Optional)
                      </label>
                      <input
                        type="tel"
                        placeholder="Optional contact number"
                        {...register('alternativePhone', {
                          pattern: {
                            value: /^$|^[0-9+\-\s()]{8,18}$/,
                            message: 'Enter a valid phone number.',
                          },
                        })}
                        className="w-full rounded-xl border border-[#CFE0F2] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2876C8]"
                      />
                      {errors.alternativePhone && (
                        <p className="text-xs text-red-600 mt-1">
                          {errors.alternativePhone.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#24364B] mb-1.5">
                        Parent Email (Optional)
                      </label>
                      <input
                        type="email"
                        placeholder="parent@example.com"
                        {...register('parentEmail', {
                          pattern: {
                            value: /^$|^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: 'Enter a valid email address.',
                          },
                        })}
                        className="w-full rounded-xl border border-[#CFE0F2] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2876C8]"
                      />
                      {errors.parentEmail && (
                        <p className="text-xs text-red-600 mt-1">{errors.parentEmail.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Previous School & Present Address */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-[#24364B] mb-1.5">
                        Previous School (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="If applicable"
                        {...register('previousSchool')}
                        className="w-full rounded-xl border border-[#CFE0F2] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2876C8]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#24364B] mb-1.5">
                        Present Address *
                      </label>
                      <input
                        type="text"
                        placeholder="House, road, area"
                        {...register('presentAddress', {
                          required: 'Present address is required.',
                        })}
                        className="w-full rounded-xl border border-[#CFE0F2] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2876C8]"
                      />
                      {errors.presentAddress && (
                        <p className="text-xs text-red-600 mt-1">
                          {errors.presentAddress.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end">
                    <button
                      type="submit"
                      disabled={submitting || !isAdmissionOpen}
                      className="px-7 py-3 rounded-xl bg-[#2876C8] text-white font-semibold text-sm hover:bg-[#1E62AB] disabled:opacity-50 transition-colors"
                    >
                      {submitting ? 'Submitting Application...' : 'Submit Admission Application'}
                    </button>
                  </div>
                </form>
              )}
            </>
          ) : (
            /* Track Application Status */
            <div className="rounded-2xl border border-[#DCE8F5] bg-white p-6 sm:p-8 space-y-6">
              <div className="space-y-1">
                <h2 className="font-display font-bold text-xl text-[#24364B]">
                  Check Admission Status
                </h2>
                <p className="text-sm text-[#52657A]">
                  Enter your unique Application ID (e.g. LS-2026-1001-XXXX) to check review status.
                </p>
              </div>

              <form onSubmit={handleTrackSubmit} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={trackIdInput}
                  onChange={(e) => setTrackIdInput(e.target.value)}
                  placeholder="Enter Application ID"
                  className="flex-1 rounded-xl border border-[#CFE0F2] px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#2876C8]"
                />
                <button
                  type="submit"
                  disabled={trackingLoading}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#2876C8] text-white text-sm font-semibold hover:bg-[#1E62AB] disabled:opacity-50 whitespace-nowrap"
                >
                  <Search className="w-4 h-4" />
                  <span>{trackingLoading ? 'Checking...' : 'Check Status'}</span>
                </button>
              </form>

              {trackingError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {trackingError}
                </div>
              )}

              {trackedApp && (
                <div className="rounded-xl border border-[#DCE8F5] bg-[#F8FBFF] p-6 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#DCE8F5]">
                    <div>
                      <p className="text-xs text-[#52657A]">Application ID</p>
                      <p className="font-mono font-bold text-lg text-[#24364B] tabular-nums">
                        {trackedApp.applicationId}
                      </p>
                    </div>
                    <span
                      className={`px-3.5 py-1 rounded-lg border text-xs font-semibold ${statusTone(
                        trackedApp.status
                      )}`}
                    >
                      Status: {trackedApp.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-[#52657A]">Student Name</p>
                      <p className="font-semibold text-[#24364B]">{trackedApp.studentName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#52657A]">Applying Class / Course</p>
                      <p className="font-semibold text-[#24364B]">{trackedApp.applyingClass}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#52657A]">Submitted On</p>
                      <p className="font-semibold text-[#24364B] tabular-nums">
                        {formatDate(trackedApp.createdAt)}
                      </p>
                    </div>
                  </div>

                  {trackedApp.adminNotes && (
                    <div className="pt-2 text-sm text-[#52657A]">
                      <span className="font-semibold text-[#24364B]">Administration Note:</span>{' '}
                      {trackedApp.adminNotes}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
