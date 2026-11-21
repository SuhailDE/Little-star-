import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
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
    className: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    classRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      default: null,
    },
    enrolledCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
      },
    ],
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
      enum: ['Active', 'Inactive', 'Graduated'],
      default: 'Active',
    },
    admissionRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admission',
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
      maxlength: 500,
    },
  },
  { timestamps: true }
);

studentSchema.index({ studentId: 1 }, { unique: true });
studentSchema.index({ className: 1, status: 1 });
studentSchema.index({ name: 'text', studentId: 'text', guardianPhone: 'text' });

export const Student = mongoose.models.Student || mongoose.model('Student', studentSchema);
