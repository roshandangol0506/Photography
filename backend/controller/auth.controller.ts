import { Request, Response } from "express";
import { StatusCodes } from "../constant/statusCodes";
import { Message } from "../constant/messages";
import authService from "../services/auth.service";

const AuthService = new authService();

class authController {
  async login(req: Request, res: Response) {
    const response = await AuthService.login(req.body);
    res.status(StatusCodes.SUCCESS).json({
      success: true,
      message: response.otpRequired
        ? Message.otpSent
        : Message.loginSuccessfully,
      data: response,
    });
  }

  async verifyOtp(req: Request, res: Response) {
    const response = await AuthService.verifyOtp(req.body);
    res.status(StatusCodes.SUCCESS).json({
      success: true,
      message: Message.loginSuccessfully,
      data: response,
    });
  }

  async unlock(req: Request, res: Response) {
    const response = await AuthService.unlock(req.params.token);
    res.status(StatusCodes.SUCCESS).json({
      success: true,
      message: Message.accountUnlocked,
      data: response,
    });
  }

  async logout(req: Request, res: Response) {
    res.status(StatusCodes.SUCCESS).json({
      success: true,
      message: Message.loggedOut,
      data: null,
    });
  }

  async me(req: Request, res: Response) {
    const response = await AuthService.me(req.user!.id as string);
    res.status(StatusCodes.SUCCESS).json({
      success: true,
      message: Message.fetched,
      data: response,
    });
  }
}

export default authController;
