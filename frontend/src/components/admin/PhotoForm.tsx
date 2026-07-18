import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useActiveCategories } from "@/api/categories";
import { useActiveCollections } from "@/api/collections";
import { useCreatePhoto, useUpdatePhoto, type Photo } from "@/api/photos";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Switch } from "@/components/ui/Switch";
import { ImageUploader } from "@/components/admin/ImageUploader";

const photoSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9]+(-[a-z0-9]+)*$/,
      "Lowercase letters, numbers and hyphens only (e.g. my-photo-title)",
    ),
  description: z.string().optional(),
  category: z.string().optional(),
  tags: z.string().optional(),
  camera: z.string().optional(),
  lens: z.string().optional(),
  location: z.string().optional(),
  dateTaken: z.string().optional(),
  visibility: z.string().optional(),
  order: z.number().optional(),
});

type PhotoFieldsForm = z.infer<typeof photoSchema>;

type ToggleKey =
  | "isBackground"
  | "isSideScroll"
  | "isFeatured"
  | "isTrending"
  | "isHome";

const TOGGLES: { key: ToggleKey; label: string; hint: string }[] = [
  {
    key: "isFeatured",
    label: "Featured",
    hint: "Show in the Featured Photos section",
  },
  { key: "isTrending", label: "Trending", hint: "Show in Trending" },
  { key: "isHome", label: "Home", hint: "Show on the homepage" },
  {
    key: "isBackground",
    label: "Hero background",
    hint: "Use in the landing page slideshow",
  },
  {
    key: "isSideScroll",
    label: "Side scroll",
    hint: "Show in the continuous side-scrolling strip",
  },
];

interface PhotoFormProps {
  photo?: Photo;
}

export function PhotoForm({ photo }: PhotoFormProps) {
  const navigate = useNavigate();
  const isEditing = Boolean(photo);

  const { data: categories } = useActiveCategories();
  const { data: collections } = useActiveCollections();
  const createMutation = useCreatePhoto();
  const updateMutation = useUpdatePhoto();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [selectedCollections, setSelectedCollections] = useState<string[]>(
    photo?.collections.map((c) => c._id) ?? [],
  );
  const [toggles, setToggles] = useState<Record<ToggleKey, boolean>>({
    isBackground: photo?.isBackground ?? false,
    isSideScroll: photo?.isSideScroll ?? false,
    isFeatured: photo?.isFeatured ?? false,
    isTrending: photo?.isTrending ?? false,
    isHome: photo?.isHome ?? false,
  });

  const form = useForm<PhotoFieldsForm>({
    resolver: zodResolver(photoSchema),
    defaultValues: {
      title: photo?.title ?? "",
      slug: photo?.slug ?? "",
      description: photo?.description ?? "",
      category: photo?.category?._id ?? "",
      tags: photo?.tags.join(", ") ?? "",
      camera: photo?.camera ?? "",
      lens: photo?.lens ?? "",
      location: photo?.location ?? "",
      dateTaken: photo?.dateTaken ? photo.dateTaken.slice(0, 10) : "",
      visibility: photo?.visibility ?? "draft",
      order: photo?.order ?? 0,
    },
  });

  const toggleCollection = (id: string) => {
    setSelectedCollections((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const onSubmit = async (values: PhotoFieldsForm) => {
    if (!isEditing && !imageFile) {
      setImageError("A photo image is required");
      return;
    }
    setImageError(null);

    const payload = {
      ...values,
      tags: values.tags
        ? values.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : [],
      collections: selectedCollections,
      ...toggles,
      image: imageFile,
    };

    try {
      if (isEditing && photo) {
        await updateMutation.mutateAsync({ id: photo._id, values: payload });
        toast.success("Photo updated");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Photo created");
      }
      navigate("/admin/photos");
    } catch {
      toast.error("Something went wrong saving the photo");
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="max-w-3xl space-y-6"
    >
      <div>
        <ImageUploader
          label="Photo"
          value={photo?.images.medium}
          onChange={(file) => {
            setImageFile(file);
            if (file) setImageError(null);
          }}
        />
        {imageError && (
          <p className="mt-1 text-xs text-destructive">{imageError}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" {...form.register("slug")} />
          {form.formState.errors.slug && (
            <p className="text-xs text-destructive">
              {form.formState.errors.slug.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" {...form.register("description")} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select id="category" {...form.register("category")}>
            <option value="">No category</option>
            {categories?.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="visibility">Visibility</Label>
          <Select id="visibility" {...form.register("visibility")}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archive">Archive</option>
          </Select>
        </div>
      </div>

      {collections && collections.length > 0 && (
        <div className="space-y-2">
          <Label>Collections</Label>
          <div className="flex flex-wrap gap-3">
            {collections.map((collection) => (
              <label
                key={collection._id}
                className="flex items-center gap-2 rounded-md border border-input px-3 py-1.5 text-sm"
              >
                <input
                  type="checkbox"
                  checked={selectedCollections.includes(collection._id)}
                  onChange={() => toggleCollection(collection._id)}
                />
                {collection.name}
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="tags">Tags (comma separated)</Label>
        <Input
          id="tags"
          placeholder="sunset, landscape, nepal"
          {...form.register("tags")}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="camera">Camera</Label>
          <Input id="camera" {...form.register("camera")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lens">Lens</Label>
          <Input id="lens" {...form.register("lens")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input id="location" {...form.register("location")} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="dateTaken">Date taken</Label>
          <Input id="dateTaken" type="date" {...form.register("dateTaken")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="order">Order</Label>
          <Input
            id="order"
            type="number"
            {...form.register("order", { valueAsNumber: true })}
          />
        </div>
      </div>

      <div className="space-y-3 rounded-xl border border-border p-4">
        <p className="text-sm font-medium text-foreground">Placement</p>
        {TOGGLES.map((toggle) => (
          <div key={toggle.key} className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground">{toggle.label}</p>
              <p className="text-xs text-muted-foreground">{toggle.hint}</p>
            </div>
            <Switch
              checked={toggles[toggle.key]}
              onCheckedChange={(checked) =>
                setToggles((prev) => ({ ...prev, [toggle.key]: checked }))
              }
            />
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/admin/photos")}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving
            ? "Saving..."
            : isEditing
              ? "Save changes"
              : "Create photo"}
        </Button>
      </div>
    </form>
  );
}
