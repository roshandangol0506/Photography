import { Request, Response } from "express";
import { StatusCodes } from "../constant/statusCodes";
import { Message } from "../constant/messages";
import photoService from "../services/photo.service";

const PhotoService = new photoService();

class photoController {
  async createPhoto(req: Request, res: Response) {
    const response = await PhotoService.createPhoto(req.body, req.file);
    res.status(StatusCodes.CREATED).json({
      success: true,
      message: Message.created,
      data: response,
    });
  }

  async getAdminPhotos(req: Request, res: Response) {
    const response = await PhotoService.getAdminPhotos(req.query);
    res.status(StatusCodes.SUCCESS).json({
      success: true,
      message: Message.fetched,
      data: response,
    });
  }

  async getAdminPhotoById(req: Request, res: Response) {
    const response = await PhotoService.getAdminPhotoById(req.params.id);
    res.status(StatusCodes.SUCCESS).json({
      success: true,
      message: Message.fetched,
      data: response,
    });
  }

  async getPublicPhotos(req: Request, res: Response) {
    const response = await PhotoService.getPublicPhotos(req.query);
    res.status(StatusCodes.SUCCESS).json({
      success: true,
      message: Message.fetched,
      data: response,
    });
  }

  async getPhotoBySlug(req: Request, res: Response) {
    const response = await PhotoService.getPhotoBySlug(req.params.slug);
    res.status(StatusCodes.SUCCESS).json({
      success: true,
      message: Message.fetched,
      data: response,
    });
  }

  async getBackgroundPhotos(req: Request, res: Response) {
    const response = await PhotoService.getBackgroundPhotos();
    res.status(StatusCodes.SUCCESS).json({
      success: true,
      message: Message.fetched,
      data: response,
    });
  }

  async getSideScrollPhotos(req: Request, res: Response) {
    const response = await PhotoService.getSideScrollPhotos();
    res.status(StatusCodes.SUCCESS).json({
      success: true,
      message: Message.fetched,
      data: response,
    });
  }

  async updatePhoto(req: Request, res: Response) {
    const response = await PhotoService.updatePhoto(
      req.params.id,
      req.body,
      req.file,
    );
    res.status(StatusCodes.SUCCESS).json({
      success: true,
      message: Message.updated,
      data: response,
    });
  }

  async deletePhoto(req: Request, res: Response) {
    const response = await PhotoService.deletePhoto(req.params.id);
    res.status(StatusCodes.SUCCESS).json({
      success: true,
      message: Message.deleted,
      data: response,
    });
  }
}

export default photoController;
