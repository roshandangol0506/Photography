/**
 * Shapes returned by the Express API. Copied from the Vite app's api/*.ts
 * modules so both frontends agree on the contract while the migration runs.
 */

export interface PhotoRef {
  _id: string;
  name: string;
  slug: string;
}

export interface PhotoImages {
  thumb: string;
  medium: string;
  large: string;
  blurDataURL: string;
}

export interface Photo {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  images: PhotoImages;
  category?: PhotoRef | null;
  collections: PhotoRef[];
  tags: string[];
  camera?: string;
  lens?: string;
  location?: string;
  dateTaken?: string | null;
  isBackground: boolean;
  isSideScroll: boolean;
  isFeatured: boolean;
  isTrending: boolean;
  isHome: boolean;
  visibility: "draft" | "published" | "archive";
  order: number;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: string;
}

export interface RelatedPhoto {
  _id: string;
  title: string;
  slug: string;
  images: PhotoImages;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  coverImage?: string;
  country?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
}

export interface ActiveCategory extends Category {
  photoCount: number;
}

export interface Collection {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  coverImage?: string;
  isBackgroundList?: boolean;
  order: number;
  isActive: boolean;
  createdAt: string;
}

export interface Award {
  _id: string;
  title: string;
  organization?: string;
  year: number;
  description?: string;
  image?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
}

export interface Testimonial {
  _id: string;
  name: string;
  role?: string;
  avatar?: string;
  image?: string;
  message: string;
  rating: number;
  order: number;
  isActive: boolean;
  createdAt: string;
}

export interface SiteSettings {
  _id: string;
  siteTitle: string;
  tagline?: string;
  logo?: string;
  logoDark?: string;
  themeColors: {
    primary: string;
    secondary: string;
    accent: string;
    siteAccent?: string;
    siteBackground?: string;
    siteText?: string;
  };
  seo: { metaTitle?: string; metaDescription?: string; ogImage?: string };
  socialLinks: {
    instagram?: string;
    facebook?: string;
    youtube?: string;
    behance?: string;
  };
  contactDetails: {
    email?: string;
    phone?: string;
    whatsapp?: string;
    location?: string;
    mapEmbedUrl?: string;
  };
  footerText?: string;
  heroSettings: {
    autoplaySpeedMs: number;
    transitionStyle: string;
    eyebrow?: string;
    headline?: string;
    ctaLabel?: string;
  };
  about: {
    title?: string;
    description?: string;
    image?: string;
    portraitImage?: string;
    experienceYears?: number;
  };
  animationsEnabled: boolean;
  maintenanceMode: boolean;
  darkModeDefault: boolean;
}
