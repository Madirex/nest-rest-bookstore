import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { BooksModule } from './books/books.module'
import { CategoriesModule } from './categories/categories.module'
import { CacheModule } from '@nestjs/cache-manager'
import { NotificationsModule } from './websockets/notifications/notifications.module'
import { StorageModule } from './storage/storage.module'
import { ClientModule } from './client/client.module'
import { MongooseModule } from '@nestjs/mongoose'
import { OrdersModule } from './orders/orders.module'
import { UsersModule } from './users/users.module'
import { AuthModule } from './auth/auth.module'

/**
 * Módulo principal de la aplicación
 */
@Module({
  imports: [
    CategoriesModule,
    BooksModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'admin',
      password: 'password123',
      database: 'BOOKSTORE_DB',
      entities: [`${__dirname}/**/*.entity{.ts,.js}`],
      synchronize: true,
    }),
    MongooseModule.forRoot(
      'mongodb://admin:password123@localhost:27017/BOOKSTORE_DB',
    ),
    StorageModule,
    OrdersModule,
    NotificationsModule,
    CacheModule.register(),
    ClientModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [],
})

/**
 * Módulo principal de la aplicación
 */
export class AppModule {}
