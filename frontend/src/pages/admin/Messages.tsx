import { useState } from "react";
import { toast } from "sonner";
import { Eye, Archive, Trash2 } from "lucide-react";
import {
  useMessages,
  useUpdateMessageStatus,
  useDeleteMessage,
  type ContactMessage,
} from "@/api/messages";
import { useDebounce } from "@/hooks/useDebounce";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { Pagination } from "@/components/admin/Pagination";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

const statusVariant: Record<
  ContactMessage["status"],
  "default" | "muted" | "warning"
> = {
  new: "default",
  read: "muted",
  archived: "warning",
};

export default function Messages() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const debouncedSearch = useDebounce(search);
  const [viewing, setViewing] = useState<ContactMessage | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ContactMessage | null>(
    null,
  );

  const { data, isLoading } = useMessages({
    page,
    perpage: 10,
    search: debouncedSearch || undefined,
    status: status || undefined,
  });
  const statusMutation = useUpdateMessageStatus();
  const deleteMutation = useDeleteMessage();

  const openMessage = async (message: ContactMessage) => {
    setViewing(message);
    if (message.status === "new") {
      try {
        await statusMutation.mutateAsync({ id: message._id, status: "read" });
      } catch {
        // non-critical, ignore
      }
    }
  };

  const archiveMessage = async (id: string) => {
    try {
      await statusMutation.mutateAsync({ id, status: "archived" });
      toast.success("Message archived");
    } catch {
      toast.error("Failed to archive message");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget._id);
      toast.success("Message deleted");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete message");
    }
  };

  const columns: Column<ContactMessage>[] = [
    { header: "Name", accessor: (row) => row.name },
    { header: "Email", accessor: (row) => row.email },
    { header: "Subject", accessor: (row) => row.subject ?? "-" },
    {
      header: "Status",
      accessor: (row) => (
        <Badge variant={statusVariant[row.status]}>{row.status}</Badge>
      ),
    },
    {
      header: "Received",
      accessor: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      header: "Actions",
      accessor: (row) => (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => openMessage(row)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {row.status !== "archived" && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => archiveMessage(row._id)}
            >
              <Archive className="h-4 w-4" />
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
      <h1 className="text-2xl font-semibold text-foreground">Messages</h1>

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search messages..."
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
          <option value="new">New</option>
          <option value="read">Read</option>
          <option value="archived">Archived</option>
        </Select>
      </div>

      <DataTable
        columns={columns}
        rows={data?.messages ?? []}
        rowKey={(row) => row._id}
        isLoading={isLoading}
        emptyMessage="No messages yet"
      />

      {data && (
        <Pagination
          page={data.pagination.currentPage}
          totalPages={data.pagination.totalPages}
          total={data.pagination.total}
          onPageChange={setPage}
        />
      )}

      <Dialog
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
        title={viewing?.subject || "Message"}
      >
        {viewing && (
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">From:</span>{" "}
              {viewing.name} ({viewing.email})
            </p>
            {viewing.phone && (
              <p>
                <span className="text-muted-foreground">Phone:</span>{" "}
                {viewing.phone}
              </p>
            )}
            <p className="whitespace-pre-wrap pt-2 text-foreground">
              {viewing.message}
            </p>
          </div>
        )}
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete message"
        description="Are you sure you want to delete this message? This cannot be undone."
        loading={deleteMutation.isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
