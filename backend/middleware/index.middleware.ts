import express, { type Application, type Response } from "express";
import { Server as SocketIOServer } from "socket.io";
import cors from "cors";
import path from "path";
import cookieParser from "cookie-parser";
import routeManager from "../routes/index.routes";
import { createServer, Server as HTTPServer } from "http";
import fs from "fs";
import expressStaticGzip from "express-static-gzip";
import { errorHandler } from "./errorHandler.middleware";
import { apiKeyAuth } from "./apiKey.middleware";
import { DotenvConfig } from "../config/env.config";
import { rateLimit } from "express-rate-limit";

const middleware = (app: Application) => {
  const server: HTTPServer = createServer(app);

  app.set("trust proxy", 1);

  // Serve static chatbot files
  const botPath = path.join(__dirname, "./dist");
  const botDistExists = fs.existsSync(botPath);

  if (botDistExists) {
    // Serve pre-compressed files (Brotli and Gzip)
    app.use(
      "/chatbot",
      expressStaticGzip(botPath, {
        enableBrotli: true,
        orderPreference: ["br", "gz"], // Prefer Brotli, fallback to Gzip
        index: false, // Don't auto-serve index.html
        serveStatic: {
          maxAge: "0",
          etag: true,
          lastModified: true,
          immutable: true,
          setHeaders: (res, filePath) => {
            res.setHeader("X-Content-Type-Options", "nosniff");

            // Aggressive caching for hashed assets
            if (
              /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|webp|avif)$/i.test(
                filePath,
              )
            ) {
              res.setHeader("Cache-Control", "public, max-age=0, immutable");
            }
            // No cache for HTML
            else if (filePath.endsWith(".html")) {
              res.setHeader(
                "Cache-Control",
                "no-cache, no-store, must-revalidate",
              );
              res.setHeader("Pragma", "no-cache");
            }
          },
        },
      }),
    );
  }

  const rateLimiter = rateLimit({
    windowMs: DotenvConfig.API_WINDOW_MINUTE * 60 * 1000,
    limit: DotenvConfig.API_RATE_LIMIT,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    ipv6Subnet: 56,
  });

  const io = new SocketIOServer(server, {
    maxHttpBufferSize: 1e8,
  });

  app.use(
    cors({
      origin: DotenvConfig.CORS_ORIGIN,
      credentials: true,
      methods: ["GET", "POST", "PATCH", "DELETE", "PUT", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "apiKey"],
    }),
  );

  app.use(express.json());

  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());

  app.use(
    `/${DotenvConfig.LOCAL_UPLOAD_DIR}`,
    express.static(path.join(process.cwd(), DotenvConfig.LOCAL_UPLOAD_DIR)),
  );

  app.use("/", rateLimiter);
  app.use("/api", apiKeyAuth(), routeManager);
  app.use(express.static(botPath));

  // Catch-all route for chatbot host
  app.get("/", (_, res: Response) => {
    res.sendFile(path.join(botPath, "index.html"));
  });

  app.use(errorHandler);
};

export default middleware;
