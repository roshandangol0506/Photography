import express from "express";
import visitorController from "../controller/visitor.controller";
import { VisitorIdentifyDTO } from "../dto/visitorIdentify.dto";
import RequestValidator from "../middleware/Request.Validator";
import { catchAsync } from "../utils/catchAsync";
import { authentication } from "../middleware/authentication.middleware";
import { authorization } from "../middleware/authorization.middleware";
import { ROLE } from "../constant/enum";

const router = express.Router();

const VisitorController = new visitorController();

router.post(
  "/identify",
  RequestValidator.validate(VisitorIdentifyDTO),
  catchAsync(VisitorController.identify),
);

router.use(authentication(), authorization([ROLE.ADMIN]));
router.get("/", catchAsync(VisitorController.getVisitors));

export default router;
