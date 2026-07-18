import express from "express";
import awardController from "../controller/award.controller";
import { CreateAwardDTO, UpdateAwardDTO } from "../dto/award.dto";
import RequestValidator from "../middleware/Request.Validator";
import { catchAsync } from "../utils/catchAsync";
import { authentication } from "../middleware/authentication.middleware";
import { authorization } from "../middleware/authorization.middleware";
import { ROLE } from "../constant/enum";

const router = express.Router();

const AwardController = new awardController();

router.get("/active", catchAsync(AwardController.getActiveAwards));

router.use(authentication(), authorization([ROLE.ADMIN]));
router.get("/", catchAsync(AwardController.getAwards));
router.post(
  "/",
  RequestValidator.validate(CreateAwardDTO),
  catchAsync(AwardController.createAward),
);
router.get("/:id", catchAsync(AwardController.getAwardById));
router.put(
  "/:id",
  RequestValidator.validate(UpdateAwardDTO),
  catchAsync(AwardController.updateAward),
);
router.delete("/:id", catchAsync(AwardController.deleteAward));

export default router;
