import mongoose from 'mongoose';

const websiteSettingsSchema = new mongoose.Schema(
  {
    singletonKey: {
      type: String,
      default: 'primary',
      unique: true,
    },
    institutionName: {
      type: String,
      default: 'Little Star',
      trim: true,
      maxlength: 100,
    },
    logoUrl: {
      type: String,
      default: '',
      trim: true,
    },
    tagline: {
      type: String,
      default: 'A Caring Place for Young Learners',
      trim: true,
      maxlength: 160,
    },
    directorName: {
      type: String,
      default: 'Selina Parveen (Munni)',
      trim: true,
      maxlength: 120,
    },
    phones: {
      type: [String],
      default: ['01636-021582', '01682-225117'],
    },
    whatsappNumber: {
      type: String,
      default: '01636-021582',
      trim: true,
    },
    facebookUrl: {
      type: String,
      default: '',
      trim: true,
    },
    address: {
      type: String,
      default: '',
      trim: true,
      maxlength: 300,
    },
    googleMapsUrl: {
      type: String,
      default: '',
      trim: true,
    },
    admissionStatus: {
      type: String,
      enum: ['Open', 'Closed'],
      default: 'Open',
    },
    minimumAge: {
      type: Number,
      default: 4,
      min: 3,
      max: 12,
    },
    heroHeading: {
      type: String,
      default: 'Every Child Is a Little Star',
      trim: true,
      maxlength: 160,
    },
    heroSubtitle: {
      type: String,
      default: 'A Caring Place for Young Learners',
      trim: true,
      maxlength: 200,
    },
    heroSupportingText: {
      type: String,
      default:
        'Helping children build confidence, knowledge, creativity and strong educational foundations.',
      trim: true,
      maxlength: 400,
    },
    aboutIntro: {
      type: String,
      default:
        'Little Star is a nurturing learning institution dedicated to guiding young learners through their earliest and most formative educational years with care, structure, and individual attention.',
      trim: true,
      maxlength: 1200,
    },
    mission: {
      type: String,
      default:
        'To provide a caring, encouraging, and structured learning space where every child builds strong foundational skills, curiosity, and confidence.',
      trim: true,
      maxlength: 800,
    },
    vision: {
      type: String,
      default:
        'To nurture thoughtful, capable young learners equipped with essential language, literacy, and digital foundations for future academic growth.',
      trim: true,
      maxlength: 800,
    },
    teachingPhilosophy: {
      type: String,
      default:
        'We believe children learn best when guided with patience, interactive activities, and attentive support tailored to each learner’s pace.',
      trim: true,
      maxlength: 800,
    },
    learningEnvironment: {
      type: String,
      default:
        'A warm, child-friendly classroom atmosphere designed to help young students feel safe, respected, and excited to learn each day.',
      trim: true,
      maxlength: 800,
    },
    galleryCategories: {
      type: [String],
      default: ['Classroom', 'Learning Activities', 'Student Activities', 'Events', 'Institution'],
    },
  },
  { timestamps: true }
);

export const WebsiteSettings =
  mongoose.models.WebsiteSettings || mongoose.model('WebsiteSettings', websiteSettingsSchema);
