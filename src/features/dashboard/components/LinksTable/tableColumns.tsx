import type { ColumnDef } from "@tanstack/react-table";
import type { useFormatter } from "next-intl";
import type { UserUrl } from "@/features/dashboard/types/types";

type Formatter = ReturnType<typeof useFormatter>;

export function buildLinkColumns(
  t: (key: string) => string,
  format: Formatter,
  collator: Intl.Collator,
): ColumnDef<UserUrl>[] {
  return [
    {
      id: "short",
      accessorFn: (link) => link.slug,
      header: t("table.links.headers.short"),
      cell: ({ getValue }) => <SpanShortLink hostname="iny.one" slug={getValue<string>()} />,
      size: 160,
      minSize: 150,
      maxSize: 340,
      sortingFn: (a, b, id) => collator.compare(a.getValue(id), b.getValue(id)),
    },
    {
      id: "name",
      accessorFn: (link) => link.alias ?? undefined,
      header: t("table.links.headers.name"),
      cell: ({ getValue }) => getValue<string | undefined>() ?? "—",
      size: 160,
      minSize: 100,
      maxSize: 400,
      sortUndefined: "last",
      sortingFn: (a, b, id) => collator.compare(a.getValue(id), b.getValue(id)),
    },
    {
      id: "destination",
      accessorKey: "destination",
      header: t("table.links.headers.destination"),
      size: 300,
      minSize: 120,
      maxSize: 600,
      sortingFn: (a, b, id) => collator.compare(a.getValue(id), b.getValue(id)),
    },
    {
      id: "clicks",
      accessorFn: (link) => link.clicks ?? undefined,
      header: t("table.links.headers.clicks"),
      cell: ({ getValue }) => {
        const value = getValue<number | undefined>();
        return value === undefined ? t("noData") : format.number(value);
      },
      size: 110,
      minSize: 90,
      maxSize: 220,
      sortUndefined: "last",
      sortingFn: "basic",
    },
    {
      id: "created",
      accessorFn: (link) => Date.parse(link.created_at),
      header: t("table.links.headers.created"),
      cell: ({ getValue }) => format.dateTime(new Date(getValue<number>()), {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "UTC",
      }),
      size: 190,
      minSize: 140,
      maxSize: 300,
    },
    {
      id: "actions",
      header: t("table.links.headers.actions"),
      cell: () => null,
      size: 64,
      minSize: 64,
      maxSize: 64,
      enableSorting: false,
      enableResizing: false,
    },
  ];
}

function SpanShortLink({ hostname, slug }: Readonly<{ hostname: string; slug: string }>) {
  return (
    <p className="text-sm text-gray-900">
      <span className="hidden text-xs text-gray-500 md:block">{hostname}/</span>
      {slug}
    </p>
  );
}
