import { Request, Response } from "express";
import { StatusCodes } from "../constant/statusCodes";
import { Message } from "../constant/messages";
import visitorService from "../services/visitor.service";

const VisitorService = new visitorService();

class visitorController {
  async identify(req: Request, res: Response) {
    const response = await VisitorService.identify(
      req.body,
      req.headers["user-agent"],
    );
    res.status(StatusCodes.SUCCESS).json({
      success: true,
      message: Message.fetched,
      data: response,
    });
  }

  async getVisitors(req: Request, res: Response) {
    const response = await VisitorService.getVisitors(req.query);
    res.status(StatusCodes.SUCCESS).json({
      success: true,
      message: Message.fetched,
      data: response,
    });
  }
}

export default visitorController;
