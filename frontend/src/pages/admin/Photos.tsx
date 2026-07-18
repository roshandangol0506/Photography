import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Pencil, Trash2, Eye, Heart, MessageCircle } from "lucide-react";
import { useAdminPhotos, useDeletePhoto, type Photo } from "@/api/photos";
import { useActiveCategories } from "@/api/categories";
import { useDebounce } from "@/hooks/useDebounce";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/admin/Pagination";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

const visibilityVariant: Record<
  Photo["visibility"],
  "success" | "muted" | "warning"
> = {
  published: "success",
  draft: "muted",
  archive: "warning",
};

export default function Photos() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [visibility, setVisibility] = useState("");
  const debouncedSearch = useDebounce(search);
  const [deleteTarget, setDeleteTarget] = useState<Photo | null>(null);

  const { data: categories } = useActiveCategories();
  const { data, isLoading } = useAdminPhotos({
    page,
    perpage: 12,
    search: debouncedSearch || undefined,
    category: category || undefined,
    visibility: visibility || undefined,
  });
  const deleteMutation = useDeletePhoto();

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget._id);
      toast.success("Photo deleted");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete photo");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-foreground">Photos</h1>
        <Button onClick={() => navigate("/admin/photos/new")}>
          Add Photo
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search photos..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="max-w-xs"
        />
        <Select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
          className="max-w-45"
        >
          <option value="">All categories</option>
          {categories?.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </Select>
        <Select
          value={visibility}
          onChange={(e) => {
            setVisibility(e.target.value);
            setPage(1);
          }}
          className="max-w-40"
        >
          <option value="">All visibility</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archive">Archive</option>
        </Select>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : !data || data.photos.length === 0 ? (
        <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-border text-muted-foreground">
          No photos yet
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.photos.map((photo) => (
            <div
              key={photo._id}
              className="overflow-hidden rounded-xl border border-border bg-card"
            >
              <img
                src={photo.images.thumb}
                alt={photo.title}
                className="h-40 w-full object-cover"
              />
              <div className="space-y-2 p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="truncate text-sm font-medium text-card-foreground">
                    {photo.title}
                  </p>
                  <Badge variant={visibilityVariant[photo.visibility]}>
                    {photo.visibility}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {photo.category?.name ?? "Uncategorized"}
                </p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" /> {photo.viewCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="h-3 w-3" /> {photo.likeCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-3 w-3" /> {photo.commentCount}
                  </span>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(`/admin/photos/${photo._id}/edit`)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteTarget(photo)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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
        title="Delete photo"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This cannot be undone.`}
        loading={deleteMutation.isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
