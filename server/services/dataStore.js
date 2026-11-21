import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { isMongoConnected } from '../config/db.js';
import { Admin } from '../models/Admin.js';
import { Admission } from '../models/Admission.js';
import { ClassModel } from '../models/Class.js';
import { ContactMessage } from '../models/ContactMessage.js';
import { Course } from '../models/Course.js';
import { Gallery } from '../models/Gallery.js';
import { Notice } from '../models/Notice.js';
import { Student } from '../models/Student.js';
import { WebsiteSettings } from '../models/WebsiteSettings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '..', 'data');
const STORE_PATH = path.resolve(DATA_DIR, 'store.json');

const EMPTY_STORE = {
  admins: [],
  students: [],
  admissions: [],
  classes: [],
  courses: [],
  gallery: [],
  notices: [],
  contactMessages: [],
  settings: null,
};

let memoryCache = null;

function generateId() {
  return crypto.randomBytes(12).toString('hex');
}

function readLocalStore() {
  if (memoryCache) return memoryCache;
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(STORE_PATH)) {
    memoryCache = structuredClone(EMPTY_STORE);
    fs.writeFileSync(STORE_PATH, JSON.stringify(memoryCache, null, 2), 'utf8');
    return memoryCache;
  }
  try {
    const raw = fs.readFileSync(STORE_PATH, 'utf8');
    memoryCache = { ...structuredClone(EMPTY_STORE), ...JSON.parse(raw) };
    return memoryCache;
  } catch {
    memoryCache = structuredClone(EMPTY_STORE);
    return memoryCache;
  }
}

function writeLocalStore(store) {
  memoryCache = store;
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const tmpPath = `${STORE_PATH}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(store, null, 2), 'utf8');
  fs.renameSync(tmpPath, STORE_PATH);
}

function normalizeDoc(doc) {
  if (!doc) return null;
  if (typeof doc.toObject === 'function') {
    const obj = doc.toObject();
    obj._id = String(obj._id);
    return obj;
  }
  return { ...doc, _id: String(doc._id) };
}

export const dataStore = {
  // ---------------- ADMINS ----------------
  async countAdmins() {
    if (isMongoConnected()) return Admin.countDocuments();
    return readLocalStore().admins.length;
  },

  async findAdminByEmail(email) {
    const normalized = String(email || '').trim().toLowerCase();
    if (isMongoConnected()) {
      const doc = await Admin.findOne({ email: normalized });
      return normalizeDoc(doc);
    }
    const store = readLocalStore();
    return store.admins.find((a) => a.email === normalized) || null;
  },

  async findAdminById(id) {
    if (isMongoConnected()) {
      const doc = await Admin.findById(id).select('-passwordHash');
      return normalizeDoc(doc);
    }
    const store = readLocalStore();
    const found = store.admins.find((a) => a._id === String(id));
    if (!found) return null;
    const { passwordHash: _omit, ...safe } = found;
    return safe;
  },

  async createAdmin(payload) {
    if (isMongoConnected()) {
      const doc = await Admin.create(payload);
      return normalizeDoc(doc);
    }
    const store = readLocalStore();
    const now = new Date().toISOString();
    const admin = {
      _id: generateId(),
      role: 'admin',
      lastLoginAt: null,
      ...payload,
      email: String(payload.email).trim().toLowerCase(),
      createdAt: now,
      updatedAt: now,
    };
    store.admins.push(admin);
    writeLocalStore(store);
    return admin;
  },

  async updateAdmin(id, updates) {
    if (isMongoConnected()) {
      const doc = await Admin.findByIdAndUpdate(id, updates, { new: true });
      return normalizeDoc(doc);
    }
    const store = readLocalStore();
    const idx = store.admins.findIndex((a) => a._id === String(id));
    if (idx === -1) return null;
    store.admins[idx] = {
      ...store.admins[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    writeLocalStore(store);
    return store.admins[idx];
  },

  // ---------------- SETTINGS ----------------
  async getSettings() {
    if (isMongoConnected()) {
      const doc = await WebsiteSettings.findOne({ singletonKey: 'primary' });
      return normalizeDoc(doc);
    }
    return readLocalStore().settings;
  },

  async upsertSettings(payload) {
    if (isMongoConnected()) {
      const doc = await WebsiteSettings.findOneAndUpdate(
        { singletonKey: 'primary' },
        { $set: { ...payload, singletonKey: 'primary' } },
        { new: true, upsert: true, runValidators: true }
      );
      return normalizeDoc(doc);
    }
    const store = readLocalStore();
    const now = new Date().toISOString();
    store.settings = {
      ...(store.settings || { _id: generateId(), createdAt: now }),
      ...payload,
      singletonKey: 'primary',
      updatedAt: now,
    };
    writeLocalStore(store);
    return store.settings;
  },

  // ---------------- CLASSES (REGULAR PROGRAM) ----------------
  async listClasses(onlyAvailable = false) {
    if (isMongoConnected()) {
      const filter = onlyAvailable ? { isAvailable: true } : {};
      const docs = await ClassModel.find(filter).sort({ order: 1, createdAt: 1 });
      return docs.map(normalizeDoc);
    }
    const list = [...readLocalStore().classes];
    return list
      .filter((item) => (onlyAvailable ? item.isAvailable : true))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  },

  async createClass(payload) {
    if (isMongoConnected()) {
      const doc = await ClassModel.create(payload);
      return normalizeDoc(doc);
    }
    const store = readLocalStore();
    const now = new Date().toISOString();
    const item = {
      _id: generateId(),
      isAvailable: true,
      learningObjectives: [],
      subjects: [],
      order: store.classes.length + 1,
      ...payload,
      createdAt: now,
      updatedAt: now,
    };
    store.classes.push(item);
    writeLocalStore(store);
    return item;
  },

  async updateClass(id, updates) {
    if (isMongoConnected()) {
      const doc = await ClassModel.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
      return normalizeDoc(doc);
    }
    const store = readLocalStore();
    const idx = store.classes.findIndex((c) => c._id === String(id));
    if (idx === -1) return null;
    store.classes[idx] = { ...store.classes[idx], ...updates, updatedAt: new Date().toISOString() };
    writeLocalStore(store);
    return store.classes[idx];
  },

  async deleteClass(id) {
    if (isMongoConnected()) {
      const doc = await ClassModel.findByIdAndDelete(id);
      return normalizeDoc(doc);
    }
    const store = readLocalStore();
    const idx = store.classes.findIndex((c) => c._id === String(id));
    if (idx === -1) return null;
    const [removed] = store.classes.splice(idx, 1);
    writeLocalStore(store);
    return removed;
  },

  // ---------------- COURSES (SPECIAL PROGRAMS) ----------------
  async listCourses(onlyAvailable = false) {
    if (isMongoConnected()) {
      const filter = onlyAvailable ? { isAvailable: true } : {};
      const docs = await Course.find(filter).sort({ order: 1, createdAt: 1 });
      return docs.map(normalizeDoc);
    }
    const list = [...readLocalStore().courses];
    return list
      .filter((item) => (onlyAvailable ? item.isAvailable : true))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  },

  async createCourse(payload) {
    if (isMongoConnected()) {
      const doc = await Course.create(payload);
      return normalizeDoc(doc);
    }
    const store = readLocalStore();
    const now = new Date().toISOString();
    const item = {
      _id: generateId(),
      isAvailable: true,
      learningObjectives: [],
      order: store.courses.length + 1,
      ...payload,
      createdAt: now,
      updatedAt: now,
    };
    store.courses.push(item);
    writeLocalStore(store);
    return item;
  },

  async updateCourse(id, updates) {
    if (isMongoConnected()) {
      const doc = await Course.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
      return normalizeDoc(doc);
    }
    const store = readLocalStore();
    const idx = store.courses.findIndex((c) => c._id === String(id));
    if (idx === -1) return null;
    store.courses[idx] = { ...store.courses[idx], ...updates, updatedAt: new Date().toISOString() };
    writeLocalStore(store);
    return store.courses[idx];
  },

  async deleteCourse(id) {
    if (isMongoConnected()) {
      const doc = await Course.findByIdAndDelete(id);
      return normalizeDoc(doc);
    }
    const store = readLocalStore();
    const idx = store.courses.findIndex((c) => c._id === String(id));
    if (idx === -1) return null;
    const [removed] = store.courses.splice(idx, 1);
    writeLocalStore(store);
    return removed;
  },

  // ---------------- STUDENTS ----------------
  async listStudents({ search = '', className = '', status = '' } = {}) {
    if (isMongoConnected()) {
      const filter = {};
      if (className) filter.className = className;
      if (status) filter.status = status;
      if (search) {
        const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        filter.$or = [{ name: regex }, { studentId: regex }, { guardianPhone: regex }, { fatherName: regex }];
      }
      const docs = await Student.find(filter).populate('enrolledCourses', 'title subject').sort({ createdAt: -1 });
      return docs.map(normalizeDoc);
    }
    const store = readLocalStore();
    const q = search.trim().toLowerCase();
    return store.students
      .filter((s) => {
        if (className && s.className !== className) return false;
        if (status && s.status !== status) return false;
        if (q) {
          const hay = `${s.name} ${s.studentId} ${s.guardianPhone} ${s.fatherName}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .map((s) => ({
        ...s,
        enrolledCourses: (s.enrolledCourses || [])
          .map((cid) => store.courses.find((c) => c._id === String(cid)))
          .filter(Boolean)
          .map((c) => ({ _id: c._id, title: c.title, subject: c.subject })),
      }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async getStudentById(id) {
    if (isMongoConnected()) {
      const doc = await Student.findById(id).populate('enrolledCourses', 'title subject');
      return normalizeDoc(doc);
    }
    const store = readLocalStore();
    const s = store.students.find((item) => item._id === String(id));
    if (!s) return null;
    return {
      ...s,
      enrolledCourses: (s.enrolledCourses || [])
        .map((cid) => store.courses.find((c) => c._id === String(cid)))
        .filter(Boolean),
    };
  },

  async generateStudentId() {
    const year = new Date().getFullYear();
    const prefix = `LS-STU-${year}-`;
    if (isMongoConnected()) {
      const count = await Student.countDocuments();
      return `${prefix}${String(count + 101).padStart(4, '0')}`;
    }
    const store = readLocalStore();
    return `${prefix}${String(store.students.length + 101).padStart(4, '0')}`;
  },

  async createStudent(payload) {
    if (isMongoConnected()) {
      const doc = await Student.create(payload);
      return normalizeDoc(doc);
    }
    const store = readLocalStore();
    const now = new Date().toISOString();
    const student = {
      _id: generateId(),
      status: 'Active',
      enrolledCourses: [],
      ...payload,
      createdAt: now,
      updatedAt: now,
    };
    store.students.push(student);
    writeLocalStore(store);
    return student;
  },

  async updateStudent(id, updates) {
    if (isMongoConnected()) {
      const doc = await Student.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
      return normalizeDoc(doc);
    }
    const store = readLocalStore();
    const idx = store.students.findIndex((s) => s._id === String(id));
    if (idx === -1) return null;
    store.students[idx] = { ...store.students[idx], ...updates, updatedAt: new Date().toISOString() };
    writeLocalStore(store);
    return store.students[idx];
  },

  async deleteStudent(id) {
    if (isMongoConnected()) {
      const doc = await Student.findByIdAndDelete(id);
      return normalizeDoc(doc);
    }
    const store = readLocalStore();
    const idx = store.students.findIndex((s) => s._id === String(id));
    if (idx === -1) return null;
    const [removed] = store.students.splice(idx, 1);
    writeLocalStore(store);
    return removed;
  },

  // ---------------- ADMISSIONS ----------------
  async generateApplicationId() {
    const year = new Date().getFullYear();
    const randomPart = crypto.randomBytes(2).toString('hex').toUpperCase();
    const count = isMongoConnected()
      ? await Admission.countDocuments()
      : readLocalStore().admissions.length;
    return `LS-${year}-${String(count + 1001)}-${randomPart}`;
  },

  async listAdmissions({ search = '', status = '' } = {}) {
    if (isMongoConnected()) {
      const filter = {};
      if (status) filter.status = status;
      if (search) {
        const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        filter.$or = [
          { applicationId: regex },
          { studentName: regex },
          { guardianPhone: regex },
          { applyingClass: regex },
        ];
      }
      const docs = await Admission.find(filter).sort({ createdAt: -1 });
      return docs.map(normalizeDoc);
    }
    const q = search.trim().toLowerCase();
    return readLocalStore()
      .admissions.filter((a) => {
        if (status && a.status !== status) return false;
        if (q) {
          const hay = `${a.applicationId} ${a.studentName} ${a.guardianPhone} ${a.applyingClass}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async getAdmissionById(id) {
    if (isMongoConnected()) {
      const doc = await Admission.findById(id);
      return normalizeDoc(doc);
    }
    return readLocalStore().admissions.find((a) => a._id === String(id)) || null;
  },

  async findAdmissionByApplicationId(applicationId) {
    const normalized = String(applicationId || '').trim().toUpperCase();
    if (isMongoConnected()) {
      const doc = await Admission.findOne({ applicationId: normalized });
      return normalizeDoc(doc);
    }
    return (
      readLocalStore().admissions.find((a) => a.applicationId.toUpperCase() === normalized) || null
    );
  },

  async createAdmission(payload) {
    if (isMongoConnected()) {
      const doc = await Admission.create(payload);
      return normalizeDoc(doc);
    }
    const store = readLocalStore();
    const now = new Date().toISOString();
    const item = {
      _id: generateId(),
      status: 'Pending',
      adminNotes: '',
      convertedStudentRef: null,
      reviewedBy: null,
      reviewedAt: null,
      ...payload,
      createdAt: now,
      updatedAt: now,
    };
    store.admissions.push(item);
    writeLocalStore(store);
    return item;
  },

  async updateAdmission(id, updates) {
    if (isMongoConnected()) {
      const doc = await Admission.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
      return normalizeDoc(doc);
    }
    const store = readLocalStore();
    const idx = store.admissions.findIndex((a) => a._id === String(id));
    if (idx === -1) return null;
    store.admissions[idx] = { ...store.admissions[idx], ...updates, updatedAt: new Date().toISOString() };
    writeLocalStore(store);
    return store.admissions[idx];
  },

  async deleteAdmission(id) {
    if (isMongoConnected()) {
      const doc = await Admission.findByIdAndDelete(id);
      return normalizeDoc(doc);
    }
    const store = readLocalStore();
    const idx = store.admissions.findIndex((a) => a._id === String(id));
    if (idx === -1) return null;
    const [removed] = store.admissions.splice(idx, 1);
    writeLocalStore(store);
    return removed;
  },

  // ---------------- GALLERY ----------------
  async listGallery(category = '') {
    if (isMongoConnected()) {
      const filter = category && category !== 'All' ? { category } : {};
      const docs = await Gallery.find(filter).sort({ order: 1, createdAt: -1 });
      return docs.map(normalizeDoc);
    }
    return readLocalStore()
      .gallery.filter((g) => (category && category !== 'All' ? g.category === category : true))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || new Date(b.createdAt) - new Date(a.createdAt));
  },

  async getGalleryById(id) {
    if (isMongoConnected()) {
      const doc = await Gallery.findById(id);
      return normalizeDoc(doc);
    }
    return readLocalStore().gallery.find((g) => g._id === String(id)) || null;
  },

  async createGalleryItem(payload) {
    if (isMongoConnected()) {
      const doc = await Gallery.create(payload);
      return normalizeDoc(doc);
    }
    const store = readLocalStore();
    const now = new Date().toISOString();
    const item = {
      _id: generateId(),
      order: store.gallery.length + 1,
      isDemo: false,
      ...payload,
      createdAt: now,
      updatedAt: now,
    };
    store.gallery.push(item);
    writeLocalStore(store);
    return item;
  },

  async updateGalleryItem(id, updates) {
    if (isMongoConnected()) {
      const doc = await Gallery.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
      return normalizeDoc(doc);
    }
    const store = readLocalStore();
    const idx = store.gallery.findIndex((g) => g._id === String(id));
    if (idx === -1) return null;
    store.gallery[idx] = { ...store.gallery[idx], ...updates, updatedAt: new Date().toISOString() };
    writeLocalStore(store);
    return store.gallery[idx];
  },

  async deleteGalleryItem(id) {
    if (isMongoConnected()) {
      const doc = await Gallery.findByIdAndDelete(id);
      return normalizeDoc(doc);
    }
    const store = readLocalStore();
    const idx = store.gallery.findIndex((g) => g._id === String(id));
    if (idx === -1) return null;
    const [removed] = store.gallery.splice(idx, 1);
    writeLocalStore(store);
    return removed;
  },

  // ---------------- NOTICES ----------------
  async listNotices({ activeOnly = false, category = '' } = {}) {
    if (isMongoConnected()) {
      const filter = {};
      if (activeOnly) filter.isActive = true;
      if (category && category !== 'All') filter.category = category;
      const docs = await Notice.find(filter).sort({ isPinned: -1, publishDate: -1, createdAt: -1 });
      return docs.map(normalizeDoc);
    }
    return readLocalStore()
      .notices.filter((n) => {
        if (activeOnly && !n.isActive) return false;
        if (category && category !== 'All' && n.category !== category) return false;
        return true;
      })
      .sort((a, b) => {
        if (Boolean(b.isPinned) !== Boolean(a.isPinned)) return b.isPinned ? 1 : -1;
        return new Date(b.publishDate || b.createdAt) - new Date(a.publishDate || a.createdAt);
      });
  },

  async createNotice(payload) {
    if (isMongoConnected()) {
      const doc = await Notice.create(payload);
      return normalizeDoc(doc);
    }
    const store = readLocalStore();
    const now = new Date().toISOString();
    const item = {
      _id: generateId(),
      isActive: true,
      isPinned: false,
      publishDate: now,
      ...payload,
      createdAt: now,
      updatedAt: now,
    };
    store.notices.push(item);
    writeLocalStore(store);
    return item;
  },

  async updateNotice(id, updates) {
    if (isMongoConnected()) {
      const doc = await Notice.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
      return normalizeDoc(doc);
    }
    const store = readLocalStore();
    const idx = store.notices.findIndex((n) => n._id === String(id));
    if (idx === -1) return null;
    store.notices[idx] = { ...store.notices[idx], ...updates, updatedAt: new Date().toISOString() };
    writeLocalStore(store);
    return store.notices[idx];
  },

  async deleteNotice(id) {
    if (isMongoConnected()) {
      const doc = await Notice.findByIdAndDelete(id);
      return normalizeDoc(doc);
    }
    const store = readLocalStore();
    const idx = store.notices.findIndex((n) => n._id === String(id));
    if (idx === -1) return null;
    const [removed] = store.notices.splice(idx, 1);
    writeLocalStore(store);
    return removed;
  },

  // ---------------- CONTACT MESSAGES ----------------
  async listContactMessages() {
    if (isMongoConnected()) {
      const docs = await ContactMessage.find().sort({ createdAt: -1 });
      return docs.map(normalizeDoc);
    }
    return [...readLocalStore().contactMessages].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  },

  async createContactMessage(payload) {
    if (isMongoConnected()) {
      const doc = await ContactMessage.create(payload);
      return normalizeDoc(doc);
    }
    const store = readLocalStore();
    const now = new Date().toISOString();
    const item = {
      _id: generateId(),
      isRead: false,
      ...payload,
      createdAt: now,
      updatedAt: now,
    };
    store.contactMessages.push(item);
    writeLocalStore(store);
    return item;
  },

  async updateContactMessage(id, updates) {
    if (isMongoConnected()) {
      const doc = await ContactMessage.findByIdAndUpdate(id, updates, { new: true });
      return normalizeDoc(doc);
    }
    const store = readLocalStore();
    const idx = store.contactMessages.findIndex((m) => m._id === String(id));
    if (idx === -1) return null;
    store.contactMessages[idx] = { ...store.contactMessages[idx], ...updates };
    writeLocalStore(store);
    return store.contactMessages[idx];
  },

  async deleteContactMessage(id) {
    if (isMongoConnected()) {
      const doc = await ContactMessage.findByIdAndDelete(id);
      return normalizeDoc(doc);
    }
    const store = readLocalStore();
    const idx = store.contactMessages.findIndex((m) => m._id === String(id));
    if (idx === -1) return null;
    const [removed] = store.contactMessages.splice(idx, 1);
    writeLocalStore(store);
    return removed;
  },

  // ---------------- DASHBOARD STATS ----------------
  async getDashboardStats() {
    const [students, admissions, classes, courses, notices, messages] = await Promise.all([
      this.listStudents(),
      this.listAdmissions(),
      this.listClasses(),
      this.listCourses(),
      this.listNotices(),
      this.listContactMessages(),
    ]);

    const pendingAdmissions = admissions.filter((a) => a.status === 'Pending').length;
    const approvedAdmissions = admissions.filter((a) => a.status === 'Approved').length;
    const rejectedAdmissions = admissions.filter((a) => a.status === 'Rejected').length;
    const specialCourseEnrollments =
      students.filter((s) => s.programType === 'special' || (s.enrolledCourses && s.enrolledCourses.length > 0))
        .length +
      admissions.filter((a) => a.programType === 'special' && a.status !== 'Rejected').length;

    return {
      totalStudents: students.length,
      activeStudents: students.filter((s) => s.status === 'Active').length,
      totalAdmissions: admissions.length,
      pendingAdmissions,
      approvedAdmissions,
      rejectedAdmissions,
      totalClasses: classes.length,
      totalSpecialCourses: courses.length,
      specialCourseEnrollments,
      totalNotices: notices.length,
      unreadMessages: messages.filter((m) => !m.isRead).length,
      recentApplications: admissions.slice(0, 6),
    };
  },
};
