import { Request, Response } from "express";
import { StatusCodes } from "../constant/statusCodes";
import productService from "../services/product.service";
const ProductService = new productService();
class productController {
  async getProduct(req: Request, res: Response) {
    const response = await ProductService.getProduct();
    res.status(StatusCodes.SUCCESS).json({
      success: true,
      message: "Products Fetched Successfully",
      data: response,
    });
  }
}
export default productController;
