import { Module } from '@nestjs/common'
import { CategoriesNotificationsGateway } from './categories-notifications.gateway'
import { BooksNotificationsGateway } from './books-notifications.gateway'
import { ClientNotificationsGateway } from './client-notifications.gateway'

/**
 * Módulo de notificaciones
 */
@Module({
  providers: [
    CategoriesNotificationsGateway,
    BooksNotificationsGateway,
    ClientNotificationsGateway,
  ],
  exports: [
    CategoriesNotificationsGateway,
    BooksNotificationsGateway,
    ClientNotificationsGateway,
  ],
})
export class NotificationsModule {}
