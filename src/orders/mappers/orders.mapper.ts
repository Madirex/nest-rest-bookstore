import { Injectable } from '@nestjs/common'
import { plainToClass } from 'class-transformer'
import { CreateOrderDto } from '../dto/CreateOrderDto'
import { Order } from '../schemas/order.schema'

/**
 * @description Maps a CreateOrderDto to an OrderSchema entity
 */
@Injectable()
export class OrdersMapper {
  /**
   * @description Maps a CreateOrderDto to an OrderSchema entity
   * @param createOrderDto The CreateOrderDto to map
   */
  toEntity(createOrderDto: CreateOrderDto): Order {
    return plainToClass(Order, createOrderDto)
  }
}
