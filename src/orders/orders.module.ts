import { Module } from '@nestjs/common'
import { OrdersService } from './services/orders.service'
import { OrdersController } from './controllers/orders.controller'
import { MongooseModule, SchemaFactory } from '@nestjs/mongoose'
import { Order } from './schemas/order.schema'
import * as mongoosePaginate from 'mongoose-paginate-v2'
import { TypeOrmModule } from '@nestjs/typeorm'
import { OrdersMapper } from './mappers/orders.mapper'
import { Book } from '../books/entities/book.entity'
import { Client } from '../client/entities/client.entity'
import { User } from '../users/entities/user.entity'
import { CacheModule } from '@nestjs/cache-manager'

/**
 * Módulo de Orders
 */
@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Order.name,
        useFactory: () => {
          const schema = SchemaFactory.createForClass(Order)
          schema.plugin(mongoosePaginate)
          return schema
        },
      },
    ]),
    TypeOrmModule.forFeature([Book]),
    TypeOrmModule.forFeature([Client]),
    TypeOrmModule.forFeature([User]),
    CacheModule.register(),
  ],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersMapper],
  exports: [OrdersService],
})
export class OrdersModule {}
