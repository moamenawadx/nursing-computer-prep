import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ReactNode } from "react";

export interface AdminFormField {
  name: string;
  label: string;
  type?: "text" | "number" | "textarea" | "url" | "custom";
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  render?: () => ReactNode;
}

interface AdminFormProps {
  title: string;
  fields: AdminFormField[];
  onSubmit: () => void;
  onCancel?: () => void;
  submitLabel?: string;
  loading?: boolean;
  error?: string;
  children?: ReactNode;
}

export default function AdminForm({
  title,
  fields,
  onSubmit,
  onCancel,
  submitLabel = "حفظ",
  loading = false,
  error,
  children,
}: AdminFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <Card className="border-blue-200">
      <CardHeader>
        <CardTitle className="text-lg text-gray-900">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((field) => (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={field.name}>{field.label}</Label>
              {field.type === "custom" && field.render ? (
                field.render()
              ) : field.type === "textarea" ? (
                <Textarea
                  id={field.name}
                  value={String(field.value)}
                  onChange={(e) => field.onChange(e.target.value)}
                  placeholder={field.placeholder}
                  required={field.required}
                  rows={4}
                />
              ) : (
                <Input
                  id={field.name}
                  type={field.type ?? "text"}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  placeholder={field.placeholder}
                  required={field.required}
                />
              )}
            </div>
          ))}

          {children}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? "جاري الحفظ..." : submitLabel}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                إلغاء
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
