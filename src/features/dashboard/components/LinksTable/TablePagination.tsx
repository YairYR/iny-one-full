import { Button } from "@headlessui/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  page: number;
  totalPages: number;
  status: string;
  previous: string;
  next: string;
  label: string;
  disabled?: boolean;
  onPageChange: (page: number) => void;
}

export function TablePagination({ page, totalPages, status, previous, next, label, disabled = false, onPageChange }: Readonly<Props>) {
  if (totalPages <= 1) return null;
  return (
    <nav className="flex items-center justify-between gap-3 border-t border-gray-200 px-4 py-3 text-sm" aria-label={label}>
      <span className="text-gray-500">{status}</span>
      <div className="flex items-center gap-1.5">
        <Button
          type="button"
          disabled={disabled || page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label={previous}
          className="inline-flex h-9 items-center gap-1 rounded-md border border-gray-300 bg-surface px-2.5 text-gray-700 enabled:cursor-pointer enabled:hover:border-indigo-300 enabled:hover:bg-indigo-50 enabled:hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={16} aria-hidden="true" />
          <span className="hidden sm:inline">{previous}</span>
        </Button>
        <Button
          type="button"
          disabled={disabled || page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label={next}
          className="inline-flex h-9 items-center gap-1 rounded-md border border-gray-300 bg-surface px-2.5 text-gray-700 enabled:cursor-pointer enabled:hover:border-indigo-300 enabled:hover:bg-indigo-50 enabled:hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span className="hidden sm:inline">{next}</span>
          <ChevronRight size={16} aria-hidden="true" />
        </Button>
      </div>
    </nav>
  );
}
