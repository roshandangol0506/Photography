import { Request, Response } from "express";
import { StatusCodes } from "../constant/statusCodes";
import interestService from "../services/userIntrest.service";
const InterestService = new interestService();
class interestController {
  async interest(req: Request, res: Response) {
    const bodyData = req.body;
    const response = await InterestService.userInterest(bodyData);
    res.status(StatusCodes.SUCCESS).json({
      success: true,
      message: "User Interest submitted successfully.",
      data: response,
    });
  }
}
export default interestController;
