import express, { Request, Response } from "express";
import auth from "./auth.route";
import visitor from "./visitor.route";
import category from "./category.route";
import collection from "./collection.route";
import photo from "./photo.route";
import award from "./award.route";
import testimonial from "./testimonial.route";
import comment from "./comment.route";
import like from "./like.route";
import message from "./message.route";
import settings from "./settings.route";
import analytics from "./analytics.route";
import upload from "./upload.route";

const app = express.Router();
// Health check endpoint
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

app.use("/auth", auth);
app.use("/visitors", visitor);
app.use("/categories", category);
app.use("/collections", collection);
app.use("/photos", photo);
app.use("/awards", award);
app.use("/testimonials", testimonial);
app.use("/comments", comment);
app.use("/likes", like);
app.use("/messages", message);
app.use("/settings", settings);
app.use("/analytics", analytics);
app.use("/uploads", upload);

export default app;
