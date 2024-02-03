import { IsNotEmpty, IsNumber, Min } from 'class-validator'

/**
 * The OrderLineDto class is a data transfer object that is used to define the structure of the data that is used to create an order line.
 */
export class OrderLineDto {
  @IsNumber()
  @IsNotEmpty()
  productId: number

  @IsNumber()
  @IsNotEmpty()
  @Min(0, { message: 'El precio debe ser mayor que 0' })
  price: number

  @IsNumber()
  @IsNotEmpty()
  @Min(1, { message: 'El stock debe ser mayor que 0' })
  quantity: number

  @IsNumber()
  @IsNotEmpty()
  @Min(0, { message: 'El stock debe ser mayor que 0' })
  total: number
}
