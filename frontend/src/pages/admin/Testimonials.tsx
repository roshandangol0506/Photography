import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  useTestimonials,
  useCreateTestimonial,
  useUpdateTestimonial,
  useDeleteTestimonial,
  type Testimonial,
} from "@/api/testimonials";
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

const testimonialSchema = z.object({
  name: z.string().min(1, "Name is required"),
  role: z.string().optional(),
  message: z.string().min(1, "Message is required"),
  rating: z.number().min(1).max(5).optional(),
  order: z.number().optional(),
  isActive: z.boolean().optional(),
});

type TestimonialForm = z.infer<typeof testimonialSchema>;

export default function Testimonials() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [avatar, setAvatar] = useState<string | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<Testimonial | null>(null);

  const { data, isLoading } = useTestimonials({
    page,
    perpage: 10,
    search: debouncedSearch || undefined,
  });
  const createMutation = useCreateTestimonial();
  const updateMutation = useUpdateTestimonial();
  const deleteMutation = useDeleteTestimonial();
  const uploadMutation = useUploadAsset();

  const form = useForm<TestimonialForm>({
    resolver: zodResolver(testimonialSchema),
  });

  const openCreate = () => {
    setEditing(null);
    setAvatar(undefined);
    form.reset({
      name: "",
      role: "",
      message: "",
      rating: 5,
      order: 0,
      isActive: true,
    });
    setDialogOpen(true);
  };

  const openEdit = (testimonial: Testimonial) => {
    setEditing(testimonial);
    setAvatar(testimonial.avatar);
    form.reset({
      name: testimonial.name,
      role: testimonial.role,
      message: testimonial.message,
      rating: testimonial.rating,
      order: testimonial.order,
      isActive: testimonial.isActive,
    });
    setDialogOpen(true);
  };

  const onSubmit = async (values: TestimonialForm) => {
    try {
      const body = { ...values, avatar };
      if (editing) {
        await updateMutation.mutateAsync({ id: editing._id, body });
        toast.success("Testimonial updated");
      } else {
        await createMutation.mutateAsync(body);
        toast.success("Testimonial created");
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
      setAvatar(result.url);
    } catch {
      toast.error("Image upload failed");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget._id);
      toast.success("Testimonial deleted");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete testimonial");
    }
  };

  const columns: Column<Testimonial>[] = [
    { header: "Name", accessor: (row) => row.name },
    { header: "Role", accessor: (row) => row.role ?? "-" },
    { header: "Rating", accessor: (row) => `${row.rating} / 5` },
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
        <h1 className="text-2xl font-semibold text-foreground">
          Testimonials
        </h1>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Add Testimonial
        </Button>
      </div>

      <Input
        placeholder="Search testimonials..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        className="max-w-xs"
      />

      <DataTable
        columns={columns}
        rows={data?.testimonials ?? []}
        rowKey={(row) => row._id}
        isLoading={isLoading}
        emptyMessage="No testimonials yet"
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
        title={editing ? "Edit Testimonial" : "Add Testimonial"}
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <ImageUploader label="Avatar" value={avatar} onChange={handleImageChange} />
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...form.register("name")} />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role / Company</Label>
            <Input id="role" {...form.register("role")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" {...form.register("message")} />
            {form.formState.errors.message && (
              <p className="text-xs text-destructive">
                {form.formState.errors.message.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="rating">Rating (1-5)</Label>
            <Input
              id="rating"
              type="number"
              min={1}
              max={5}
              {...form.register("rating", { valueAsNumber: true })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="order">Order</Label>
            <Input
              id="order"
              type="number"
              {...form.register("order", { valueAsNumber: true })}
            />
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
              {editing ? "Save changes" : "Create testimonial"}
            </Button>
          </div>
        </form>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete testimonial"
        description={`Are you sure you want to delete the testimonial from "${deleteTarget?.name}"? This cannot be undone.`}
        loading={deleteMutation.isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
