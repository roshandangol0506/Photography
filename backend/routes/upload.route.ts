import express from "express";
import uploadController from "../controller/upload.controller";
import { catchAsync } from "../utils/catchAsync";
import { authentication } from "../middleware/authentication.middleware";
import { authorization } from "../middleware/authorization.middleware";
import { ROLE } from "../constant/enum";
import { upload } from "../middleware/upload.middleware";

const router = express.Router();

const UploadController = new uploadController();

router.use(authentication(), authorization([ROLE.ADMIN]));
router.post(
  "/",
  upload.single("file"),
  catchAsync(UploadController.uploadAsset),
);

export default router;
