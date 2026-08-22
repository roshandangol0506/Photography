import { useState } from "react";
import { ArrowUpDown, BadgeCheck, MessageSquare, ThumbsUp } from "lucide-react";
import { toast } from "sonner";
import {
  useCreateComment,
  useLikeComment,
  usePublicComments,
  type Comment,
} from "@/api/comments";
import { useVisitorProfile } from "@/api/visitors";
import { useVisitorId } from "@/hooks/useVisitorId";
import { cn } from "@/lib/utils";

const FIELD_CLASS =
  "w-full border-2 border-md-divider bg-transparent px-4 py-3 font-[inherit] text-[14px] text-md-fg outline-none focus:border-md-red";

const ACTION_CLASS =
  "flex cursor-pointer items-center gap-1.5 border-0 bg-transparent p-0 text-[13px] font-medium text-md-600 transition-colors duration-200 hover:text-md-red disabled:opacity-60";

const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 31536000],
  ["month", 2592000],
  ["day", 86400],
  ["hour", 3600],
  ["minute", 60],
];

function timeAgo(value: string) {
  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return "";
  const seconds = Math.round((then - Date.now()) / 1000);
  const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  for (const [unit, size] of RELATIVE_UNITS) {
    if (Math.abs(seconds) >= size) {
      return formatter.format(Math.round(seconds / size), unit);
    }
  }
  return "just now";
}

/** "Roshan Dangol" -> "RD", "Roshan" -> "R". */
function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * A reply's body starts with "@Author " - render that lead-in as a mention.
 * Candidate names come from the thread, so multi-word names match correctly
 * and a stray "@" in ordinary prose is left alone.
 */
function renderContent(content: string, names: string[]) {
  const match = names
    .filter((name) => content.startsWith(`@${name}`))
    .sort((a, b) => b.length - a.length)[0];

  if (!match) return content;

  return (
    <>
      <span className="font-semibold text-md-red">@{match}</span>
      {content.slice(match.length + 1)}
    </>
  );
}

function Avatar({ name, admin }: { name: string; admin?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex h-9 w-9 flex-none items-center justify-center rounded-full text-[12px] font-bold",
        admin ? "bg-md-red text-md-light" : "bg-md-300 text-md-800",
      )}
    >
      {initials(name)}
    </span>
  );
}

function CommentBody({
  comment,
  photoId,
  visitorId,
  names,
  onReply,
}: {
  comment: Comment;
  photoId: string;
  visitorId: string | null;
  names: string[];
  onReply: () => void;
}) {
  const likeMutation = useLikeComment(photoId);

  const toggleLike = () => {
    if (!visitorId || likeMutation.isPending) return;
    likeMutation.mutate({ commentId: comment._id, visitorId });
  };

  return (
    <article className="flex gap-3">
      <Avatar name={comment.name} admin={comment.isAdminReply} />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-[14px] font-semibold">{comment.name}</span>
          {comment.isAdminReply && (
            <BadgeCheck
              className="h-4 w-4 text-md-red"
              aria-label="Photographer"
            />
          )}
          <span className="text-[12px] text-md-600">
            {timeAgo(comment.createdAt)}
          </span>
        </div>

        <p className="mt-1 mb-0 text-[14px] leading-[1.6]">
          {renderContent(comment.content, names)}
        </p>

        <div className="mt-2 flex items-center gap-5">
          <button
            type="button"
            onClick={toggleLike}
            disabled={!visitorId || likeMutation.isPending}
            aria-pressed={comment.likedByMe}
            aria-label={comment.likedByMe ? "Remove like" : "Like comment"}
            className={cn(ACTION_CLASS, comment.likedByMe && "text-md-red")}
          >
            <ThumbsUp
              className="h-4 w-4"
              fill={comment.likedByMe ? "currentColor" : "none"}
            />
            {comment.likeCount}
          </button>

          <button type="button" onClick={onReply} className={ACTION_CLASS}>
            <MessageSquare className="h-4 w-4" />
            Reply
          </button>
        </div>
      </div>
    </article>
  );
}

export function PhotoComments({ photoId }: { photoId: string }) {
  const visitorId = useVisitorId();
  const { data: profile } = useVisitorProfile(visitorId);
  const [sort, setSort] = useState<"recent" | "oldest">("recent");
  const { data, isLoading } = usePublicComments(photoId, { visitorId, sort });
  const createComment = useCreateComment(photoId);

  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [replyTo, setReplyTo] = useState<Comment | null>(null);

  // A visitor who has commented before is known to the dashboard, so the name
  // field disappears on every later visit and the stored name wins outright.
  const savedName = profile?.name ?? "";
  const effectiveName = savedName || name;

  const comments = data?.comments ?? [];
  const total = data?.pagination.total ?? 0;

  const startReply = (comment: Comment) => {
    setReplyTo(comment);
    setContent((current) =>
      current.startsWith(`@${comment.name} `) ? current : `@${comment.name} `,
    );
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!visitorId) return;

    const trimmedName = effectiveName.trim();
    let trimmedContent = content.trim();
    if (!trimmedName) {
      toast.error("Please add your name first.");
      return;
    }
    if (!trimmedContent) return;

    // Keep the mention even if the visitor cleared it before submitting.
    if (replyTo && !trimmedContent.startsWith(`@${replyTo.name}`)) {
      trimmedContent = `@${replyTo.name} ${trimmedContent}`;
    }

    try {
      await createComment.mutateAsync({
        visitorId,
        name: trimmedName,
        content: trimmedContent,
        // Replying to a reply still attaches to the root of the thread.
        parent: replyTo ? (replyTo.parent ?? replyTo._id) : undefined,
      });
      setContent("");
      setReplyTo(null);
      toast.success("Thanks — your comment has been posted.");
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <div
      id="comments"
      className="px-9 py-[70px] max-[900px]:px-5 max-[900px]:py-10"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="m-0 flex items-center gap-3 font-bold tracking-[-0.02em] text-[clamp(22px,2.6vw,32px)] leading-none">
          Comments
          <span className="rounded-full bg-md-red px-2.5 py-1 text-[12px] font-semibold text-md-light">
            {total}
          </span>
        </h2>

        <label className="flex items-center gap-2 text-[13px] font-medium text-md-700">
          <ArrowUpDown className="h-4 w-4" />
          <span className="sr-only">Sort comments</span>
          <select
            value={sort}
            onChange={(event) =>
              setSort(event.target.value as "recent" | "oldest")
            }
            className="cursor-pointer border-0 bg-transparent font-[inherit] text-[13px] text-md-fg outline-none"
          >
            <option value="recent">Most recent</option>
            <option value="oldest">Oldest first</option>
          </select>
        </label>
      </div>

      <div className="mt-8 grid grid-cols-[1fr_360px] items-start gap-12 max-[900px]:grid-cols-1 max-[900px]:gap-8">
        <div className="min-w-0">
          {isLoading && (
            <div className="space-y-3" aria-hidden="true">
              <div className="h-4 w-1/3 bg-md-300" />
              <div className="h-4 w-full bg-md-300" />
              <div className="h-4 w-2/3 bg-md-300" />
            </div>
          )}

          {!isLoading && comments.length === 0 && (
            <p className="m-0 text-[14px] text-md-600">
              No comments yet. Be the first to say something.
            </p>
          )}

          {comments.map((comment) => {
            const names = [
              comment.name,
              ...(comment.replies ?? []).map((reply) => reply.name),
            ];

            return (
              <div key={comment._id} className="mb-7">
                <CommentBody
                  comment={comment}
                  photoId={photoId}
                  visitorId={visitorId}
                  names={names}
                  onReply={() => startReply(comment)}
                />

                {(comment.replies?.length ?? 0) > 0 && (
                  <div className="mt-4 ml-[18px] flex flex-col gap-4 border-l-2 border-md-divider pl-6">
                    {comment.replies?.map((reply) => (
                      <CommentBody
                        key={reply._id}
                        comment={reply}
                        photoId={photoId}
                        visitorId={visitorId}
                        names={names}
                        onReply={() => startReply(reply)}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <form
          onSubmit={submit}
          className="sticky top-28 flex flex-col gap-3 max-[900px]:static max-[900px]:order-first"
        >
          {!savedName && (
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your name"
              required
              className={FIELD_CLASS}
            />
          )}

          <textarea
            rows={3}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder={
              replyTo ? `Reply to ${replyTo.name}…` : "Add a comment…"
            }
            required
            className={`${FIELD_CLASS} resize-y`}
          />

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="submit"
              disabled={!visitorId || createComment.isPending}
              className="cursor-pointer border-0 bg-md-ink px-5 py-3 text-[12px] font-semibold tracking-[0.16em] text-md-light uppercase transition-colors duration-200 hover:bg-md-red disabled:opacity-60"
            >
              {createComment.isPending
                ? "Posting…"
                : replyTo
                  ? "Post reply"
                  : "Post comment"}
            </button>

            {replyTo && (
              <button
                type="button"
                onClick={() => {
                  setReplyTo(null);
                  setContent("");
                }}
                className="cursor-pointer border-0 bg-transparent p-0 text-[13px] text-md-600 hover:text-md-red"
              >
                Cancel reply
              </button>
            )}

            {savedName && (
              <span className="text-[13px] text-md-600">
                Commenting as <span className="font-semibold">{savedName}</span>
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
