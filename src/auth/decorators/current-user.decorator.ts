import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GameToken = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.gameToken;
  }
);
