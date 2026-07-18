import SiteSettings from "../models/siteSettings.model";
import Print from "../utils/Print";

export async function siteSettingsSeed() {
  try {
    const existing = await SiteSettings.findOne();
    if (existing) {
      Print.info("Site settings already seeded");
      return;
    }
    await SiteSettings.create({});
    Print.info("Site settings seed successful");
  } catch (error: any) {
    Print.warn(error?.message);
  }
}
