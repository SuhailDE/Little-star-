import { ArrowRight, BookOpen, Heart, ShieldCheck, Star, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import ResilientImage from '../components/ResilientImage.jsx';
import { useSettings } from '../context/SettingsContext.jsx';

export default function AboutPage() {
  const { settings } = useSettings();

  return (
    <div>
      <section className="bg-[#EAF5FF] border-b border-[#DCE8F5] py-14 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <p className="text-sm font-semibold text-[#2876C8]">About Us</p>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-[#24364B] max-w-3xl text-balance">
            {settings.institutionName || 'Little Star'} —{' '}
            {settings.tagline || 'A Caring Place for Young Learners'}
          </h1>
          <p className="text-base sm:text-lg text-[#52657A] max-w-2xl leading-relaxed">
            {settings.aboutIntro}
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Director & Institutional Introduction */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
            <div className="lg:col-span-6 rounded-2xl overflow-hidden border border-[#DCE8F5] bg-[#EAF5FF]">
              <ResilientImage
                src="/src/assets/images/classroom_early_learning_1795266082477.jpg"
                alt="Little Star welcoming classroom environment"
                fallbackTitle="Little Star Learning Space"
                className="w-full h-72 lg:h-full object-cover"
              />
            </div>

            <div className="lg:col-span-6 flex flex-col justify-center space-y-5">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#2876C8]">
                <Star className="w-4 h-4 fill-[#FFD447] text-[#FFD447]" />
                <span>Institution Leadership</span>
              </div>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#24364B]">
                Guided by {settings.directorName || 'Selina Parveen (Munni)'}
              </h2>
              <p className="text-base text-[#52657A] leading-relaxed">
                As Director of Little Star,{' '}
                <span className="font-semibold text-[#24364B]">
                  {settings.directorName || 'Selina Parveen (Munni)'}
                </span>{' '}
                is dedicated to fostering a warm, disciplined, and supportive educational space
                where young learners feel valued from their very first day.
              </p>
              <p className="text-base text-[#52657A] leading-relaxed">
                Our programs focus carefully on foundational education — offering a structured
                Regular Educational Program from Pre-Play through Class 4 (minimum age{' '}
                {settings.minimumAge ?? 4} years), alongside dedicated Special English and Special
                ICT Classes for students in Class 3–8.
              </p>
            </div>
          </div>

          {/* Mission, Vision, Philosophy, Environment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <article className="rounded-2xl border border-[#DCE8F5] bg-[#F8FBFF] p-8 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#DCE8F5] text-[#2876C8] flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-xl text-[#24364B]">Our Mission</h3>
              <p className="text-sm sm:text-base text-[#52657A] leading-relaxed">
                {settings.mission}
              </p>
            </article>

            <article className="rounded-2xl border border-[#DCE8F5] bg-[#F8FBFF] p-8 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#DCE8F5] text-[#2876C8] flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-xl text-[#24364B]">Our Vision</h3>
              <p className="text-sm sm:text-base text-[#52657A] leading-relaxed">
                {settings.vision}
              </p>
            </article>

            <article className="rounded-2xl border border-[#DCE8F5] bg-white p-8 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#EAF5FF] text-[#2876C8] flex items-center justify-center">
                <Heart className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-xl text-[#24364B]">Teaching Philosophy</h3>
              <p className="text-sm sm:text-base text-[#52657A] leading-relaxed">
                {settings.teachingPhilosophy}
              </p>
            </article>

            <article className="rounded-2xl border border-[#DCE8F5] bg-white p-8 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#EAF5FF] text-[#2876C8] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-xl text-[#24364B]">Learning Environment</h3>
              <p className="text-sm sm:text-base text-[#52657A] leading-relaxed">
                {settings.learningEnvironment}
              </p>
            </article>
          </div>

          <div className="rounded-2xl bg-[#EAF5FF] border border-[#CFE2F6] p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-1">
              <h3 className="font-display font-bold text-xl text-[#24364B]">
                Explore Our Classes and Programs
              </h3>
              <p className="text-sm text-[#52657A]">
                See full details for Regular Classes (Pre-Play to Class 4) and Special English &amp;
                ICT Classes.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <Link
                to="/classes"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2876C8] text-white text-sm font-semibold hover:bg-[#1E62AB] transition-colors"
              >
                <span>View Classes</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/admission"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-[#24364B] border border-[#CFE2F6] text-sm font-semibold hover:bg-[#F8FBFF] transition-colors"
              >
                <span>Apply for Admission</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
