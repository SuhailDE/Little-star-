import mongoose from 'mongoose';

const admissionSchema = new mongoose.Schema(
  {
    applicationId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    studentName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: true,
    },
    programType: {
      type: String,
      enum: ['regular', 'special'],
      default: 'regular',
    },
    applyingClass: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    fatherName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    motherName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    guardianPhone: {
      type: String,
      required: true,
      trim: true,
      maxlength: 30,
    },
    alternativePhone: {
      type: String,
      trim: true,
      default: '',
      maxlength: 30,
    },
    previousSchool: {
      type: String,
      trim: true,
      default: '',
      maxlength: 150,
    },
    presentAddress: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    parentEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
      maxlength: 150,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    adminNotes: {
      type: String,
      trim: true,
      default: '',
      maxlength: 500,
    },
    convertedStudentRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      default: null,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

admissionSchema.index({ applicationId: 1 }, { unique: true });
admissionSchema.index({ status: 1, createdAt: -1 });

export const Admission = mongoose.models.Admission || mongoose.model('Admission', admissionSchema);
