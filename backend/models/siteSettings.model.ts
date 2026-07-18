import mongoose, { Schema } from "mongoose";

export interface ISiteSettings extends mongoose.Document {
  siteTitle: string;
  tagline?: string;
  logo?: string;
  themeColors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: string;
  };
  socialLinks: {
    instagram?: string;
    facebook?: string;
    youtube?: string;
    behance?: string;
  };
  contactDetails: {
    email?: string;
    phone?: string;
    location?: string;
    mapEmbedUrl?: string;
  };
  footerText?: string;
  heroSettings: {
    autoplaySpeedMs: number;
    transitionStyle: string;
  };
  animationsEnabled: boolean;
  maintenanceMode: boolean;
  darkModeDefault: boolean;
}

const siteSettingsSchema = new Schema<ISiteSettings>(
  {
    siteTitle: { type: String, default: "Photography Portfolio" },
    tagline: { type: String, default: "" },
    logo: { type: String, default: "" },
    themeColors: {
      primary: { type: String, default: "#c5161d" },
      secondary: { type: String, default: "#044189" },
      accent: { type: String, default: "#f5a623" },
    },
    seo: {
      metaTitle: { type: String, default: "" },
      metaDescription: { type: String, default: "" },
      ogImage: { type: String, default: "" },
    },
    socialLinks: {
      instagram: { type: String, default: "" },
      facebook: { type: String, default: "" },
      youtube: { type: String, default: "" },
      behance: { type: String, default: "" },
    },
    contactDetails: {
      email: { type: String, default: "" },
      phone: { type: String, default: "" },
      location: { type: String, default: "" },
      mapEmbedUrl: { type: String, default: "" },
    },
    footerText: { type: String, default: "" },
    heroSettings: {
      autoplaySpeedMs: { type: Number, default: 5000 },
      transitionStyle: { type: String, default: "fade" },
    },
    animationsEnabled: { type: Boolean, default: true },
    maintenanceMode: { type: Boolean, default: false },
    darkModeDefault: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const SiteSettings = mongoose.model<ISiteSettings>(
  "site_settings",
  siteSettingsSchema,
);
export default SiteSettings;
