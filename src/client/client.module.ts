import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Client } from './entities/client.entity'
import { ClientController } from './controller/client.controller'
import { ClientService } from './service/client.service'
import { CacheModule } from '@nestjs/cache-manager'
import { ClientMapper } from './mappers/client.mapper'
import { NotificationsModule } from '../websockets/notifications/notifications.module'
import { StorageModule } from '../storage/storage.module'
import { OrdersModule } from '../orders/orders.module'

/**
 * Módulo de clientes
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Client]),
    CacheModule.register(),
    NotificationsModule,
    StorageModule,
    OrdersModule,
  ],
  controllers: [ClientController],
  providers: [ClientService, ClientMapper],
})
export class ClientModule {}
