import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { ReactNode } from "react";

export interface AdminTableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
}

interface AdminTableProps<T> {
  columns: AdminTableColumn<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  emptyMessage?: string;
  loading?: boolean;
}

export default function AdminTable<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = "لا توجد بيانات.",
  loading = false,
}: AdminTableProps<T>) {
  if (loading) {
    return (
      <Card className="border-gray-200">
        <CardContent className="py-10 text-center text-gray-600">جاري التحميل...</CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card className="border-gray-200">
        <CardContent className="py-10 text-center text-gray-600">{emptyMessage}</CardContent>
      </Card>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            {columns.map((col) => (
              <th key={col.key} className={`px-4 py-3 text-right text-sm font-semibold text-gray-900 ${col.className ?? ""}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={keyExtractor(row)} className="border-b border-gray-100 hover:bg-gray-50">
              {columns.map((col) => (
                <td key={col.key} className={`px-4 py-3 text-sm text-gray-700 ${col.className ?? ""}`}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AdminTableActions({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap gap-2">{children}</div>;
}

export function AdminActionButton({
  children,
  onClick,
  variant = "outline",
  className = "",
}: {
  children: ReactNode;
  onClick: () => void;
  variant?: "outline" | "destructive" | "default";
  className?: string;
}) {
  return (
    <Button size="sm" variant={variant} onClick={onClick} className={className}>
      {children}
    </Button>
  );
}
