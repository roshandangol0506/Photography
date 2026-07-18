import SiteSettings from "../models/siteSettings.model";

class settingsService {
  async getSettings() {
    try {
      let settings = await SiteSettings.findOne();
      if (!settings) settings = await SiteSettings.create({});
      return settings;
    } catch (error) {
      throw error;
    }
  }

  async updateSettings(body: any) {
    try {
      let settings = await SiteSettings.findOne();
      if (!settings) {
        settings = await SiteSettings.create(body);
        return settings;
      }
      Object.assign(settings, body);
      await settings.save();
      return settings;
    } catch (error) {
      throw error;
    }
  }
}

export default settingsService;
