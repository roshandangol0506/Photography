import Award from "../models/award.model";
import { paginationValidator, getPaginationData } from "../utils/pagination";
import HttpException from "../utils/HttpException.utils";
import { Message } from "../constant/messages";

class awardService {
  async createAward(body: any) {
    try {
      const award = await Award.create(body);
      return award;
    } catch (error) {
      throw error;
    }
  }

  async getAwards(query: any) {
    try {
      const [page, perpage] = paginationValidator(query.page, query.perpage);
      const filter: Record<string, any> = {};
      if (query.search) filter.title = { $regex: query.search, $options: "i" };
      if (query.isActive !== undefined)
        filter.isActive = query.isActive === "true";

      const total = await Award.countDocuments(filter);
      const awards = await Award.find(filter)
        .sort({ year: -1, order: 1 })
        .skip((page - 1) * perpage)
        .limit(perpage);

      return { awards, pagination: getPaginationData(total, page, perpage) };
    } catch (error) {
      throw error;
    }
  }

  async getActiveAwards() {
    try {
      return await Award.find({ isActive: true }).sort({ year: -1, order: 1 });
    } catch (error) {
      throw error;
    }
  }

  async getAwardById(id: string) {
    try {
      const award = await Award.findById(id);
      if (!award) throw HttpException.notFound(Message.notFound);
      return award;
    } catch (error) {
      throw error;
    }
  }

  async updateAward(id: string, body: any) {
    try {
      const award = await Award.findByIdAndUpdate(id, body, { new: true });
      if (!award) throw HttpException.notFound(Message.notFound);
      return award;
    } catch (error) {
      throw error;
    }
  }

  async deleteAward(id: string) {
    try {
      const award = await Award.findByIdAndDelete(id);
      if (!award) throw HttpException.notFound(Message.notFound);
      return award;
    } catch (error) {
      throw error;
    }
  }
}

export default awardService;
