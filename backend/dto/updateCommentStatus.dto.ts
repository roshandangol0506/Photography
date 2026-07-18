import { IsIn, IsNotEmpty } from "class-validator";

export class UpdateCommentStatusDTO {
  @IsIn(["pending", "approved", "rejected"])
  @IsNotEmpty()
  status: string;
}
