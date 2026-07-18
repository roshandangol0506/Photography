import { useEffect, useRef } from "react";
import { useVisitorId } from "@/hooks/useVisitorId";
import { useIdentifyVisitor } from "@/api/visitors";

export function VisitorTracker() {
  const visitorId = useVisitorId();
  const identifyMutation = useIdentifyVisitor();
  const hasIdentified = useRef(false);

  useEffect(() => {
    if (!visitorId || hasIdentified.current) return;
    hasIdentified.current = true;
    identifyMutation.mutate({
      uniqueId: visitorId,
      path: window.location.pathname,
    });
  }, [visitorId, identifyMutation]);

  return null;
}
