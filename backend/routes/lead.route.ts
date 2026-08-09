import express from "express";
import leadController from "../controller/lead.controller";
import {
  CreateLeadDTO,
  SendLeadMailDTO,
  UpdateLeadStatusDTO,
} from "../dto/lead.dto";
import RequestValidator from "../middleware/Request.Validator";
import { catchAsync } from "../utils/catchAsync";
import { authentication } from "../middleware/authentication.middleware";
import { authorization } from "../middleware/authorization.middleware";
import { ROLE } from "../constant/enum";

const router = express.Router();

const LeadController = new leadController();

// Public: the "book a demo" form on the contact page.
router.post(
  "/",
  RequestValidator.validate(CreateLeadDTO),
  catchAsync(LeadController.createLead),
);

router.use(authentication(), authorization([ROLE.ADMIN]));
router.get("/", catchAsync(LeadController.getLeads));
router.patch(
  "/:id/status",
  RequestValidator.validate(UpdateLeadStatusDTO),
  catchAsync(LeadController.updateStatus),
);
router.post(
  "/:id/mail",
  RequestValidator.validate(SendLeadMailDTO),
  catchAsync(LeadController.sendMail),
);
router.delete("/:id", catchAsync(LeadController.deleteLead));

export default router;
