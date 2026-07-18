import Photo from "../models/photo.model";
import Visitor from "../models/visitor.model";
import VisitLog from "../models/visitLog.model";
import Like from "../models/like.model";
import Comment from "../models/comment.model";
import Collection from "../models/collection.model";
import Award from "../models/award.model";
import HttpException from "../utils/HttpException.utils";
import { ANALYTICS_RANGE, COMMENT_STATUS, VISIBILITY } from "../constant/enum";

const DATE_FORMAT: Record<ANALYTICS_RANGE, string> = {
  [ANALYTICS_RANGE.DAILY]: "%Y-%m-%d",
  [ANALYTICS_RANGE.WEEKLY]: "%Y-W%U",
  [ANALYTICS_RANGE.MONTHLY]: "%Y-%m",
  [ANALYTICS_RANGE.YEARLY]: "%Y",
};

const MODEL_MAP: Record<string, any> = {
  visitors: VisitLog,
  likes: Like,
  comments: Comment,
  photos: Photo,
};

class analyticsService {
  async getOverview() {
    try {
      const [
        totalPhotos,
        totalVisitors,
        totalLikes,
        totalComments,
        totalCollections,
        totalAwards,
      ] = await Promise.all([
        Photo.countDocuments({ visibility: VISIBILITY.PUBLISHED }),
        Visitor.countDocuments(),
        Like.countDocuments(),
        Comment.countDocuments({ status: COMMENT_STATUS.APPROVED }),
        Collection.countDocuments(),
        Award.countDocuments(),
      ]);

      return {
        totalPhotos,
        totalVisitors,
        totalLikes,
        totalComments,
        totalCollections,
        totalAwards,
      };
    } catch (error) {
      throw error;
    }
  }

  async getChart(query: any) {
    try {
      const metric = query.metric || "visitors";
      const range: ANALYTICS_RANGE = query.range || ANALYTICS_RANGE.DAILY;
      const Model = MODEL_MAP[metric];
      if (!Model) throw HttpException.badRequest("Invalid metric");

      const match: Record<string, any> = {};
      if (query.from || query.to) {
        match.createdAt = {};
        if (query.from) match.createdAt.$gte = new Date(query.from);
        if (query.to) match.createdAt.$lte = new Date(query.to);
      }

      const data = await Model.aggregate([
        { $match: match },
        {
          $group: {
            _id: {
              $dateToString: {
                format: DATE_FORMAT[range] || DATE_FORMAT[ANALYTICS_RANGE.DAILY],
                date: "$createdAt",
              },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      return data.map((item: any) => ({ date: item._id, count: item.count }));
    } catch (error) {
      throw error;
    }
  }

  async exportData(query: any) {
    try {
      const data = await this.getChart(query);
      const header = "date,count";
      const rows = data.map((item: any) => `${item.date},${item.count}`);
      return [header, ...rows].join("\n");
    } catch (error) {
      throw error;
    }
  }
}

export default analyticsService;
