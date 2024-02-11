import { IsNotEmpty, IsString, MaxLength } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

/**
 * The DirectionDto class is a data transfer object that is used to define the structure of the data that is used to create a direction.
 */
export class DirectionDto {
  @ApiProperty({
    example: 'calle 123',
    description: 'La calle',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  @IsNotEmpty()
  street: string

  @ApiProperty({
    example: '123',
    description: 'El número',
    maxLength: 50,
  })
  @IsString()
  @MaxLength(50)
  @IsNotEmpty()
  number: string

  @ApiProperty({
    example: 'Leganés',
    description: 'La ciudad',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  @IsNotEmpty()
  city: string

  @ApiProperty({
    example: 'Madrid',
    description: 'La provincia',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  @IsNotEmpty()
  province: string

  @ApiProperty({
    example: 'España',
    description: 'El país',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  @IsNotEmpty()
  country: string

  @ApiProperty({
    example: '28000',
    description: 'El código postal',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  @IsNotEmpty()
  postalCode: string
}
