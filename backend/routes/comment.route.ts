import express from "express";
import commentController from "../controller/comment.controller";
import {
  CreateCommentDTO,
  LikeCommentDTO,
  ReplyCommentDTO,
} from "../dto/comment.dto";
import { UpdateCommentStatusDTO } from "../dto/updateCommentStatus.dto";
import RequestValidator from "../middleware/Request.Validator";
import { catchAsync } from "../utils/catchAsync";
import { authentication } from "../middleware/authentication.middleware";
import { authorization } from "../middleware/authorization.middleware";
import { ROLE } from "../constant/enum";

const router = express.Router();

const CommentController = new commentController();

// Admin (registered before the generic "/:photoId" routes below)
router.use("/admin", authentication(), authorization([ROLE.ADMIN]));
router.get("/admin", catchAsync(CommentController.getAdminComments));
router.patch(
  "/admin/:id/status",
  RequestValidator.validate(UpdateCommentStatusDTO),
  catchAsync(CommentController.updateStatus),
);
router.post(
  "/admin/:id/reply",
  RequestValidator.validate(ReplyCommentDTO),
  catchAsync(CommentController.replyAsAdmin),
);
router.delete("/admin/:id", catchAsync(CommentController.deleteComment));

// Public - must stay last, ":photoId" is a catch-all single segment
router.post(
  "/:photoId",
  RequestValidator.validate(CreateCommentDTO),
  catchAsync(CommentController.createComment),
);
router.get("/:photoId", catchAsync(CommentController.getPublicComments));

// Two segments, so it never collides with the single-segment routes above.
router.post(
  "/:id/like",
  RequestValidator.validate(LikeCommentDTO),
  catchAsync(CommentController.likeComment),
);

export default router;
