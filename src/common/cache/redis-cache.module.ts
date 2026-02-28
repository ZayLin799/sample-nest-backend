import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => {
        const store = await redisStore({
          socket: {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
          },
          password: process.env.REDIS_PASSWORD,
          // No TTL set - sessions will never expire
        });

        return {
          store: () => store,
        };
      },
    }),
  ],
  exports: [CacheModule],
})
export class RedisCacheModule {}
