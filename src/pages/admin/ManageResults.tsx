import AdminTable from "@/components/admin/AdminTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAllExamResults, getAllProfiles } from "@/services/adminResultService";
import { getLessons } from "@/services/lessonService";
import type { AdminResultFilters, ExamResult, Lesson } from "@/types";
import { formatArabicDate } from "@/utils/format";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

export default function ManageResults() {
  const [, setLocation] = useLocation();
  const [results, setResults] = useState<ExamResult[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [profiles, setProfiles] = useState<{ id: string; full_name: string | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState<AdminResultFilters>({
    sortBy: "date",
    sortOrder: "desc",
  });

  const loadResults = (currentFilters: AdminResultFilters) => {
    setLoading(true);
    getAllExamResults(currentFilters)
      .then(setResults)
      .catch((err) => setError(err instanceof Error ? err.message : "تعذر تحميل النتائج."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    Promise.all([getLessons(), getAllProfiles()])
      .then(([lessonData, profileData]) => {
        setLessons(lessonData);
        setProfiles(profileData);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "تعذر تحميل البيانات."));
  }, []);

  useEffect(() => {
    loadResults(filters);
  }, [filters]);

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => setLocation("/admin")} className="mb-2 text-blue-600">
            <ArrowRight className="ml-2 h-4 w-4" />
            العودة للوحة الإدارة
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">نتائج الطلاب</h1>
        </div>

        {error && <p className="mb-4 text-red-600">{error}</p>}

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <Label>تصفية حسب الدرس</Label>
            <Select
              value={filters.lessonId ?? "all"}
              onValueChange={(v) => setFilters({ ...filters, lessonId: v === "all" ? undefined : v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="كل الدروس" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الدروس</SelectItem>
                {lessons.map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    {l.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>تصفية حسب الطالب</Label>
            <Select
              value={filters.userId ?? "all"}
              onValueChange={(v) => setFilters({ ...filters, userId: v === "all" ? undefined : v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="كل الطلاب" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الطلاب</SelectItem>
                {profiles.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.full_name ?? p.id.slice(0, 8)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>ترتيب حسب</Label>
            <Select
              value={filters.sortBy ?? "date"}
              onValueChange={(v) => setFilters({ ...filters, sortBy: v as AdminResultFilters["sortBy"] })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">التاريخ</SelectItem>
                <SelectItem value="score">الدرجة</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>الاتجاه</Label>
            <Select
              value={filters.sortOrder ?? "desc"}
              onValueChange={(v) => setFilters({ ...filters, sortOrder: v as AdminResultFilters["sortOrder"] })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">تنازلي</SelectItem>
                <SelectItem value="asc">تصاعدي</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <AdminTable
          loading={loading}
          data={results}
          keyExtractor={(r) => r.id}
          emptyMessage="لا توجد نتائج مطابقة."
          columns={[
            { key: "student", header: "الطالب", render: (r) => r.profiles?.full_name ?? r.user_id.slice(0, 8) },
            { key: "lesson", header: "الدرس", render: (r) => r.lessons?.title ?? "—" },
            { key: "score", header: "الدرجة", render: (r) => `${r.score}/${r.total_questions}` },
            {
              key: "percentage",
              header: "النسبة",
              render: (r) => (
                <Badge className={r.percentage >= 70 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                  {r.percentage}%
                </Badge>
              ),
            },
            { key: "date", header: "التاريخ", render: (r) => formatArabicDate(r.created_at) },
          ]}
        />
      </div>
    </div>
  );
}
