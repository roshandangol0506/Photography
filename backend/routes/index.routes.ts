import express, { Request, Response, Router } from "express";
import userDetail from "./userDetail.route";
import product from "./product.route";

const app = express.Router();
// Health check endpoint
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});
app.use("/user", userDetail);
app.use("/product", product);

export default app;
