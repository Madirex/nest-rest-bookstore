import { CreateOrderDto } from './CreateOrderDto'
import { PartialType } from '@nestjs/mapped-types'
import { IsNotEmpty, IsNumber, IsString } from 'class-validator'
import { OrderLineDto } from './OrderLineDto'
import { ApiProperty } from '@nestjs/swagger'

/**
 * The UpdateOrderDto class is a data transfer object that is used to define the structure of the data that is used to update an order.
 */
export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: 'El identificador del usuario',
  })
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
