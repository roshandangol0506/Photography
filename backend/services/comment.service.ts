import Comment from "../models/comment.model";
import Photo from "../models/photo.model";
import Visitor from "../models/visitor.model";
import SiteSettings from "../models/siteSettings.model";
import { paginationValidator, getPaginationData } from "../utils/pagination";
import HttpException from "../utils/HttpException.utils";
import { Message } from "../constant/messages";
import { COMMENT_STATUS } from "../constant/enum";

class commentService {
  async createComment(photoId: string, body: any) {
    try {
      const photo = await Photo.findById(photoId);
      if (!photo) throw HttpException.notFound(Message.notFound);

      if (body.parent) {
        const parent = await Comment.findById(body.parent);
        if (!parent || String(parent.photo) !== String(photo._id)) {
          throw HttpException.badRequest("Invalid parent comment");
        }
      }

      // Published straight away so the visitor sees their own comment, and
      // so the photo's counter (dashboard, admin photo list) moves with it.
      // Moderation stays available after the fact in /admin/comments.
      const comment = await Comment.create({
        photo: photoId,
        parent: body.parent || null,
        visitorId: body.visitorId,
        name: body.name,
        content: body.content,
        status: COMMENT_STATUS.APPROVED,
      });

      await Photo.findByIdAndUpdate(photoId, { $inc: { commentCount: 1 } });

      // Remember the name against the visitor so they are never asked twice,
      // and so the dashboard shows a person instead of "Anonymous".
      await Visitor.findOneAndUpdate(
        { uniqueId: body.visitorId },
        { $set: { name: body.name } },
      );

      return comment;
    } catch (error) {
      throw error;
    }
  }

  // Admin replies skip moderation - they are written by the owner - so the
  // photo's counter has to be advanced here rather than on approval.
  async replyAsAdmin(id: string, content: string) {
    try {
      const parent = await Comment.findById(id);
      if (!parent) throw HttpException.notFound(Message.notFound);

      const settings = await SiteSettings.findOne();

      const reply = await Comment.create({
        photo: parent.photo,
        parent: parent._id,
        visitorId: "admin",
        name: settings?.siteTitle || "Admin",
        content,
        isAdminReply: true,
        status: COMMENT_STATUS.APPROVED,
      });

      await Photo.findByIdAndUpdate(parent.photo, {
        $inc: { commentCount: 1 },
      });

      return reply;
    } catch (error) {
      throw error;
    }
  }

  async toggleLike(id: string, visitorId: string) {
    try {
      const comment = await Comment.findById(id);
      if (!comment) throw HttpException.notFound(Message.notFound);

      const liked = comment.likedBy.includes(visitorId);
      if (liked) {
        comment.likedBy = comment.likedBy.filter((entry) => entry !== visitorId);
      } else {
        comment.likedBy.push(visitorId);
      }
      comment.likeCount = comment.likedBy.length;
      await comment.save();

      return { liked: !liked, likeCount: comment.likeCount };
    } catch (error) {
      throw error;
    }
  }

  // Threads are one level deep: approved roots newest-first, each carrying its
  // approved replies oldest-first so a conversation reads top to bottom.
  async getPublicComments(photoId: string, query: any) {
    try {
      const [page, perpage] = paginationValidator(query.page, query.perpage);
      const visitorId = query.visitorId as string | undefined;
      const filter = {
        photo: photoId,
        parent: null,
        status: COMMENT_STATUS.APPROVED,
      };

      const newestFirst = query.sort !== "oldest";

      const total = await Comment.countDocuments(filter);
      const roots = await Comment.find(filter)
        .sort({ createdAt: newestFirst ? -1 : 1 })
        .skip((page - 1) * perpage)
        .limit(perpage)
        .lean();

      const replies = await Comment.find({
        parent: { $in: roots.map((root) => root._id) },
        status: COMMENT_STATUS.APPROVED,
      })
        .sort({ createdAt: 1 })
        .lean();

      // `likedBy` is internal; the client only needs its own state.
      const shape = (entry: any) => {
        const { likedBy = [], ...rest } = entry;
        return {
          ...rest,
          likedByMe: visitorId ? likedBy.includes(visitorId) : false,
        };
      };

      const comments = roots.map((root) => ({
        ...shape(root),
        replies: replies
          .filter((reply) => String(reply.parent) === String(root._id))
          .map(shape),
      }));

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
