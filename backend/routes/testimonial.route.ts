import express from "express";
import testimonialController from "../controller/testimonial.controller";
import {
  CreateTestimonialDTO,
  UpdateTestimonialDTO,
} from "../dto/testimonial.dto";
import RequestValidator from "../middleware/Request.Validator";
import { catchAsync } from "../utils/catchAsync";
import { authentication } from "../middleware/authentication.middleware";
import { authorization } from "../middleware/authorization.middleware";
import { ROLE } from "../constant/enum";

const router = express.Router();

const TestimonialController = new testimonialController();

router.get(
  "/active",
  catchAsync(TestimonialController.getActiveTestimonials),
);

router.use(authentication(), authorization([ROLE.ADMIN]));
router.get("/", catchAsync(TestimonialController.getTestimonials));
router.post(
  "/",
  RequestValidator.validate(CreateTestimonialDTO),
  catchAsync(TestimonialController.createTestimonial),
);
router.get("/:id", catchAsync(TestimonialController.getTestimonialById));
router.put(
  "/:id",
  RequestValidator.validate(UpdateTestimonialDTO),
  catchAsync(TestimonialController.updateTestimonial),
);
router.delete("/:id", catchAsync(TestimonialController.deleteTestimonial));

export default router;
