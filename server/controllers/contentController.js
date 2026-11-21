import { deleteImageAsset, uploadImageAsset } from '../config/cloudinary.js';
import { dataStore } from '../services/dataStore.js';
import { AppError, cleanString, isSafeUrl, isValidEmail, isValidPhone } from '../utils/validators.js';

// ---------------- GALLERY ----------------
export async function listGallery(req, res, next) {
  try {
    const category = cleanString(req.query.category, 60);
    const items = await dataStore.listGallery(category);
    res.json({ success: true, gallery: items });
  } catch (err) {
    next(err);
  }
}

export async function createGalleryItem(req, res, next) {
  try {
    const title = cleanString(req.body.title, 120);
    const category = cleanString(req.body.category, 60) || 'Classroom';
    const description = cleanString(req.body.description, 400);

    if (!title) {
      return next(new AppError('Photo title is required.', 400));
    }

    let imageUrl = '';
    let publicId = '';

    if (req.file) {
      const uploaded = await uploadImageAsset(req.file);
      imageUrl = uploaded.imageUrl;
      publicId = uploaded.publicId;
    } else if (req.body.imageUrl) {
      const candidateUrl = cleanString(req.body.imageUrl, 500);
      if (!isSafeUrl(candidateUrl, true)) {
        return next(new AppError('Invalid image URL.', 400));
      }
      imageUrl = candidateUrl;
    } else {
      return next(new AppError('Please upload an image file or provide an image URL.', 400));
    }

    // Automatically register custom category in settings if new
    const settings = await dataStore.getSettings();
    if (settings && Array.isArray(settings.galleryCategories)) {
      if (!settings.galleryCategories.includes(category)) {
        await dataStore.upsertSettings({
          galleryCategories: [...settings.galleryCategories, category],
        });
      }
    }

    const item = await dataStore.createGalleryItem({
      title,
      category,
      description,
      imageUrl,
      publicId,
      isDemo: false,
    });

    res.status(201).json({ success: true, message: 'Gallery photo added.', item });
  } catch (err) {
    next(err);
  }
}

export async function updateGalleryItem(req, res, next) {
  try {
    const existing = await dataStore.getGalleryById(req.params.id);
    if (!existing) {
      return next(new AppError('Gallery item not found.', 404));
    }

    const updates = {};
    if (req.body.title !== undefined) updates.title = cleanString(req.body.title, 120);
    if (req.body.category !== undefined) {
      updates.category = cleanString(req.body.category, 60) || 'Classroom';
      const settings = await dataStore.getSettings();
      if (settings && Array.isArray(settings.galleryCategories)) {
        if (!settings.galleryCategories.includes(updates.category)) {
          await dataStore.upsertSettings({
            galleryCategories: [...settings.galleryCategories, updates.category],
          });
        }
      }
    }
    if (req.body.description !== undefined) {
      updates.description = cleanString(req.body.description, 400);
    }
    if (req.file) {
      const uploaded = await uploadImageAsset(req.file);
      if (existing.publicId) {
        await deleteImageAsset(existing.publicId);
      }
      updates.imageUrl = uploaded.imageUrl;
      updates.publicId = uploaded.publicId;
      updates.isDemo = false;
    }

    const updated = await dataStore.updateGalleryItem(req.params.id, updates);
    res.json({ success: true, message: 'Gallery photo updated.', item: updated });
  } catch (err) {
    next(err);
  }
}

export async function deleteGalleryItem(req, res, next) {
  try {
    const removed = await dataStore.deleteGalleryItem(req.params.id);
    if (!removed) {
      return next(new AppError('Gallery item not found.', 404));
    }
    if (removed.publicId) {
      await deleteImageAsset(removed.publicId);
    }
    res.json({ success: true, message: 'Gallery photo deleted.' });
  } catch (err) {
    next(err);
  }
}

// ---------------- NOTICES ----------------
export async function listNotices(req, res, next) {
  try {
    const activeOnly = req.query.active === 'true';
    const category = cleanString(req.query.category, 40);
    const notices = await dataStore.listNotices({ activeOnly, category });
    res.json({ success: true, notices });
  } catch (err) {
    next(err);
  }
}

export async function createNotice(req, res, next) {
  try {
    const title = cleanString(req.body.title, 180);
    const content = cleanString(req.body.content, 2000);
    const category = ['Admission', 'Examination', 'Holiday', 'Announcement'].includes(
      req.body.category
    )
      ? req.body.category
      : 'Announcement';

    if (!title || !content) {
      return next(new AppError('Notice title and content are required.', 400));
    }

    const notice = await dataStore.createNotice({
      title,
      category,
      content,
      publishDate: req.body.publishDate ? new Date(req.body.publishDate) : new Date(),
      isActive: req.body.isActive !== false,
      isPinned: Boolean(req.body.isPinned),
    });

    res.status(201).json({ success: true, message: 'Notice published.', notice });
  } catch (err) {
    next(err);
  }
}

export async function updateNotice(req, res, next) {
  try {
    const updates = {};
    if (req.body.title !== undefined) updates.title = cleanString(req.body.title, 180);
    if (req.body.content !== undefined) updates.content = cleanString(req.body.content, 2000);
    if (
      req.body.category !== undefined &&
      ['Admission', 'Examination', 'Holiday', 'Announcement'].includes(req.body.category)
    ) {
      updates.category = req.body.category;
    }
    if (req.body.publishDate !== undefined) updates.publishDate = new Date(req.body.publishDate);
    if (req.body.isActive !== undefined) updates.isActive = Boolean(req.body.isActive);
    if (req.body.isPinned !== undefined) updates.isPinned = Boolean(req.body.isPinned);

    const updated = await dataStore.updateNotice(req.params.id, updates);
    if (!updated) {
      return next(new AppError('Notice not found.', 404));
    }
    res.json({ success: true, message: 'Notice updated.', notice: updated });
  } catch (err) {
    next(err);
  }
}

export async function deleteNotice(req, res, next) {
  try {
    const removed = await dataStore.deleteNotice(req.params.id);
    if (!removed) {
      return next(new AppError('Notice not found.', 404));
    }
    res.json({ success: true, message: 'Notice deleted.' });
  } catch (err) {
    next(err);
  }
}

// ---------------- CONTACT ----------------
export async function submitContactMessage(req, res, next) {
  try {
    const name = cleanString(req.body.name, 120);
    const phone = cleanString(req.body.phone, 30);
    const email = cleanString(req.body.email, 150).toLowerCase();
    const subject = cleanString(req.body.subject, 150) || 'General Inquiry';
    const message = cleanString(req.body.message, 2000);

    if (!name || !phone || !message) {
      return next(new AppError('Name, phone number, and message are required.', 400));
    }
    if (!isValidPhone(phone)) {
      return next(new AppError('Please enter a valid phone number.', 400));
    }
    if (email && !isValidEmail(email)) {
      return next(new AppError('Please enter a valid email address.', 400));
    }

    const saved = await dataStore.createContactMessage({
      name,
      phone,
      email,
      subject,
      message,
    });

    res.status(201).json({
      success: true,
      message: 'Your message has been sent to Little Star. We will reach out shortly.',
      contactMessage: { _id: saved._id, createdAt: saved.createdAt },
    });
  } catch (err) {
    next(err);
  }
}

export async function listContactMessages(_req, res, next) {
  try {
    const messages = await dataStore.listContactMessages();
    res.json({ success: true, messages });
  } catch (err) {
    next(err);
  }
}

export async function markMessageRead(req, res, next) {
  try {
    const updated = await dataStore.updateContactMessage(req.params.id, {
      isRead: req.body.isRead !== false,
    });
    if (!updated) {
      return next(new AppError('Message not found.', 404));
    }
    res.json({ success: true, message: 'Message status updated.', contactMessage: updated });
  } catch (err) {
    next(err);
  }
}

export async function deleteContactMessage(req, res, next) {
  try {
    const removed = await dataStore.deleteContactMessage(req.params.id);
    if (!removed) {
      return next(new AppError('Message not found.', 404));
    }
    res.json({ success: true, message: 'Message deleted.' });
  } catch (err) {
    next(err);
  }
}

// ---------------- WEBSITE SETTINGS ----------------
export async function getWebsiteSettings(_req, res, next) {
  try {
    const settings = await dataStore.getSettings();
    res.json({ success: true, settings });
  } catch (err) {
    next(err);
  }
}

export async function updateWebsiteSettings(req, res, next) {
  try {
    const body = req.body || {};
    const updates = {};

    const textFields = [
      ['institutionName', 100],
      ['tagline', 160],
      ['directorName', 120],
      ['whatsappNumber', 30],
      ['address', 300],
      ['heroHeading', 160],
      ['heroSubtitle', 200],
      ['heroSupportingText', 400],
      ['aboutIntro', 1200],
      ['mission', 800],
      ['vision', 800],
      ['teachingPhilosophy', 800],
      ['learningEnvironment', 800],
    ];

    for (const [key, max] of textFields) {
      if (body[key] !== undefined) {
        updates[key] = cleanString(body[key], max);
      }
    }

    if (body.phones !== undefined) {
      const phoneList = Array.isArray(body.phones)
        ? body.phones.map((p) => cleanString(String(p), 30)).filter(Boolean)
        : String(body.phones)
            .split(/,|\n/)
            .map((p) => cleanString(p, 30))
            .filter(Boolean);
      updates.phones = phoneList;
    }

    if (body.galleryCategories !== undefined) {
      const cats = Array.isArray(body.galleryCategories)
        ? body.galleryCategories.map((c) => cleanString(String(c), 60)).filter(Boolean)
        : String(body.galleryCategories)
            .split(/,|\n/)
            .map((c) => cleanString(c, 60))
            .filter(Boolean);
      if (cats.length > 0) updates.galleryCategories = cats;
    }

    if (body.admissionStatus !== undefined) {
      updates.admissionStatus = body.admissionStatus === 'Closed' ? 'Closed' : 'Open';
    }

    if (body.minimumAge !== undefined) {
      const age = Number(body.minimumAge);
      if (!Number.isFinite(age) || age < 3 || age > 12) {
        return next(new AppError('Minimum age must be between 3 and 12 years.', 400));
      }
      updates.minimumAge = Math.round(age);
    }

    for (const urlField of ['facebookUrl', 'googleMapsUrl', 'logoUrl']) {
      if (body[urlField] !== undefined) {
        const val = cleanString(body[urlField], 500);
        if (val && !isSafeUrl(val, urlField === 'logoUrl')) {
          return next(new AppError(`Please enter a valid http/https URL for ${urlField}.`, 400));
        }
        updates[urlField] = val;
      }
    }

    const settings = await dataStore.upsertSettings(updates);
    res.json({
      success: true,
      message: 'Website settings updated successfully.',
      settings,
    });
  } catch (err) {
    next(err);
  }
}

export async function uploadLogoAsset(req, res, next) {
  try {
    if (!req.file) {
      return next(new AppError('Please choose a logo image file.', 400));
    }
    const uploaded = await uploadImageAsset(req.file);
    const settings = await dataStore.upsertSettings({ logoUrl: uploaded.imageUrl });
    res.json({
      success: true,
      message: 'Institution logo uploaded.',
      logoUrl: uploaded.imageUrl,
      settings,
    });
  } catch (err) {
    next(err);
  }
}
