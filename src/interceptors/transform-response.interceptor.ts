// transform-response.interceptor.ts
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

@Injectable()
export class TransformResponseInterceptor<T> implements NestInterceptor<
  T,
  any
> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data: any) => {
        const response: any = {
          status: 'success',
          message: data?.message || 'Request successful',
          data: data?.data ?? data,
        };

        // Attach meta if provided
        if (data?.meta) {
          response.meta = {
            total: data.meta.total,
            page: data.meta.page,
            limit: data.meta.limit,
            totalPages: data.meta.totalPages,
          };
        } else if (Array.isArray(response.data)) {
          response.meta = {
            total: response.data.length,
            page: 1,
            limit: response.data.length,
            totalPages: 1,
          };
        }

        return response;
      })
    );
  }
}
