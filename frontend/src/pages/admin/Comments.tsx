import { useState } from "react";
import { toast } from "sonner";
import { Check, X, Trash2 } from "lucide-react";
import {
  useAdminComments,
  useUpdateCommentStatus,
  useDeleteComment,
  type Comment,
} from "@/api/comments";
import { useDebounce } from "@/hooks/useDebounce";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { Pagination } from "@/components/admin/Pagination";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

const statusVariant: Record<
  Comment["status"],
  "success" | "warning" | "destructive"
> = {
  approved: "success",
  pending: "warning",
  rejected: "destructive",
};

export default function Comments() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const debouncedSearch = useDebounce(search);
  const [deleteTarget, setDeleteTarget] = useState<Comment | null>(null);

  const { data, isLoading } = useAdminComments({
    page,
    perpage: 10,
    search: debouncedSearch || undefined,
    status: status || undefined,
  });
  const statusMutation = useUpdateCommentStatus();
  const deleteMutation = useDeleteComment();

  const updateStatus = async (id: string, next: string) => {
    try {
      await statusMutation.mutateAsync({ id, status: next });
      toast.success(`Comment ${next}`);
    } catch {
      toast.error("Failed to update comment");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget._id);
      toast.success("Comment deleted");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete comment");
    }
  };

  const columns: Column<Comment>[] = [
    { header: "Name", accessor: (row) => row.name },
    {
      header: "Photo",
      accessor: (row) =>
        typeof row.photo === "string" ? row.photo : row.photo.title,
    },
    {
      header: "Comment",
      accessor: (row) => <span className="line-clamp-2">{row.content}</span>,
    },
    {
      header: "Status",
      accessor: (row) => (
        <Badge variant={statusVariant[row.status]}>{row.status}</Badge>
      ),
    },
    {
      header: "Actions",
      accessor: (row) => (
        <div className="flex gap-1">
          {row.status !== "approved" && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => updateStatus(row._id, "approved")}
            >
              <Check className="h-4 w-4 text-emerald-600" />
            </Button>
          )}
          {row.status !== "rejected" && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => updateStatus(row._id, "rejected")}
            >
              <X className="h-4 w-4 text-amber-600" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDeleteTarget(row)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
      className: "w-32",
    },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-foreground">Comments</h1>

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search comments..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="max-w-xs"
        />
        <Select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="max-w-40"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </Select>
      </div>

      <DataTable
        columns={columns}
        rows={data?.comments ?? []}
        rowKey={(row) => row._id}
        isLoading={isLoading}
        emptyMessage="No comments yet"
      />

      {data && (
        <Pagination
          page={data.pagination.currentPage}
          totalPages={data.pagination.totalPages}
          total={data.pagination.total}
          onPageChange={setPage}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete comment"
        description="Are you sure you want to delete this comment? This cannot be undone."
        loading={deleteMutation.isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
