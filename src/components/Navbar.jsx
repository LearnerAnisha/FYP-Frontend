// src/components/Navbar.jsx — "Pricing" navigates to /pricing page
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Menu, Sprout, Moon, Sun } from "lucide-react";
import { useDarkMode } from "@/hooks/useDarkMode";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { isDark, toggleDark } = useDarkMode();

  // Mix of anchor links (same-page scroll) and route links
  const navLinks = [
    { name: "Features",      href: "/#features",      isRoute: false },
    { name: "How It Works",  href: "/#how-it-works",  isRoute: false },
    { name: "Pricing",       href: "/pricing",         isRoute: true  }, // <- own page
    { name: "Testimonials",  href: "/#testimonials",  isRoute: false },
    { name: "FAQ",           href: "/#faq",           isRoute: false },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-smooth">
              <Sprout className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl sm:text-2xl font-display font-bold text-foreground">
              Krishi <span className="text-primary">Saathi</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) =>
              link.isRoute ? (
                <Link key={link.name} to={link.href}
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-smooth">
                  {link.name}
                </Link>
              ) : (
                <a key={link.name} href={link.href}
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-smooth">
                  {link.name}
                </a>
              )
            )}
          </div>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-3">
            <button onClick={toggleDark} aria-label="Toggle dark mode"
              className="w-9 h-9 rounded-lg border border-border bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth">
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Button variant="ghost" onClick={() => navigate("/auth")} className="text-sm font-medium">Sign In</Button>
            <Button onClick={() => navigate("/auth")} className="bg-gradient-primary text-primary-foreground hover:opacity-90 transition-smooth">
              Get Started
            </Button>
          </div>

          {/* Mobile */}
          <div className="flex items-center gap-2 md:hidden">
            <button onClick={toggleDark} aria-label="Toggle dark mode"
              className="w-9 h-9 rounded-lg border border-border bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-smooth">
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon"><Menu className="h-6 w-6" /></Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[350px]">
                <SheetHeader className="sr-only"><SheetTitle>Navigation Menu</SheetTitle></SheetHeader>
                <div className="flex flex-col gap-6 mt-8">
                  {navLinks.map((link) =>
                    link.isRoute ? (
                      <Link key={link.name} to={link.href} onClick={() => setIsOpen(false)}
                        className="text-lg font-medium text-muted-foreground hover:text-primary transition-smooth">
                        {link.name}
                      </Link>
                    ) : (
                      <a key={link.name} href={link.href} onClick={() => setIsOpen(false)}
                        className="text-lg font-medium text-muted-foreground hover:text-primary transition-smooth">
                        {link.name}
                      </a>
                    )
                  )}
                  <div className="flex flex-col gap-3 mt-4">
                    <Button variant="outline" onClick={() => { setIsOpen(false); navigate("/auth"); }} className="w-full">Sign In</Button>
                    <Button onClick={() => { setIsOpen(false); navigate("/auth"); }} className="w-full bg-gradient-primary text-primary-foreground">
                      Get Started
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

        </div>
      </div>
    </nav>
  );
};