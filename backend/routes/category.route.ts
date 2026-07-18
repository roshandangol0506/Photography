import express from "express";
import categoryController from "../controller/category.controller";
import { CreateCategoryDTO, UpdateCategoryDTO } from "../dto/category.dto";
import RequestValidator from "../middleware/Request.Validator";
import { catchAsync } from "../utils/catchAsync";
import { authentication } from "../middleware/authentication.middleware";
import { authorization } from "../middleware/authorization.middleware";
import { ROLE } from "../constant/enum";

const router = express.Router();

const CategoryController = new categoryController();

router.get("/active", catchAsync(CategoryController.getActiveCategories));

router.use(authentication(), authorization([ROLE.ADMIN]));
router.get("/", catchAsync(CategoryController.getCategories));
router.post(
  "/",
  RequestValidator.validate(CreateCategoryDTO),
  catchAsync(CategoryController.createCategory),
);
router.get("/:id", catchAsync(CategoryController.getCategoryById));
router.put(
  "/:id",
  RequestValidator.validate(UpdateCategoryDTO),
  catchAsync(CategoryController.updateCategory),
);
router.delete("/:id", catchAsync(CategoryController.deleteCategory));

export default router;
