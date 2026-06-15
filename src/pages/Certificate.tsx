import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { getUserCertificates } from "@/services/certificateService";
import { getUserResults } from "@/services/examService";
import { getLessons } from "@/services/lessonService";
import type { Certificate, ExamResult, Lesson } from "@/types";
import { formatArabicDate } from "@/utils/format";
import { generateCertificatePDF } from "@/utils/generateCertificatePDF";
import { Award, Download, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

export default function Certificate() {
  const { profile, user } = useAuth();
  const [, setLocation] = useLocation();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    Promise.all([getLessons(), getUserResults(user.id), getUserCertificates(user.id)])
      .then(([lessonRows, resultRows, certRows]) => {
        setLessons(lessonRows);
        setResults(resultRows);
        setCertificates(certRows);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "تعذر تحميل بيانات الشهادة."))
      .finally(() => setLoading(false));
  }, [user]);

  const passedLessons = results.filter((r) => r.percentage >= 70);
  const studentName = profile?.full_name || user?.email || "الطالب";

  const handleDownload = (cert: Certificate) => {
    setDownloadingId(cert.id);
    try {
      generateCertificatePDF({
        studentName,
        lessonTitle: cert.lessons?.title ?? "اختبار",
        score: cert.score,
        issueDate: formatArabicDate(cert.issued_at),
        certificateNumber: cert.certificate_number,
      });
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) return <StateCard message="جاري تحميل الشهادات..." />;
  if (error) return <StateCard message={error} tone="error" />;

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
            <Award className="h-8 w-8 text-amber-600" />
          </div>
          <h1 className="mb-2 text-4xl font-bold text-gray-900">شهاداتي</h1>
          <p className="text-lg text-gray-600">الشهادات الصادرة لكل درس اجتزته بنجاح (70% فأكثر)</p>
        </div>

        {certificates.length > 0 ? (
          <div className="mx-auto grid max-w-4xl gap-4">
            {certificates.map((cert) => (
              <Card key={cert.id} className="border-amber-200">
                <CardContent className="flex flex-col items-start justify-between gap-4 pt-6 md:flex-row md:items-center">
                  <div>
                    <p className="text-lg font-bold text-gray-900">{cert.lessons?.title ?? "درس"}</p>
                    <p className="text-sm text-gray-600">
                      {cert.certificate_number} — {formatArabicDate(cert.issued_at)} — {cert.score}%
                    </p>
                  </div>
                  <Button
                    onClick={() => handleDownload(cert)}
                    disabled={downloadingId === cert.id}
                    className="bg-amber-600 hover:bg-amber-700"
                  >
                    {downloadingId === cert.id ? (
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="ml-2 h-4 w-4" />
                    )}
                    تحميل PDF
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="mx-auto max-w-2xl border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-yellow-900">لا توجد شهادات بعد</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                للحصول على شهادة، اجتز اختبار أي درس بنسبة 70% فأكثر ثم اضغط &quot;تحميل الشهادة&quot; من صفحة النتيجة.
              </p>
              {passedLessons.length > 0 && (
                <p className="text-sm text-amber-800">
                  لديك {passedLessons.length} اختبار ناجح — قم بتحميل الشهادة من صفحة النتيجة.
                </p>
              )}
              <Button onClick={() => setLocation("/exams")} className="w-full bg-blue-600 hover:bg-blue-700">
                الذهاب للاختبارات
              </Button>
            </CardContent>
          </Card>
        )}

        {lessons.length > 0 && certificates.length > 0 && (
          <p className="mt-8 text-center text-sm text-gray-500">
            {certificates.length} من {lessons.length} دروس لها شهادات
          </p>
        )}
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
