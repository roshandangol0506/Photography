import { useState } from "react";
import { useVisitors, type Visitor } from "@/api/visitors";
import { useDebounce } from "@/hooks/useDebounce";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { Pagination } from "@/components/admin/Pagination";

export default function Visitors() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [device, setDevice] = useState("");
  const debouncedSearch = useDebounce(search);

  const { data, isLoading } = useVisitors({
    page,
    perpage: 10,
    search: debouncedSearch || undefined,
    device: device || undefined,
  });

  const columns: Column<Visitor>[] = [
    {
      header: "Visitor ID",
      accessor: (row) => (
        <span className="font-mono text-xs">
          {row.uniqueId.slice(0, 18)}...
        </span>
      ),
    },
    { header: "Name", accessor: (row) => row.name ?? "Anonymous" },
    { header: "Visits", accessor: (row) => row.visitCount },
    { header: "Device", accessor: (row) => row.device ?? "-" },
    { header: "Browser", accessor: (row) => row.browser ?? "-" },
    { header: "Platform", accessor: (row) => row.platform ?? "-" },
    {
      header: "First visit",
      accessor: (row) => new Date(row.firstVisit).toLocaleDateString(),
    },
    {
      header: "Last visit",
      accessor: (row) => new Date(row.lastVisit).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-foreground">Visitors</h1>

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search by ID or name..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="max-w-xs"
        />
        <Select
          value={device}
          onChange={(e) => {
            setDevice(e.target.value);
            setPage(1);
          }}
          className="max-w-40"
        >
          <option value="">All devices</option>
          <option value="mobile">Mobile</option>
          <option value="tablet">Tablet</option>
          <option value="desktop">Desktop</option>
        </Select>
      </div>

      <DataTable
        columns={columns}
        rows={data?.visitors ?? []}
        rowKey={(row) => row._id}
        isLoading={isLoading}
        emptyMessage="No visitors yet"
      />

      {data && (
        <Pagination
          page={data.pagination.currentPage}
          totalPages={data.pagination.totalPages}
          total={data.pagination.total}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
