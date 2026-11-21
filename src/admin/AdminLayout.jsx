import { useState } from 'react';
import {
  Bell,
  BookOpen,
  ClipboardList,
  ExternalLink,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Settings,
  Users,
  X,
} from 'lucide-react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import LittleStarLogo from '../components/LittleStarLogo.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import AdminAuthGate from './AdminAuthGate.jsx';

const SIDEBAR_ITEMS = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/admissions', label: 'Admissions', icon: ClipboardList },
  { to: '/admin/students', label: 'Students', icon: Users },
  { to: '/admin/academics', label: 'Classes & Courses', icon: BookOpen },
  { to: '/admin/gallery', label: 'Gallery', icon: ImageIcon },
  { to: '/admin/notices', label: 'Notices', icon: Bell },
  { to: '/admin/messages', label: 'Messages', icon: Mail },
  { to: '/admin/settings', label: 'Website Settings', icon: Settings },
];

export default function AdminLayout() {
  const { admin, loading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F8FC] flex items-center justify-center">
        <div className="text-sm font-medium text-[#52657A]">Verifying administrator session...</div>
      </div>
    );
  }

  if (!admin) {
    return <AdminAuthGate />;
  }

  const currentSection =
    SIDEBAR_ITEMS.find((item) =>
      item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
    )?.label || 'Dashboard';

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#24364B] flex">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#0F172A]/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#E2E8F0] flex flex-col justify-between transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          <div className="h-16 px-5 border-b border-[#E2E8F0] flex items-center justify-between">
            <Link to="/admin" className="shrink-0">
              <LittleStarLogo size="sm" />
            </Link>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg text-[#52657A] hover:bg-[#F1F5F9]"
              aria-label="Close sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <nav className="p-3 space-y-1" aria-label="Admin Navigation">
            {SIDEBAR_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                      isActive
                        ? 'bg-[#EAF5FF] text-[#2876C8] font-semibold'
                        : 'text-[#52657A] hover:bg-[#F1F5F9] hover:text-[#24364B]'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-[#E2E8F0] space-y-3">
          <div className="px-2">
            <p className="text-xs font-semibold text-[#24364B] truncate">{admin.name}</p>
            <p className="text-xs text-[#52657A] truncate">{admin.email}</p>
          </div>
          <div className="space-y-1">
            <Link
              to="/"
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#52657A] hover:bg-[#F1F5F9] hover:text-[#24364B]"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Public Website</span>
            </Link>
            <button
              type="button"
              onClick={logout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 bg-white border-b border-[#E2E8F0] px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-[#24364B] hover:bg-[#F1F5F9]"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="text-sm text-[#52657A] truncate">
              <span>Admin</span>
              <span className="mx-2">/</span>
              <span className="font-semibold text-[#24364B]">{currentSection}</span>
            </div>
          </div>

          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#DCE8F5] text-xs font-semibold text-[#24364B] hover:bg-[#EAF5FF] whitespace-nowrap shrink-0"
          >
            <span>Public Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
