import { useAuth } from "@/hooks/useAuth";
import { useEffect, type ReactNode } from "react";
import { useLocation } from "wouter";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { loading, user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation("/login");
    }
  }, [loading, setLocation, user]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <p className="text-gray-600">جاري تحميل الجلسة...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
