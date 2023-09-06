import { Module } from '@nestjs/common';
import { UserIdentityService } from './user_identity.service';

@Module({
  providers: [UserIdentityService]
})
export class UserIdentityModule {}
