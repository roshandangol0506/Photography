import express from "express";
import analyticsController from "../controller/analytics.controller";
import { catchAsync } from "../utils/catchAsync";
import { authentication } from "../middleware/authentication.middleware";
import { authorization } from "../middleware/authorization.middleware";
import { ROLE } from "../constant/enum";

const router = express.Router();

const AnalyticsController = new analyticsController();

router.use(authentication(), authorization([ROLE.ADMIN]));
router.get("/overview", catchAsync(AnalyticsController.getOverview));
router.get("/chart", catchAsync(AnalyticsController.getChart));
router.get("/export", catchAsync(AnalyticsController.exportData));

export default router;
