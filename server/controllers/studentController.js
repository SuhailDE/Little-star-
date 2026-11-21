import { dataStore } from '../services/dataStore.js';
import { AppError, cleanString, isValidEmail, isValidPhone } from '../utils/validators.js';

export async function getDashboardStats(_req, res, next) {
  try {
    const stats = await dataStore.getDashboardStats();
    res.json({ success: true, stats });
  } catch (err) {
    next(err);
  }
}

export async function listStudents(req, res, next) {
  try {
    const search = cleanString(req.query.search, 100);
    const className = cleanString(req.query.className, 80);
    const status = cleanString(req.query.status, 30);
    const students = await dataStore.listStudents({ search, className, status });
    res.json({ success: true, students });
  } catch (err) {
    next(err);
  }
}

export async function getStudentById(req, res, next) {
  try {
    const student = await dataStore.getStudentById(req.params.id);
    if (!student) {
      return next(new AppError('Student not found.', 404));
    }
    res.json({ success: true, student });
  } catch (err) {
    next(err);
  }
}

export async function createStudent(req, res, next) {
  try {
    const name = cleanString(req.body.name, 120);
    const dateOfBirth = cleanString(req.body.dateOfBirth, 30);
    const gender = cleanString(req.body.gender, 20);
    const programType = req.body.programType === 'special' ? 'special' : 'regular';
    const className = cleanString(req.body.className, 80);
    const fatherName = cleanString(req.body.fatherName, 120);
    const motherName = cleanString(req.body.motherName, 120);
    const guardianPhone = cleanString(req.body.guardianPhone, 30);
    const alternativePhone = cleanString(req.body.alternativePhone, 30);
    const previousSchool = cleanString(req.body.previousSchool, 150);
    const presentAddress = cleanString(req.body.presentAddress, 300);
    const parentEmail = cleanString(req.body.parentEmail, 150).toLowerCase();
    const status = ['Active', 'Inactive', 'Graduated'].includes(req.body.status)
      ? req.body.status
      : 'Active';
    const notes = cleanString(req.body.notes, 500);
    const enrolledCourses = Array.isArray(req.body.enrolledCourses)
      ? req.body.enrolledCourses.map((id) => cleanString(String(id), 64)).filter(Boolean)
      : [];

    if (!name || !dateOfBirth || !gender || !className || !fatherName || !motherName || !guardianPhone || !presentAddress) {
      return next(new AppError('Please fill in all required student fields.', 400));
    }

    if (!['Male', 'Female', 'Other'].includes(gender)) {
      return next(new AppError('Invalid gender selection.', 400));
    }

    if (!isValidPhone(guardianPhone)) {
      return next(new AppError('Please enter a valid guardian phone number.', 400));
    }

    if (parentEmail && !isValidEmail(parentEmail)) {
      return next(new AppError('Please enter a valid parent email address.', 400));
    }

    const studentId = cleanString(req.body.studentId, 40) || (await dataStore.generateStudentId());
    const student = await dataStore.createStudent({
      studentId,
      name,
      dateOfBirth: new Date(dateOfBirth),
      gender,
      programType,
      className,
      enrolledCourses,
      fatherName,
      motherName,
      guardianPhone,
      alternativePhone,
      previousSchool,
      presentAddress,
      parentEmail,
      status,
      notes,
    });

    res.status(201).json({
      success: true,
      message: 'Student added successfully.',
      student,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateStudent(req, res, next) {
  try {
    const existing = await dataStore.getStudentById(req.params.id);
    if (!existing) {
      return next(new AppError('Student not found.', 404));
    }

    const updates = {};
    if (req.body.name !== undefined) updates.name = cleanString(req.body.name, 120);
    if (req.body.dateOfBirth !== undefined) updates.dateOfBirth = new Date(req.body.dateOfBirth);
    if (req.body.gender !== undefined && ['Male', 'Female', 'Other'].includes(req.body.gender)) {
      updates.gender = req.body.gender;
    }
    if (req.body.programType !== undefined) {
      updates.programType = req.body.programType === 'special' ? 'special' : 'regular';
    }
    if (req.body.className !== undefined) updates.className = cleanString(req.body.className, 80);
    if (req.body.fatherName !== undefined) updates.fatherName = cleanString(req.body.fatherName, 120);
    if (req.body.motherName !== undefined) updates.motherName = cleanString(req.body.motherName, 120);
    if (req.body.guardianPhone !== undefined) {
      const phone = cleanString(req.body.guardianPhone, 30);
      if (!isValidPhone(phone)) {
        return next(new AppError('Please enter a valid guardian phone number.', 400));
      }
      updates.guardianPhone = phone;
    }
    if (req.body.alternativePhone !== undefined) {
      updates.alternativePhone = cleanString(req.body.alternativePhone, 30);
    }
    if (req.body.previousSchool !== undefined) {
      updates.previousSchool = cleanString(req.body.previousSchool, 150);
    }
    if (req.body.presentAddress !== undefined) {
      updates.presentAddress = cleanString(req.body.presentAddress, 300);
    }
    if (req.body.parentEmail !== undefined) {
      const email = cleanString(req.body.parentEmail, 150).toLowerCase();
      if (email && !isValidEmail(email)) {
        return next(new AppError('Invalid email address.', 400));
      }
      updates.parentEmail = email;
    }
    if (req.body.status !== undefined && ['Active', 'Inactive', 'Graduated'].includes(req.body.status)) {
      updates.status = req.body.status;
    }
    if (req.body.notes !== undefined) updates.notes = cleanString(req.body.notes, 500);
    if (Array.isArray(req.body.enrolledCourses)) {
      updates.enrolledCourses = req.body.enrolledCourses
        .map((id) => cleanString(String(id), 64))
        .filter(Boolean);
    }

    const updated = await dataStore.updateStudent(req.params.id, updates);
    res.json({
      success: true,
      message: 'Student updated successfully.',
      student: updated,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteStudent(req, res, next) {
  try {
    const removed = await dataStore.deleteStudent(req.params.id);
    if (!removed) {
      return next(new AppError('Student not found.', 404));
    }
    res.json({ success: true, message: 'Student record deleted.' });
  } catch (err) {
    next(err);
  }
}
