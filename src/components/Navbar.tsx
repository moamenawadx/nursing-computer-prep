import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Menu, X, ChevronLeft, BookOpen, LogOut } from "lucide-react";

export default function Navbar() {
  const { signOut, user, profile } = useAuth();
  const [location, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  if (location === "/login") {
    return null;
  }

  const isHomePage = location === "/";
  const isInternalPage = location !== "/";

  const navItems = [
    { label: "الرئيسية", href: "/" },
    { label: "الدروس", href: "/lessons" },
    { label: "الاختبارات", href: "/exams" },
    { label: "لوحة التحكم", href: "/dashboard" },
    ...(profile?.role === "admin" ? [{ label: "الإدارة", href: "/admin" }] : []),
  ];

  const handleLogout = async () => {
    await signOut();
    setIsOpen(false);
    setLocation("/login");
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-blue-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="hidden md:inline font-bold text-lg text-gray-900">
              دليل التمريض
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Button
                key={item.href}
                variant={location === item.href ? "default" : "ghost"}
                className={`${
                  location === item.href
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "text-gray-700 hover:bg-blue-50"
                }`}
                onClick={() => {
                  setLocation(item.href);
                  setIsOpen(false);
                }}
              >
                {item.label}
              </Button>
            ))}
          </div>

          {/* Back Button for Internal Pages */}
          <div className="hidden md:flex items-center gap-2">
            {isInternalPage && (
              <Button
                variant="outline"
                size="sm"
                className="items-center gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                onClick={() => setLocation("/")}
              >
                <ChevronLeft className="w-4 h-4" />
                رجوع
              </Button>
            )}
            {user && (
              <Button
                variant="outline"
                size="sm"
                className="items-center gap-2 border-red-200 text-red-600 hover:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" />
                خروج
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? (
              <X className="w-6 h-6 text-gray-900" />
            ) : (
              <Menu className="w-6 h-6 text-gray-900" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 border-t border-blue-200">
            <div className="flex flex-col gap-2 pt-4">
              {navItems.map((item) => (
                <Button
                  key={item.href}
                  variant={location === item.href ? "default" : "ghost"}
                  className={`w-full justify-start ${
                    location === item.href
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "text-gray-700 hover:bg-blue-50"
                  }`}
                  onClick={() => {
                    setLocation(item.href);
                    setIsOpen(false);
                  }}
                >
                  {item.label}
                </Button>
              ))}
              {isInternalPage && (
                <Button
                  variant="outline"
                  className="w-full justify-start text-blue-600 border-blue-200 hover:bg-blue-50"
                  onClick={() => {
                    setLocation("/");
                    setIsOpen(false);
                  }}
                >
                  <ChevronLeft className="w-4 h-4 ml-2" />
                  رجوع
                </Button>
              )}
              {user && (
                <Button
                  variant="outline"
                  className="w-full justify-start border-red-200 text-red-600 hover:bg-red-50"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 ml-2" />
                  تسجيل الخروج
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
