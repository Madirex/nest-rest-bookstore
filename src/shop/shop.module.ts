import { Module } from '@nestjs/common'
import { ShopsService } from './services/shop.service'
import { ShopsController } from './controller/shop.controller'
import { ShopMapper } from './mappers/shop.mapper'
import { CacheModule } from '@nestjs/cache-manager'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Shop } from './entities/shop.entity'
import { Client } from '../client/entities/client.entity'
import { Book } from '../books/entities/book.entity'
import { NotificationsModule } from '../websockets/notifications/notifications.module'

/**
 * Módulo de Shops
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Shop, Client, Book]),
    NotificationsModule,
    CacheModule.register(),
  ],
  controllers: [ShopsController],
  providers: [ShopsService, ShopMapper],
})
export class ShopsModule {}
