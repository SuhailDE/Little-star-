import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AdminAdmissions from './admin/AdminAdmissions.jsx';
import AdminClassesCourses from './admin/AdminClassesCourses.jsx';
import AdminGallery from './admin/AdminGallery.jsx';
import AdminLayout from './admin/AdminLayout.jsx';
import AdminMessages from './admin/AdminMessages.jsx';
import AdminNotices from './admin/AdminNotices.jsx';
import AdminOverview from './admin/AdminOverview.jsx';
import AdminSettings from './admin/AdminSettings.jsx';
import AdminStudents from './admin/AdminStudents.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { SettingsProvider } from './context/SettingsContext.jsx';
import PublicLayout from './layouts/PublicLayout.jsx';
import AboutPage from './pages/AboutPage.jsx';
import AdmissionPage from './pages/AdmissionPage.jsx';
import ApproachPage from './pages/ApproachPage.jsx';
import ClassesPage from './pages/ClassesPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import GalleryPage from './pages/GalleryPage.jsx';
import HomePage from './pages/HomePage.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <SettingsProvider>
        <AuthProvider>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/classes" element={<ClassesPage />} />
              <Route path="/approach" element={<ApproachPage />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/admission" element={<AdmissionPage />} />
              <Route path="/contact" element={<ContactPage />} />
            </Route>

            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminOverview />} />
              <Route path="admissions" element={<AdminAdmissions />} />
              <Route path="students" element={<AdminStudents />} />
              <Route path="academics" element={<AdminClassesCourses />} />
              <Route path="gallery" element={<AdminGallery />} />
              <Route path="notices" element={<AdminNotices />} />
              <Route path="messages" element={<AdminMessages />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </SettingsProvider>
    </BrowserRouter>
  );
}
