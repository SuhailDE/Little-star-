import {
  ArrowRight,
  Award,
  BookOpen,
  Computer,
  Heart,
  Languages,
  Puzzle,
  Sparkles,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import ResilientImage from '../components/ResilientImage.jsx';

const APPROACH_SECTIONS = [
  {
    number: '01.',
    title: 'Child-Friendly Learning',
    description:
      'Young children learn most naturally when they feel comfortable, respected, and encouraged. Our classrooms prioritize warmth and patience so children associate learning with curiosity rather than pressure.',
    icon: Heart,
  },
  {
    number: '02.',
    title: 'Individual Attention',
    description:
      'Every learner progresses at a distinct pace. We pay close attention to each student’s strengths and areas needing extra support, ensuring no child is left behind during foundational stages.',
    icon: Users,
  },
  {
    number: '03.',
    title: 'Interactive Teaching',
    description:
      'Lessons invite students to ask questions, read aloud, share observations, and engage actively with teachers rather than relying on rote repetition alone.',
    icon: Sparkles,
  },
  {
    number: '04.',
    title: 'Learning Through Activities',
    description:
      'Drawing, storytelling, structured games, and hands-on table exercises help younger learners connect concepts to real understanding while building fine motor and social skills.',
    icon: Puzzle,
  },
  {
    number: '05.',
    title: 'Building Confidence',
    description:
      'Consistent encouragement and gentle feedback help shy students find their voice, participate in group work, and develop pride in their own effort.',
    icon: Award,
  },
  {
    number: '06.',
    title: 'English Language Development',
    description:
      'From early phonics and vocabulary in regular classes to dedicated Special English Classes for Class 3–8, we emphasize clear reading, grammar, and confident expression.',
    icon: Languages,
  },
  {
    number: '07.',
    title: 'Basic ICT Education',
    description:
      'Students build practical familiarity with computer concepts, responsible digital habits, and foundational ICT skills tailored for primary and middle-school learners.',
    icon: Computer,
  },
];

export default function ApproachPage() {
  return (
    <div>
      <section className="bg-[#EAF5FF] border-b border-[#DCE8F5] py-14 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <p className="text-sm font-semibold text-[#2876C8]">Pedagogy &amp; Care</p>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-[#24364B] max-w-3xl text-balance">
            Our Teaching Approach
          </h1>
          <p className="text-base sm:text-lg text-[#52657A] max-w-2xl leading-relaxed">
            Helping young learners grow through patient guidance, active participation, and strong
            foundations in literacy, English, and basic ICT.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
            <div className="lg:col-span-6 rounded-2xl overflow-hidden border border-[#DCE8F5]">
              <ResilientImage
                src="/src/assets/images/english_ict_learning_1795266082887.jpg"
                alt="Interactive English and ICT teaching session"
                fallbackTitle="Interactive Learning"
                className="w-full h-72 lg:h-full object-cover"
              />
            </div>
            <div className="lg:col-span-6 rounded-2xl overflow-hidden border border-[#DCE8F5]">
              <ResilientImage
                src="/src/assets/images/creative_student_activities_1795266082584.jpg"
                alt="Students learning through creative activities"
                fallbackTitle="Activity-Based Learning"
                className="w-full h-72 lg:h-full object-cover"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {APPROACH_SECTIONS.map((item) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.title}
                  className="rounded-2xl border border-[#DCE8F5] bg-white p-7 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display font-semibold text-sm text-[#2876C8] tabular-nums">
                      {item.number}
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-[#EAF5FF] text-[#2876C8] flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <h2 className="font-display font-bold text-xl text-[#24364B]">{item.title}</h2>
                  <p className="text-sm text-[#52657A] leading-relaxed">{item.description}</p>
                </article>
              );
            })}
          </div>

          <div className="rounded-2xl bg-[#EAF5FF] border border-[#CFE2F6] p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-white text-[#2876C8] flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-xl text-[#24364B]">
                  See How Our Programs Are Structured
                </h3>
                <p className="text-sm text-[#52657A] mt-1">
                  Explore Regular Classes (Pre-Play to Class 4) or Special English &amp; ICT Classes
                  (Class 3–8).
                </p>
              </div>
            </div>
            <Link
              to="/classes"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2876C8] text-white text-sm font-semibold hover:bg-[#1E62AB] transition-colors whitespace-nowrap shrink-0"
            >
              <span>Explore Classes</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
