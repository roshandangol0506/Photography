import Testimonial from "../models/testimonial.model";
import { paginationValidator, getPaginationData } from "../utils/pagination";
import HttpException from "../utils/HttpException.utils";
import { Message } from "../constant/messages";

class testimonialService {
  async createTestimonial(body: any) {
    try {
      const testimonial = await Testimonial.create(body);
      return testimonial;
    } catch (error) {
      throw error;
    }
  }

  async getTestimonials(query: any) {
    try {
      const [page, perpage] = paginationValidator(query.page, query.perpage);
      const filter: Record<string, any> = {};
      if (query.search) filter.name = { $regex: query.search, $options: "i" };
      if (query.isActive !== undefined)
        filter.isActive = query.isActive === "true";

      const total = await Testimonial.countDocuments(filter);
      const testimonials = await Testimonial.find(filter)
        .sort({ order: 1, createdAt: -1 })
        .skip((page - 1) * perpage)
        .limit(perpage);

      return {
        testimonials,
        pagination: getPaginationData(total, page, perpage),
      };
    } catch (error) {
      throw error;
    }
  }

  async getActiveTestimonials() {
    try {
      return await Testimonial.find({ isActive: true }).sort({ order: 1 });
    } catch (error) {
      throw error;
    }
  }

  async getTestimonialById(id: string) {
    try {
      const testimonial = await Testimonial.findById(id);
      if (!testimonial) throw HttpException.notFound(Message.notFound);
      return testimonial;
    } catch (error) {
      throw error;
    }
  }

  async updateTestimonial(id: string, body: any) {
    try {
      const testimonial = await Testimonial.findByIdAndUpdate(id, body, {
        new: true,
      });
      if (!testimonial) throw HttpException.notFound(Message.notFound);
      return testimonial;
    } catch (error) {
      throw error;
    }
  }

  async deleteTestimonial(id: string) {
    try {
      const testimonial = await Testimonial.findByIdAndDelete(id);
      if (!testimonial) throw HttpException.notFound(Message.notFound);
      return testimonial;
    } catch (error) {
      throw error;
    }
  }
}

export default testimonialService;
