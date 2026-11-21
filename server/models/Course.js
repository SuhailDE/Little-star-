import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    targetClasses: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 800,
    },
    learningObjectives: {
      type: [String],
      default: [],
    },
    eligibilityNote: {
      type: String,
      trim: true,
      default: '',
      maxlength: 250,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

courseSchema.index({ slug: 1 }, { unique: true });
courseSchema.index({ order: 1 });

export const Course = mongoose.models.Course || mongoose.model('Course', courseSchema);
