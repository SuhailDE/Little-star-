import mongoose from 'mongoose';

const contactMessageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      maxlength: 30,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
      maxlength: 150,
    },
    subject: {
      type: String,
      trim: true,
      default: 'General Inquiry',
      maxlength: 150,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

contactMessageSchema.index({ isRead: 1, createdAt: -1 });

export const ContactMessage =
  mongoose.models.ContactMessage || mongoose.model('ContactMessage', contactMessageSchema);
