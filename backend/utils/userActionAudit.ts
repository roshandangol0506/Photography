import { Logger } from "../config/logger.config";
import { ACTION } from "../constant/enum";

type AuditLog = {
  action: ACTION;
  body?: any;
  params?: any;
  query?: any;
  errorMessage?: string;
};

const logUserAction = (route: string, metadata: AuditLog) => {
  if (!metadata.action) {
    console.error("ACTION is missing, skipping log...");
    return;
  }

  Logger.info(route, { metadata });
};

export { logUserAction };
