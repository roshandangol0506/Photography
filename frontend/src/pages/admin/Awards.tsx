import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  useAwards,
  useCreateAward,
  useUpdateAward,
  useDeleteAward,
  type Award,
} from "@/api/awards";
import { useUploadAsset } from "@/api/uploads";
import { useDebounce } from "@/hooks/useDebounce";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Switch } from "@/components/ui/Switch";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { Pagination } from "@/components/admin/Pagination";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ImageUploader } from "@/components/admin/ImageUploader";

const awardSchema = z.object({
  title: z.string().min(1, "Title is required"),
  organization: z.string().optional(),
  year: z.coerce.number().min(1900, "Enter a valid year"),
  description: z.string().optional(),
  order: z.coerce.number().optional(),
  isActive: z.boolean().optional(),
});

type AwardForm = z.infer<typeof awardSchema>;

export default function Awards() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Award | null>(null);
  const [image, setImage] = useState<string | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<Award | null>(null);

  const { data, isLoading } = useAwards({
    page,
    perpage: 10,
    search: debouncedSearch || undefined,
  });
  const createMutation = useCreateAward();
  const updateMutation = useUpdateAward();
  const deleteMutation = useDeleteAward();
  const uploadMutation = useUploadAsset();

  const form = useForm<AwardForm>({ resolver: zodResolver(awardSchema) });

  const openCreate = () => {
    setEditing(null);
    setImage(undefined);
    form.reset({
      title: "",
      organization: "",
      year: new Date().getFullYear(),
      description: "",
      order: 0,
      isActive: true,
    });
    setDialogOpen(true);
  };

  const openEdit = (award: Award) => {
    setEditing(award);
    setImage(award.image);
    form.reset({
      title: award.title,
      organization: award.organization,
      year: award.year,
      description: award.description,
      order: award.order,
      isActive: award.isActive,
    });
    setDialogOpen(true);
  };

  const onSubmit = async (values: AwardForm) => {
    try {
      const body = { ...values, image };
      if (editing) {
        await updateMutation.mutateAsync({ id: editing._id, body });
        toast.success("Award updated");
      } else {
        await createMutation.mutateAsync(body);
        toast.success("Award created");
      }
      setDialogOpen(false);
    } catch {
      toast.error("Something went wrong");
    }
  };

  const handleImageChange = async (file: File | null) => {
    if (!file) return;
    try {
      const result = await uploadMutation.mutateAsync(file);
      setImage(result.url);
    } catch {
      toast.error("Image upload failed");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget._id);
      toast.success("Award deleted");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete award");
    }
  };

  const columns: Column<Award>[] = [
    { header: "Title", accessor: (row) => row.title },
    { header: "Organization", accessor: (row) => row.organization ?? "-" },
    { header: "Year", accessor: (row) => row.year },
    {
      header: "Status",
      accessor: (row) => (
        <Badge variant={row.isActive ? "success" : "muted"}>
          {row.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      header: "Actions",
      accessor: (row) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => openEdit(row)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDeleteTarget(row)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
      className: "w-28",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-foreground">Awards</h1>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Add Award
        </Button>
      </div>

      <Input
        placeholder="Search awards..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        className="max-w-xs"
      />

      <DataTable
        columns={columns}
        rows={data?.awards ?? []}
        rowKey={(row) => row._id}
        isLoading={isLoading}
        emptyMessage="No awards yet"
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
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editing ? "Edit Award" : "Add Award"}
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <ImageUploader label="Award image" value={image} onChange={handleImageChange} />
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...form.register("title")} />
            {form.formState.errors.title && (
              <p className="text-xs text-destructive">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="organization">Organization</Label>
            <Input id="organization" {...form.register("organization")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="year">Year</Label>
            <Input id="year" type="number" {...form.register("year")} />
            {form.formState.errors.year && (
              <p className="text-xs text-destructive">
                {form.formState.errors.year.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...form.register("description")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="order">Order</Label>
            <Input id="order" type="number" {...form.register("order")} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="isActive">Active</Label>
            <Controller
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <Switch
                  id="isActive"
                  checked={field.value ?? true}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {editing ? "Save changes" : "Create award"}
            </Button>
          </div>
        </form>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete award"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This cannot be undone.`}
        loading={deleteMutation.isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
