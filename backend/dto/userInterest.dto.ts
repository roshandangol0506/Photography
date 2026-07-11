import {
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  isString,
  IsString,
} from "class-validator";

export class UserInterestDTO {
  @IsMongoId()
  @IsNotEmpty()
  branch_id: string;

  @IsString()
  @IsOptional()
  current_address: string;

  @IsString()
  @IsOptional()
  address: string;

  @IsString()
  @IsOptional()
  fullname: string;

  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  interest: string;

  @IsString()
  @IsOptional()
  formType: string;

  @IsString()
  @IsOptional()
  mobileNumber: string;

  @IsString()
  @IsOptional()
  mobile: string;

  @IsEmail()
  @IsOptional()
  mobile_email: string;

  @IsString()
  @IsOptional()
  email: string;

  @IsMongoId()
  @IsNotEmpty()
  org_id: string;

  @IsString()
  @IsNotEmpty()
  visitorId: string;

  @IsString()
  @IsOptional()
  fullName: string;

  @IsString()
  @IsOptional()
  emailAddress: string;

  @IsString()
  @IsOptional()
  mobileNo: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsString()
  @IsOptional()
  droper: string;

  @IsString()
  @IsOptional()
  source: string;

  @IsString()
  @IsOptional()
  policyNumber: string;

  @IsString()
  @IsOptional()
  claimNumber: string;

  @IsString()
  @IsOptional()
  DateOfLoss: string;

  @IsString()
  @IsOptional()
  vehicleNumber: string;

  @IsString()
  @IsOptional()
  PlaceOfLoss: string;

  @IsString()
  @IsOptional()
  EstimatedLoss: string;
}
