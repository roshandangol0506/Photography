import express from "express";
import messageController from "../controller/message.controller";
import { CreateMessageDTO } from "../dto/message.dto";
import { UpdateMessageStatusDTO } from "../dto/updateMessageStatus.dto";
import RequestValidator from "../middleware/Request.Validator";
import { catchAsync } from "../utils/catchAsync";
import { authentication } from "../middleware/authentication.middleware";
import { authorization } from "../middleware/authorization.middleware";
import { ROLE } from "../constant/enum";

const router = express.Router();

const MessageController = new messageController();

router.post(
  "/",
  RequestValidator.validate(CreateMessageDTO),
  catchAsync(MessageController.createMessage),
);

router.use(authentication(), authorization([ROLE.ADMIN]));
router.get("/", catchAsync(MessageController.getMessages));
router.patch(
  "/:id/status",
  RequestValidator.validate(UpdateMessageStatusDTO),
  catchAsync(MessageController.updateStatus),
);
router.delete("/:id", catchAsync(MessageController.deleteMessage));

export default router;
