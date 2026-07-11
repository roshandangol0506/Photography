import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

export class DotenvConfig {
  static PORT = process.env.PORT;
  static NODE_ENV = process.env.NODE_ENV;
  static SOCKET_PROTOCOL = process.env.SOCKET_PROTOCOL;
  static SOCKET_HOST = process.env.SOCKET_HOST;
  static SOCKET_PORT = process.env.SOCKET_PORT;
  static SOCKET_TOKEN = process.env.SOCKET_TOKEN;
  static DEBUG_MODE = process.env.DEBUG_MODE;
  static REDIS_SERVER = process.env.REDIS_SERVER;
  static BASEPATH = process.env.BASEPATH;
  static PASSWORD = process.env.PASSWORD;
  static EMAIL = process.env.EMAIL;
  static SMTP_HOST = process.env.SMTP_HOST;
  static SMTP_PORT = process.env.SMTP_PORT;
  static EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
  static EMAIL_DEV = process.env.EMAIL_DEV;
  static EMAIL_TO = process.env.EMAIL_TO;
  static DATABASE_HOST = process.env.DATABASE_HOST;

  static CONTROL_PANEL_KEY = process.env.CONTROL_PANEL_KEY;
  static REDIS_HOST = process.env.REDIS_HOST;
  static REDIS_PORT = process.env.REDIS_PORT;
  static REDIS_PASSWORD = process.env.REDIS_PASSWORD;
  static SOCKET_ALLOWED_ORIGINS = process.env.SOCKET_ALLOWED_ORIGINS;

  static API_RATE_LIMIT = Number(process.env.API_RATE_LIMIT) || 500;
  static API_WINDOW_MINUTE = Number(process.env.API_WINDOW_MINUTE) || 5;
}
