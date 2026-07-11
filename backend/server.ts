import { createServer } from "http";
import { DotenvConfig } from "./config/env.config";
import mongoose from "mongoose";
import Print from "./utils/Print";
import { indexSeed } from "./seeders/index.seed";
import express from "express";
import middleware from "./middleware/index.middleware";

const app = express();
async function listen() {
  middleware(app);
  await indexSeed();
  const PORT = DotenvConfig.PORT;
  const httpServer = createServer(app);
  httpServer.listen(PORT);
  Print.info(`Server is listening on port ${PORT} 🚀`);
}

mongoose
  .connect(DotenvConfig.DATABASE_HOST as string, {
    serverSelectionTimeoutMS: 5000, // Timeout after 5s
  })
  .then(async () => {
    await listen();
    Print.info("Connected to mongoDB");
  })
  .catch(() => {
    Print.error("Couldn't connect to database");
  });
