import { IsNotEmpty, IsNumber, Min } from 'class-validator'

export class OrderLineDto {
  @IsNumber()
  @IsNotEmpty()
  idProduct: number

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
