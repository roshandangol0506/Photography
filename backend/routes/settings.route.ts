import express from "express";
import settingsController from "../controller/settings.controller";
import { UpdateSettingsDTO } from "../dto/settings.dto";
import RequestValidator from "../middleware/Request.Validator";
import { catchAsync } from "../utils/catchAsync";
import { authentication } from "../middleware/authentication.middleware";
import { authorization } from "../middleware/authorization.middleware";
import { ROLE } from "../constant/enum";

const router = express.Router();

const SettingsController = new settingsController();

router.get("/", catchAsync(SettingsController.getSettings));

router.use("/admin", authentication(), authorization([ROLE.ADMIN]));
router.get("/admin", catchAsync(SettingsController.getSettings));
router.put(
  "/admin",
  RequestValidator.validate(UpdateSettingsDTO),
  catchAsync(SettingsController.updateSettings),
);

export default router;
