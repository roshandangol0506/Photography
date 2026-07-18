import { IsNotEmpty, IsString } from "class-validator";

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
}
