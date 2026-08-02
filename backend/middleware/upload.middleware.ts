import multer from "multer";
import { type NextFunction, type Request, type Response } from "express";
import HttpException from "../utils/HttpException.utils";
import { DotenvConfig } from "../config/env.config";

const storage = multer.memoryStorage();

export const MAX_UPLOAD_BYTES = DotenvConfig.MAX_UPLOAD_MB * 1024 * 1024;

const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  if (!file.mimetype.startsWith("image/")) {
    cb(HttpException.badRequest("Only image files are allowed") as any);
    return;
  }
  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_UPLOAD_BYTES },
});

/**
 * Multer rejects an oversized file with a bare MulterError, which the global
 * handler surfaces as an opaque 500 "File too large". Translate it into a 400
 * that names the actual ceiling.
 */
export const handleUploadError = (
  error: any,
  _req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return next(
        HttpException.badRequest(
          `Image is larger than the ${DotenvConfig.MAX_UPLOAD_MB}MB upload limit`,
        ),
      );
    }
    return next(HttpException.badRequest(error.message));
  }
  return next(error);
};
