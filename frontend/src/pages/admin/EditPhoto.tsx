import { useParams } from "react-router-dom";
import { useAdminPhoto } from "@/api/photos";
import { PhotoForm } from "@/components/admin/PhotoForm";

export default function EditPhoto() {
  const { id } = useParams<{ id: string }>();
  const { data: photo, isLoading } = useAdminPhoto(id);

  if (isLoading) {
    return <p className="text-muted-foreground">Loading...</p>;
  }

  if (!photo) {
    return <p className="text-muted-foreground">Photo not found.</p>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-foreground">Edit Photo</h1>
      <PhotoForm key={id} photo={photo} />
    </div>
  );
}
