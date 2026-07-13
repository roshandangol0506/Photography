import express from "express";
import productController from "../controller/product.controller";
import { UserInterestDTO } from "../dto/userInterest.dto";
import RequestValidator from "../middleware/Request.Validator";
import { catchAsync } from "../utils/catchAsync";
import { authorization } from "../middleware/authorization.middleware";
import { ROLE } from "../constant/enum";

const router = express.Router();

const ProductController = new productController();

router.use(authorization([ROLE.ADMIN]));
router.get("/", catchAsync(ProductController.getProduct));

export default router;
