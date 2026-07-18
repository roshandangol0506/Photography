import { Request, Response } from "express";
import { StatusCodes } from "../constant/statusCodes";
import { Message } from "../constant/messages";
import settingsService from "../services/settings.service";

const SettingsService = new settingsService();

class settingsController {
  async getSettings(req: Request, res: Response) {
    const response = await SettingsService.getSettings();
    res.status(StatusCodes.SUCCESS).json({
      success: true,
      message: Message.fetched,
      data: response,
    });
  }

  async updateSettings(req: Request, res: Response) {
    const response = await SettingsService.updateSettings(req.body);
    res.status(StatusCodes.SUCCESS).json({
      success: true,
      message: Message.updated,
      data: response,
    });
  }
}

export default settingsController;
