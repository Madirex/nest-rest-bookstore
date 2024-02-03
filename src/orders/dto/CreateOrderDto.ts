import { IsNotEmpty, IsNumber, IsString } from 'class-validator'
import { OrderLineDto } from './OrderLineDto'

/**
 * The CreateOrderDto class is a data transfer object that is used to define the structure of the data that is used to create an order.
 */
export class CreateOrderDto {
  @IsNumber()
  @IsNotEmpty()
  userId: string

  @IsString()
  @IsNotEmpty()
  clientId: string

  @IsNotEmpty()
  orderLines: OrderLineDto[]
}
