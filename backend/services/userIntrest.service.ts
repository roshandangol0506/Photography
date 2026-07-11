import { DotenvConfig } from "../config/env.config";
import { Message } from "../constant/messages";
import { UserInterestDTO } from "../dto/userInterest.dto";
import HttpException from "../utils/HttpException.utils";
import { newPostToServer } from "./server.services";

const { client } = require("../utils/redis");
export interface interestBody {
  branch_id: string;
  visitorId: string;
  fullName: string;
  emailAddress: string;
  mobileNumber: string;
  mobileNo: string;
  interest: string;
  type: string;
  problem: string;
  org_id: string;
  suggestion: string;
  title?: string;
  fullname: string;
  mobile_email: string;
  description: string;
  droper: string;
  source: string;
  current_address: string;
  formType: string;
  policyNumber?: string;
  claimNumber?: string;
  DateOfLoss?: string;
  vehicleNumber?: string;
  PlaceOfLoss?: string;
  EstimatedLoss?: string;
}
class interestService {
  async userInterest(bodyData: UserInterestDTO) {
    try {
      const url = `https://demo-dashboard.palmchatbot.com/leads?branchId=${bodyData.branch_id}`;

      let headers = {
        "Content-Type": "application/json",
        apikey: DotenvConfig.CONTROL_PANEL_KEY || "",
      };

      let postData = {
        sender: bodyData.visitorId,
        first_name: bodyData.fullname || bodyData.fullName || bodyData.name,
        email: bodyData.mobile_email || bodyData.emailAddress || bodyData.email,
        phone:
          bodyData.mobileNumber ||
          bodyData.mobileNo ||
          bodyData.mobile ||
          "No Number",
        type: "userInterest",
        interest: bodyData.droper
          ? `${bodyData.droper}`
          : bodyData.interest
            ? `${bodyData.interest} ${
                bodyData?.droper ? ` (${bodyData.droper})` : ""
              }`
            : "",
        source_group: bodyData.source || "web",
        description:
          bodyData.formType === "renew motor insurance" ||
          bodyData.formType === "renew nonmotor insurance" ||
          bodyData.formType === "policyDetail" ||
          bodyData.formType === "personalDetail"
            ? `The policy no of ${bodyData.fullName} is ${bodyData?.policyNumber}`
            : bodyData.formType === "checkClaim"
              ? `The claim Number and Date of Loss of ${bodyData.fullName} is ${bodyData?.claimNumber} and ${bodyData?.DateOfLoss}`
              : bodyData.formType === "fileClaim motor"
                ? `policy no= ${bodyData?.policyNumber}, Claim Number=${bodyData?.claimNumber}, Vechicle no=${bodyData?.vehicleNumber}, Date of Loss=${bodyData?.DateOfLoss}, Place of Loss=${bodyData?.PlaceOfLoss}, Estimated Loss=${bodyData?.EstimatedLoss}`
                : bodyData.formType === "fileClaim nonmotor"
                  ? `policy no= ${bodyData?.policyNumber}, Claim Number=${bodyData?.claimNumber}, Date of Loss=${bodyData?.DateOfLoss}, Place of Loss=${bodyData?.PlaceOfLoss}, Estimated Loss=${bodyData?.EstimatedLoss}`
                  : bodyData.current_address
                    ? "User Location= " + bodyData.current_address
                    : bodyData?.formType ||
                      bodyData?.interest ||
                      bodyData?.droper ||
                      "User Interest",

        organization_id: bodyData.org_id,
        last_name: "",
      };
      let data = await newPostToServer(url, postData, headers);
      if (data.success) {
        return data.data;
      } else {
        throw HttpException.forbidden(Message.error);
      }
    } catch (error) {
      console.error("error at user Interest", error);
      throw error;
    }
  }
}
export default interestService;
