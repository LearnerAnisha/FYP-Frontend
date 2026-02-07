import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Sprout,
  Menu,
  X,
  LayoutDashboard,
  Scan,
  CloudRain,
  TrendingUp,
  MessageSquare,
  LogOut,
  User,
} from "lucide-react";

export const DashboardLayout = ({ children }) => {
  /* ================= States ================= */

  const [isOpen, setIsOpen] = useState(false);

  // Persistent collapse state
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    return saved ? JSON.parse(saved) : false;
  });

  const location = useLocation();
  const navigate = useNavigate();

  /* ================= Nav Items ================= */

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Disease Detection", href: "/disease-detection", icon: Scan },
    { name: "Weather & Irrigation", href: "/weather-irrigation", icon: CloudRain },
    { name: "Price Predictor", href: "/price-predictor", icon: TrendingUp },
    { name: "AI Assistant", href: "/chatbot", icon: MessageSquare },
  ];

  const handleLogout = () => navigate("/");

  /* ================= Toggle ================= */

  const toggleCollapse = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    localStorage.setItem("sidebarCollapsed", JSON.stringify(newState));
  };

  /* ================= Label Class Helper ================= */

  const labelClass = `
    whitespace-nowrap overflow-hidden
    transition-[opacity,width] duration-200
  `;

  /* ================= Sidebar ================= */

  const SidebarContent = ({ isMobile = false }) => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-border flex items-center justify-between">

        {/* ===== Expanded Logo ===== */}
        {(!collapsed || isMobile) && (
          <Link
            to="/dashboard"
            onClick={() => isMobile && setIsOpen(false)}
            className="flex items-center gap-2 min-w-0"
          >
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shrink-0">
              <Sprout className="w-6 h-6 text-primary-foreground" />
            </div>

            {/* Logo Text */}
            <div
              className={`${labelClass} ${collapsed && !isMobile
                  ? "opacity-0 w-0"
                  : "opacity-100 w-auto"
                }`}
            >
              <span className="text-xl font-display font-bold text-foreground">
                Krishi <span className="text-primary">Saathi</span>
              </span>
            </div>
          </Link>
        )}

        {/* ===== Collapsed Hamburger ===== */}
        {!isMobile && (
          <button
            onClick={toggleCollapse}
            className={`p-2 rounded-lg hover:bg-muted shrink-0 ${collapsed ? "mx-auto" : ""
              }`}
          >
            {collapsed ? (
              <Menu className="w-5 h-5" />
            ) : (
              <X className="w-5 h-5" />
            )}
          </button>
        )}

      </div>

      {/* ===== Navigation ===== */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;

          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => isMobile && setIsOpen(false)}
              className={`flex items-center ${
                collapsed && !isMobile ? "justify-center" : "gap-3"
              } px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />

              {/* Label */}
              <span
                className={`${labelClass} ${
                  collapsed && !isMobile
                    ? "opacity-0 w-0"
                    : "opacity-100 w-auto"
                } font-medium`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* ===== Bottom Section ===== */}
      <div className="p-4 border-t border-border flex flex-col gap-2">

        {/* Profile */}
        <div
          onClick={() => {
            navigate("/profile");
            if (isMobile) setIsOpen(false);
          }}
          className={`flex items-center ${
            collapsed && !isMobile ? "justify-center" : "gap-3"
          } px-4 py-3 rounded-lg transition-colors cursor-pointer ${
            location.pathname === "/profile"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <User className="w-5 h-5 shrink-0" />

          <span
            className={`${labelClass} ${
              collapsed && !isMobile
                ? "opacity-0 w-0"
                : "opacity-100 w-auto"
            } font-medium`}
          >
            Profile
          </span>
        </div>

        {/* Logout */}
        <div
          onClick={handleLogout}
          className={`flex items-center ${
            collapsed && !isMobile ? "justify-center" : "gap-3"
          } px-4 py-3 rounded-lg transition-colors cursor-pointer
          text-muted-foreground hover:bg-muted hover:text-destructive`}
        >
          <LogOut className="w-5 h-5 shrink-0" />

          <span
            className={`${labelClass} ${
              collapsed && !isMobile
                ? "opacity-0 w-0"
                : "opacity-100 w-auto"
            } font-medium`}
          >
            Logout
          </span>
        </div>
      </div>
    </div>
  );

  /* ================= Layout ================= */

  return (
    <div className="flex h-screen bg-background">

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex lg:flex-col border-r border-border bg-card
        transition-[width] duration-300 ease-in-out
        ${collapsed ? "lg:w-20" : "lg:w-64"}`}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild className="lg:hidden fixed top-4 left-4 z-50">
          <Button variant="outline" size="icon" className="bg-card">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>

        <SheetContent side="left" className="p-0 w-64">
          <SidebarContent isMobile />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
};
