import { dataStore } from '../services/dataStore.js';
import { AppError, cleanString, toSlug } from '../utils/validators.js';

function normalizeStringArray(val) {
  if (Array.isArray(val)) {
    return val.map((item) => cleanString(String(item), 200)).filter(Boolean);
  }
  if (typeof val === 'string') {
    return val
      .split(/\r?\n|,/)
      .map((item) => cleanString(item, 200))
      .filter(Boolean);
  }
  return [];
}

// ---------------- REGULAR CLASSES ----------------
export async function listClasses(req, res, next) {
  try {
    const onlyAvailable = req.query.available === 'true';
    const classes = await dataStore.listClasses(onlyAvailable);
    res.json({ success: true, classes });
  } catch (err) {
    next(err);
  }
}

export async function createClass(req, res, next) {
  try {
    const name = cleanString(req.body.name, 80);
    const description = cleanString(req.body.description, 800);
    if (!name || !description) {
      return next(new AppError('Class name and description are required.', 400));
    }

    const created = await dataStore.createClass({
      name,
      slug: toSlug(name) || `class-${Date.now()}`,
      order: Number(req.body.order) || 10,
      description,
      suitableAge: cleanString(req.body.suitableAge, 80),
      learningObjectives: normalizeStringArray(req.body.learningObjectives),
      subjects: normalizeStringArray(req.body.subjects),
      eligibilityNote: cleanString(req.body.eligibilityNote, 250),
      isAvailable: req.body.isAvailable !== false,
    });

    res.status(201).json({ success: true, message: 'Class created successfully.', classItem: created });
  } catch (err) {
    next(err);
  }
}

export async function updateClass(req, res, next) {
  try {
    const updates = {};
    if (req.body.name !== undefined) {
      updates.name = cleanString(req.body.name, 80);
      updates.slug = toSlug(updates.name);
    }
    if (req.body.order !== undefined) updates.order = Number(req.body.order) || 0;
    if (req.body.description !== undefined) updates.description = cleanString(req.body.description, 800);
    if (req.body.suitableAge !== undefined) updates.suitableAge = cleanString(req.body.suitableAge, 80);
    if (req.body.learningObjectives !== undefined) {
      updates.learningObjectives = normalizeStringArray(req.body.learningObjectives);
    }
    if (req.body.subjects !== undefined) {
      updates.subjects = normalizeStringArray(req.body.subjects);
    }
    if (req.body.eligibilityNote !== undefined) {
      updates.eligibilityNote = cleanString(req.body.eligibilityNote, 250);
    }
    if (req.body.isAvailable !== undefined) updates.isAvailable = Boolean(req.body.isAvailable);

    const updated = await dataStore.updateClass(req.params.id, updates);
    if (!updated) {
      return next(new AppError('Class not found.', 404));
    }
    res.json({ success: true, message: 'Class updated successfully.', classItem: updated });
  } catch (err) {
    next(err);
  }
}

export async function deleteClass(req, res, next) {
  try {
    const removed = await dataStore.deleteClass(req.params.id);
    if (!removed) {
      return next(new AppError('Class not found.', 404));
    }
    res.json({ success: true, message: 'Class deleted.' });
  } catch (err) {
    next(err);
  }
}

// ---------------- SPECIAL COURSES ----------------
export async function listCourses(req, res, next) {
  try {
    const onlyAvailable = req.query.available === 'true';
    const courses = await dataStore.listCourses(onlyAvailable);
    res.json({ success: true, courses });
  } catch (err) {
    next(err);
  }
}

export async function createCourse(req, res, next) {
  try {
    const title = cleanString(req.body.title, 120);
    const subject = cleanString(req.body.subject, 80);
    const targetClasses = cleanString(req.body.targetClasses, 80);
    const description = cleanString(req.body.description, 800);

    if (!title || !subject || !targetClasses || !description) {
      return next(
        new AppError('Course title, subject, target classes, and description are required.', 400)
      );
    }

    const created = await dataStore.createCourse({
      title,
      slug: toSlug(title) || `course-${Date.now()}`,
      subject,
      targetClasses,
      description,
      learningObjectives: normalizeStringArray(req.body.learningObjectives),
      eligibilityNote: cleanString(req.body.eligibilityNote, 250),
      isAvailable: req.body.isAvailable !== false,
      order: Number(req.body.order) || 10,
    });

    res.status(201).json({ success: true, message: 'Special course created.', course: created });
  } catch (err) {
    next(err);
  }
}

export async function updateCourse(req, res, next) {
  try {
    const updates = {};
    if (req.body.title !== undefined) {
      updates.title = cleanString(req.body.title, 120);
      updates.slug = toSlug(updates.title);
    }
    if (req.body.subject !== undefined) updates.subject = cleanString(req.body.subject, 80);
    if (req.body.targetClasses !== undefined) {
      updates.targetClasses = cleanString(req.body.targetClasses, 80);
    }
    if (req.body.description !== undefined) updates.description = cleanString(req.body.description, 800);
    if (req.body.learningObjectives !== undefined) {
      updates.learningObjectives = normalizeStringArray(req.body.learningObjectives);
    }
    if (req.body.eligibilityNote !== undefined) {
      updates.eligibilityNote = cleanString(req.body.eligibilityNote, 250);
    }
    if (req.body.isAvailable !== undefined) updates.isAvailable = Boolean(req.body.isAvailable);
    if (req.body.order !== undefined) updates.order = Number(req.body.order) || 0;

    const updated = await dataStore.updateCourse(req.params.id, updates);
    if (!updated) {
      return next(new AppError('Special course not found.', 404));
    }
    res.json({ success: true, message: 'Special course updated.', course: updated });
  } catch (err) {
    next(err);
  }
}

export async function deleteCourse(req, res, next) {
  try {
    const removed = await dataStore.deleteCourse(req.params.id);
    if (!removed) {
      return next(new AppError('Special course not found.', 404));
    }
    res.json({ success: true, message: 'Special course deleted.' });
  } catch (err) {
    next(err);
  }
}
