import { dataStore } from '../services/dataStore.js';
import {
  AppError,
  calculateAgeYears,
  cleanString,
  isValidEmail,
  isValidPhone,
} from '../utils/validators.js';

export async function submitAdmission(req, res, next) {
  try {
    const settings = await dataStore.getSettings();
    if (settings && settings.admissionStatus === 'Closed') {
      return next(
        new AppError(
          'Admissions are currently closed. Please contact the school office for upcoming schedules.',
          400
        )
      );
    }

    const studentName = cleanString(req.body.studentName, 120);
    const dateOfBirth = cleanString(req.body.dateOfBirth, 30);
    const gender = cleanString(req.body.gender, 20);
    const programType = req.body.programType === 'special' ? 'special' : 'regular';
    const applyingClass = cleanString(req.body.applyingClass, 100);
    const fatherName = cleanString(req.body.fatherName, 120);
    const motherName = cleanString(req.body.motherName, 120);
    const guardianPhone = cleanString(req.body.guardianPhone, 30);
    const alternativePhone = cleanString(req.body.alternativePhone, 30);
    const previousSchool = cleanString(req.body.previousSchool, 150);
    const presentAddress = cleanString(req.body.presentAddress, 300);
    const parentEmail = cleanString(req.body.parentEmail, 150).toLowerCase();

    if (
      !studentName ||
      !dateOfBirth ||
      !gender ||
      !applyingClass ||
      !fatherName ||
      !motherName ||
      !guardianPhone ||
      !presentAddress
    ) {
      return next(new AppError('Please complete all required admission fields.', 400));
    }

    if (!['Male', 'Female', 'Other'].includes(gender)) {
      return next(new AppError('Please select a valid gender.', 400));
    }

    const age = calculateAgeYears(dateOfBirth);
    if (age === null || age < 1 || age > 25) {
      return next(new AppError('Please enter a valid date of birth.', 400));
    }

    const minAge = settings?.minimumAge ?? 4;
    if (programType === 'regular' && age < minAge) {
      return next(
        new AppError(
          `Minimum age for the Little Star regular educational program is ${minAge} years.`,
          400
        )
      );
    }

    if (!isValidPhone(guardianPhone)) {
      return next(new AppError('Please enter a valid guardian phone number.', 400));
    }

    if (alternativePhone && !isValidPhone(alternativePhone)) {
      return next(new AppError('Please enter a valid alternative phone number.', 400));
    }

    if (parentEmail && !isValidEmail(parentEmail)) {
      return next(new AppError('Please enter a valid parent email address.', 400));
    }

    const applicationId = await dataStore.generateApplicationId();
    const admission = await dataStore.createAdmission({
      applicationId,
      studentName,
      dateOfBirth: new Date(dateOfBirth),
      gender,
      programType,
      applyingClass,
      fatherName,
      motherName,
      guardianPhone,
      alternativePhone,
      previousSchool,
      presentAddress,
      parentEmail,
      status: 'Pending',
    });

    res.status(201).json({
      success: true,
      message: 'Admission application submitted successfully.',
      admission: {
        _id: admission._id,
        applicationId: admission.applicationId,
        studentName: admission.studentName,
        applyingClass: admission.applyingClass,
        programType: admission.programType,
        status: admission.status,
        createdAt: admission.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function trackAdmissionStatus(req, res, next) {
  try {
    const applicationId = cleanString(req.params.applicationId, 40);
    if (!applicationId) {
      return next(new AppError('Application ID is required.', 400));
    }

    const admission = await dataStore.findAdmissionByApplicationId(applicationId);
    if (!admission) {
      return next(new AppError('No admission application found with that Application ID.', 404));
    }

    res.json({
      success: true,
      application: {
        applicationId: admission.applicationId,
        studentName: admission.studentName,
        applyingClass: admission.applyingClass,
        programType: admission.programType,
        status: admission.status,
        adminNotes: admission.adminNotes || '',
        createdAt: admission.createdAt,
        reviewedAt: admission.reviewedAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function listAdmissions(req, res, next) {
  try {
    const search = cleanString(req.query.search, 100);
    const status = cleanString(req.query.status, 20);
    const admissions = await dataStore.listAdmissions({ search, status });
    res.json({ success: true, admissions });
  } catch (err) {
    next(err);
  }
}

export async function getAdmissionDetails(req, res, next) {
  try {
    const admission = await dataStore.getAdmissionById(req.params.id);
    if (!admission) {
      return next(new AppError('Admission application not found.', 404));
    }
    res.json({ success: true, admission });
  } catch (err) {
    next(err);
  }
}

export async function updateAdmissionStatus(req, res, next) {
  try {
    const status = cleanString(req.body.status, 20);
    const adminNotes = cleanString(req.body.adminNotes, 500);

    if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
      return next(new AppError('Status must be Pending, Approved, or Rejected.', 400));
    }

    const updated = await dataStore.updateAdmission(req.params.id, {
      status,
      ...(req.body.adminNotes !== undefined ? { adminNotes } : {}),
      reviewedBy: req.admin._id,
      reviewedAt: new Date().toISOString(),
    });

    if (!updated) {
      return next(new AppError('Admission application not found.', 404));
    }

    res.json({
      success: true,
      message: `Application marked as ${status}.`,
      admission: updated,
    });
  } catch (err) {
    next(err);
  }
}

export async function convertAdmissionToStudent(req, res, next) {
  try {
    const admission = await dataStore.getAdmissionById(req.params.id);
    if (!admission) {
      return next(new AppError('Admission application not found.', 404));
    }

    if (admission.convertedStudentRef) {
      const existing = await dataStore.getStudentById(admission.convertedStudentRef);
      if (existing) {
        return res.json({
          success: true,
          message: 'This application has already been converted to a student record.',
          student: existing,
          admission,
        });
      }
    }

    if (admission.status !== 'Approved') {
      await dataStore.updateAdmission(admission._id, {
        status: 'Approved',
        reviewedBy: req.admin._id,
        reviewedAt: new Date().toISOString(),
      });
    }

    const studentId = await dataStore.generateStudentId();
    const student = await dataStore.createStudent({
      studentId,
      name: admission.studentName,
      dateOfBirth: admission.dateOfBirth,
      gender: admission.gender,
      programType: admission.programType,
      className: admission.applyingClass,
      fatherName: admission.fatherName,
      motherName: admission.motherName,
      guardianPhone: admission.guardianPhone,
      alternativePhone: admission.alternativePhone || '',
      previousSchool: admission.previousSchool || '',
      presentAddress: admission.presentAddress,
      parentEmail: admission.parentEmail || '',
      status: 'Active',
      admissionRef: admission._id,
      notes: `Converted from application ${admission.applicationId}`,
    });

    const updatedAdmission = await dataStore.updateAdmission(admission._id, {
      status: 'Approved',
      convertedStudentRef: student._id,
      reviewedBy: req.admin._id,
      reviewedAt: new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      message: 'Approved application converted to active student record.',
      student,
      admission: updatedAdmission,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteAdmission(req, res, next) {
  try {
    const removed = await dataStore.deleteAdmission(req.params.id);
    if (!removed) {
      return next(new AppError('Admission application not found.', 404));
    }
    res.json({ success: true, message: 'Admission application deleted.' });
  } catch (err) {
    next(err);
  }
}
