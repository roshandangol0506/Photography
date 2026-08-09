import { Request, Response } from "express";
import { StatusCodes } from "../constant/statusCodes";
import { Message } from "../constant/messages";
import leadService from "../services/lead.service";

const LeadService = new leadService();

class leadController {
  async createLead(req: Request, res: Response) {
    const response = await LeadService.createLead(req.body);
    res.status(StatusCodes.CREATED).json({
      success: true,
      message: Message.messageSent,
      data: response,
    });
  }

  async getLeads(req: Request, res: Response) {
    const response = await LeadService.getLeads(req.query);
    res.status(StatusCodes.SUCCESS).json({
      success: true,
      message: Message.fetched,
      data: response,
    });
  }

  async updateStatus(req: Request, res: Response) {
    const response = await LeadService.updateStatus(
      req.params.id,
      req.body.status,
    );
    res.status(StatusCodes.SUCCESS).json({
      success: true,
      message: Message.updated,
      data: response,
    });
  }

  async deleteLead(req: Request, res: Response) {
    const response = await LeadService.deleteLead(req.params.id);
    res.status(StatusCodes.SUCCESS).json({
      success: true,
      message: Message.deleted,
      data: response,
    });
  }

  async sendMail(req: Request, res: Response) {
    const response = await LeadService.sendMail(
      req.params.id,
      req.body.subject,
      req.body.message,
    );
    res.status(StatusCodes.SUCCESS).json({
      success: true,
      message: Message.messageSent,
      data: response,
    });
  }
}

export default leadController;
