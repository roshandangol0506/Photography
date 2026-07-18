import express from "express";
import collectionController from "../controller/collection.controller";
import {
  CreateCollectionDTO,
  UpdateCollectionDTO,
} from "../dto/collection.dto";
import RequestValidator from "../middleware/Request.Validator";
import { catchAsync } from "../utils/catchAsync";
import { authentication } from "../middleware/authentication.middleware";
import { authorization } from "../middleware/authorization.middleware";
import { ROLE } from "../constant/enum";

const router = express.Router();

const CollectionController = new collectionController();

router.get("/active", catchAsync(CollectionController.getActiveCollections));

router.use(authentication(), authorization([ROLE.ADMIN]));
router.get("/", catchAsync(CollectionController.getCollections));
router.post(
  "/",
  RequestValidator.validate(CreateCollectionDTO),
  catchAsync(CollectionController.createCollection),
);
router.get("/:id", catchAsync(CollectionController.getCollectionById));
router.put(
  "/:id",
  RequestValidator.validate(UpdateCollectionDTO),
  catchAsync(CollectionController.updateCollection),
);
router.delete("/:id", catchAsync(CollectionController.deleteCollection));

export default router;
