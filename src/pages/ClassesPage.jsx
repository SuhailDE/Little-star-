import { useEffect, useState } from 'react';
import { ArrowRight, BookOpen, CheckCircle2, Computer, GraduationCap, Languages } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext.jsx';
import { classesApi, coursesApi } from '../services/api.js';

export default function ClassesPage() {
  const { settings } = useSettings();
  const [classes, setClasses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [clsRes, crsRes] = await Promise.all([classesApi.list(), coursesApi.list()]);
        if (!active) return;
        setClasses(clsRes.classes || []);
        setCourses(crsRes.courses || []);
      } catch {
        if (active) setError('Unable to load class and course details right now.');
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div>
      {/* Header */}
      <section className="bg-[#EAF5FF] border-b border-[#DCE8F5] py-14 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <p className="text-sm font-semibold text-[#2876C8]">Academic Programs</p>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-[#24364B] text-balance">
            Classes &amp; Special Programs at {settings.institutionName || 'Little Star'}
          </h1>
          <p className="text-base sm:text-lg text-[#52657A] max-w-2xl">
            Our Regular Educational Program (Pre-Play to Class 4) and our Special English &amp; ICT
            Programs (Class 3–8) are structured separately to give every learner focused support.
          </p>
        </div>
      </section>

      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        </div>
      )}

      {/* SECTION 1: REGULAR EDUCATIONAL PROGRAM */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#E2ECF6]">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#2876C8]">
                <BookOpen className="w-4 h-4" />
                <span>Category 01</span>
              </div>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#24364B]">
                Regular Educational Program
              </h2>
              <p className="text-sm sm:text-base text-[#52657A]">
                Pre-Play, Play, Class 1, Class 2, Class 3, and Class 4 &middot; Minimum student age:{' '}
                <span className="font-semibold text-[#24364B]">
                  {settings.minimumAge ?? 4} years
                </span>
              </p>
            </div>
            <Link
              to="/admission?program=regular"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2876C8] text-white text-sm font-semibold hover:bg-[#1E62AB] transition-colors whitespace-nowrap shrink-0"
            >
              <span>Apply for Regular Program</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-64 rounded-2xl bg-[#F8FBFF] border border-[#E2ECF6] animate-pulse" />
              ))}
            </div>
          ) : classes.length === 0 ? (
            <p className="text-sm text-[#52657A]">No regular classes configured yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
              {classes.map((cls) => (
                <article
                  key={cls._id}
                  className="rounded-2xl border border-[#DCE8F5] bg-white p-7 flex flex-col justify-between space-y-6"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-display font-bold text-2xl text-[#24364B]">
                          {cls.name}
                        </h3>
                        {cls.suitableAge && (
                          <p className="text-xs font-medium text-[#2876C8] mt-1">
                            Suitable Age: {cls.suitableAge}
                          </p>
                        )}
                      </div>
                      <span
                        className={`text-xs font-semibold ${
                          cls.isAvailable ? 'text-[#15803D]' : 'text-[#B45309]'
                        }`}
                      >
                        {cls.isAvailable ? 'Admission Open' : 'Currently Closed'}
                      </span>
                    </div>

                    <p className="text-sm sm:text-base text-[#52657A] leading-relaxed">
                      {cls.description}
                    </p>

                    {cls.learningObjectives && cls.learningObjectives.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-[#24364B]">
                          Learning Objectives
                        </h4>
                        <ul className="space-y-1.5">
                          {cls.learningObjectives.map((obj, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-2 text-sm text-[#52657A]"
                            >
                              <CheckCircle2 className="w-4 h-4 text-[#2876C8] shrink-0 mt-0.5" />
                              <span>{obj}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {cls.subjects && cls.subjects.length > 0 && (
                      <div className="pt-1">
                        <p className="text-xs text-[#52657A]">
                          <span className="font-semibold text-[#24364B]">Available Subjects:</span>{' '}
                          {cls.subjects.join(' · ')}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-[#EFF5FB] flex flex-wrap items-center justify-between gap-4">
                    <span className="text-xs text-[#52657A]">
                      {cls.eligibilityNote || `Minimum age ${settings.minimumAge ?? 4} years`}
                    </span>
                    <Link
                      to={`/admission?program=regular&class=${encodeURIComponent(cls.name)}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#EAF5FF] text-[#2876C8] text-sm font-semibold hover:bg-[#2876C8] hover:text-white transition-colors"
                    >
                      <span>Apply for {cls.name}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* SECTION 2: SPECIAL PROGRAMS (COMPLETELY SEPARATE) */}
      <section className="py-16 bg-[#F8FBFF] border-t border-[#E2ECF6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#DCE8F5]">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#2876C8]">
                <GraduationCap className="w-4 h-4" />
                <span>Category 02</span>
              </div>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#24364B]">
                Special Programs (Class 3–8)
              </h2>
              <p className="text-sm sm:text-base text-[#52657A]">
                Focused English and ICT courses designed for school students in Classes 3 through 8.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-72 rounded-2xl bg-white border border-[#E2ECF6] animate-pulse" />
              <div className="h-72 rounded-2xl bg-white border border-[#E2ECF6] animate-pulse" />
            </div>
          ) : courses.length === 0 ? (
            <p className="text-sm text-[#52657A]">No special programs configured yet.</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {courses.map((course) => {
                const isIct = String(course.subject).toLowerCase().includes('ict');
                const Icon = isIct ? Computer : Languages;
                return (
                  <article
                    key={course._id}
                    className="rounded-2xl bg-white border border-[#CFE2F6] p-8 flex flex-col justify-between space-y-6"
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-[#EAF5FF] text-[#2876C8] flex items-center justify-center shrink-0">
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-[#2876C8]">
                              Target Classes: {course.targetClasses}
                            </p>
                            <h3 className="font-display font-bold text-xl sm:text-2xl text-[#24364B]">
                              {course.title}
                            </h3>
                          </div>
                        </div>
                        <span
                          className={`text-xs font-semibold shrink-0 ${
                            course.isAvailable ? 'text-[#15803D]' : 'text-[#B45309]'
                          }`}
                        >
                          {course.isAvailable ? 'Available' : 'Closed'}
                        </span>
                      </div>

                      <p className="text-sm sm:text-base text-[#52657A] leading-relaxed">
                        {course.description}
                      </p>

                      {course.learningObjectives && course.learningObjectives.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-[#24364B]">
                            Course Learning Objectives
                          </h4>
                          <ul className="space-y-2">
                            {course.learningObjectives.map((obj, idx) => (
                              <li
                                key={idx}
                                className="flex items-start gap-2.5 text-sm text-[#52657A]"
                              >
                                <CheckCircle2 className="w-4 h-4 text-[#2876C8] shrink-0 mt-0.5" />
                                <span>{obj}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {course.eligibilityNote && (
                        <p className="text-xs text-[#52657A]">{course.eligibilityNote}</p>
                      )}
                    </div>

                    <div className="pt-4 border-t border-[#EFF5FB] flex flex-wrap items-center justify-between gap-4">
                      <Link
                        to={`/admission?program=special&class=${encodeURIComponent(course.title)}`}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2876C8] text-white text-sm font-semibold hover:bg-[#1E62AB] transition-colors"
                      >
                        <span>Apply for Course</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                      <Link
                        to="/contact"
                        className="text-sm font-semibold text-[#24364B] hover:text-[#2876C8]"
                      >
                        Contact for Enrollment
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
