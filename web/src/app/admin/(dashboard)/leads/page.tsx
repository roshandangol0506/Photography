"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Mail, Trash2 } from "lucide-react";
import {
  useLeads,
  useUpdateLeadStatus,
  useDeleteLead,
  useSendLeadMail,
  type Lead,
  type LeadStatus,
} from "@/lib/api/leads";
import { useDebounce } from "@/hooks/useDebounce";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Textarea } from "@/components/ui/Textarea";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { Pagination } from "@/components/admin/Pagination";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

const statusVariant: Record<LeadStatus, "success" | "warning" | "destructive"> =
  {
    completed: "success",
    pending: "warning",
    rejected: "destructive",
  };

const typeLabel: Record<Lead["type"], string> = {
  book_a_demo: "Book a demo",
  contact: "Contact",
};

function formatDateTime(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Leads() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const debouncedSearch = useDebounce(search);

  const [deleteTarget, setDeleteTarget] = useState<Lead | null>(null);
  const [mailTarget, setMailTarget] = useState<Lead | null>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const { data, isLoading } = useLeads({
    page,
    perpage: 10,
    search: debouncedSearch || undefined,
    status: status || undefined,
    type: type || undefined,
  });
  const statusMutation = useUpdateLeadStatus();
  const deleteMutation = useDeleteLead();
  const mailMutation = useSendLeadMail();

  const openMail = (lead: Lead) => {
    setMailTarget(lead);
    setSubject(
      lead.type === "book_a_demo"
        ? "Your booking request"
        : "Thanks for getting in touch",
    );
    setBody(
      lead.type === "book_a_demo"
        ? `Thanks for your booking request${
            lead.bookingDate ? ` for ${formatDateTime(lead.bookingDate)}` : ""
          }. I can confirm the slot — let me know if that still suits you.`
        : "Thanks for your message. I will come back to you shortly with more detail.",
    );
  };

  const sendMail = async () => {
    if (!mailTarget || !subject.trim() || !body.trim()) return;
    try {
      await mailMutation.mutateAsync({
        id: mailTarget._id,
        subject: subject.trim(),
        message: body.trim(),
      });
      toast.success(`Email sent to ${mailTarget.email}`);
      setMailTarget(null);
    } catch {
      toast.error("Failed to send the email");
    }
  };

  const complete = async (lead: Lead) => {
    try {
      await statusMutation.mutateAsync({ id: lead._id, status: "completed" });
      toast.success("Lead marked complete");
    } catch {
      toast.error("Failed to update lead");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget._id);
      toast.success("Lead deleted");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete lead");
    }
  };

  const columns: Column<Lead>[] = [
    {
      header: "User Details",
      accessor: (row) => (
        <div className="space-y-0.5">
          <p className="font-medium text-foreground">{row.fullName}</p>
          <p className="text-xs text-muted-foreground">{row.email}</p>
          {row.phone && (
            <p className="text-xs text-muted-foreground">{row.phone}</p>
          )}
        </div>
      ),
    },
    {
      header: "Description",
      accessor: (row) => (
        <div className="max-w-xs space-y-1">
          <p className="line-clamp-3 text-sm">{row.description || "—"}</p>
          {row.category && <Badge variant="muted">{row.category.name}</Badge>}
        </div>
      ),
    },
    {
      header: "Type",
      accessor: (row) => (
        <span className="text-sm whitespace-nowrap">{typeLabel[row.type]}</span>
      ),
    },
    {
      header: "Status",
      accessor: (row) => (
        <Badge variant={statusVariant[row.status]}>{row.status}</Badge>
      ),
    },
    {
      header: "Booking Date",
      accessor: (row) => (
        <span className="text-sm whitespace-nowrap">
          {formatDateTime(row.bookingDate)}
        </span>
      ),
    },
    {
      header: "Created Date",
      accessor: (row) => (
        <span className="text-sm whitespace-nowrap">
          {formatDateTime(row.createdAt)}
        </span>
      ),
    },
    {
      header: "Actions",
      accessor: (row) => (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            title="Send email"
            onClick={() => openMail(row)}
          >
            <Mail className="h-4 w-4 text-foreground" />
          </Button>
          {row.status !== "completed" && (
            <Button
              variant="ghost"
              size="icon"
              title="Mark complete"
              onClick={() => complete(row)}
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            title="Delete"
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
      <h1 className="text-2xl font-semibold text-foreground">Leads</h1>

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search name, email or phone..."
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
          <option value="completed">Completed</option>
          <option value="rejected">Rejected</option>
        </Select>
        <Select
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            setPage(1);
          }}
          className="max-w-44"
        >
          <option value="">All types</option>
          <option value="book_a_demo">Book a demo</option>
          <option value="contact">Contact</option>
        </Select>
      </div>

      <DataTable
        columns={columns}
        rows={data?.leads ?? []}
        rowKey={(row) => row._id}
        isLoading={isLoading}
        emptyMessage="No leads yet"
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
        open={Boolean(mailTarget)}
        onClose={() => setMailTarget(null)}
        title={`Email ${mailTarget?.fullName ?? ""}`}
      >
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Sending to {mailTarget?.email}
          </p>
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject"
          />
          <Textarea
            rows={6}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Message"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setMailTarget(null)}>
              Cancel
            </Button>
            <Button
              onClick={sendMail}
              disabled={
                mailMutation.isPending || !subject.trim() || !body.trim()
              }
            >
              {mailMutation.isPending ? "Sending..." : "Send email"}
            </Button>
          </div>
        </div>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete lead"
        description={`Delete the lead from "${deleteTarget?.fullName}"? This cannot be undone.`}
        loading={deleteMutation.isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
