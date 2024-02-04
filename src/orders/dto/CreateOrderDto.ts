import { IsNotEmpty, IsNumber, IsString } from 'class-validator'
import { OrderLineDto } from './OrderLineDto'
import { ApiProperty } from '@nestjs/swagger'

/**
 * The CreateOrderDto class is a data transfer object that is used to define the structure of the data that is used to create an order.
 */
export class CreateOrderDto {
  @ApiProperty({
    description: 'El identificador del usuario',
  })
  @IsNumber()
  @IsNotEmpty()
  userId: string

  @ApiProperty({
    description: 'El identificador del cliente',
  })
  @IsString()
  @IsNotEmpty()
  clientId: string

  @ApiProperty({
    description: 'Las líneas de pedido',
    type: [OrderLineDto],
  })
  @IsNotEmpty()
  orderLines: OrderLineDto[]
}
