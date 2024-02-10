import { Module } from '@nestjs/common'
import { PublisherService } from './services/publishers.service'
import { PublishersController } from './controllers/publishers.controller'
import { PublisherMapper } from './mappers/publisher.mapper'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Publisher } from './entities/publisher.entity'
import { Book } from '../books/entities/book.entity'
import { StorageModule } from '../storage/storage.module'
import { NotificationsModule } from '../websockets/notifications/notifications.module'
import { CacheModule } from '@nestjs/cache-manager'
import { PublishersNotificationsGateway } from '../websockets/notifications/publishers-notification.gateway'

/**
 * Módulo de Publishers
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Publisher]),
    TypeOrmModule.forFeature([Book]),
    StorageModule,
    NotificationsModule,
    CacheModule.register(),
  ],
  controllers: [PublishersController],
  providers: [
    PublisherService,
    PublisherMapper,
    PublishersNotificationsGateway,
  ],
})
export class PublishersModule {}
