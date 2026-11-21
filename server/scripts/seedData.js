import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';
import { dataStore } from '../services/dataStore.js';

const OFFICIAL_SETTINGS = {
  institutionName: 'Little Star',
  logoUrl: '',
  tagline: 'A Caring Place for Young Learners',
  directorName: 'Selina Parveen (Munni)',
  phones: ['01636-021582', '01682-225117'],
  whatsappNumber: '01636-021582',
  facebookUrl: '',
  address: '',
  googleMapsUrl: '',
  admissionStatus: 'Open',
  minimumAge: 4,
  heroHeading: 'Every Child Is a Little Star',
  heroSubtitle: 'A Caring Place for Young Learners',
  heroSupportingText:
    'Helping children build confidence, knowledge, creativity and strong educational foundations.',
  aboutIntro:
    'Little Star is a caring educational institution in Bangladesh guided by Director Selina Parveen (Munni). We focus on nurturing young learners with patience, structured early education, and attentive foundational support.',
  mission:
    'To provide a caring, encouraging, and structured learning space where every child builds strong foundational skills, curiosity, and confidence.',
  vision:
    'To nurture thoughtful, capable young learners equipped with essential language, literacy, and basic ICT foundations for continued academic success.',
  teachingPhilosophy:
    'Children thrive when taught with warmth, patience, interactive activities, and individual attention suited to their developmental stage.',
  learningEnvironment:
    'A welcoming, child-friendly classroom atmosphere where young students feel safe, supported, and eager to participate every day.',
  galleryCategories: [
    'Classroom',
    'Learning Activities',
    'Student Activities',
    'Events',
    'Institution',
  ],
};

const REGULAR_CLASSES = [
  {
    name: 'Pre-Play',
    slug: 'pre-play',
    order: 1,
    description:
      'A gentle, joyful introduction to school life designed to help young children settle in comfortably through guided play, social interaction, and early recognition skills.',
    suitableAge: 'Minimum 4 years',
    learningObjectives: [
      'Comfort with classroom routines and peer interaction',
      'Early alphabet, shape, and color recognition',
      'Fine motor development through drawing and hands-on activities',
    ],
    subjects: ['Early Literacy', 'Pre-Numeracy', 'Creative Activities', 'English Readiness'],
    eligibilityNote: 'Minimum age 4 years required for enrollment.',
    isAvailable: true,
  },
  {
    name: 'Play',
    slug: 'play',
    order: 2,
    description:
      'Builds curiosity and classroom confidence through structured phonics, counting, storytelling, and interactive group exercises.',
    suitableAge: '4+ years',
    learningObjectives: [
      'Letter sounds, basic handwriting readiness, and vocabulary',
      'Number sense, counting, and simple pattern recognition',
      'Listening skills and confident classroom participation',
    ],
    subjects: ['English', 'Early Mathematics', 'General Awareness', 'Art & Craft'],
    eligibilityNote: 'Minimum age 4 years required for enrollment.',
    isAvailable: true,
  },
  {
    name: 'Class 1',
    slug: 'class-1',
    order: 3,
    description:
      'Establishes core reading, writing, and foundational numeracy habits with supportive individual guidance for every learner.',
    suitableAge: 'Configurable by admin',
    learningObjectives: [
      'Clear reading fluency and sentence formation',
      'Fundamental arithmetic operations and problem solving',
      'Neat handwriting and disciplined study habits',
    ],
    subjects: ['English', 'Foundational Studies', 'Mathematics', 'Elementary ICT Awareness'],
    eligibilityNote: 'Open for eligible learners meeting institutional placement criteria.',
    isAvailable: true,
  },
  {
    name: 'Class 2',
    slug: 'class-2',
    order: 4,
    description:
      'Strengthens comprehension, expressive writing, and structured reasoning through interactive lessons and consistent practice.',
    suitableAge: 'Configurable by admin',
    learningObjectives: [
      'Reading comprehension and structured paragraph writing',
      'Expanded numeracy and logical thinking exercises',
      'Active participation and confident communication',
    ],
    subjects: ['English', 'Mathematics', 'Foundational Studies', 'Basic ICT'],
    eligibilityNote: 'Open for students advancing from Class 1 or equivalent.',
    isAvailable: true,
  },
  {
    name: 'Class 3',
    slug: 'class-3',
    order: 5,
    description:
      'Deepens academic independence in English, core primary subjects, and practical introductory ICT literacy.',
    suitableAge: 'Configurable by admin',
    learningObjectives: [
      'Grammar accuracy and clear written expression in English',
      'Applied mathematics and analytical classroom exercises',
      'Introductory ICT concepts and guided computer familiarity',
    ],
    subjects: ['English', 'ICT', 'Mathematics', 'Primary Studies'],
    eligibilityNote: 'Open for students advancing from Class 2 or equivalent.',
    isAvailable: true,
  },
  {
    name: 'Class 4',
    slug: 'class-4',
    order: 6,
    description:
      'Prepares upper-primary learners with strong English communication, systematic problem solving, and practical ICT skills.',
    suitableAge: 'Configurable by admin',
    learningObjectives: [
      'Confident English reading, composition, and spoken expression',
      'Strong conceptual clarity across core primary subjects',
      'Foundational ICT fluency for modern learning',
    ],
    subjects: ['English', 'ICT', 'Mathematics', 'Primary Studies'],
    eligibilityNote: 'Open for students advancing from Class 3 or equivalent.',
    isAvailable: true,
  },
];

const SPECIAL_COURSES = [
  {
    title: 'Special English Classes (Class 3–8)',
    slug: 'special-english-class-3-8',
    subject: 'English',
    targetClasses: 'Class 3–8',
    order: 1,
    description:
      'Focused supplementary English program helping students in Classes 3 through 8 build clear reading comprehension, grammar accuracy, vocabulary, and confident written and spoken communication.',
    learningObjectives: [
      'Strong English grammar foundation and sentence construction',
      'Reading comprehension and structured creative writing',
      'Vocabulary building and confident spoken English practice',
      'Personalized feedback to address individual learning gaps',
    ],
    eligibilityNote: 'Open to students studying in Class 3 through Class 8.',
    isAvailable: true,
  },
  {
    title: 'Special ICT Classes (Class 3–8)',
    slug: 'special-ict-class-3-8',
    subject: 'ICT',
    targetClasses: 'Class 3–8',
    order: 2,
    description:
      'Practical Information & Communication Technology course tailored for students in Classes 3 through 8 to build essential digital literacy, computer fundamentals, and responsible technology habits.',
    learningObjectives: [
      'Understanding computer hardware, software, and operating basics',
      'Essential typing, document creation, and digital organization',
      'School-level ICT curriculum alignment and conceptual clarity',
      'Safe, responsible, and productive technology use',
    ],
    eligibilityNote: 'Open to students studying in Class 3 through Class 8.',
    isAvailable: true,
  },
];

const INITIAL_NOTICES = [
  {
    title: 'Admissions Open — Regular Program (Pre-Play to Class 4)',
    category: 'Admission',
    content:
      'Little Star is now welcoming admission applications for Pre-Play, Play, Class 1, Class 2, Class 3, and Class 4. Minimum student age for the regular educational program is 4 years. Parents may apply online or contact 01636-021582 / 01682-225117.',
    isActive: true,
    isPinned: true,
  },
  {
    title: 'Enrollment Open — Special English & ICT Classes (Class 3–8)',
    category: 'Announcement',
    content:
      'Dedicated Special English Classes and Special ICT Classes are open for students in Class 3 to Class 8. Contact the Little Star office for enrollment guidance.',
    isActive: true,
    isPinned: false,
  },
];

const DEMO_GALLERY_ITEMS = [
  {
    title: 'Bright Early-Learning Classroom (Demo Reference)',
    category: 'Classroom',
    description:
      'Demo reference image showcasing a welcoming early-learning classroom space. Replace with actual Little Star photographs via Admin Gallery.',
    imageUrl: '/src/assets/images/classroom_early_learning_1795266082477.jpg',
    publicId: '',
    isDemo: true,
    order: 1,
  },
  {
    title: 'Interactive English & ICT Learning (Demo Reference)',
    category: 'Learning Activities',
    description:
      'Demo reference image illustrating guided English reading and beginner ICT practice. Replace with actual Little Star photographs via Admin Gallery.',
    imageUrl: '/src/assets/images/english_ict_learning_1795266082887.jpg',
    publicId: '',
    isDemo: true,
    order: 2,
  },
  {
    title: 'Creative Student Activities (Demo Reference)',
    category: 'Student Activities',
    description:
      'Demo reference image representing hands-on drawing and collaborative learning activities. Replace with actual Little Star photographs via Admin Gallery.',
    imageUrl: '/src/assets/images/creative_student_activities_1795266082584.jpg',
    publicId: '',
    isDemo: true,
    order: 3,
  },
];

export async function ensureInitialDataSeeded() {
  const existingSettings = await dataStore.getSettings();
  if (!existingSettings) {
    await dataStore.upsertSettings(OFFICIAL_SETTINGS);
  }

  const existingClasses = await dataStore.listClasses();
  if (existingClasses.length === 0) {
    for (const cls of REGULAR_CLASSES) {
      await dataStore.createClass(cls);
    }
  }

  const existingCourses = await dataStore.listCourses();
  if (existingCourses.length === 0) {
    for (const course of SPECIAL_COURSES) {
      await dataStore.createCourse(course);
    }
  }

  const existingNotices = await dataStore.listNotices();
  if (existingNotices.length === 0) {
    for (const notice of INITIAL_NOTICES) {
      await dataStore.createNotice(notice);
    }
  }

  const existingGallery = await dataStore.listGallery();
  if (existingGallery.length === 0) {
    for (const item of DEMO_GALLERY_ITEMS) {
      await dataStore.createGalleryItem(item);
    }
  }

  // If ADMIN_EMAIL and ADMIN_PASSWORD are provided in env, ensure that admin account exists
  if (env.adminEmail && env.adminPassword) {
    const existingAdmin = await dataStore.findAdminByEmail(env.adminEmail);
    const passwordHash = await bcrypt.hash(env.adminPassword, 12);
    if (!existingAdmin) {
      await dataStore.createAdmin({
        name: 'Selina Parveen (Munni)',
        email: env.adminEmail,
        passwordHash,
        role: 'superadmin',
      });
      console.log(`[Auth] Initialized admin account from environment for ${env.adminEmail}`);
    } else {
      await dataStore.updateAdmin(existingAdmin._id, { passwordHash });
    }
  }
}
