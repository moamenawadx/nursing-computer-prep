import { Button } from "@/components/ui/button";
import { useNotification } from "@/components/NotificationSystem";
import { uploadLessonImage } from "@/services/lessonImageService";
import type { LessonImage } from "@/types";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { useRef, useState } from "react";

interface ImageUploaderProps {
  lessonId: string;
  images: LessonImage[];
  onUploaded: (image: LessonImage) => void;
  onDeleted: (imageId: string) => void;
  onDeleteRequest: (image: LessonImage) => void;
}

export default function ImageUploader({
  lessonId,
  images,
  onUploaded,
  onDeleteRequest,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const notify = useNotification();
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      notify({
        type: "error",
        title: "خطأ في الرفع",
        message: "يرجى اختيار ملف صورة صالح.",
      });
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);
    setUploading(true);

    try {
      const image = await uploadLessonImage(lessonId, file);
      onUploaded(image);
      notify({
        type: "success",
        title: "تم الرفع",
        message: "تم رفع الصورة بنجاح.",
      });
    } catch (err) {
      notify({
        type: "error",
        title: "فشل الرفع",
        message: err instanceof Error ? err.message : "تعذر رفع الصورة.",
      });
    } finally {
      setUploading(false);
      setPreviewUrl(null);
      URL.revokeObjectURL(localPreview);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const displayImages = previewUrl
    ? [...images, { id: "preview", lesson_id: lessonId, image_url: previewUrl }]
    : images;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={uploading}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="border-blue-200 text-blue-600"
        >
          {uploading ? (
            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
          ) : (
            <ImagePlus className="ml-2 h-4 w-4" />
          )}
          {uploading ? "جاري الرفع..." : "رفع صورة"}
        </Button>
      </div>

      {displayImages.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {displayImages.map((image) => {
            const isPreview = image.id === "preview";
            return (
              <div
                key={image.id}
                className={`group relative overflow-hidden rounded-lg border border-gray-200 ${isPreview ? "opacity-70" : ""}`}
              >
                <img src={image.image_url} alt="" className="h-32 w-full object-cover" />
                {isPreview ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                  </div>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    className="absolute left-2 top-2 opacity-0 transition group-hover:opacity-100"
                    onClick={() => onDeleteRequest(image)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-gray-500">لا توجد صور مرفوعة لهذا الدرس.</p>
      )}
    </div>
  );
}
