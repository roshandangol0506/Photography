"use client";

import { useEffect, useState } from "react";
import { getVisitorId } from "@/lib/visitor";

/** Resolved after mount: `document.cookie` does not exist on the server. */
export function useVisitorId(): string | null {
  const [visitorId, setVisitorId] = useState<string | null>(null);
  useEffect(() => setVisitorId(getVisitorId()), []);
  return visitorId;
}
