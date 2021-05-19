import Joi, {NumberSchema, ObjectSchema, StringSchema} from "joi";
import {ErrorType, HttpCode} from "../types/errorHandler";

export class UserInputValidationError extends Error {
  private status: number;
  private expose: boolean;
  private details: Joi.ValidationErrorItem[] | null;

  constructor(error: Joi.ValidationErrorItem[], status = HttpCode.badRequest, expose = true) {
    super('Validation Error');
    this.name = ErrorType.userInputValidationError;
    this.status = status;
    this.details = error;
    this.expose = expose;
  }
}

export default abstract class Controller {
  public static assert<P = any>(schema: ObjectSchema<any> | NumberSchema | StringSchema, validationParams: P): P {
    // Return all the errors detected during the validation
    const validation: Joi.ValidationResult = schema.validate(validationParams, {abortEarly: false});
    if (validation.error) {
      throw new UserInputValidationError(validation.error.details);
    }

    return validation.value;
  }

  public static composeJoyErrorDetails(params: {
    message: string,
    label?: string,
    value?: string,
    key?: string
  }[]): Joi.ValidationErrorItem[] {
    return params.map(param => ({
      message: param.message,
      context: {
        label: param.label || '',
        value: param.value || '',
        key: param.key || ''
      }
    })) as Joi.ValidationErrorItem[];
  }
}
