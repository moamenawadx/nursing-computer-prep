import AdminForm from "@/components/admin/AdminForm";
import AdminTable, { AdminActionButton, AdminTableActions } from "@/components/admin/AdminTable";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createQuestion, deleteQuestion, getAllQuestions, updateQuestion } from "@/services/adminQuestionService";
import { getLessons } from "@/services/lessonService";
import type { Lesson, Question, QuestionInput, QuestionType } from "@/types";
import { ArrowRight, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

const emptyForm = (lessonId: string): QuestionInput => ({
  lesson_id: lessonId,
  text: "",
  type: "mcq",
  options: ["", "", "", ""],
  correct_answer: "",
  explanation: "",
  order_index: 0,
});

export default function ManageQuestions() {
  const [, setLocation] = useLocation();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<QuestionInput>(emptyForm(""));
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Question | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    getLessons()
      .then((data) => {
        setLessons(data);
        if (data[0]) setSelectedLesson(data[0].id);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "تعذر تحميل الدروس."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedLesson) return;
    setLoading(true);
    getAllQuestions(selectedLesson)
      .then(setQuestions)
      .catch((err) => setError(err instanceof Error ? err.message : "تعذر تحميل الأسئلة."))
      .finally(() => setLoading(false));
  }, [selectedLesson]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm(selectedLesson));
    setFormError("");
    setShowForm(true);
  };

  const openEdit = (question: Question) => {
    setEditingId(question.id);
    setForm({
      lesson_id: question.lesson_id,
      text: question.text,
      type: question.type,
      options: question.options.length ? question.options : ["", "", "", ""],
      correct_answer: question.correct_answer,
      explanation: question.explanation ?? "",
      order_index: question.order_index ?? 0,
    });
    setFormError("");
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.text.trim()) {
      setFormError("نص السؤال مطلوب.");
      return;
    }
    if (!form.correct_answer.trim()) {
      setFormError("يجب تحديد الإجابة الصحيحة.");
      return;
    }

    setSaving(true);
    setFormError("");
    try {
      const payload: QuestionInput = {
        ...form,
        options: form.type === "truefalse" ? ["صح", "خطأ"] : form.options.filter((o) => o.trim()),
        order_index: Number(form.order_index ?? 0),
      };

      if (editingId) {
        await updateQuestion(editingId, payload);
      } else {
        await createQuestion(payload);
      }
      const updated = await getAllQuestions(selectedLesson);
      setQuestions(updated);
      setShowForm(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "تعذر حفظ السؤال.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteQuestion(deleteTarget.id);
      setQuestions((prev) => prev.filter((q) => q.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر حذف السؤال.");
    } finally {
      setDeleting(false);
    }
  };

  const updateOption = (index: number, value: string) => {
    const options = [...form.options];
    options[index] = value;
    setForm({ ...form, options });
  };

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => setLocation("/admin")} className="mb-2 text-blue-600">
            <ArrowRight className="ml-2 h-4 w-4" />
            العودة للوحة الإدارة
          </Button>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h1 className="text-3xl font-bold text-gray-900">إدارة الأسئلة</h1>
            <Button onClick={openCreate} disabled={!selectedLesson} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="ml-2 h-4 w-4" />
              سؤال جديد
            </Button>
          </div>
        </div>

        <div className="mb-6 max-w-sm space-y-2">
          <Label>اختر الدرس</Label>
          <Select value={selectedLesson} onValueChange={setSelectedLesson}>
            <SelectTrigger>
              <SelectValue placeholder="اختر درساً" />
            </SelectTrigger>
            <SelectContent>
              {lessons.map((lesson) => (
                <SelectItem key={lesson.id} value={lesson.id}>
                  {lesson.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {error && <p className="mb-4 text-red-600">{error}</p>}

        {showForm && (
          <div className="mb-8">
            <AdminForm
              title={editingId ? "تعديل السؤال" : "إضافة سؤال جديد"}
              fields={[
                { name: "text", label: "نص السؤال", type: "textarea", value: form.text, onChange: (v) => setForm({ ...form, text: v }), required: true },
                {
                  name: "type",
                  label: "نوع السؤال",
                  type: "custom",
                  value: form.type,
                  onChange: () => {},
                  render: () => (
                    <Select
                      value={form.type}
                      onValueChange={(v) =>
                        setForm({
                          ...form,
                          type: v as QuestionType,
                          options: v === "truefalse" ? ["صح", "خطأ"] : ["", "", "", ""],
                          correct_answer: "",
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mcq">اختيار من متعدد</SelectItem>
                        <SelectItem value="truefalse">صح / خطأ</SelectItem>
                      </SelectContent>
                    </Select>
                  ),
                },
                { name: "order_index", label: "ترتيب العرض", type: "number", value: form.order_index ?? 0, onChange: (v) => setForm({ ...form, order_index: Number(v) }) },
                { name: "explanation", label: "الشرح", type: "textarea", value: form.explanation ?? "", onChange: (v) => setForm({ ...form, explanation: v }) },
              ]}
              onSubmit={handleSave}
              onCancel={() => setShowForm(false)}
              loading={saving}
              error={formError}
            >
              <div className="space-y-3 border-t border-gray-200 pt-4">
                <Label>الخيارات</Label>
                {form.type === "mcq" ? (
                  form.options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correct"
                        checked={form.correct_answer === opt && opt !== ""}
                        onChange={() => setForm({ ...form, correct_answer: opt })}
                      />
                      <input
                        className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
                        value={opt}
                        onChange={(e) => updateOption(i, e.target.value)}
                        placeholder={`الخيار ${i + 1}`}
                      />
                    </div>
                  ))
                ) : (
                  <div className="flex gap-4">
                    {["صح", "خطأ"].map((opt) => (
                      <label key={opt} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="correct"
                          checked={form.correct_answer === opt}
                          onChange={() => setForm({ ...form, correct_answer: opt })}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </AdminForm>
          </div>
        )}

        <AdminTable
          loading={loading}
          data={questions}
          keyExtractor={(q) => q.id}
          emptyMessage="لا توجد أسئلة لهذا الدرس."
          columns={[
            { key: "text", header: "السؤال", render: (q) => <span className="line-clamp-2">{q.text}</span> },
            { key: "type", header: "النوع", render: (q) => (q.type === "mcq" ? "متعدد" : "صح/خطأ") },
            { key: "order", header: "الترتيب", render: (q) => q.order_index ?? 0 },
            { key: "answer", header: "الإجابة", render: (q) => q.correct_answer },
            {
              key: "actions",
              header: "إجراءات",
              render: (q) => (
                <AdminTableActions>
                  <AdminActionButton onClick={() => openEdit(q)}>
                    <Pencil className="ml-1 h-3 w-3" />
                    تعديل
                  </AdminActionButton>
                  <AdminActionButton variant="destructive" onClick={() => setDeleteTarget(q)}>
                    <Trash2 className="ml-1 h-3 w-3" />
                    حذف
                  </AdminActionButton>
                </AdminTableActions>
              ),
            },
          ]}
        />

        <ConfirmDialog
          open={!!deleteTarget}
          title="حذف السؤال"
          description="هل أنت متأكد من حذف هذا السؤال؟"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      </div>
    </div>
  );
}
