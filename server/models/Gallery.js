import mongoose from 'mongoose';

const gallerySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
      default: 'Classroom',
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: 400,
    },
    imageUrl: {
      type: String,
      required: true,
      trim: true,
    },
    publicId: {
      type: String,
      trim: true,
      default: '',
    },
    isDemo: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

gallerySchema.index({ category: 1, order: 1, createdAt: -1 });

export const Gallery = mongoose.models.Gallery || mongoose.model('Gallery', gallerySchema);
