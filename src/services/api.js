import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/+$/, '')}/api`
  : '/api';

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
  },
});

export function extractErrorMessage(err, fallback = 'Something went wrong. Please try again.') {
  return err?.response?.data?.message || err?.message || fallback;
}

export const authApi = {
  getSetupStatus: () => apiClient.get('/auth/setup-status').then((r) => r.data),
  claimAdmin: (data) => apiClient.post('/auth/claim-admin', data).then((r) => r.data),
  login: (data) => apiClient.post('/auth/login', data).then((r) => r.data),
  logout: () => apiClient.post('/auth/logout').then((r) => r.data),
  me: () => apiClient.get('/auth/me').then((r) => r.data),
};

export const settingsApi = {
  get: () => apiClient.get('/settings').then((r) => r.data),
  update: (data) => apiClient.put('/settings', data).then((r) => r.data),
  uploadLogo: (formData) =>
    apiClient
      .post('/settings/logo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data),
};

export const classesApi = {
  list: (availableOnly = false) =>
    apiClient.get('/classes', { params: availableOnly ? { available: 'true' } : {} }).then((r) => r.data),
  create: (data) => apiClient.post('/classes', data).then((r) => r.data),
  update: (id, data) => apiClient.put(`/classes/${id}`, data).then((r) => r.data),
  remove: (id) => apiClient.delete(`/classes/${id}`).then((r) => r.data),
};

export const coursesApi = {
  list: (availableOnly = false) =>
    apiClient.get('/courses', { params: availableOnly ? { available: 'true' } : {} }).then((r) => r.data),
  create: (data) => apiClient.post('/courses', data).then((r) => r.data),
  update: (id, data) => apiClient.put(`/courses/${id}`, data).then((r) => r.data),
  remove: (id) => apiClient.delete(`/courses/${id}`).then((r) => r.data),
};

export const admissionsApi = {
  submit: (data) => apiClient.post('/admissions', data).then((r) => r.data),
  track: (applicationId) =>
    apiClient.get(`/admissions/track/${encodeURIComponent(applicationId)}`).then((r) => r.data),
  list: (params) => apiClient.get('/admissions', { params }).then((r) => r.data),
  get: (id) => apiClient.get(`/admissions/${id}`).then((r) => r.data),
  updateStatus: (id, data) => apiClient.patch(`/admissions/${id}/status`, data).then((r) => r.data),
  convertToStudent: (id) => apiClient.post(`/admissions/${id}/convert`).then((r) => r.data),
  remove: (id) => apiClient.delete(`/admissions/${id}`).then((r) => r.data),
};

export const studentsApi = {
  stats: () => apiClient.get('/dashboard/stats').then((r) => r.data),
  list: (params) => apiClient.get('/students', { params }).then((r) => r.data),
  get: (id) => apiClient.get(`/students/${id}`).then((r) => r.data),
  create: (data) => apiClient.post('/students', data).then((r) => r.data),
  update: (id, data) => apiClient.put(`/students/${id}`, data).then((r) => r.data),
  remove: (id) => apiClient.delete(`/students/${id}`).then((r) => r.data),
};

export const galleryApi = {
  list: (category = '') =>
    apiClient.get('/gallery', { params: category ? { category } : {} }).then((r) => r.data),
  create: (formData) =>
    apiClient
      .post('/gallery', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data),
  update: (id, formData) =>
    apiClient
      .put(`/gallery/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data),
  remove: (id) => apiClient.delete(`/gallery/${id}`).then((r) => r.data),
};

export const noticesApi = {
  list: (params) => apiClient.get('/notices', { params }).then((r) => r.data),
  create: (data) => apiClient.post('/notices', data).then((r) => r.data),
  update: (id, data) => apiClient.put(`/notices/${id}`, data).then((r) => r.data),
  remove: (id) => apiClient.delete(`/notices/${id}`).then((r) => r.data),
};

export const contactApi = {
  submit: (data) => apiClient.post('/contact', data).then((r) => r.data),
  list: () => apiClient.get('/contact').then((r) => r.data),
  markRead: (id, isRead = true) => apiClient.patch(`/contact/${id}/read`, { isRead }).then((r) => r.data),
  remove: (id) => apiClient.delete(`/contact/${id}`).then((r) => r.data),
};
