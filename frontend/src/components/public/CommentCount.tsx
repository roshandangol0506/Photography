import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface CommentCountProps {
  slug: string;
  count: number;
  className?: string;
}

/**
 * Hover chip beside the like control. Links straight to the photo's detail
 * page, where the conversation lives.
 */
export function CommentCount({ slug, count, className }: CommentCountProps) {
  return (
    <Link
      to={`/photo/${slug}#comments`}
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
