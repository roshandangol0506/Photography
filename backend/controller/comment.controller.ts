import { Request, Response } from "express";
import { StatusCodes } from "../constant/statusCodes";
import { Message } from "../constant/messages";
import commentService from "../services/comment.service";

const CommentService = new commentService();

class commentController {
  async createComment(req: Request, res: Response) {
    const response = await CommentService.createComment(
      req.params.photoId,
      req.body,
    );
    res.status(StatusCodes.CREATED).json({
      success: true,
      message: Message.commentSubmitted,
      data: response,
    });
  }

  async getPublicComments(req: Request, res: Response) {
    const response = await CommentService.getPublicComments(
      req.params.photoId,
      req.query,
    );
    res.status(StatusCodes.SUCCESS).json({
      success: true,
      message: Message.fetched,
      data: response,
    });
  }

  async getAdminComments(req: Request, res: Response) {
    const response = await CommentService.getAdminComments(req.query);
    res.status(StatusCodes.SUCCESS).json({
      success: true,
      message: Message.fetched,
      data: response,
    });
  }

  async updateStatus(req: Request, res: Response) {
    const response = await CommentService.updateStatus(
      req.params.id,
      req.body.status,
    );
    res.status(StatusCodes.SUCCESS).json({
      success: true,
      message: Message.updated,
      data: response,
    });
  }

  async deleteComment(req: Request, res: Response) {
    const response = await CommentService.deleteComment(req.params.id);
    res.status(StatusCodes.SUCCESS).json({
      success: true,
      message: Message.deleted,
      data: response,
    });
  }
}

export default commentController;
