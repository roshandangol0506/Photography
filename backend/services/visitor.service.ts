import { UAParser } from "ua-parser-js";
import Visitor from "../models/visitor.model";
import VisitLog from "../models/visitLog.model";
import { VisitorIdentifyDTO } from "../dto/visitorIdentify.dto";
import { paginationValidator, getPaginationData } from "../utils/pagination";

class visitorService {
  async identify(body: VisitorIdentifyDTO, userAgent?: string) {
    try {
      await VisitLog.create({
        visitorId: body.uniqueId,
        path: body.path || "/",
      });

      const existing = await Visitor.findOne({ uniqueId: body.uniqueId });
      if (existing) {
        existing.visitCount += 1;
        existing.lastVisit = new Date();
        if (body.name && !existing.name) existing.name = body.name;
        await existing.save();
        return existing;
      }

      const ua = new UAParser(userAgent || "").getResult();
      const visitor = await Visitor.create({
        uniqueId: body.uniqueId,
        name: body.name || null,
        device: ua.device.type || "desktop",
        browser: ua.browser.name || "unknown",
        platform: ua.os.name || "unknown",
      });
      return visitor;
    } catch (error) {
      throw error;
    }
  }

  async getVisitors(query: any) {
    try {
      const [page, perpage] = paginationValidator(query.page, query.perpage);
      const filter: Record<string, any> = {};

      if (query.search) {
        filter.$or = [
          { uniqueId: { $regex: query.search, $options: "i" } },
          { name: { $regex: query.search, $options: "i" } },
        ];
      }
      if (query.device) filter.device = query.device;
      if (query.browser) filter.browser = query.browser;
      if (query.platform) filter.platform = query.platform;

      const total = await Visitor.countDocuments(filter);
      const visitors = await Visitor.find(filter)
        .sort({ lastVisit: -1 })
        .skip((page - 1) * perpage)
        .limit(perpage);

      return { visitors, pagination: getPaginationData(total, page, perpage) };
    } catch (error) {
      throw error;
    }
  }
}

export default visitorService;
