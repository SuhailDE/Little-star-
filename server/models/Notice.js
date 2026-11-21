import mongoose from 'mongoose';

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 180,
    },
    category: {
      type: String,
      enum: ['Admission', 'Examination', 'Holiday', 'Announcement'],
      default: 'Announcement',
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    publishDate: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

noticeSchema.index({ isActive: 1, isPinned: -1, publishDate: -1 });

export const Notice = mongoose.models.Notice || mongoose.model('Notice', noticeSchema);
