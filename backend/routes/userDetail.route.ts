import express from "express";
import interestController from "../controller/userIntrest.controller";
import { UserInterestDTO } from "../dto/userInterest.dto";
import RequestValidator from "../middleware/Request.Validator";
import { catchAsync } from "../utils/catchAsync";

const router = express.Router();

const InterestController = new interestController();

router.post(
  "/userInterest",
  RequestValidator.validate(UserInterestDTO),
  catchAsync(InterestController.interest),
);

export default router;
