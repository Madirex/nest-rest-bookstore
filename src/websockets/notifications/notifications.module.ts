import { Module } from '@nestjs/common'
import { CategoriesNotificationsGateway } from './categories-notifications.gateway'
import { BooksNotificationsGateway } from './books-notifications.gateway'
import { ClientNotificationsGateway } from './client-notifications.gateway'
import { ShopsNotificationsGateway } from './shop-notification.gateway'

/**
 * Módulo de notificaciones
 */
@Module({
  providers: [
    CategoriesNotificationsGateway,
    BooksNotificationsGateway,
    ClientNotificationsGateway,
    ShopsNotificationsGateway,
  ],
  exports: [
    CategoriesNotificationsGateway,
    BooksNotificationsGateway,
    ClientNotificationsGateway,
    ShopsNotificationsGateway,
  ],
})
export class NotificationsModule {}
