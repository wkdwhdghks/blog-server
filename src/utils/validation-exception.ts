import { BadRequestException } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { ERROR_MESSAGES } from 'src/constants/error-messages';
import { ERROR_CODES } from '../constants/error-codes';

export function validationException(errors: ValidationError[]): BadRequestException {
  const firstError = errors[0];
  const constraint = Object.keys(firstError.constraints || {})[0];

  let code: number;
  let message: string;

  switch (constraint) {
    case 'whitelistValidation':
      code = ERROR_CODES.INVALID_FIELD;
      message = ERROR_MESSAGES.INVALID_FIELD;
      break;
    case 'isNotEmpty':
      code = ERROR_CODES.REQUIRED_FIELD;
      message = ERROR_MESSAGES.REQUIRED_FIELD;
      break;
    case 'isString':
    case 'isNumber':
    case 'isArray':
      code = ERROR_CODES.INVALID_TYPE;
      message = ERROR_MESSAGES.INVALID_TYPE;
      break;
    case 'min':
      code = ERROR_CODES.INVALID_RANGE;
      message = ERROR_MESSAGES.INVALID_RANGE;
      break;
    default:
      code = ERROR_CODES.VALIDATION_ERROR;
      message = ERROR_MESSAGES.VALIDATION_ERROR;
  }

  return new BadRequestException({ code, message });
}
