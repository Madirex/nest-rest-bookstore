import { IsNotEmpty, IsString, MaxLength } from 'class-validator'

export class DirectionDto {
  @IsString()
  @MaxLength(100)
  @IsNotEmpty()
  street: string

  @IsString()
  @MaxLength(50)
  @IsNotEmpty()
  number: string

  @IsString()
  @MaxLength(100)
  @IsNotEmpty()
  city: string

  @IsString()
  @MaxLength(100)
  @IsNotEmpty()
  province: string

  @IsString()
  @MaxLength(100)
  @IsNotEmpty()
  country: string

  @IsString()
  @MaxLength(100)
  @IsNotEmpty()
  postalCode: string
}
