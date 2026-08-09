import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";
import { LEAD_STATUS } from "../constant/enum";

export class CreateLeadDTO {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  bookingDate?: string;

  @IsString()
  @IsOptional()
  category?: string;
}

export class UpdateLeadStatusDTO {
  @IsEnum(LEAD_STATUS)
  status: LEAD_STATUS;
}

export class SendLeadMailDTO {
  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  message: string;
}
