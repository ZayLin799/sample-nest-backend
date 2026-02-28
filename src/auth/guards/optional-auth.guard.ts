import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class OptionalAuthGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();

        // Will not block the request if user is not authenticated
        // Will attach user info if a token is present
        return true;
    }
}
