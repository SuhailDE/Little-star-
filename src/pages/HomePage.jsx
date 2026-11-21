import { useEffect, useState } from 'react';
import {
  ArrowRight,
  Bell,
  BookOpen,
  CheckCircle2,
  Computer,
  GraduationCap,
  Heart,
  Languages,
  MapPin,
  MessageCircle,
  Phone,
  Sparkles,
  Star,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { StarEmblem } from '../components/LittleStarLogo.jsx';
import ResilientImage from '../components/ResilientImage.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import { classesApi, coursesApi, galleryApi, noticesApi } from '../services/api.js';
import { formatDate, formatTelHref, formatWhatsAppHref, isSafeHttpUrl } from '../utils/formatters.js';

const HERO_IMAGE = '/src/assets/images/hero_little_star_learning_1795266082769.jpg';

const TEACHING_PILLARS = [
  {
    title: 'Child-Friendly Learning',
    description:
      'A gentle, encouraging environment where young learners feel safe to ask questions, explore ideas, and enjoy school.',
    icon: Heart,
  },
  {
    title: 'Individual Attention',
    description:
      'Attentive classroom guidance that recognizes each child’s pace and supports steady personal progress.',
    icon: Users,
  },
  {
    title: 'Interactive Teaching',
    description:
      'Guided classroom participation, reading aloud, and clear explanations instead of passive memorization.',
    icon: Sparkles,
  },
  {
    title: 'Learning Through Activities',
    description:
      'Hands-on drawing, storytelling, phonics games, and structured exercises that keep young minds engaged.',
    icon: BookOpen,
  },
  {
    title: 'English Language Development',
    description:
      'Dedicated focus on reading fluency, vocabulary, grammar clarity, and confident everyday communication.',
    icon: Languages,
  },
  {
    title: 'Basic ICT Education',
    description:
      'Age-appropriate computer familiarity and practical digital foundations to prepare students for modern learning.',
    icon: Computer,
  },
];

export default function HomePage() {
  const { settings } = useSettings();
  const [classes, setClasses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [notices, setNotices] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    let active = true;
    async function loadHomeData() {
      try {
        const [clsRes, crsRes, notRes, galRes] = await Promise.all([
          classesApi.list(true),
          coursesApi.list(true),
          noticesApi.list({ active: 'true' }),
          galleryApi.list(),
        ]);
        if (!active) return;
        setClasses(clsRes.classes || []);
        setCourses(crsRes.courses || []);
        setNotices((notRes.notices || []).slice(0, 3));
        setGallery((galRes.gallery || []).slice(0, 3));
      } catch {
        // Silently degrade to empty collections; hero & core info stay intact
      } finally {
        if (active) setLoadingData(false);
      }
    }
    loadHomeData();
    return () => {
      active = false;
    };
  }, []);

  const phones =
    settings.phones && settings.phones.length > 0
      ? settings.phones
      : ['01636-021582', '01682-225117'];
  const primaryWhatsapp = settings.whatsappNumber || phones[0];
  const isAdmissionOpen = settings.admissionStatus !== 'Closed';

  return (
    <div>
      {/* 1. HERO SECTION */}
      <section className="relative bg-gradient-to-b from-[#EAF5FF] via-[#F4F9FF] to-white border-b border-[#E2ECF6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
              <div className="flex items-center gap-3 text-sm font-medium text-[#24364B]">
                <StarEmblem className="w-8 h-8" />
                <span>{settings.institutionName || 'Little Star'}</span>
                <span aria-hidden="true" className="text-[#2876C8]/40">
                  &middot;
                </span>
                <span
                  className={
                    isAdmissionOpen ? 'text-[#15803D] font-semibold' : 'text-[#B45309] font-semibold'
                  }
                >
                  Admission {settings.admissionStatus || 'Open'}
                </span>
              </div>

              <div className="space-y-3">
                <p className="font-display font-semibold text-base sm:text-lg text-[#2876C8]">
                  {settings.heroSubtitle || settings.tagline || 'A Caring Place for Young Learners'}
                </p>
                <h1 className="font-display font-bold tracking-tight text-[#24364B] text-[clamp(2.25rem,4vw,3.5rem)] leading-[1.1] text-balance">
                  {settings.heroHeading || 'Every Child Is a Little Star'}
                </h1>
              </div>

              <p className="text-base sm:text-lg text-[#52657A] leading-relaxed max-w-xl">
                {settings.heroSupportingText ||
                  'Helping children build confidence, knowledge, creativity and strong educational foundations.'}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-1">
                <Link
                  to="/admission"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#2876C8] text-white font-semibold text-sm sm:text-base hover:bg-[#1E62AB] transition-colors shadow-sm whitespace-nowrap"
                >
                  <span>Apply for Admission</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-[#24364B] font-semibold text-sm sm:text-base border border-[#CFE0F2] hover:bg-[#EAF5FF] transition-colors whitespace-nowrap"
                >
                  <span>Contact Us</span>
                </Link>
              </div>

              <div className="pt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-sm text-[#52657A]">
                <span>Regular Classes: Pre-Play to Class 4</span>
                <span aria-hidden="true">&middot;</span>
                <span>Minimum Age: {settings.minimumAge ?? 4} Years</span>
                <span aria-hidden="true">&middot;</span>
                <span>Special English &amp; ICT (Class 3–8)</span>
              </div>
            </div>

            <div className="lg:col-span-6 flex">
              <div className="w-full rounded-3xl overflow-hidden border border-[#D8E7F5] bg-white shadow-sm">
                <ResilientImage
                  src={HERO_IMAGE}
                  alt="Young learners studying happily at Little Star"
                  fallbackTitle="Every Child Is a Little Star"
                  className="w-full h-72 sm:h-96 lg:h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. WELCOME & NOTICES */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-7 space-y-5">
              <p className="text-sm font-semibold text-[#2876C8]">Welcome to Little Star</p>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#24364B] text-balance">
                Building Strong Educational Foundations With Warmth and Care
              </h2>
              <p className="text-base text-[#52657A] leading-relaxed">
                {settings.aboutIntro}
              </p>
              <p className="text-base text-[#52657A] leading-relaxed">
                {settings.learningEnvironment}
              </p>
              <div className="pt-2">
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#2876C8] hover:text-[#1E62AB]"
                >
                  <span>Read more about Little Star</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Official Notice Board */}
            <div className="lg:col-span-5 rounded-2xl bg-[#EAF5FF]/60 border border-[#D8E7F5] p-6 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <Bell className="w-5 h-5 text-[#2876C8]" />
                  <h3 className="font-display font-semibold text-lg text-[#24364B]">
                    Notice Board
                  </h3>
                </div>
                <span className="text-xs font-medium text-[#52657A]">Latest Updates</span>
              </div>

              {loadingData ? (
                <div className="space-y-3">
                  <div className="h-16 rounded-xl bg-white/80 animate-pulse" />
                  <div className="h-16 rounded-xl bg-white/80 animate-pulse" />
                </div>
              ) : notices.length === 0 ? (
                <p className="text-sm text-[#52657A] py-4">
                  No active notices at the moment. Admissions are {settings.admissionStatus || 'Open'}.
                </p>
              ) : (
                <div className="divide-y divide-[#D8E7F5]">
                  {notices.map((notice) => (
                    <article key={notice._id} className="py-3.5 first:pt-1 last:pb-1 space-y-1">
                      <div className="flex items-center gap-2 text-xs text-[#52657A]">
                        <span className="font-semibold text-[#2876C8]">{notice.category}</span>
                        <span aria-hidden="true">&middot;</span>
                        <span className="tabular-nums">
                          {formatDate(notice.publishDate || notice.createdAt)}
                        </span>
                      </div>
                      <h4 className="font-display font-semibold text-sm text-[#24364B]">
                        {notice.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-[#52657A] line-clamp-2 leading-relaxed">
                        {notice.content}
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3. REGULAR EDUCATIONAL PROGRAM (SEPARATE FROM SPECIAL PROGRAMS) */}
      <section className="py-16 lg:py-20 bg-[#F8FBFF] border-y border-[#E2ECF6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <p className="text-sm font-semibold text-[#2876C8]">Regular Educational Program</p>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#24364B] text-balance">
                Pre-Play to Class 4
              </h2>
              <p className="text-sm sm:text-base text-[#52657A]">
                Structured early-childhood and primary schooling starting from age{' '}
                <span className="font-semibold text-[#24364B] tabular-nums">
                  {settings.minimumAge ?? 4} years
                </span>
                .
              </p>
            </div>
            <Link
              to="/classes"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#2876C8] hover:text-[#1E62AB] whitespace-nowrap shrink-0"
            >
              <span>View full curriculum details</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loadingData ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((idx) => (
                <div key={idx} className="h-52 rounded-2xl bg-white border border-[#E2ECF6] animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {classes.map((cls) => (
                <article
                  key={cls._id}
                  className="bg-white rounded-2xl border border-[#DCE8F5] p-6 flex flex-col justify-between space-y-5 hover:border-[#2876C8]/40 transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-display font-bold text-xl text-[#24364B]">{cls.name}</h3>
                      {cls.suitableAge && (
                        <span className="text-xs font-medium text-[#2876C8]">
                          {cls.suitableAge}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[#52657A] leading-relaxed">{cls.description}</p>
                    {cls.subjects && cls.subjects.length > 0 && (
                      <p className="text-xs text-[#52657A] pt-1">
                        <span className="font-semibold text-[#24364B]">Focus areas:</span>{' '}
                        {cls.subjects.join(' · ')}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-[#EFF5FB] flex items-center justify-between gap-4">
                    <span className="text-xs font-medium text-[#15803D]">
                      {cls.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                    <Link
                      to={`/admission?program=regular&class=${encodeURIComponent(cls.name)}`}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#2876C8] hover:text-[#1E62AB]"
                    >
                      <span>Apply</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. SPECIAL ENGLISH & ICT PROGRAMS (SEPARATE SECTION) */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="space-y-2 max-w-2xl">
            <p className="text-sm font-semibold text-[#2876C8]">Special Subject Programs</p>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#24364B] text-balance">
              Special English &amp; ICT Classes (Class 3–8)
            </h2>
            <p className="text-sm sm:text-base text-[#52657A]">
              Dedicated skill-building courses offered separately from our regular classes for
              students in Class 3 through Class 8.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {courses.map((course) => (
              <article
                key={course._id}
                className="rounded-2xl bg-[#EAF5FF]/65 border border-[#CFE2F6] p-7 sm:p-8 flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#2876C8]">
                      <GraduationCap className="w-4 h-4" />
                      <span>
                        {course.subject} &middot; {course.targetClasses}
                      </span>
                    </span>
                    <span className="text-xs font-semibold text-[#15803D]">
                      {course.isAvailable ? 'Enrollment Open' : 'Closed'}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-2xl text-[#24364B]">
                    {course.title}
                  </h3>
                  <p className="text-sm sm:text-base text-[#52657A] leading-relaxed">
                    {course.description}
                  </p>

                  {course.learningObjectives && course.learningObjectives.length > 0 && (
                    <ul className="space-y-2 pt-1">
                      {course.learningObjectives.map((obj, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-[#24364B]">
                          <CheckCircle2 className="w-4 h-4 text-[#2876C8] shrink-0 mt-0.5" />
                          <span>{obj}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="pt-4 border-t border-[#CFE2F6] flex flex-wrap items-center justify-between gap-4">
                  <Link
                    to={`/admission?program=special&class=${encodeURIComponent(course.title)}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2876C8] text-white text-sm font-semibold hover:bg-[#1E62AB] transition-colors"
                  >
                    <span>Enroll in {course.subject}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/contact"
                    className="text-sm font-semibold text-[#24364B] hover:text-[#2876C8]"
                  >
                    Contact for details
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 5. WHY CHOOSE LITTLE STAR & TEACHING APPROACH */}
      <section className="py-16 lg:py-20 bg-[#F8FBFF] border-y border-[#E2ECF6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <p className="text-sm font-semibold text-[#2876C8]">
                Why Choose Little Star &amp; Our Teaching Approach
              </p>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#24364B] text-balance">
                Thoughtful Guidance Designed for Young Learners
              </h2>
            </div>
            <Link
              to="/approach"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#2876C8] hover:text-[#1E62AB]"
            >
              <span>Explore our teaching approach</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {TEACHING_PILLARS.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="bg-white rounded-2xl border border-[#DCE8F5] p-6 space-y-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#EAF5FF] text-[#2876C8] flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-display font-semibold text-lg text-[#24364B]">{item.title}</h3>
                  <p className="text-sm text-[#52657A] leading-relaxed">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. DIRECTOR'S INTRODUCTION */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-[#24364B] text-white p-8 sm:p-12 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-4 flex flex-col items-center md:items-start text-center md:text-left space-y-3">
              <div className="w-24 h-24 rounded-2xl bg-[#2876C8] border border-white/20 flex items-center justify-center">
                <Star className="w-11 h-11 text-[#FFD447] fill-[#FFD447]" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#FFD447]">Institution Leadership</p>
                <h3 className="font-display font-bold text-xl mt-0.5">
                  {settings.directorName || 'Selina Parveen (Munni)'}
                </h3>
                <p className="text-sm text-white/75">Director, {settings.institutionName}</p>
              </div>
            </div>

            <div className="md:col-span-8 space-y-4">
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-balance">
                A Personal Commitment to Every Child’s Foundation
              </h2>
              <p className="text-sm sm:text-base text-white/85 leading-relaxed">
                {settings.teachingPhilosophy ||
                  'At Little Star, we welcome every child with patience, encouragement, and structured care. Our goal is to help young learners build confidence, curiosity, and strong academic habits in English, foundational subjects, and basic ICT.'}
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FFD447] text-[#24364B] text-sm font-semibold hover:bg-[#F5C733] transition-colors"
                >
                  <span>About Little Star</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-[#FFD447] transition-colors"
                >
                  <span>Speak with the Director</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. PHOTO GALLERY PREVIEW */}
      <section className="py-16 lg:py-20 bg-[#F8FBFF] border-y border-[#E2ECF6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-[#2876C8]">Photo Gallery</p>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#24364B]">
                Inside Our Learning Space
              </h2>
            </div>
            <Link
              to="/gallery"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#2876C8] hover:text-[#1E62AB]"
            >
              <span>Open full gallery</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {gallery.map((item) => (
              <Link
                key={item._id}
                to="/gallery"
                className="group bg-white rounded-2xl border border-[#DCE8F5] overflow-hidden hover:border-[#2876C8]/50 transition-colors"
              >
                <div className="aspect-[4/3] overflow-hidden bg-[#EAF5FF]">
                  <ResilientImage
                    src={item.imageUrl}
                    alt={item.title}
                    fallbackTitle={item.title}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                  />
                </div>
                <div className="p-5 space-y-1.5">
                  <p className="text-xs font-medium text-[#2876C8]">
                    {item.category}
                    {item.isDemo ? ' · Demo Reference' : ''}
                  </p>
                  <h3 className="font-display font-semibold text-base text-[#24364B]">
                    {item.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 8. ADMISSION & DIRECT CONTACT CTA */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            <div className="lg:col-span-7 rounded-2xl bg-[#EAF5FF] border border-[#CFE2F6] p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <p className="text-sm font-semibold text-[#2876C8]">
                  Admissions &middot; Status: {settings.admissionStatus || 'Open'}
                </p>
                <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#24364B] text-balance">
                  Ready to Apply for Admission at Little Star?
                </h2>
                <p className="text-sm sm:text-base text-[#52657A] leading-relaxed">
                  Applications are open for our Regular Program (Pre-Play to Class 4, minimum age{' '}
                  {settings.minimumAge ?? 4} years) and Special English &amp; ICT Classes (Class
                  3–8). Submit online and receive a tracking ID immediately.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  to="/admission"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#2876C8] text-white font-semibold text-sm hover:bg-[#1E62AB] transition-colors"
                >
                  <span>Apply for Admission</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/admission?tab=track"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-[#24364B] font-semibold text-sm border border-[#CFE2F6] hover:bg-[#F8FBFF] transition-colors"
                >
                  <span>Check Application Status</span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 rounded-2xl border border-[#DCE8F5] p-8 flex flex-col justify-between space-y-5 bg-white">
              <div className="space-y-4">
                <h3 className="font-display font-bold text-xl text-[#24364B]">
                  Contact Little Star
                </h3>
                <p className="text-sm text-[#52657A]">
                  Director: <span className="font-semibold text-[#24364B]">{settings.directorName}</span>
                </p>
                <div className="space-y-2.5">
                  {phones.map((phone) => (
                    <a
                      key={phone}
                      href={formatTelHref(phone)}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#F8FBFF] border border-[#E2ECF6] text-sm font-semibold text-[#24364B] hover:border-[#2876C8] transition-colors tabular-nums"
                    >
                      <Phone className="w-4 h-4 text-[#2876C8]" />
                      <span>Call {phone}</span>
                    </a>
                  ))}
                </div>
                <div className="flex items-start gap-2.5 text-sm text-[#52657A]">
                  <MapPin className="w-4 h-4 text-[#2876C8] shrink-0 mt-0.5" />
                  <span>
                    {settings.address
                      ? settings.address
                      : 'Location details are configurable by the administrator.'}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href={formatWhatsAppHref(
                    primaryWhatsapp,
                    'Assalamu Alaikum, I would like admission information for Little Star.'
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#15803D] text-white text-sm font-semibold hover:bg-[#166534] transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp</span>
                </a>
                {isSafeHttpUrl(settings.facebookUrl) && (
                  <a
                    href={settings.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#EAF5FF] text-[#2876C8] text-sm font-semibold hover:bg-[#DCECFB] transition-colors"
                  >
                    <span>Facebook Page</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
