import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { BooksModule } from './books/books.module';

/**
 * Módulo principal de la aplicación
 */
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'admin',
      password: 'password123',
      database: 'FUNKOS_DB',
      entities: [`${__dirname}/**/*.entity{.ts,.js}`],
      synchronize: true,
    }),
    BooksModule,
  ],
  controllers: [],
  providers: [],
})

/**
 * Módulo principal de la aplicación
 */
export class AppModule {}
