import { IsBoolean, IsObject, IsOptional, IsString } from "class-validator";

export class UpdateSettingsDTO {
  @IsString()
  @IsOptional()
  siteTitle?: string;

  @IsString()
  @IsOptional()
  tagline?: string;

  @IsString()
  @IsOptional()
  logo?: string;

  @IsObject()
  @IsOptional()
  themeColors?: Record<string, string>;

  @IsObject()
  @IsOptional()
  seo?: Record<string, string>;

  @IsObject()
  @IsOptional()
  socialLinks?: Record<string, string>;

  @IsObject()
  @IsOptional()
  contactDetails?: Record<string, string>;

  @IsString()
  @IsOptional()
  footerText?: string;

  @IsObject()
  @IsOptional()
  heroSettings?: Record<string, any>;

  @IsBoolean()
  @IsOptional()
  animationsEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  maintenanceMode?: boolean;

  @IsBoolean()
  @IsOptional()
  darkModeDefault?: boolean;
}
