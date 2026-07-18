import Comment from "../models/comment.model";
import Photo from "../models/photo.model";
import { paginationValidator, getPaginationData } from "../utils/pagination";
import HttpException from "../utils/HttpException.utils";
import { Message } from "../constant/messages";
import { COMMENT_STATUS } from "../constant/enum";

class commentService {
  async createComment(photoId: string, body: any) {
    try {
      const photo = await Photo.findById(photoId);
      if (!photo) throw HttpException.notFound(Message.notFound);

      const comment = await Comment.create({
        photo: photoId,
        visitorId: body.visitorId,
        name: body.name,
        content: body.content,
        status: COMMENT_STATUS.PENDING,
      });

      return comment;
    } catch (error) {
      throw error;
    }
  }

  async getPublicComments(photoId: string, query: any) {
    try {
      const [page, perpage] = paginationValidator(query.page, query.perpage);
      const filter = { photo: photoId, status: COMMENT_STATUS.APPROVED };

      const total = await Comment.countDocuments(filter);
      const comments = await Comment.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * perpage)
        .limit(perpage);

      return { comments, pagination: getPaginationData(total, page, perpage) };
    } catch (error) {
      throw error;
    }
  }

  async getAdminComments(query: any) {
    try {
      const [page, perpage] = paginationValidator(query.page, query.perpage);
      const filter: Record<string, any> = {};
      if (query.status) filter.status = query.status;
      if (query.search)
        filter.content = { $regex: query.search, $options: "i" };
      if (query.photo) filter.photo = query.photo;

      const total = await Comment.countDocuments(filter);
      const comments = await Comment.find(filter)
        .populate("photo", "title slug")
        .sort({ createdAt: -1 })
        .skip((page - 1) * perpage)
        .limit(perpage);

      return { comments, pagination: getPaginationData(total, page, perpage) };
    } catch (error) {
      throw error;
    }
  }

  async updateStatus(id: string, status: COMMENT_STATUS) {
    try {
      const comment = await Comment.findById(id);
      if (!comment) throw HttpException.notFound(Message.notFound);

      const wasApproved = comment.status === COMMENT_STATUS.APPROVED;
      const willBeApproved = status === COMMENT_STATUS.APPROVED;

      comment.status = status;
      await comment.save();

      if (!wasApproved && willBeApproved) {
        await Photo.findByIdAndUpdate(comment.photo, {
          $inc: { commentCount: 1 },
        });
      } else if (wasApproved && !willBeApproved) {
        await Photo.findByIdAndUpdate(comment.photo, {
          $inc: { commentCount: -1 },
        });
      }

      return comment;
    } catch (error) {
      throw error;
    }
  }

  async deleteComment(id: string) {
    try {
      const comment = await Comment.findByIdAndDelete(id);
      if (!comment) throw HttpException.notFound(Message.notFound);

      if (comment.status === COMMENT_STATUS.APPROVED) {
        await Photo.findByIdAndUpdate(comment.photo, {
          $inc: { commentCount: -1 },
        });
      }

      return comment;
    } catch (error) {
      throw error;
    }
  }
}

export default commentService;
