import Like from "../models/like.model";
import Photo from "../models/photo.model";
import HttpException from "../utils/HttpException.utils";
import { Message } from "../constant/messages";
import { VISIBILITY } from "../constant/enum";
import { paginationValidator, getPaginationData } from "../utils/pagination";

class likeService {
  async likePhoto(photoId: string, visitorId: string) {
    try {
      const photo = await Photo.findById(photoId);
      if (!photo) throw HttpException.notFound(Message.notFound);

      const existing = await Like.findOne({ photo: photoId, visitorId });
      if (existing) throw HttpException.conflict(Message.alreadyLiked);

      await Like.create({ photo: photoId, visitorId });
      const updated = await Photo.findByIdAndUpdate(
        photoId,
        { $inc: { likeCount: 1 } },
        { new: true },
      );

      return { liked: true, likeCount: updated?.likeCount ?? 0 };
    } catch (error) {
      throw error;
    }
  }

  async unlikePhoto(photoId: string, visitorId: string) {
    try {
      const existing = await Like.findOneAndDelete({
        photo: photoId,
        visitorId,
      });
      if (!existing) throw HttpException.badRequest(Message.notLiked);

      const updated = await Photo.findByIdAndUpdate(
        photoId,
        { $inc: { likeCount: -1 } },
        { new: true },
      );

      return { liked: false, likeCount: updated?.likeCount ?? 0 };
    } catch (error) {
      throw error;
    }
  }

  async getLikeStatus(photoId: string, visitorId: string) {
    try {
      const existing = await Like.findOne({ photo: photoId, visitorId });
      return { liked: !!existing };
    } catch (error) {
      throw error;
    }
  }

  async getTopLiked(query: any) {
    try {
      const limit = query.limit ? Number(query.limit) : 10;
      return await Photo.find({ visibility: VISIBILITY.PUBLISHED })
        .sort({ likeCount: -1 })
        .limit(limit)
        .select("title slug images likeCount");
    } catch (error) {
      throw error;
    }
  }

  async getRecentLikes(query: any) {
    try {
      const [page, perpage] = paginationValidator(query.page, query.perpage);

      const total = await Like.countDocuments();
      const likes = await Like.find()
        .populate("photo", "title slug images")
        .sort({ createdAt: -1 })
        .skip((page - 1) * perpage)
        .limit(perpage);

      return { likes, pagination: getPaginationData(total, page, perpage) };
    } catch (error) {
      throw error;
    }
  }
}

export default likeService;
