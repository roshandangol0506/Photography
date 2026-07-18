import { IsNotEmpty, IsString } from "class-validator";

export class LikeDTO {
  @IsString()
  @IsNotEmpty()
  visitorId: string;
}
