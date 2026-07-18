import { PhotoForm } from "@/components/admin/PhotoForm";

export default function AddPhoto() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-foreground">Add Photo</h1>
      <PhotoForm />
    </div>
  );
}
