import Collection from "../models/collection.model";
import { paginationValidator, getPaginationData } from "../utils/pagination";
import HttpException from "../utils/HttpException.utils";
import { Message } from "../constant/messages";

class collectionService {
  async createCollection(body: any) {
    try {
      const collection = await Collection.create(body);
      return collection;
    } catch (error) {
      throw error;
    }
  }

  async getCollections(query: any) {
    try {
      const [page, perpage] = paginationValidator(query.page, query.perpage);
      const filter: Record<string, any> = {};
      if (query.search) filter.name = { $regex: query.search, $options: "i" };
      if (query.isActive !== undefined)
        filter.isActive = query.isActive === "true";

      const total = await Collection.countDocuments(filter);
      const collections = await Collection.find(filter)
        .sort({ order: 1, createdAt: -1 })
        .skip((page - 1) * perpage)
        .limit(perpage);

      return {
        collections,
        pagination: getPaginationData(total, page, perpage),
      };
    } catch (error) {
      throw error;
    }
  }

  async getActiveCollections() {
    try {
      return await Collection.find({ isActive: true }).sort({ order: 1 });
    } catch (error) {
      throw error;
    }
  }

  async getCollectionById(id: string) {
    try {
      const collection = await Collection.findById(id);
      if (!collection) throw HttpException.notFound(Message.notFound);
      return collection;
    } catch (error) {
      throw error;
    }
  }

  async updateCollection(id: string, body: any) {
    try {
      const collection = await Collection.findByIdAndUpdate(id, body, {
        new: true,
      });
      if (!collection) throw HttpException.notFound(Message.notFound);
      return collection;
    } catch (error) {
      throw error;
    }
  }

  async deleteCollection(id: string) {
    try {
      const collection = await Collection.findByIdAndDelete(id);
      if (!collection) throw HttpException.notFound(Message.notFound);
      return collection;
    } catch (error) {
      throw error;
    }
  }
}

export default collectionService;
