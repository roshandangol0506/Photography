import Category from "../models/category.model";
import { paginationValidator, getPaginationData } from "../utils/pagination";
import HttpException from "../utils/HttpException.utils";
import { Message } from "../constant/messages";

class categoryService {
  async createCategory(body: any) {
    try {
      const category = await Category.create(body);
      return category;
    } catch (error) {
      throw error;
    }
  }

  async getCategories(query: any) {
    try {
      const [page, perpage] = paginationValidator(query.page, query.perpage);
      const filter: Record<string, any> = {};
      if (query.search) filter.name = { $regex: query.search, $options: "i" };
      if (query.isActive !== undefined)
        filter.isActive = query.isActive === "true";

      const total = await Category.countDocuments(filter);
      const categories = await Category.find(filter)
        .sort({ order: 1, createdAt: -1 })
        .skip((page - 1) * perpage)
        .limit(perpage);

      return {
        categories,
        pagination: getPaginationData(total, page, perpage),
      };
    } catch (error) {
      throw error;
    }
  }

  async getActiveCategories() {
    try {
      return await Category.find({ isActive: true }).sort({ order: 1 });
    } catch (error) {
      throw error;
    }
  }

  async getCategoryById(id: string) {
    try {
      const category = await Category.findById(id);
      if (!category) throw HttpException.notFound(Message.notFound);
      return category;
    } catch (error) {
      throw error;
    }
  }

  async updateCategory(id: string, body: any) {
    try {
      const category = await Category.findByIdAndUpdate(id, body, {
        new: true,
      });
      if (!category) throw HttpException.notFound(Message.notFound);
      return category;
    } catch (error) {
      throw error;
    }
  }

  async deleteCategory(id: string) {
    try {
      const category = await Category.findByIdAndDelete(id);
      if (!category) throw HttpException.notFound(Message.notFound);
      return category;
    } catch (error) {
      throw error;
    }
  }
}

export default categoryService;
