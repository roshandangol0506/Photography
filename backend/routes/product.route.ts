import express from "express";
import productController from "../controller/product.controller";
import { UserInterestDTO } from "../dto/userInterest.dto";
import RequestValidator from "../middleware/Request.Validator";
import { catchAsync } from "../utils/catchAsync";

const router = express.Router();

const ProductController = new productController();

router.get("/", catchAsync(ProductController.getProduct));

export default router;
