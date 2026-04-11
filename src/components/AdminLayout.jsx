import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from '@/components/ui/sheet';
import {
  Sprout, Menu, X, LayoutDashboard, Users, MessageSquare,
  Leaf, DollarSign, Settings, CreditCard, LogOut, Shield,
  Moon, Sun, Bell,
} from 'lucide-react';
import { useDarkMode } from '@/hooks/useDarkMode';
import { getAdminUser } from '@/lib/adminAuth';
import { adminLogout } from '@/api/admin';

const AdminLayout = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem('adminSidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });

  const location = useLocation();
  const navigate = useNavigate();
  const { isDark, toggleDark } = useDarkMode();
  const adminUser = getAdminUser();

  const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { label: 'Users', icon: Users, path: '/admin/users' },
    { label: 'Chatbot', icon: MessageSquare, path: '/admin/chat-conversations' },
    { label: 'Crop Disease', icon: Leaf, path: '/admin/scan-results' },
    { label: 'Price Predictor', icon: DollarSign, path: '/admin/price-predictor' },
    { label: 'Subscriptions', icon: CreditCard, path: '/admin/subscriptions' },
    { label: 'Settings', icon: Settings, path: '/admin/settings' },
  ];

  const toggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem('adminSidebarCollapsed', JSON.stringify(next));
  };

  const handleLogout = () => {
    if (window.confirm('Logout from admin panel?')) adminLogout();
  };

  const labelClass = 'whitespace-nowrap overflow-hidden transition-[opacity,width] duration-200';

  const SidebarContent = ({ isMobile = false }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-border flex items-center justify-between">
        {(!collapsed || isMobile) && (
          <Link to="/admin/dashboard" onClick={() => isMobile && setIsOpen(false)}
            className="flex items-center gap-2 min-w-0">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center shrink-0">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className={`${labelClass} ${collapsed && !isMobile ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}>
              <span className="text-xl font-display font-bold text-foreground">
                Krishi <span className="text-primary">Admin</span>
              </span>
            </div>
          </Link>
        )}
        {!isMobile && (
          <button onClick={toggleCollapse}
            className={`p-2 rounded-lg hover:bg-muted shrink-0 ${collapsed ? 'mx-auto' : ''}`}>
            {collapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path}
              onClick={() => isMobile && setIsOpen(false)}
              className={`flex items-center ${collapsed && !isMobile ? 'justify-center' : 'gap-3'}
                px-4 py-3 rounded-lg transition-colors
                ${isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
              <Icon className="w-5 h-5 shrink-0" />
              <span className={`${labelClass} ${collapsed && !isMobile ? 'opacity-0 w-0' : 'opacity-100 w-auto'} font-medium`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-border flex flex-col gap-1">
        <button onClick={toggleDark}
          className={`flex items-center ${collapsed && !isMobile ? 'justify-center' : 'gap-3'}
            px-4 py-3 rounded-lg transition-colors w-full text-muted-foreground hover:bg-muted hover:text-foreground`}>
          {isDark ? <Sun className="w-5 h-5 shrink-0" /> : <Moon className="w-5 h-5 shrink-0" />}
          <span className={`${labelClass} ${collapsed && !isMobile ? 'opacity-0 w-0' : 'opacity-100 w-auto'} font-medium`}>
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </span>
        </button>

        <div className={`flex items-center ${collapsed && !isMobile ? 'justify-center' : 'gap-3'}
          px-4 py-3 rounded-lg cursor-pointer text-muted-foreground hover:bg-muted hover:text-destructive`}
          onClick={handleLogout}>
          <LogOut className="w-5 h-5 shrink-0" />
          <span className={`${labelClass} ${collapsed && !isMobile ? 'opacity-0 w-0' : 'opacity-100 w-auto'} font-medium`}>
            Logout
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex lg:flex-col border-r border-border bg-card
        transition-[width] duration-300 ease-in-out ${collapsed ? 'lg:w-20' : 'lg:w-64'}`}>
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild className="lg:hidden fixed top-4 left-4 z-50">
          <Button variant="outline" size="icon" className="bg-card"><Menu className="h-5 w-5" /></Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <SheetHeader className="sr-only"><SheetTitle>Admin Menu</SheetTitle></SheetHeader>
          <SidebarContent isMobile />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top header bar */}
        <header className="sticky top-0 z-30 bg-card border-b border-border px-6 py-3 flex items-center justify-between">
          <p className="text-sm text-muted-foreground font-medium">
            Logged in as <span className="text-foreground font-semibold">{adminUser?.full_name || 'Admin'}</span>
          </p>
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary" />
            </div>
          </div>
        </header>
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
};

export default AdminLayout;