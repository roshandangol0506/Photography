import { Request, Response } from "express";
import { StatusCodes } from "../constant/statusCodes";
import { Message } from "../constant/messages";
import awardService from "../services/award.service";

const AwardService = new awardService();

class awardController {
  async createAward(req: Request, res: Response) {
    const response = await AwardService.createAward(req.body);
    res.status(StatusCodes.CREATED).json({
      success: true,
      message: Message.created,
      data: response,
    });
  }

  async getAwards(req: Request, res: Response) {
    const response = await AwardService.getAwards(req.query);
    res.status(StatusCodes.SUCCESS).json({
      success: true,
      message: Message.fetched,
      data: response,
    });
  }

  async getActiveAwards(req: Request, res: Response) {
    const response = await AwardService.getActiveAwards();
    res.status(StatusCodes.SUCCESS).json({
      success: true,
      message: Message.fetched,
      data: response,
    });
  }

  async getAwardById(req: Request, res: Response) {
    const response = await AwardService.getAwardById(req.params.id);
    res.status(StatusCodes.SUCCESS).json({
      success: true,
      message: Message.fetched,
      data: response,
    });
  }

  async updateAward(req: Request, res: Response) {
    const response = await AwardService.updateAward(req.params.id, req.body);
    res.status(StatusCodes.SUCCESS).json({
      success: true,
      message: Message.updated,
      data: response,
    });
  }

  async deleteAward(req: Request, res: Response) {
    const response = await AwardService.deleteAward(req.params.id);
    res.status(StatusCodes.SUCCESS).json({
      success: true,
      message: Message.deleted,
      data: response,
    });
  }
}

export default awardController;
