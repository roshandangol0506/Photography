import express from "express";
import likeController from "../controller/like.controller";
import { LikeDTO } from "../dto/like.dto";
import RequestValidator from "../middleware/Request.Validator";
import { catchAsync } from "../utils/catchAsync";
import { authentication } from "../middleware/authentication.middleware";
import { authorization } from "../middleware/authorization.middleware";
import { ROLE } from "../constant/enum";

const router = express.Router();

const LikeController = new likeController();

// Admin (registered before the generic "/:photoId" routes below)
router.use("/admin", authentication(), authorization([ROLE.ADMIN]));
router.get("/admin/top", catchAsync(LikeController.getTopLiked));
router.get("/admin/recent", catchAsync(LikeController.getRecentLikes));

// Public - must stay last, ":photoId" is a catch-all single segment
router.get("/:photoId/status", catchAsync(LikeController.getLikeStatus));
router.post(
  "/:photoId",
  RequestValidator.validate(LikeDTO),
  catchAsync(LikeController.likePhoto),
);
router.delete("/:photoId", catchAsync(LikeController.unlikePhoto));

export default router;
