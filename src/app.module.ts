import { Module } from '@nestjs/common'
import { BooksModule } from './books/books.module'
import { CategoriesModule } from './categories/categories.module'
import { CacheModule } from '@nestjs/cache-manager'
import { NotificationsModule } from './websockets/notifications/notifications.module'
import { StorageModule } from './storage/storage.module'
import { ClientModule } from './client/client.module'
import { ShopsModule } from './shop/shop.module';
import { OrdersModule } from './orders/orders.module'
import { UsersModule } from './users/users.module'
import { AuthModule } from './auth/auth.module'
import { ConfigModule } from '@nestjs/config'
import { CorsConfigModule } from './config/cors/cors.module'
import { DatabaseModule } from './config/database/database.module'

/**
 * Módulo principal de la aplicación
 */
@Module({
  imports: [
    ConfigModule.forRoot(
      process.env.NODE_ENV === 'dev'
        ? { envFilePath: '.env.dev' || '.env' }
        : { envFilePath: '.env.prod' },
    ),
    CorsConfigModule,
    DatabaseModule,
    CategoriesModule,
    BooksModule,
    StorageModule,
    OrdersModule,
    NotificationsModule,
    CacheModule.register(),
    ClientModule,
    ShopsModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [],
})

/**
 * Módulo principal de la aplicación
 */
export class AppModule {}
