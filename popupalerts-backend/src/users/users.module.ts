import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
// Kita tidak perlu lagi Subscription di sini

@Module({
  imports: [TypeOrmModule.forFeature([User])], // Hanya mendaftarkan User
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // Hanya ekspor UsersService
})
export class UsersModule {}


