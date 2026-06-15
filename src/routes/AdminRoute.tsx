import { useAuth } from "@/hooks/useAuth";
import { useEffect, type ReactNode } from "react";
import { useLocation } from "wouter";

export default function AdminRoute({ children }: { children: ReactNode }) {
  const { loading, user, profile } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation("/login");
      return;
    }
    if (!loading && user && profile && profile.role !== "admin") {
      setLocation("/dashboard");
    }
  }, [loading, profile, setLocation, user]);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <p className="text-gray-600">جاري تحميل لوحة الإدارة...</p>
      </div>
    );
  }

  if (!user || profile?.role !== "admin") {
    return null;
  }

  return <>{children}</>;
}
