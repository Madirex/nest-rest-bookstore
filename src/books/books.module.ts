import { Module } from '@nestjs/common'
import { BooksService } from './books.service'
import { BooksController } from './books.controller'
import { BookMapper } from './mappers/book.mapper'
import { CacheModule } from '@nestjs/cache-manager'
import { StorageModule } from '../storage/storage.module'
import { Category } from '../categories/entities/category.entity'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Book } from './entities/book.entity'
import { NotificationsModule } from '../websockets/notifications/notifications.module'

/**
 * Módulo de Books
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Book]),
    TypeOrmModule.forFeature([Category]),
    StorageModule,
    NotificationsModule,
    CacheModule.register(),
  ],
  controllers: [BooksController],
  providers: [BooksService, BookMapper],
})
export class BooksModule {}
