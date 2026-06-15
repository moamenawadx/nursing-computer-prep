import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { getUserResults } from "@/services/examService";
import type { ExamResult } from "@/types";
import { formatArabicDate } from "@/utils/format";
import { BookOpen, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

export default function Review() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    getUserResults(user.id)
      .then(setResults)
      .catch((err) => setError(err instanceof Error ? err.message : "تعذر تحميل المراجعات."))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <StateCard message="جاري تحميل المراجعات..." />;
  if (error) return <StateCard message={error} tone="error" />;

  return (
    <div className="py-12">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="mb-8 flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-blue-600" />
          <h1 className="text-4xl font-bold text-gray-900">مراجعة النتائج</h1>
        </div>

        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle>محاولاتك السابقة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.length === 0 ? (
              <div className="py-8 text-center">
                <p className="mb-4 text-gray-600">لا توجد نتائج للمراجعة بعد.</p>
                <Button onClick={() => setLocation("/exams")} className="bg-blue-600 hover:bg-blue-700">
                  ابدأ اختباراً
                </Button>
              </div>
            ) : (
              results.map((result) => (
                <div key={result.id} className="flex flex-col gap-4 rounded-lg border border-gray-200 p-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{result.lessons?.title ?? "اختبار"}</p>
                    <p className="text-sm text-gray-600">{formatArabicDate(result.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-bold text-blue-600">{result.percentage}%</p>
                    <Button onClick={() => setLocation(`/results/${result.id}`)} variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                      <Eye className="ml-2 h-4 w-4" />
                      عرض
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StateCard({ message, tone = "default" }: { message: string; tone?: "default" | "error" }) {
  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <Card className={tone === "error" ? "border-red-200 bg-red-50" : "border-blue-200"}>
          <CardContent className="py-10 text-center text-gray-700">{message}</CardContent>
        </Card>
      </div>
    </div>
  );
}
