import express from "express";
import authController from "../controller/auth.controller";
import { LoginDTO } from "../dto/login.dto";
import { VerifyOtpDTO } from "../dto/verifyOtp.dto";
import RequestValidator from "../middleware/Request.Validator";
import { catchAsync } from "../utils/catchAsync";
import { authentication } from "../middleware/authentication.middleware";

const router = express.Router();

const AuthController = new authController();

router.post(
  "/login",
  RequestValidator.validate(LoginDTO),
  catchAsync(AuthController.login),
);
router.post(
  "/otp/verify",
  RequestValidator.validate(VerifyOtpDTO),
  catchAsync(AuthController.verifyOtp),
);
router.get("/unlock/:token", catchAsync(AuthController.unlock));

router.use(authentication());
router.post("/logout", catchAsync(AuthController.logout));
router.get("/me", catchAsync(AuthController.me));

export default router;
