import { type NextFunction, type Request, type Response } from "express";
import { DotenvConfig } from "../config/env.config";
import { Message } from "../constant/messages";
import HttpException from "../utils/HttpException.utils";

export const apiKeyAuth = () => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const apiKey = req.headers.apikey;
    if (!apiKey || apiKey !== DotenvConfig.API_KEY) {
      throw HttpException.unauthorized(Message.invalidApiKey);
    }
    next();
  };
};
