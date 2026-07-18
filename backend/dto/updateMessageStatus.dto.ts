import { IsIn, IsNotEmpty } from "class-validator";

export class UpdateMessageStatusDTO {
  @IsIn(["new", "read", "archived"])
  @IsNotEmpty()
  status: string;
}
