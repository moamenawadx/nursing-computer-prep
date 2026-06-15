import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getLessons } from "@/services/lessonService";
import type { Lesson } from "@/types";
import { toEmbedVideoUrl } from "@/utils/video";
import { BookOpen, ChevronDown, ChevronUp, Code, Lightbulb, Target } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";

const TAB_GRID_COLS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
};

export default function Lessons() {
  const [, setLocation] = useLocation();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<number | "all">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getLessons()
      .then((data) => {
        setLessons(data);
        setExpandedLesson(data[0]?.id ?? null);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "تعذر تحميل الدروس."))
      .finally(() => setLoading(false));
  }, []);

  const weeks = useMemo(
    () => Array.from(new Set(lessons.map((lesson) => lesson.week).filter((week): week is number => typeof week === "number"))),
    [lessons],
  );

  const filteredLessons = selectedWeek === "all" ? lessons : lessons.filter((lesson) => lesson.week === selectedWeek);

  if (loading) return <StateCard message="جاري تحميل الدروس..." />;
  if (error) return <StateCard message={error} tone="error" />;

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <div className="mb-10">
          <div className="mb-4 flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900 md:text-5xl">الدروس التفصيلية</h1>
          </div>
          <p className="text-lg text-gray-600">شروحات مبسطة وأمثلة عملية لجميع موضوعات منهج الحاسب الآلي</p>
        </div>

        <div className="mb-8 flex flex-wrap gap-3">
          <Button
            onClick={() => setSelectedWeek("all")}
            variant={selectedWeek === "all" ? "default" : "outline"}
            className={selectedWeek === "all" ? "bg-blue-600 text-white" : "border-blue-200 text-blue-600"}
          >
            كل الأسابيع
          </Button>
          {weeks.map((week) => (
            <Button
              key={week}
              onClick={() => setSelectedWeek(week)}
              variant={selectedWeek === week ? "default" : "outline"}
              className={selectedWeek === week ? "bg-blue-600 text-white" : "border-blue-200 text-blue-600"}
            >
              الأسبوع {week}
            </Button>
          ))}
        </div>

        {filteredLessons.length === 0 ? (
          <StateCard message="لا توجد دروس منشورة حالياً." />
        ) : (
          <div className="space-y-6">
            {filteredLessons.map((lesson) => {
              const isExpanded = expandedLesson === lesson.id;
              return (
                <Card key={lesson.id} className="border-blue-200 transition hover:border-blue-400">
                  <CardHeader
                    className="cursor-pointer bg-gradient-to-r from-blue-50 to-indigo-50"
                    onClick={() => setExpandedLesson(isExpanded ? null : lesson.id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          {lesson.week && <Badge className="bg-blue-600 text-white">الأسبوع {lesson.week}</Badge>}
                          {lesson.duration_minutes && <span className="text-sm text-gray-600">{lesson.duration_minutes} دقيقة</span>}
                        </div>
                        <CardTitle className="text-2xl">{lesson.title}</CardTitle>
                        {lesson.description && <p className="mt-2 text-gray-600">{lesson.description}</p>}
                      </div>
                      {isExpanded ? <ChevronUp className="h-6 w-6 text-blue-600" /> : <ChevronDown className="h-6 w-6 text-blue-600" />}
                    </div>
                  </CardHeader>

                  {isExpanded && <LessonContent lesson={lesson} onStartExam={() => setLocation(`/exams?lesson=${lesson.id}`)} />}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function LessonContent({ lesson, onStartExam }: { lesson: Lesson; onStartExam: () => void }) {
  const tabs = useMemo(() => {
    const items = [{ value: "content", label: "المحتوى" }];
    if (lesson.examples.length > 0) items.push({ value: "examples", label: "أمثلة" });
    if (lesson.practical_tasks.length > 0) items.push({ value: "tasks", label: "تطبيقات" });
    if (lesson.key_points.length > 0) items.push({ value: "points", label: "نقاط رئيسية" });
    return items;
  }, [lesson.examples.length, lesson.practical_tasks.length, lesson.key_points.length]);

  const gridCols = TAB_GRID_COLS[tabs.length] ?? "grid-cols-4";

  return (
    <CardContent className="pt-6">
      <Tabs defaultValue="content" className="w-full">
        <TabsList className={`grid w-full ${gridCols}`}>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="content" className="space-y-5">
          {lesson.objectives.length > 0 && (
            <ListBlock title="أهداف التعلم" icon={Target} items={lesson.objectives} />
          )}
          <div className="border-t pt-4">
            <h3 className="mb-3 text-lg font-semibold text-gray-900">المحتوى</h3>
            <p className="whitespace-pre-wrap leading-relaxed text-gray-700">
              {lesson.content || "لم يتم إضافة محتوى لهذا الدرس بعد."}
            </p>
          </div>
          {lesson.video_url && <LessonVideo url={lesson.video_url} />}
          <LessonImages images={lesson.images} />
        </TabsContent>

        {lesson.examples.length > 0 && (
          <TabsContent value="examples" className="space-y-4">
            {lesson.examples.map((example, index) => (
              <Card key={`${example.title}-${index}`} className="border-blue-100 bg-blue-50">
                <CardContent className="pt-6">
                  <div className="flex gap-3">
                    <Lightbulb className="mt-1 h-5 w-5 shrink-0 text-yellow-500" />
                    <div>
                      <h4 className="mb-2 font-semibold text-gray-900">{example.title}</h4>
                      <p className="text-gray-700">{example.description}</p>
                      {example.code && (
                        <pre className="mt-3 overflow-x-auto rounded bg-gray-900 p-3 text-sm text-green-400">{example.code}</pre>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        )}

        {lesson.practical_tasks.length > 0 && (
          <TabsContent value="tasks">
            <ListBlock title="تطبيقات عملية" icon={Code} items={lesson.practical_tasks} />
          </TabsContent>
        )}

        {lesson.key_points.length > 0 && (
          <TabsContent value="points">
            <ListBlock title="النقاط الرئيسية" icon={BookOpen} items={lesson.key_points} />
          </TabsContent>
        )}
      </Tabs>

      <Button onClick={onStartExam} className="mt-6 bg-blue-600 hover:bg-blue-700">
        ابدأ اختبار هذا الدرس
      </Button>
    </CardContent>
  );
}

function LessonVideo({ url }: { url: string }) {
  const embedUrl = toEmbedVideoUrl(url);

  return (
    <div className="border-t pt-4">
      <h3 className="mb-3 text-lg font-semibold text-gray-900">فيديو الدرس</h3>
      <div className="aspect-video w-full overflow-hidden rounded-lg border border-blue-200 bg-black">
        <iframe
          src={embedUrl}
          title="فيديو الدرس"
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}

function LessonImages({ images }: { images: Lesson["images"] }) {
  if (images.length === 0) return null;

  return (
    <div className="border-t pt-4">
      <h3 className="mb-3 text-lg font-semibold text-gray-900">صور الدرس</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((image) => (
          <div key={image.id} className="overflow-hidden rounded-lg border border-blue-100 bg-white">
            <img
              src={image.image_url}
              alt=""
              className="h-48 w-full object-cover"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function ListBlock({
  icon: Icon,
  items,
  title,
}: {
  icon: typeof BookOpen;
  items: string[];
  title: string;
}) {
  return (
    <div>
      <h3 className="mb-3 text-lg font-semibold text-gray-900">{title}</h3>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={`${title}-${index}`} className="flex items-start gap-3 rounded-lg border border-blue-100 bg-blue-50 p-4">
            <Icon className="mt-1 h-5 w-5 shrink-0 text-blue-600" />
            <p className="text-gray-700">{item}</p>
          </div>
        ))}
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
