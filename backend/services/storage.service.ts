import fs from "fs";
import path from "path";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { DotenvConfig } from "../config/env.config";
import { STORAGE_PROVIDER } from "../constant/enum";

export interface UploadResult {
  url: string;
  key: string;
  provider: STORAGE_PROVIDER;
}

class StorageService {
  private s3Client: S3Client | null = null;

  private isS3(): boolean {
    return DotenvConfig.IMG_STORE === STORAGE_PROVIDER.S3;
  }

  private getS3Client(): S3Client {
    if (!this.s3Client) {
      this.s3Client = new S3Client({
        region: DotenvConfig.AWS_REGION,
        credentials: {
          accessKeyId: DotenvConfig.AWS_ACCESS_KEY_ID as string,
          secretAccessKey: DotenvConfig.AWS_SECRET_ACCESS_KEY as string,
        },
      });
    }
    return this.s3Client;
  }

  async upload(
    buffer: Buffer,
    key: string,
    mimetype: string,
  ): Promise<UploadResult> {
    try {
      if (this.isS3()) {
        await this.getS3Client().send(
          new PutObjectCommand({
            Bucket: DotenvConfig.AWS_S3_BUCKET,
            Key: key,
            Body: buffer,
            ContentType: mimetype,
          }),
        );
        const base =
          DotenvConfig.AWS_S3_BASE_URL ||
          `https://${DotenvConfig.AWS_S3_BUCKET}.s3.${DotenvConfig.AWS_REGION}.amazonaws.com`;
        return { url: `${base}/${key}`, key, provider: STORAGE_PROVIDER.S3 };
      }

      const uploadDir = path.join(process.cwd(), DotenvConfig.LOCAL_UPLOAD_DIR);
      const filePath = path.join(uploadDir, key);
      await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
      await fs.promises.writeFile(filePath, buffer);
      return {
        url: `/${DotenvConfig.LOCAL_UPLOAD_DIR}/${key}`,
        key,
        provider: STORAGE_PROVIDER.LOCAL,
      };
    } catch (error) {
      throw error;
    }
  }

  async delete(key: string, provider: STORAGE_PROVIDER): Promise<void> {
    try {
      if (provider === STORAGE_PROVIDER.S3) {
        await this.getS3Client().send(
          new DeleteObjectCommand({
            Bucket: DotenvConfig.AWS_S3_BUCKET,
            Key: key,
          }),
        );
        return;
      }
      const filePath = path.join(process.cwd(), DotenvConfig.LOCAL_UPLOAD_DIR, key);
      await fs.promises.unlink(filePath).catch(() => {});
    } catch (error) {
      throw error;
    }
  }
}

export default StorageService;
