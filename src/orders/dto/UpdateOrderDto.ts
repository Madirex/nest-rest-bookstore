import { CreateOrderDto } from './CreateOrderDto'
import { PartialType } from '@nestjs/mapped-types'
import { IsNotEmpty, IsNumber, IsString } from 'class-validator'
import { OrderLineDto } from './OrderLineDto'

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  @IsNumber()
  @IsNotEmpty()
  idUser: number

  @IsString()
  @IsNotEmpty()
  idClient: string

  @IsNotEmpty()
  orderLines: OrderLineDto[]
}
