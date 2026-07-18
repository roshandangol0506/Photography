import express from "express";
import photoController from "../controller/photo.controller";
import { CreatePhotoDTO, UpdatePhotoDTO } from "../dto/photo.dto";
import RequestValidator from "../middleware/Request.Validator";
import { catchAsync } from "../utils/catchAsync";
import { authentication } from "../middleware/authentication.middleware";
import { authorization } from "../middleware/authorization.middleware";
import { ROLE } from "../constant/enum";
import { upload } from "../middleware/upload.middleware";

const router = express.Router();

const PhotoController = new photoController();

// Public
router.get("/background", catchAsync(PhotoController.getBackgroundPhotos));
router.get("/sidescroll", catchAsync(PhotoController.getSideScrollPhotos));
router.get("/", catchAsync(PhotoController.getPublicPhotos));

// Admin (registered before the generic "/:slug" route further down)
router.use("/admin", authentication(), authorization([ROLE.ADMIN]));
router.get("/admin", catchAsync(PhotoController.getAdminPhotos));
router.post(
  "/admin",
  upload.single("image"),
  RequestValidator.validate(CreatePhotoDTO),
  catchAsync(PhotoController.createPhoto),
);
router.get("/admin/:id", catchAsync(PhotoController.getAdminPhotoById));
router.put(
  "/admin/:id",
  upload.single("image"),
  RequestValidator.validate(UpdatePhotoDTO),
  catchAsync(PhotoController.updatePhoto),
);
router.delete("/admin/:id", catchAsync(PhotoController.deletePhoto));

// Public detail lookup - must stay last, it's a catch-all single segment
router.get("/:slug", catchAsync(PhotoController.getPhotoBySlug));

export default router;
