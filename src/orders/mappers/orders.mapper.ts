import { Injectable } from '@nestjs/common'
import { CreateOrderDto } from '../dto/CreateOrderDto'
import { Order } from '../schemas/Order'
import { plainToClass } from 'class-transformer'

@Injectable()
export class OrdersMapper {
  toEntity(createPedidoDto: CreateOrderDto): Order {
    return plainToClass(Order, createPedidoDto)
  }
}
