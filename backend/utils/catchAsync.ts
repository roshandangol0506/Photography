import {
  RequestHandler,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { ACTION } from "../constant/enum";
import { logUserAction } from "./userActionAudit";

export const catchAsync =
  (fn: RequestHandler) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const method = req.method.toLowerCase();
    let actionValue: ACTION = ACTION.CREATE;
    if (method === "post") {
      actionValue = ACTION.CREATE;
    } else if (method === "put" || method === "patch") {
      actionValue = ACTION.UPDATE;
    } else if (method === "delete") {
      actionValue = ACTION.DELETE;
    } else if (method === "get") {
      actionValue = ACTION.VIEW;
    }

    const route = req.originalUrl.split("?")[0];
    const body = req.body;
    const params = req.params;
    const query = req.query;

    console.log("Request info:", {
      route,
      body,
      params,
      query,
      actionValue,
    });

    try {
      await fn(req, res, next);
      logUserAction(route, {
        action: actionValue,
        body,
        params,
        query,
      });
    } catch (error) {
      logUserAction(route, {
        action: actionValue,
        body,
        params,
        query,
        errorMessage: error instanceof Error ? error.message : String(error),
      });
      next(error);
    }
  };
