import crypto from "crypto";
import StorageService from "./storage.service";
import HttpException from "../utils/HttpException.utils";

class uploadService {
  private storage = new StorageService();

  async uploadAsset(file?: Express.Multer.File) {
    try {
      if (!file) throw HttpException.badRequest("File is required");

      const key = `assets/${crypto.randomUUID()}-${file.originalname}`;
      const result = await this.storage.upload(file.buffer, key, file.mimetype);

      return { url: result.url, key: result.key };
    } catch (error) {
      throw error;
    }
  }
}

export default uploadService;
