import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { getQuestionsByLesson, submitExam } from "@/services/examService";
import { getLessons } from "@/services/lessonService";
import type { ExamAnswer, Lesson, Question } from "@/types";
import { AlertCircle, CheckCircle2, Clock, Target } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";

export default function Exams() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getLessons()
      .then((data) => {
        setLessons(data);
        const lessonId = new URLSearchParams(window.location.search).get("lesson");
        const lesson = data.find((item) => item.id === lessonId);
        if (lesson) {
          startExam(lesson);
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : "تعذر تحميل الاختبارات."))
      .finally(() => setLoading(false));
  }, []);

  const question = questions[currentQuestion];
  const answeredCount = Object.keys(answers).length;
  const progress = questions.length ? (answeredCount / questions.length) * 100 : 0;

  const scorePreview = useMemo(
    () =>
      questions.reduce((score, item) => {
        return answers[item.id] === item.correct_answer ? score + 1 : score;
      }, 0),
    [answers, questions],
  );

  const startExam = async (lesson: Lesson) => {
    setError("");
    setLoading(true);
    try {
      const data = await getQuestionsByLesson(lesson.id);
      setSelectedLesson(lesson);
      setQuestions(data);
      setCurrentQuestion(0);
      setAnswers({});
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر تحميل أسئلة الدرس.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!user || !selectedLesson) return;
    setSubmitting(true);
    setError("");

    const examAnswers: ExamAnswer[] = questions.map((item) => {
      const selectedAnswer = answers[item.id] ?? "";
      return {
        questionId: item.id,
        selectedAnswer,
        correctAnswer: item.correct_answer,
        isCorrect: selectedAnswer === item.correct_answer,
      };
    });

    try {
      const result = await submitExam({
        userId: user.id,
        lessonId: selectedLesson.id,
        answers: examAnswers,
      });
      setLocation(`/results/${result.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر حفظ نتيجة الاختبار.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <StateCard message="جاري تحميل الاختبارات..." />;
  if (error && !selectedLesson) return <StateCard message={error} tone="error" />;

  if (!selectedLesson) {
    return (
      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <div className="mb-4 flex items-center gap-3">
              <Target className="h-8 w-8 text-blue-600" />
              <h1 className="text-4xl font-bold text-gray-900 md:text-5xl">الاختبارات</h1>
            </div>
            <p className="text-lg text-gray-600">اختر درساً لبدء اختبار مرتبط بأسئلته من قاعدة البيانات.</p>
          </div>

          {lessons.length === 0 ? (
            <StateCard message="لا توجد دروس متاحة للاختبار حالياً." />
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {lessons.map((lesson) => (
                <Card key={lesson.id} className="cursor-pointer border-blue-200 transition hover:border-blue-400" onClick={() => startExam(lesson)}>
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                    {lesson.week && <Badge className="mb-2 w-fit bg-blue-600 text-white">الأسبوع {lesson.week}</Badge>}
                    <CardTitle className="text-2xl">{lesson.title}</CardTitle>
                    <CardDescription>{lesson.description || "اختبار تدريبي على هذا الدرس"}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-6">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <span>{lesson.duration_minutes ?? 20} دقيقة تدريبية</span>
                    </div>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">ابدأ الاختبار</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="py-12">
        <div className="container mx-auto max-w-2xl px-4">
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-900">
                <AlertCircle className="h-5 w-5" />
                لا توجد أسئلة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">لم يتم إضافة أسئلة لهذا الدرس بعد.</p>
              <Button onClick={() => setSelectedLesson(null)} className="bg-blue-600 hover:bg-blue-700">
                العودة للاختبارات
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="container mx-auto max-w-2xl px-4">
        {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}
        <Card className="border-blue-200">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <CardTitle>{selectedLesson.title}</CardTitle>
                <CardDescription>السؤال {currentQuestion + 1} من {questions.length}</CardDescription>
              </div>
              <div className="text-center text-blue-600">
                <CheckCircle2 className="mx-auto mb-1 h-6 w-6" />
                <p className="text-2xl font-bold">{scorePreview}</p>
                <p className="text-xs">صحيح حالياً</p>
              </div>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="mt-2 text-sm text-gray-600">{answeredCount}/{questions.length} مجاب</p>
          </CardHeader>

          <CardContent className="pt-6">
            <div className="mb-8">
              <h2 className="mb-6 text-xl font-semibold text-gray-900">{question.text}</h2>
              <RadioGroup
                value={answers[question.id] || ""}
                onValueChange={(value) => setAnswers((current) => ({ ...current, [question.id]: value }))}
              >
                <div className="space-y-3">
                  {(question.type === "truefalse" ? ["true", "false"] : question.options).map((option) => (
                    <div key={option} className="flex items-center gap-3 rounded-lg border-2 border-gray-200 p-3 transition hover:border-blue-400">
                      <RadioGroupItem value={option} id={`option-${option}`} />
                      <Label htmlFor={`option-${option}`} className="flex-1 cursor-pointer">
                        {question.type === "truefalse" ? (option === "true" ? "صحيح" : "خطأ") : option}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" className="flex-1" onClick={() => setCurrentQuestion((value) => value - 1)} disabled={currentQuestion === 0}>
                السابق
              </Button>
              {currentQuestion === questions.length - 1 ? (
                <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={handleSubmit} disabled={submitting || answeredCount === 0}>
                  {submitting ? "جاري الحفظ..." : "إنهاء الاختبار"}
                </Button>
              ) : (
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={() => setCurrentQuestion((value) => value + 1)}>
                  التالي
                </Button>
              )}
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
