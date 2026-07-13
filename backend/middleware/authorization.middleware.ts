import { type NextFunction, type Request, type Response } from "express";
import { ROLE } from "../constant/enum";
import { Message } from "../constant/messages";
import HttpException from "../utils/HttpException.utils";

export const authorization = (roles: ROLE[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) throw HttpException.unauthorized(Message.unAuthorized);
    try {
      const role = req.user.role as ROLE;
      if (roles.includes(role)) next();
      else throw HttpException.unauthorized(Message.unAuthorized);
    } catch (error) {
      throw HttpException.unauthorized(Message.unAuthorized);
    }
  };
};
