import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { getExamResult } from "@/services/examService";
import { issueCertificate } from "@/services/certificateService";
import type { ExamResult } from "@/types";
import { formatArabicDate } from "@/utils/format";
import { generateCertificatePDF } from "@/utils/generateCertificatePDF";
import { Award, CheckCircle2, Download, Loader2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

export default function Result({ resultId }: { resultId: string }) {
  const { profile, user } = useAuth();
  const [, setLocation] = useLocation();
  const [result, setResult] = useState<ExamResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [certError, setCertError] = useState("");

  useEffect(() => {
    getExamResult(resultId)
      .then(setResult)
      .catch((err) => setError(err instanceof Error ? err.message : "تعذر تحميل النتيجة."))
      .finally(() => setLoading(false));
  }, [resultId]);

  const handleDownloadCertificate = async () => {
    if (!result || !user) return;

    setDownloading(true);
    setCertError("");
    try {
      const certificate = await issueCertificate({
        userId: user.id,
        lessonId: result.lesson_id,
        score: result.percentage,
      });

      generateCertificatePDF({
        studentName: profile?.full_name || user.email || "الطالب",
        lessonTitle: result.lessons?.title ?? "اختبار",
        score: certificate.score,
        issueDate: formatArabicDate(certificate.issued_at),
        certificateNumber: certificate.certificate_number,
      });
    } catch (err) {
      setCertError(err instanceof Error ? err.message : "تعذر إصدار الشهادة.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <StateCard message="جاري تحميل النتيجة..." />;
  if (error) return <StateCard message={error} tone="error" />;
  if (!result) return <StateCard message="لم يتم العثور على النتيجة." tone="error" />;

  const passed = result.percentage >= 70;

  return (
    <div className="py-12">
      <div className="container mx-auto max-w-3xl px-4">
        <Card className="border-blue-200">
          <CardHeader className={passed ? "bg-green-50" : "bg-red-50"}>
            <CardTitle className={`flex items-center gap-3 text-3xl ${passed ? "text-green-900" : "text-red-900"}`}>
              <Award className="h-8 w-8" />
              {passed ? "نتيجة ممتازة" : "حاول مرة أخرى"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="mb-8 text-center">
              <div className="mb-2 text-6xl font-bold text-blue-600">{result.percentage}%</div>
              <div className="mb-3 text-2xl text-gray-900">
                {result.score} من {result.total_questions} إجابات صحيحة
              </div>
              <p className="text-gray-600">{result.lessons?.title ?? "اختبار"} - {formatArabicDate(result.created_at)}</p>
            </div>

            {passed && (
              <div className="mb-8 rounded-lg border border-green-200 bg-green-50 p-4 text-center">
                <p className="mb-3 text-green-800">مبروك! لقد اجتزت الاختبار بنجاح.</p>
                <Button
                  onClick={handleDownloadCertificate}
                  disabled={downloading}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  {downloading ? (
                    <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                  ) : (
                    <Download className="ml-2 h-5 w-5" />
                  )}
                  تحميل الشهادة
                </Button>
                {certError && <p className="mt-2 text-sm text-red-600">{certError}</p>}
              </div>
            )}

            <div className="mb-8 space-y-4">
              {result.answers.map((answer, index) => (
                <div key={answer.questionId} className={`rounded-lg border-2 p-4 ${answer.isCorrect ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
                  <div className="flex items-start gap-3">
                    {answer.isCorrect ? <CheckCircle2 className="mt-1 h-5 w-5 text-green-600" /> : <XCircle className="mt-1 h-5 w-5 text-red-600" />}
                    <div className="flex-1">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <p className="font-semibold text-gray-900">السؤال {index + 1}</p>
                        <Badge className={answer.isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                          {answer.isCorrect ? "صحيح" : "خطأ"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700">إجابتك: {answer.selectedAnswer || "لم تجب"}</p>
                      {!answer.isCorrect && <p className="text-sm text-green-700">الإجابة الصحيحة: {answer.correctAnswer}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Button onClick={() => setLocation("/dashboard")} variant="outline">
                لوحة التحكم
              </Button>
              <Button onClick={() => setLocation("/certificate")} variant="outline" className="border-amber-600 text-amber-600 hover:bg-amber-50">
                شهاداتي
              </Button>
              <Button onClick={() => setLocation("/exams")} className="bg-blue-600 hover:bg-blue-700">
                اختبار آخر
              </Button>
            </div>
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
