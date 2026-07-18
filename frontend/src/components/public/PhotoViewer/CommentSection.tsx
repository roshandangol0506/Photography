import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { MessageCircle } from "lucide-react";
import { usePublicComments, useCreateComment } from "@/api/comments";
import { useVisitorId } from "@/hooks/useVisitorId";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

const commentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  content: z.string().min(1, "Comment is required"),
});

type CommentForm = z.infer<typeof commentSchema>;

export function CommentSection({ photoId }: { photoId: string }) {
  const visitorId = useVisitorId();
  const { data } = usePublicComments(photoId, { perpage: 20 });
  const createComment = useCreateComment(photoId);
  const form = useForm<CommentForm>({ resolver: zodResolver(commentSchema) });

  const onSubmit = async (values: CommentForm) => {
    if (!visitorId) return;
    try {
      await createComment.mutateAsync({ visitorId, ...values });
      toast.success("Comment submitted for review");
      form.reset();
    } catch {
      toast.error("Failed to submit comment");
    }
  };

  return (
    <div>
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
        <MessageCircle className="h-4 w-4" /> Comments (
        {data?.pagination.total ?? 0})
      </h3>

      <div className="space-y-3">
        {data?.comments.length ? (
          data.comments.map((comment) => (
            <div
              key={comment._id}
              className="rounded-lg border border-border p-3"
            >
              <p className="text-sm font-medium text-foreground">
                {comment.name}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {comment.content}
              </p>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">
            No comments yet. Be the first!
          </p>
        )}
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 space-y-3">
        <div>
          <Input placeholder="Your name" {...form.register("name")} />
          {form.formState.errors.name && (
            <p className="mt-1 text-xs text-destructive">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>
        <div>
          <Textarea
            placeholder="Add a comment..."
            rows={3}
            {...form.register("content")}
          />
          {form.formState.errors.content && (
            <p className="mt-1 text-xs text-destructive">
              {form.formState.errors.content.message}
            </p>
          )}
        </div>
        <Button type="submit" disabled={createComment.isPending || !visitorId}>
          {createComment.isPending ? "Posting..." : "Post Comment"}
        </Button>
      </form>
    </div>
  );
}
