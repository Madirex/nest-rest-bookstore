import {
  IsEmail,
  IsNotEmpty,
  IsNotEmptyObject,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
} from 'class-validator'
import { Address } from '../../common/address.entity'
import { ApiProperty } from '@nestjs/swagger'

/**
 * CreateClientDto
 */
export class CreateClientDto {
  @ApiProperty({
    example: 'John',
    description: 'El nombre del cliente',
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  @IsString({ message: 'El nombre debe de ser un String' })
  @MaxLength(255, { message: 'El nombre no puede tener más de 255 caracteres' })
  name: string

  @ApiProperty({
    example: 'Doe',
    description: 'El apellido del cliente',
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'El apellido no puede estar vacío' })
  @IsString({ message: 'El apellido debe de ser un String' })
  @MaxLength(255, {
    message: 'El apellido no puede tener más de 255 caracteres',
  })
  surname: string

  @ApiProperty({
    example: 'example@example.com',
    description: 'El email del cliente',
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'El email no puede estar vacío' })
  @IsString({ message: 'El email debe de ser un String' })
  @MaxLength(255, { message: 'El email no puede tener más de 255 caracteres' })
  @IsEmail({}, { message: 'El email debe ser un email válido' })
  email: string

  @ApiProperty({
    example: '123456789',
    description: 'El teléfono del cliente',
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'El teléfono no puede estar vacío' })
  @IsString({ message: 'El teléfono debe de ser un String' })
  @MaxLength(255, {
    message: 'El teléfono no puede tener más de 255 caracteres',
  })
  @IsPhoneNumber('ES', { message: 'El teléfono debe ser un teléfono válido' })
  phone: string

  @ApiProperty({
    example: {
      street: 'Calle de la piruleta',
      city: 'Madrid',
      state: 'Madrid',
      zip: '28000',
      country: 'España',
    },
    description: 'La dirección del cliente',
  })
  @IsNotEmptyObject(
    { nullable: false },
    { message: 'La dirección no puede estar vacía' },
  )
  address: Address

  @ApiProperty({
    example: 'test',
    description: 'Imagen del cliente',
  })
  @IsString({ message: 'La imagen debe de ser un String' })
  @MaxLength(255, {
    message: 'La imagen no puede tener más de 255 caracteres',
  })
  @IsOptional()
  image?: string
}
