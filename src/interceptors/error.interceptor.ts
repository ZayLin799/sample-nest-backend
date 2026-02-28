import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable()
export class ErrorInterceptor<T> implements NestInterceptor<T, any> {
  private readonly logger = new Logger(ErrorInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    return next.handle().pipe(
      catchError((error) => {
        const status =
          error instanceof HttpException
            ? error.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR;

        const message =
          error instanceof HttpException
            ? error.message || error.getResponse()
            : 'Internal server error';

        // 🪵 Log the full error details
        this.logger.error({
          path: request.url,
          method: request.method,
          message,
          error: error.stack || error, // stack trace if available
        });

        return throwError(() => ({
          status: 'error',
          message,
          statusCode: status,
        }));
      })
    );
  }
}
