import { ConflictException, PipeTransform } from '@nestjs/common';

export function getUniqueFieldsPipe(
  model: any,
  fields: string[],
  excludeId?: string
): PipeTransform {
  return {
    async transform(value: any) {
      for (const field of fields) {
        // skip checks if this field isn't present in payload
        if (value[field] === undefined || value[field] === null) continue;

        const filter: any = { [field]: value[field] };

        if (excludeId) {
          filter.id = { not: excludeId };
        }

        const exists = await model.findFirst({ where: filter });
        if (exists) throw new ConflictException(`${field} must be unique`);
      }
      return value;
    },
  };
}
