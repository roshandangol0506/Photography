import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class VisitorIdentifyDTO {
  @IsString()
  @IsNotEmpty()
  uniqueId: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  path?: string;
}
