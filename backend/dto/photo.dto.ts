import { IsIn, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreatePhotoDTO {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsOptional()
  collections?: string[] | string;

  @IsOptional()
  tags?: string[] | string;

  @IsString()
  @IsOptional()
  camera?: string;

  @IsString()
  @IsOptional()
  lens?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsOptional()
  dateTaken?: string;

  @IsOptional()
  isBackground?: boolean | string;

  @IsOptional()
  isSideScroll?: boolean | string;

  @IsOptional()
  isFeatured?: boolean | string;

  @IsOptional()
  isTrending?: boolean | string;

  @IsOptional()
  isHome?: boolean | string;

  @IsIn(["draft", "published", "archive"])
  @IsOptional()
  visibility?: string;

  @IsOptional()
  order?: number | string;
}

export class UpdatePhotoDTO {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsOptional()
  collections?: string[] | string;

  @IsOptional()
  tags?: string[] | string;

  @IsString()
  @IsOptional()
  camera?: string;

  @IsString()
  @IsOptional()
  lens?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsOptional()
  dateTaken?: string;

  @IsOptional()
  isBackground?: boolean | string;

  @IsOptional()
  isSideScroll?: boolean | string;

  @IsOptional()
  isFeatured?: boolean | string;

  @IsOptional()
  isTrending?: boolean | string;

  @IsOptional()
  isHome?: boolean | string;

  @IsIn(["draft", "published", "archive"])
  @IsOptional()
  visibility?: string;

  @IsOptional()
  order?: number | string;
}
