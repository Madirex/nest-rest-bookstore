import { Module } from '@nestjs/common'
import { CategoriesNotificationsGateway } from './categories-notifications.gateway'
import { BooksNotificationsGateway } from './books-notifications.gateway'

/**
 * Módulo de notificaciones
 */
@Module({
  providers: [CategoriesNotificationsGateway, BooksNotificationsGateway],
  exports: [CategoriesNotificationsGateway, BooksNotificationsGateway],
})
export class NotificationsModule {}
