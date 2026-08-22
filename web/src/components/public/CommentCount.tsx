import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Hover chip beside the like control. A plain link, so it stays a Server
 * Component and ships no JavaScript.
 */
export function CommentCount({
  slug,
  count,
  className,
}: {
  slug: string;
  count: number;
  className?: string;
}) {
  return (
    <Link
      href={`/photo/${slug}#comments`}
      aria-label={`${count} comments`}
      className={cn(
        "flex items-center gap-1.5 transition-colors hover:text-md-red",
        className,
      )}
    >
      <MessageCircle className="h-4 w-4" />
      <span>{count}</span>
    </Link>
  );
}
