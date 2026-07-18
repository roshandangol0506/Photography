import { Request, Response } from "express";
import { StatusCodes } from "../constant/statusCodes";
import { Message } from "../constant/messages";
import messageService from "../services/message.service";

const MessageService = new messageService();

class messageController {
  async createMessage(req: Request, res: Response) {
    const response = await MessageService.createMessage(req.body);
    res.status(StatusCodes.CREATED).json({
      success: true,
      message: Message.messageSent,
      data: response,
    });
  }

  async getMessages(req: Request, res: Response) {
    const response = await MessageService.getMessages(req.query);
    res.status(StatusCodes.SUCCESS).json({
      success: true,
      message: Message.fetched,
      data: response,
    });
  }

  async updateStatus(req: Request, res: Response) {
    const response = await MessageService.updateStatus(
      req.params.id,
      req.body.status,
    );
    res.status(StatusCodes.SUCCESS).json({
      success: true,
      message: Message.updated,
      data: response,
    });
  }

  async deleteMessage(req: Request, res: Response) {
    const response = await MessageService.deleteMessage(req.params.id);
    res.status(StatusCodes.SUCCESS).json({
      success: true,
      message: Message.deleted,
      data: response,
    });
  }
}

export default messageController;
