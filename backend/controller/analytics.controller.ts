import { Request, Response } from "express";
import { StatusCodes } from "../constant/statusCodes";
import { Message } from "../constant/messages";
import analyticsService from "../services/analytics.service";

const AnalyticsService = new analyticsService();

class analyticsController {
  async getOverview(req: Request, res: Response) {
    const response = await AnalyticsService.getOverview();
    res.status(StatusCodes.SUCCESS).json({
      success: true,
      message: Message.fetched,
      data: response,
    });
  }

  async getChart(req: Request, res: Response) {
    const response = await AnalyticsService.getChart(req.query);
    res.status(StatusCodes.SUCCESS).json({
      success: true,
      message: Message.fetched,
      data: response,
    });
  }

  async exportData(req: Request, res: Response) {
    const csv = await AnalyticsService.exportData(req.query);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="analytics-${req.query.metric || "visitors"}.csv"`,
    );
    res.status(StatusCodes.SUCCESS).send(csv);
  }
}

export default analyticsController;
