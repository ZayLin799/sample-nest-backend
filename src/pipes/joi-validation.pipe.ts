import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import type { ObjectSchema } from 'joi';

@Injectable()
export class JoiValidationPipe implements PipeTransform {
  constructor(private schema: ObjectSchema) {}

  transform(value: any) {
    const { error, value: validatedValue } = this.schema.validate(value, {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true,
    });

    if (error) {
      const errors: Record<string, string> = {};
      const messages = error.details.map((detail) => {
        const key = detail.path.join('.') || 'value';
        const sanitizedMessage = detail.message.replace(/['"]/g, '');
        errors[key] = sanitizedMessage;
        return sanitizedMessage;
      });

      throw new BadRequestException({
        statusCode: 400,
        message: messages.length === 1 ? messages[0] : 'Validation failed',
        errors,
      });
    }

    return validatedValue;
  }
}
