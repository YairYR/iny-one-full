import type React from "react";
import type { UserUrl } from "@/features/dashboard/types/types";

export type SearchField = "all" | "short" | "name" | "destination";

export interface LinksTableProps {
  links: UserUrl[];
  total: number;
  page: number;
  totalPages: number;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  onOpen?: (link: UserUrl) => void;
  onEdit: (link: UserUrl) => void;
  onQr?: (link: UserUrl) => void;
  permissions?: {
    canEdit: boolean;
    canViewStats: boolean;
  };
  readOnlyReason?: string;
  badge?: React.ReactNode;
}
