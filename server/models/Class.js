import mongoose from 'mongoose';

const classSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 800,
    },
    suitableAge: {
      type: String,
      trim: true,
      default: '',
      maxlength: 80,
    },
    learningObjectives: {
      type: [String],
      default: [],
    },
    subjects: {
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
  },
  { timestamps: true }
);

classSchema.index({ slug: 1 }, { unique: true });
classSchema.index({ order: 1 });

export const ClassModel = mongoose.models.Class || mongoose.model('Class', classSchema);
