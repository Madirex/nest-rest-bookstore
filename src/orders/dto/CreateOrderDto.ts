import {IsArray, IsNotEmpty, IsNumber, IsString, IsUUID, MinLength, ValidateNested} from 'class-validator'
import { OrderLineDto } from './OrderLineDto'
import { ApiProperty } from '@nestjs/swagger'
import {Type} from "class-transformer";

/**
 * The CreateOrderDto class is a data transfer object that is used to define the structure of the data that is used to create an order.
 */
export class CreateOrderDto {
  @ApiProperty({
    description: 'El identificador del usuario',
  })
  @IsString({ message: 'El id del usuario debe ser un string'})
  @IsUUID('4', { message: 'El id del usuario debe ser un UUID'})
  @IsNotEmpty({ message: 'El id del usuario no puede estar vacío'})
  @MinLength(16, { message: 'El id del usuario debe tener una longitud de al menos 16 caracteres'})
  userId: string

  @ApiProperty({
    description: 'El identificador del cliente',
  })
  @IsString({ message: 'El id del cliente debe ser un string'})
  @IsUUID('4', { message: 'El id del usuario debe ser un UUID'})
  @IsNotEmpty({ message: 'El id del cliente no puede estar vacío'})
  @MinLength(16, { message: 'El id del cliente debe tener una longitud de al menos 16 caracteres'})
  clientId: string

  @ApiProperty({
    description: 'Las líneas de pedido',
    type: [OrderLineDto],
  })
  @IsArray({ message: 'Las líneas de pedido deben ser un array'})
  @ValidateNested({ each: true })
  @Type(() => OrderLineDto)
  @IsNotEmpty({ message: 'Las líneas de pedido no pueden estar vacías'})
  orderLines: OrderLineDto[]
}
