import { IsNotEmpty, IsNumber, Min } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

/**
 * The OrderLineDto class is a data transfer object that is used to define the structure of the data that is used to create an order line.
 */
export class OrderLineDto {
  @ApiProperty({
    description: 'El identificador del producto',
  })
  @IsNumber()
  @IsNotEmpty()
  productId: number

  @ApiProperty({
    example: 2.2,
    description: 'El precio del producto',
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0, { message: 'El precio debe ser mayor que 0' })
  price: number

  @ApiProperty({
    example: 2,
    description: 'La cantidad del producto',
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(1, { message: 'El stock debe ser mayor que 0' })
  quantity: number

  @ApiProperty({
    example: 10,
    description: 'El precio total',
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0, { message: 'El stock debe ser mayor que 0' })
  total: number
}
