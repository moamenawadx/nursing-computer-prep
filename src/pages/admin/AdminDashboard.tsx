import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllCertificates } from "@/services/certificateService";
import { getAllExamResults } from "@/services/adminResultService";
import { getLessons } from "@/services/lessonService";
import { getAllQuestions } from "@/services/adminQuestionService";
import { BookOpen, ClipboardList, HelpCircle, LayoutDashboard, ShieldCheck, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [stats, setStats] = useState({ lessons: 0, questions: 0, results: 0, certificates: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getLessons(), getAllQuestions(), getAllExamResults(), getAllCertificates()])
      .then(([lessons, questions, results, certificates]) => {
        setStats({
          lessons: lessons.length,
          questions: questions.length,
          results: results.length,
          certificates: certificates.length,
        });
      })
      .catch((err) => setError(err instanceof Error ? err.message : "تعذر تحميل الإحصائيات."))
      .finally(() => setLoading(false));
  }, []);

  const links = [
    { label: "إدارة الدروس", href: "/admin/lessons", icon: BookOpen, desc: "إنشاء وتعديل الدروس والصور" },
    { label: "إدارة الأسئلة", href: "/admin/questions", icon: HelpCircle, desc: "إضافة وتعديل أسئلة الاختبارات" },
    { label: "نتائج الطلاب", href: "/admin/results", icon: ClipboardList, desc: "عرض وتصفية نتائج الاختبارات" },
  ];

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-indigo-600">
            <ShieldCheck className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">لوحة الإدارة</h1>
            <p className="text-gray-600">إدارة المحتوى والنتائج والشهادات</p>
          </div>
        </div>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="py-4 text-red-700">{error}</CardContent>
          </Card>
        )}

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
          <StatCard icon={BookOpen} label="الدروس" value={loading ? "..." : stats.lessons} />
          <StatCard icon={HelpCircle} label="الأسئلة" value={loading ? "..." : stats.questions} />
          <StatCard icon={ClipboardList} label="النتائج" value={loading ? "..." : stats.results} />
          <StatCard icon={Trophy} label="الشهادات" value={loading ? "..." : stats.certificates} />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <Card key={link.href} className="border-gray-200 transition hover:border-blue-300 hover:shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Icon className="h-5 w-5 text-blue-600" />
                    {link.label}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">{link.desc}</p>
                  <Button onClick={() => setLocation(link.href)} className="w-full bg-blue-600 hover:bg-blue-700">
                    <LayoutDashboard className="ml-2 h-4 w-4" />
                    فتح
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: typeof BookOpen; label: string; value: string | number }) {
  return (
    <Card className="border-gray-200">
      <CardContent className="flex items-center justify-between pt-6">
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
          <Icon className="h-6 w-6" />
        </div>
      </CardContent>
    </Card>
  );
}
