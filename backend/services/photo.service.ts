import crypto from "crypto";
import Photo from "../models/photo.model";
import Category from "../models/category.model";
import Collection from "../models/collection.model";
import StorageService from "./storage.service";
import {
  generateImageVariants,
  generateBlurPlaceholder,
} from "../utils/imageProcessing.utils";
import { paginationValidator, getPaginationData } from "../utils/pagination";
import HttpException from "../utils/HttpException.utils";
import { Message } from "../constant/messages";
import { VISIBILITY, STORAGE_PROVIDER } from "../constant/enum";

const toArray = (value: unknown): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(String);
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const toBool = (value: unknown, fallback = false): boolean => {
  if (value === undefined) return fallback;
  return value === true || value === "true";
};

class photoService {
  private storage = new StorageService();

  async createPhoto(body: any, file?: Express.Multer.File) {
    try {
      if (!file) throw HttpException.badRequest("Photo image is required");

      const variants = await generateImageVariants(file.buffer);
      const blurDataURL = await generateBlurPlaceholder(file.buffer);

      const folder = `photos/${body.slug}-${crypto.randomUUID()}`;
      const images: Record<string, string> = {};
      const storageKeys: string[] = [];
      let provider: STORAGE_PROVIDER = STORAGE_PROVIDER.LOCAL;

      for (const variant of variants) {
        const key = `${folder}-${variant.suffix}.webp`;
        const result = await this.storage.upload(
          variant.buffer,
          key,
          "image/webp",
        );
        images[variant.suffix] = result.url;
        storageKeys.push(result.key);
        provider = result.provider;
      }

      const photo = await Photo.create({
        title: body.title,
        slug: body.slug,
        description: body.description,
        images: { ...images, blurDataURL },
        storageProvider: provider,
        storageKeys,
        category: body.category || null,
        collections: toArray(body.collections),
        tags: toArray(body.tags),
        camera: body.camera,
        lens: body.lens,
        location: body.location,
        dateTaken: body.dateTaken || null,
        isBackground: toBool(body.isBackground),
        isSideScroll: toBool(body.isSideScroll),
        isFeatured: toBool(body.isFeatured),
        isTrending: toBool(body.isTrending),
        isHome: toBool(body.isHome),
        visibility: body.visibility || VISIBILITY.DRAFT,
        order: body.order ? Number(body.order) : 0,
      });

      return photo;
    } catch (error) {
      throw error;
    }
  }

  async getAdminPhotos(query: any) {
    try {
      const [page, perpage] = paginationValidator(query.page, query.perpage);
      const filter: Record<string, any> = {};

      if (query.search) filter.title = { $regex: query.search, $options: "i" };
      if (query.category) filter.category = query.category;
      if (query.visibility) filter.visibility = query.visibility;
      if (query.tag) filter.tags = query.tag;

      const total = await Photo.countDocuments(filter);
      const photos = await Photo.find(filter)
        .populate("category", "name slug")
        .populate("collections", "name slug")
        .sort({ createdAt: -1 })
        .skip((page - 1) * perpage)
        .limit(perpage);

      return { photos, pagination: getPaginationData(total, page, perpage) };
    } catch (error) {
      throw error;
    }
  }

  async getAdminPhotoById(id: string) {
    try {
      const photo = await Photo.findById(id)
        .populate("category", "name slug")
        .populate("collections", "name slug");
      if (!photo) throw HttpException.notFound(Message.notFound);
      return photo;
    } catch (error) {
      throw error;
    }
  }

  async getPublicPhotos(query: any) {
    try {
      const [page, perpage] = paginationValidator(query.page, query.perpage);
      const filter: Record<string, any> = {
        visibility: VISIBILITY.PUBLISHED,
      };

      if (query.search) filter.title = { $regex: query.search, $options: "i" };

      // Category/collection are addressed by slug everywhere on the public
      // site, but Photo stores them as ObjectId refs - resolve before filtering.
      if (query.category) {
        const category = await Category.findOne(
          { slug: query.category },
          "_id",
        );
        if (!category)
          return { photos: [], pagination: getPaginationData(0, page, perpage) };
        filter.category = category._id;
      }
      if (query.collection) {
        const collection = await Collection.findOne(
          { slug: query.collection },
          "_id",
        );
        if (!collection)
          return { photos: [], pagination: getPaginationData(0, page, perpage) };
        filter.collections = collection._id;
      }

      if (query.tag) filter.tags = query.tag;
      if (query.featured === "true") filter.isFeatured = true;
      if (query.trending === "true") filter.isTrending = true;

      const total = await Photo.countDocuments(filter);
      const photos = await Photo.find(filter)
        .select("-storageKeys -storageProvider")
        .populate("category", "name slug")
        .populate("collections", "name slug")
        .sort({ order: 1, createdAt: -1 })
        .skip((page - 1) * perpage)
        .limit(perpage);

      return { photos, pagination: getPaginationData(total, page, perpage) };
    } catch (error) {
      throw error;
    }
  }

  async getPhotoBySlug(slug: string) {
    try {
      const photo = await Photo.findOneAndUpdate(
        { slug, visibility: VISIBILITY.PUBLISHED },
        { $inc: { viewCount: 1 } },
        { new: true },
      )
        .select("-storageKeys -storageProvider")
        .populate("category", "name slug")
        .populate("collections", "name slug");

      if (!photo) throw HttpException.notFound(Message.notFound);

      const related = await Photo.find({
        _id: { $ne: photo._id },
        visibility: VISIBILITY.PUBLISHED,
        category: photo.category,
      })
        .select("title slug images")
        .limit(8);

      return { photo, related };
    } catch (error) {
      throw error;
    }
  }

  async getBackgroundPhotos() {
    try {
      return await Photo.find({
        isBackground: true,
        visibility: VISIBILITY.PUBLISHED,
      })
        .select("title slug images")
        .sort({ order: 1 });
    } catch (error) {
      throw error;
    }
  }

  async getSideScrollPhotos() {
    try {
      return await Photo.find({
        isSideScroll: true,
        visibility: VISIBILITY.PUBLISHED,
      })
        .select("title slug images")
        .sort({ order: 1 });
    } catch (error) {
      throw error;
    }
  }

  async updatePhoto(id: string, body: any, file?: Express.Multer.File) {
    try {
      const photo = await Photo.findById(id);
      if (!photo) throw HttpException.notFound(Message.notFound);

      const updatePayload: Record<string, any> = {};

      if (body.title !== undefined) updatePayload.title = body.title;
      if (body.slug !== undefined) updatePayload.slug = body.slug;
      if (body.description !== undefined)
        updatePayload.description = body.description;
      if (body.category !== undefined)
        updatePayload.category = body.category || null;
      if (body.collections !== undefined)
        updatePayload.collections = toArray(body.collections);
      if (body.tags !== undefined) updatePayload.tags = toArray(body.tags);
      if (body.camera !== undefined) updatePayload.camera = body.camera;
      if (body.lens !== undefined) updatePayload.lens = body.lens;
      if (body.location !== undefined) updatePayload.location = body.location;
      if (body.dateTaken !== undefined)
        updatePayload.dateTaken = body.dateTaken;
      if (body.isBackground !== undefined)
        updatePayload.isBackground = toBool(body.isBackground);
      if (body.isSideScroll !== undefined)
        updatePayload.isSideScroll = toBool(body.isSideScroll);
      if (body.isFeatured !== undefined)
        updatePayload.isFeatured = toBool(body.isFeatured);
      if (body.isTrending !== undefined)
        updatePayload.isTrending = toBool(body.isTrending);
      if (body.isHome !== undefined)
        updatePayload.isHome = toBool(body.isHome);
      if (body.visibility !== undefined)
        updatePayload.visibility = body.visibility;
      if (body.order !== undefined) updatePayload.order = Number(body.order);

      if (file) {
        await Promise.all(
          photo.storageKeys.map((key) =>
            this.storage.delete(key, photo.storageProvider),
          ),
        );

        const variants = await generateImageVariants(file.buffer);
        const blurDataURL = await generateBlurPlaceholder(file.buffer);
        const folder = `photos/${body.slug || photo.slug}-${crypto.randomUUID()}`;
        const images: Record<string, string> = {};
        const storageKeys: string[] = [];
        let provider: STORAGE_PROVIDER = photo.storageProvider;

        for (const variant of variants) {
          const key = `${folder}-${variant.suffix}.webp`;
          const result = await this.storage.upload(
            variant.buffer,
            key,
            "image/webp",
          );
          images[variant.suffix] = result.url;
          storageKeys.push(result.key);
          provider = result.provider;
        }

        updatePayload.images = { ...images, blurDataURL };
        updatePayload.storageKeys = storageKeys;
        updatePayload.storageProvider = provider;
      }

      const updated = await Photo.findByIdAndUpdate(id, updatePayload, {
        new: true,
      });
      return updated;
    } catch (error) {
      throw error;
    }
  }

  async deletePhoto(id: string) {
    try {
      const photo = await Photo.findById(id);
      if (!photo) throw HttpException.notFound(Message.notFound);

      await Promise.all(
        photo.storageKeys.map((key) =>
          this.storage.delete(key, photo.storageProvider),
        ),
      );

      await Photo.findByIdAndDelete(id);
      return photo;
    } catch (error) {
      throw error;
    }
  }
}

export default photoService;
