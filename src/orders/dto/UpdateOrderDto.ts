import { CreateOrderDto } from './CreateOrderDto'
import { PartialType } from '@nestjs/mapped-types'
import { IsNotEmpty, IsNumber, IsString } from 'class-validator'
import { OrderLineDto } from './OrderLineDto'

/**
 * The UpdateOrderDto class is a data transfer object that is used to define the structure of the data that is used to update an order.
 */
export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  @IsNumber()
  @IsNotEmpty()
  userId: string

  @IsString()
  @IsNotEmpty()
  clientId: string

  @IsNotEmpty()
  orderLines: OrderLineDto[]
}
