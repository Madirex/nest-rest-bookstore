import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { BooksModule } from './books/books.module'
import { CategoriesModule } from './categories/categories.module'
import { CacheModule } from '@nestjs/cache-manager'
import { NotificationsModule } from './websockets/notifications/notifications.module'
import { StorageModule } from './storage/storage.module'

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
    StorageModule,
    NotificationsModule,
    CacheModule.register(),
  ],
  controllers: [],
  providers: [],
})

/**
 * Módulo principal de la aplicación
 */
export class AppModule {}
