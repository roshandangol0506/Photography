import ContactMessage from "../models/message.model";
import { paginationValidator, getPaginationData } from "../utils/pagination";
import HttpException from "../utils/HttpException.utils";
import { Message } from "../constant/messages";
import { MESSAGE_STATUS } from "../constant/enum";

class messageService {
  async createMessage(body: any) {
    try {
      const message = await ContactMessage.create(body);
      return message;
    } catch (error) {
      throw error;
    }
  }

  async getMessages(query: any) {
    try {
      const [page, perpage] = paginationValidator(query.page, query.perpage);
      const filter: Record<string, any> = {};
      if (query.status) filter.status = query.status;
      if (query.search) {
        filter.$or = [
          { name: { $regex: query.search, $options: "i" } },
          { email: { $regex: query.search, $options: "i" } },
          { subject: { $regex: query.search, $options: "i" } },
        ];
      }

      const total = await ContactMessage.countDocuments(filter);
      const messages = await ContactMessage.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * perpage)
        .limit(perpage);

      return { messages, pagination: getPaginationData(total, page, perpage) };
    } catch (error) {
      throw error;
    }
  }

  async updateStatus(id: string, status: MESSAGE_STATUS) {
    try {
      const message = await ContactMessage.findByIdAndUpdate(
        id,
        { status },
        { new: true },
      );
      if (!message) throw HttpException.notFound(Message.notFound);
      return message;
    } catch (error) {
      throw error;
    }
  }

  async deleteMessage(id: string) {
    try {
      const message = await ContactMessage.findByIdAndDelete(id);
      if (!message) throw HttpException.notFound(Message.notFound);
      return message;
    } catch (error) {
      throw error;
    }
  }
}

export default messageService;
