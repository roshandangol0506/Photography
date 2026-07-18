import { useEffect, useState } from "react";
import { getUniqueId } from "@/utils/getUniqueId";

export function useVisitorId(): string | null {
  const [visitorId, setVisitorId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getUniqueId().then((id) => {
      if (active) setVisitorId(id);
    });
    return () => {
      active = false;
    };
  }, []);

  return visitorId;
}
