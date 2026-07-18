import { Request, Response } from "express";
import { StatusCodes } from "../constant/statusCodes";
import { Message } from "../constant/messages";
import likeService from "../services/like.service";

const LikeService = new likeService();

class likeController {
  async likePhoto(req: Request, res: Response) {
    const response = await LikeService.likePhoto(
      req.params.photoId,
      req.body.visitorId,
    );
    res.status(StatusCodes.SUCCESS).json({
      success: true,
      message: Message.updated,
      data: response,
    });
  }

  async unlikePhoto(req: Request, res: Response) {
    const response = await LikeService.unlikePhoto(
      req.params.photoId,
      req.query.visitorId as string,
    );
    res.status(StatusCodes.SUCCESS).json({
      success: true,
      message: Message.updated,
      data: response,
    });
  }

  async getLikeStatus(req: Request, res: Response) {
    const response = await LikeService.getLikeStatus(
      req.params.photoId,
      req.query.visitorId as string,
    );
    res.status(StatusCodes.SUCCESS).json({
      success: true,
      message: Message.fetched,
      data: response,
    });
  }

  async getTopLiked(req: Request, res: Response) {
    const response = await LikeService.getTopLiked(req.query);
    res.status(StatusCodes.SUCCESS).json({
      success: true,
      message: Message.fetched,
      data: response,
    });
  }

  async getRecentLikes(req: Request, res: Response) {
    const response = await LikeService.getRecentLikes(req.query);
    res.status(StatusCodes.SUCCESS).json({
      success: true,
      message: Message.fetched,
      data: response,
    });
  }
}

export default likeController;
