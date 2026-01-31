import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  Archive,
  Settings,
  Bell,
  Search,
  Sparkles,
  Menu,
  LogOut,
  Brain
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { logout } from '@/services/auth';
import { getCapsules } from '@/services/api';

const navItems = [
  { path: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/app/new', label: 'Nueva Cápsula', icon: PlusCircle },
  { path: '/app/archive', label: 'Archivo', icon: Archive },
  { path: '/app/settings', label: 'Configuración', icon: Settings },
];

export default function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [stats, setStats] = useState({ totalCapsules: 0, savedHours: 0, thisWeek: 0 });
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  // Load stats
  useEffect(() => {
    const loadStats = async () => {
      const { capsules } = await getCapsules();
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      setStats({
        totalCapsules: capsules.length,
        savedHours: Math.round(capsules.length * 0.25 * 10) / 10,
        thisWeek: capsules.filter(c => new Date(c.createdAt) >= weekAgo).length
      });
    };
    loadStats();
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 z-50 flex flex-col transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-100">
          <NavLink to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-2xl">FocusBrief</span>
          </NavLink>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-black text-white'
                        : 'text-black/60 hover:bg-gray-100 hover:text-black'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Stats */}
        <div className="p-4 border-t border-gray-100">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-black/50 uppercase tracking-wider mb-3">Tu Progreso</p>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-black/60">Cápsulas</span>
                <span className="font-semibold">{stats.totalCapsules}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-black/60">Horas ahorradas</span>
                <span className="font-semibold">{stats.savedHours}h</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-black/60">Esta semana</span>
                <span className="font-semibold">{stats.thisWeek}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Gemini Badge */}
        <div className="px-4 pb-2">
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg text-xs">
            <Sparkles className="w-3 h-3 text-purple-600" />
            <span className="text-purple-700 font-medium">Gemini 3 Flash</span>
          </div>
        </div>

        {/* User + Logout */}
        <div className="p-4 border-t border-gray-100">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Cerrar Sesión</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header
          className={`sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200 transition-all duration-300 ${
            isScrolled ? 'shadow-sm' : ''
          }`}
        >
          <div className="flex items-center justify-between px-4 lg:px-8 py-4">
            {/* Left: Menu button + Search */}
            <div className="flex items-center gap-4 flex-1">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>

              <div className="relative max-w-md w-full hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
                <Input
                  placeholder="Buscar cápsulas..."
                  className="pl-10 bg-gray-50 border-0 focus-visible:ring-1"
                />
              </div>
            </div>

            {/* Right: Notifications + New */}
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                {stats.thisWeek > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </Button>
              <Button
                className="hidden sm:flex bg-black text-white hover:bg-black/90 rounded-full gap-2"
                asChild
              >
                <NavLink to="/app/new">
                  <PlusCircle className="w-4 h-4" />
                  Nueva Cápsula
                </NavLink>
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
