import { Module } from '@nestjs/common'
import { UsersService } from './services/users.service'
import { UsersController } from './controllers/users.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from './entities/user.entity'
import { UserRole } from './entities/user-role.entity'
import { UsersMapper } from './mappers/users.mapper'
import { CacheModule } from '@nestjs/cache-manager'
import { BcryptService } from './bcrypt.service'
import { OrdersModule } from '../orders/orders.module'

/**
 * @description Módulo de usuarios
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([UserRole]),
    CacheModule.register(),
    OrdersModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersMapper, BcryptService],
  exports: [UsersService],
})
export class UsersModule {}
