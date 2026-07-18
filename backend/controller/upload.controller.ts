import { Request, Response } from "express";
import { StatusCodes } from "../constant/statusCodes";
import { Message } from "../constant/messages";
import uploadService from "../services/upload.service";

const UploadService = new uploadService();

class uploadController {
  async uploadAsset(req: Request, res: Response) {
    const response = await UploadService.uploadAsset(req.file);
    res.status(StatusCodes.CREATED).json({
      success: true,
      message: Message.created,
      data: response,
    });
  }
}

export default uploadController;
