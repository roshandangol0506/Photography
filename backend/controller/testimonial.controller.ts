import { Request, Response } from "express";
import { StatusCodes } from "../constant/statusCodes";
import { Message } from "../constant/messages";
import testimonialService from "../services/testimonial.service";

const TestimonialService = new testimonialService();

class testimonialController {
  async createTestimonial(req: Request, res: Response) {
    const response = await TestimonialService.createTestimonial(req.body);
    res.status(StatusCodes.CREATED).json({
      success: true,
      message: Message.created,
      data: response,
    });
  }

  async getTestimonials(req: Request, res: Response) {
    const response = await TestimonialService.getTestimonials(req.query);
    res.status(StatusCodes.SUCCESS).json({
      success: true,
      message: Message.fetched,
      data: response,
    });
  }

  async getActiveTestimonials(req: Request, res: Response) {
    const response = await TestimonialService.getActiveTestimonials();
    res.status(StatusCodes.SUCCESS).json({
      success: true,
      message: Message.fetched,
      data: response,
    });
  }

  async getTestimonialById(req: Request, res: Response) {
    const response = await TestimonialService.getTestimonialById(
      req.params.id,
    );
    res.status(StatusCodes.SUCCESS).json({
      success: true,
      message: Message.fetched,
      data: response,
    });
  }

  async updateTestimonial(req: Request, res: Response) {
    const response = await TestimonialService.updateTestimonial(
      req.params.id,
      req.body,
    );
    res.status(StatusCodes.SUCCESS).json({
      success: true,
      message: Message.updated,
      data: response,
    });
  }

  async deleteTestimonial(req: Request, res: Response) {
    const response = await TestimonialService.deleteTestimonial(
      req.params.id,
    );
    res.status(StatusCodes.SUCCESS).json({
      success: true,
      message: Message.deleted,
      data: response,
    });
  }
}

export default testimonialController;
