import AdminForm from "@/components/admin/AdminForm";
import AdminTable, { AdminActionButton, AdminTableActions } from "@/components/admin/AdminTable";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import ImageUploader from "@/components/admin/ImageUploader";
import { Button } from "@/components/ui/button";
import { createLesson, deleteLesson, updateLesson } from "@/services/adminLessonService";
import { deleteLessonImage, getLessonImages } from "@/services/lessonImageService";
import { getLessons } from "@/services/lessonService";
import type { Lesson, LessonImage, LessonInput } from "@/types";
import { ArrowRight, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

const emptyForm: LessonInput = {
  title: "",
  description: "",
  content: "",
  week: null,
  duration_minutes: null,
  order_index: 0,
  video_url: "",
  objectives: [],
  practical_tasks: [],
  key_points: [],
  examples: [],
};

export default function ManageLessons() {
  const [, setLocation] = useLocation();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<LessonInput>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Lesson | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [images, setImages] = useState<LessonImage[]>([]);
  const [imageDeleteTarget, setImageDeleteTarget] = useState<LessonImage | null>(null);

  const loadLessons = () => {
    setLoading(true);
    getLessons()
      .then(setLessons)
      .catch((err) => setError(err instanceof Error ? err.message : "تعذر تحميل الدروس."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadLessons();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setImages([]);
    setFormError("");
    setShowForm(true);
  };

  const openEdit = async (lesson: Lesson) => {
    setEditingId(lesson.id);
    setForm({
      title: lesson.title,
      description: lesson.description ?? "",
      content: lesson.content ?? "",
      week: lesson.week,
      duration_minutes: lesson.duration_minutes,
      order_index: lesson.order_index ?? 0,
      video_url: lesson.video_url ?? "",
      objectives: lesson.objectives,
      practical_tasks: lesson.practical_tasks,
      key_points: lesson.key_points,
      examples: lesson.examples,
    });
    setFormError("");
    setShowForm(true);
    try {
      const imgs = await getLessonImages(lesson.id);
      setImages(imgs);
    } catch {
      setImages([]);
    }
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      setFormError("عنوان الدرس مطلوب.");
      return;
    }

    setSaving(true);
    setFormError("");
    try {
      const payload: LessonInput = {
        ...form,
        week: form.week ? Number(form.week) : null,
        duration_minutes: form.duration_minutes ? Number(form.duration_minutes) : null,
        order_index: form.order_index !== null && form.order_index !== undefined ? Number(form.order_index) : 0,
        video_url: form.video_url?.trim() || null,
        objectives: form.objectives ?? [],
        practical_tasks: form.practical_tasks ?? [],
        key_points: form.key_points ?? [],
        examples: form.examples ?? [],
      };

      if (editingId) {
        await updateLesson(editingId, payload);
        setShowForm(false);
      } else {
        const created = await createLesson(payload);
        setEditingId(created.id);
        setImages([]);
      }
      loadLessons();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "تعذر حفظ الدرس.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteLesson(deleteTarget.id);
      setDeleteTarget(null);
      loadLessons();
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر حذف الدرس.");
    } finally {
      setDeleting(false);
    }
  };

  const handleImageDelete = async () => {
    if (!imageDeleteTarget) return;
    setDeleting(true);
    try {
      await deleteLessonImage(imageDeleteTarget);
      setImages((prev) => prev.filter((img) => img.id !== imageDeleteTarget.id));
      setImageDeleteTarget(null);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "تعذر حذف الصورة.");
    } finally {
      setDeleting(false);
    }
  };

  const listFields = [
    { name: "objectives", label: "الأهداف (سطر لكل هدف)", key: "objectives" as const },
    { name: "key_points", label: "النقاط الرئيسية (سطر لكل نقطة)", key: "key_points" as const },
    { name: "practical_tasks", label: "المهام العملية (سطر لكل مهمة)", key: "practical_tasks" as const },
  ];

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Button variant="ghost" onClick={() => setLocation("/admin")} className="mb-2 text-blue-600">
              <ArrowRight className="ml-2 h-4 w-4" />
              العودة للوحة الإدارة
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">إدارة الدروس</h1>
          </div>
          <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="ml-2 h-4 w-4" />
            درس جديد
          </Button>
        </div>

        {error && <p className="mb-4 text-red-600">{error}</p>}

        {showForm && (
          <div className="mb-8">
            <AdminForm
              title={editingId ? "تعديل الدرس" : "إنشاء درس جديد"}
              fields={[
                { name: "title", label: "العنوان", value: form.title, onChange: (v) => setForm({ ...form, title: v }), required: true },
                { name: "description", label: "الوصف", type: "textarea", value: form.description ?? "", onChange: (v) => setForm({ ...form, description: v }) },
                { name: "content", label: "المحتوى", type: "textarea", value: form.content ?? "", onChange: (v) => setForm({ ...form, content: v }) },
                { name: "week", label: "الأسبوع", type: "number", value: form.week ?? "", onChange: (v) => setForm({ ...form, week: v ? Number(v) : null }) },
                { name: "duration_minutes", label: "المدة (دقيقة)", type: "number", value: form.duration_minutes ?? "", onChange: (v) => setForm({ ...form, duration_minutes: v ? Number(v) : null }) },
                { name: "order_index", label: "ترتيب العرض", type: "number", value: form.order_index ?? 0, onChange: (v) => setForm({ ...form, order_index: Number(v) }) },
                { name: "video_url", label: "رابط الفيديو الخارجي", type: "url", value: form.video_url ?? "", onChange: (v) => setForm({ ...form, video_url: v }), placeholder: "https://..." },
                ...listFields.map((f) => ({
                  name: f.name,
                  label: f.label,
                  type: "textarea" as const,
                  value: (form[f.key] ?? []).join("\n"),
                  onChange: (v: string) => setForm({ ...form, [f.key]: v.split("\n").filter(Boolean) }),
                })),
              ]}
              onSubmit={handleSave}
              onCancel={() => setShowForm(false)}
              loading={saving}
              error={formError}
            >
              {editingId && (
                <div className="space-y-2 border-t border-gray-200 pt-4">
                  <p className="font-medium text-gray-900">صور الدرس</p>
                  <ImageUploader
                    lessonId={editingId}
                    images={images}
                    onUploaded={(img) => setImages((prev) => [...prev, img])}
                    onDeleted={(id) => setImages((prev) => prev.filter((i) => i.id !== id))}
                    onDeleteRequest={setImageDeleteTarget}
                  />
                </div>
              )}
            </AdminForm>
          </div>
        )}

        <AdminTable
          loading={loading}
          data={lessons}
          keyExtractor={(l) => l.id}
          emptyMessage="لا توجد دروس. أنشئ أول درس."
          columns={[
            { key: "title", header: "العنوان", render: (l) => l.title },
            { key: "week", header: "الأسبوع", render: (l) => l.week ?? "—" },
            { key: "order", header: "الترتيب", render: (l) => l.order_index ?? 0 },
            { key: "video", header: "فيديو", render: (l) => (l.video_url ? "✓" : "—") },
            {
              key: "actions",
              header: "إجراءات",
              render: (l) => (
                <AdminTableActions>
                  <AdminActionButton onClick={() => openEdit(l)}>
                    <Pencil className="ml-1 h-3 w-3" />
                    تعديل
                  </AdminActionButton>
                  <AdminActionButton variant="destructive" onClick={() => setDeleteTarget(l)}>
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
          title="حذف الدرس"
          description={`هل أنت متأكد من حذف "${deleteTarget?.title}"؟ سيتم حذف الأسئلة والصور المرتبطة.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />

        <ConfirmDialog
          open={!!imageDeleteTarget}
          title="حذف الصورة"
          description="هل أنت متأكد من حذف هذه الصورة؟"
          onConfirm={handleImageDelete}
          onCancel={() => setImageDeleteTarget(null)}
          loading={deleting}
        />
      </div>
    </div>
  );
}
