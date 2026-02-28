import { Module, forwardRef } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserAuthModule } from '../../auth/user-auth/user-auth.module';

@Module({
  imports: [forwardRef(() => UserAuthModule)],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule { }
