import Lead from "../models/lead.model";
import mailService from "./mail.service";
import SiteSettings from "../models/siteSettings.model";
import { paginationValidator, getPaginationData } from "../utils/pagination";
import HttpException from "../utils/HttpException.utils";
import { Message } from "../constant/messages";
import { LEAD_STATUS, LEAD_TYPE } from "../constant/enum";

const MailService = new mailService();

class leadService {
  async createLead(body: any, type: LEAD_TYPE = LEAD_TYPE.BOOK_A_DEMO) {
    try {
      return await Lead.create({
        fullName: body.fullName,
        email: body.email,
        phone: body.phone,
        description: body.description,
        type,
        bookingDate: body.bookingDate || null,
        category: body.category || null,
        status: LEAD_STATUS.PENDING,
      });
    } catch (error) {
      throw error;
    }
  }

  async getLeads(query: any) {
    try {
      const [page, perpage] = paginationValidator(query.page, query.perpage);
      const filter: Record<string, any> = {};

      if (query.status) filter.status = query.status;
      if (query.type) filter.type = query.type;
      if (query.search) {
        filter.$or = [
          { fullName: { $regex: query.search, $options: "i" } },
          { email: { $regex: query.search, $options: "i" } },
          { phone: { $regex: query.search, $options: "i" } },
        ];
      }

      const total = await Lead.countDocuments(filter);
      const leads = await Lead.find(filter)
        .populate("category", "name slug")
        .sort({ createdAt: -1 })
        .skip((page - 1) * perpage)
        .limit(perpage);

      return { leads, pagination: getPaginationData(total, page, perpage) };
    } catch (error) {
      throw error;
    }
  }

  async updateStatus(id: string, status: LEAD_STATUS) {
    try {
      const lead = await Lead.findByIdAndUpdate(
        id,
        { status },
        { new: true },
      ).populate("category", "name slug");
      if (!lead) throw HttpException.notFound(Message.notFound);
      return lead;
    } catch (error) {
      throw error;
    }
  }

  async deleteLead(id: string) {
    try {
      const lead = await Lead.findByIdAndDelete(id);
      if (!lead) throw HttpException.notFound(Message.notFound);
      return lead;
    } catch (error) {
      throw error;
    }
  }

  async sendMail(id: string, subject: string, message: string) {
    try {
      const lead = await Lead.findById(id);
      if (!lead) throw HttpException.notFound(Message.notFound);

      const settings = await SiteSettings.findOne();
      const signature = settings?.siteTitle || "Studio";

      // Plain text from the dashboard, so newlines have to become markup.
      const body = message
        .split("\n")
        .map((line) => `<p style="margin:0 0 12px">${line}</p>`)
        .join("");

      await MailService.send({
        to: lead.email,
        subject,
        html: `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#201e1d">
          <p style="margin:0 0 12px">Hi ${lead.fullName},</p>
          ${body}
          <p style="margin:20px 0 0">— ${signature}</p>
        </div>`,
      });

      return lead;
    } catch (error) {
      throw error;
    }
  }
}

export default leadService;
