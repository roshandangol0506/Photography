import { ClassConstructor, plainToClass } from "class-transformer";
import { validate, type ValidationError } from "class-validator";
import { type NextFunction, type Request, type Response } from "express";
import validator from "validator";
import sanitizeHtml from "sanitize-html";
import { titleNameToCase } from "../utils/titleToCase";
import HttpException from "../utils/HttpException.utils";

const encodeToUTF8 = (value: any) => {
  if (typeof value === "string") {
    return Buffer.from(value, "utf8").toString("utf8");
  }
  return value;
};

// Function to sanitize the request body
const sanitizeInput = (req: Request) => {
  if (req.body.title) {
    req.body.title = encodeToUTF8(req.body.title);
    req.body.title = validator.escape(req.body.title);
  }

  if (req.body.content) {
    req.body.content = encodeToUTF8(req.body.content);
    req.body.content = sanitizeHtml(req.body.content, {
      allowedTags: ["b", "i", "em", "strong", "a"],
      allowedAttributes: { a: ["href"] },
    });
  }
};

// Get validation messages (including nested object errors)
const getValidationMessage = (errors: ValidationError[], message: string[]) => {
  errors.forEach((err) => {
    if (err.children && err.children?.length > 0) {
      getValidationMessage(err.children, message);
    } else {
      if (err.constraints) {
        Object.values(err.constraints).forEach((value) => {
          const caseValue = titleNameToCase(value);
          message.push(caseValue);
        });
      }
    }
  });
};

export default class RequestValidator {
  static validate = <T extends object>(classInstance: ClassConstructor<T>) => {
    return async (req: Request, res: Response, next: NextFunction) => {
      sanitizeInput(req);
      const convertedObject = plainToClass(classInstance, req.body);
      const validationMessage: string[] = [];

      const response = await validate(convertedObject, {
        whitelist: true,
        forbidNonWhitelisted: true,
      });

      if (response.length !== 0) {
        getValidationMessage(response, validationMessage);
        next(HttpException.forbidden(validationMessage[0]));
      } else {
        next();
      }
    };
  };
}
