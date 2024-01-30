import { IsNotEmpty, IsNumber, IsString } from 'class-validator'
import { OrderLineDto } from './OrderLineDto'

export class CreateOrderDto {
  @IsNumber()
  @IsNotEmpty()
  idUser: number

  @IsString()
  @IsNotEmpty()
  idClient: string

  @IsNotEmpty()
  orderLines: OrderLineDto[]
}
