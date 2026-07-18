import { Request, Response } from "express";
import { StatusCodes } from "../constant/statusCodes";
import { Message } from "../constant/messages";
import categoryService from "../services/category.service";

const CategoryService = new categoryService();

class categoryController {
  async createCategory(req: Request, res: Response) {
    const response = await CategoryService.createCategory(req.body);
    res.status(StatusCodes.CREATED).json({
      success: true,
      message: Message.created,
      data: response,
    });
  }

  async getCategories(req: Request, res: Response) {
    const response = await CategoryService.getCategories(req.query);
    res.status(StatusCodes.SUCCESS).json({
      success: true,
      message: Message.fetched,
      data: response,
    });
  }

  async getActiveCategories(req: Request, res: Response) {
    const response = await CategoryService.getActiveCategories();
    res.status(StatusCodes.SUCCESS).json({
      success: true,
      message: Message.fetched,
      data: response,
    });
  }

  async getCategoryById(req: Request, res: Response) {
    const response = await CategoryService.getCategoryById(req.params.id);
    res.status(StatusCodes.SUCCESS).json({
      success: true,
      message: Message.fetched,
      data: response,
    });
  }

  async updateCategory(req: Request, res: Response) {
    const response = await CategoryService.updateCategory(
      req.params.id,
      req.body,
    );
    res.status(StatusCodes.SUCCESS).json({
      success: true,
      message: Message.updated,
      data: response,
    });
  }

  async deleteCategory(req: Request, res: Response) {
    const response = await CategoryService.deleteCategory(req.params.id);
    res.status(StatusCodes.SUCCESS).json({
      success: true,
      message: Message.deleted,
      data: response,
    });
  }
}

export default categoryController;
