import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateCommentDTO {
  @IsString()
  @IsNotEmpty()
  visitorId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsOptional()
  parent?: string;
}

export class ReplyCommentDTO {
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class LikeCommentDTO {
  @IsString()
  @IsNotEmpty()
  visitorId: string;
}
