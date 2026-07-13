import { type NextFunction, type Request, type Response } from "express";
import { DotenvConfig } from "../config/env.config";
import { Message } from "../constant/messages";
import { IJwtPayload } from "../interface/jwt.interface";
import WebTokenService from "../services/webtoken.service";
import HttpException from "../utils/HttpException.utils";
import { getUserRole } from "../utils/helperFunctions.utils";

export const authentication = () => {
  return async (req: Request, _: Response, next: NextFunction) => {
    const tokenService = new WebTokenService();
    const tokens = req.headers.authorization?.split(" ");

    try {
      if (!tokens) {
        throw HttpException.unauthorized(Message.unAuthorized);
      }
      const mode = tokens[0];
      const accessToken = tokens[1];
      if (mode !== "Bearer" || !accessToken)
        throw HttpException.unauthorized(Message.unAuthorized);
      const payload = tokenService.verify(accessToken, DotenvConfig.JWT_SECRET);
      if (payload) {
        req.user = payload as unknown as IJwtPayload;
        const role = await getUserRole(req.user.id as string);
        if (req.user.role !== role) req.user.role = role;
        next();
      } else {
        throw HttpException.unauthorized(Message.unAuthorized);
      }
    } catch (err: any) {
      if (err.name === "TokenExpiredError") {
        next(
          HttpException.unauthorized(
            "Your token has expired. Please login again.",
          ),
        );
        return;
      }
      next(HttpException.unauthorized(Message.unAuthorized));
    }
  };
};
