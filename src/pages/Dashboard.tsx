import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { getLessons } from "@/services/lessonService";
import { getUserResults } from "@/services/examService";
import type { ExamResult, Lesson } from "@/types";
import { formatArabicDate } from "@/utils/format";
import { Award, BarChart3, BookOpen, ShieldCheck, Target, TrendingUp, User } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";

export default function Dashboard() {
  const { profile, user } = useAuth();
  const [, setLocation] = useLocation();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    Promise.all([getLessons(), getUserResults(user.id)])
      .then(([lessonRows, resultRows]) => {
        setLessons(lessonRows);
        setResults(resultRows);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "تعذر تحميل لوحة التحكم."))
      .finally(() => setLoading(false));
  }, [user]);

  const averageScore = useMemo(() => {
    if (results.length === 0) return 0;
    return Math.round(results.reduce((sum, result) => sum + result.percentage, 0) / results.length);
  }, [results]);

  const passedResults = results.filter((result) => result.percentage >= 70).length;
  const displayName = profile?.full_name || user?.email || "الطالب";
  const isAdmin = profile?.role === "admin";

  if (loading) {
    return <PageState message="جاري تحميل لوحة التحكم..." />;
  }

  if (error) {
    return <PageState message={error} tone="error" />;
  }

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-blue-600">
              {isAdmin ? <ShieldCheck className="h-8 w-8 text-white" /> : <User className="h-8 w-8 text-white" />}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">لوحة التحكم</h1>
              <p className="text-gray-600">مرحباً {displayName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <Button onClick={() => setLocation("/admin")} className="bg-indigo-600 hover:bg-indigo-700">
                <ShieldCheck className="ml-2 h-4 w-4" />
                لوحة الإدارة
              </Button>
            )}
            <Badge className={isAdmin ? "bg-indigo-100 text-indigo-800" : "bg-green-100 text-green-800"}>
              {isAdmin ? "Admin" : "Student"}
            </Badge>
          </div>
        </div>

        <StudentDashboard
          averageScore={averageScore}
          lessons={lessons}
          passedResults={passedResults}
          results={results}
          setLocation={setLocation}
        />
      </div>
    </div>
  );
}

function StudentDashboard({
  averageScore,
  lessons,
  passedResults,
  results,
  setLocation,
}: {
  averageScore: number;
  lessons: Lesson[];
  passedResults: number;
  results: ExamResult[];
  setLocation: (path: string) => void;
}) {
  const stats = [
    { label: "محاولات مكتملة", value: results.length, icon: BarChart3, color: "bg-blue-50 text-blue-600" },
    { label: "نتائج ناجحة", value: passedResults, icon: Award, color: "bg-green-50 text-green-600" },
    { label: "متوسط الدرجات", value: `${averageScore}%`, icon: TrendingUp, color: "bg-indigo-50 text-indigo-600" },
  ];

  return (
    <div className="space-y-8">
      <StatsGrid stats={stats} />
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-semibold text-gray-900">التقدم العام</p>
            <p className="text-sm text-gray-600">{results.length} من {lessons.length} دروس</p>
          </div>
          <Progress value={lessons.length ? (results.length / lessons.length) * 100 : 0} className="h-3" />
        </CardContent>
      </Card>
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle>نتائجك</CardTitle>
        </CardHeader>
        <CardContent>
          <ResultsTable results={results} />
          {results.length === 0 && (
            <Button onClick={() => setLocation("/exams")} className="mt-4 bg-blue-600 hover:bg-blue-700">
              ابدأ أول اختبار
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatsGrid({ stats }: { stats: { label: string; value: string | number; icon: typeof BookOpen; color: string }[] }) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="border-gray-200">
            <CardContent className="flex items-center justify-between pt-6">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`rounded-lg p-3 ${stat.color}`}>
                <Icon className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function ResultsTable({ results }: { results: ExamResult[] }) {
  if (results.length === 0) {
    return <p className="py-6 text-center text-gray-600">لا توجد نتائج بعد.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-gray-200">
            <th className="px-4 py-3 text-right font-semibold text-gray-900">الدرس</th>
            <th className="px-4 py-3 text-right font-semibold text-gray-900">الدرجة</th>
            <th className="px-4 py-3 text-right font-semibold text-gray-900">النسبة</th>
            <th className="px-4 py-3 text-right font-semibold text-gray-900">التاريخ</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result) => (
            <tr key={result.id} className="border-b border-gray-200 hover:bg-gray-50">
              <td className="px-4 py-3 text-gray-900">{result.lessons?.title ?? "اختبار"}</td>
              <td className="px-4 py-3 font-semibold text-gray-900">{result.score}/{result.total_questions}</td>
              <td className="px-4 py-3">
                <Badge className={result.percentage >= 70 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                  {result.percentage}%
                </Badge>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">{formatArabicDate(result.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PageState({ message, tone = "default" }: { message: string; tone?: "default" | "error" }) {
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
