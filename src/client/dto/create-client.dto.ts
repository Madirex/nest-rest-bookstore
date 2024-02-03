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

/**
 * CreateClientDto
 */
export class CreateClientDto {
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  @IsString({ message: 'El nombre debe de ser un String' })
  @MaxLength(255, { message: 'El nombre no puede tener más de 255 caracteres' })
  name: string

  @IsNotEmpty({ message: 'El apellido no puede estar vacío' })
  @IsString({ message: 'El apellido debe de ser un String' })
  @MaxLength(255, {
    message: 'El apellido no puede tener más de 255 caracteres',
  })
  surname: string

  @IsNotEmpty({ message: 'El email no puede estar vacío' })
  @IsString({ message: 'El email debe de ser un String' })
  @MaxLength(255, { message: 'El email no puede tener más de 255 caracteres' })
  @IsEmail({}, { message: 'El email debe ser un email válido' })
  email: string

  @IsNotEmpty({ message: 'El teléfono no puede estar vacío' })
  @IsString({ message: 'El teléfono debe de ser un String' })
  @MaxLength(255, {
    message: 'El teléfono no puede tener más de 255 caracteres',
  })
  @IsPhoneNumber('ES', { message: 'El teléfono debe ser un teléfono válido' })
  phone: string

  @IsNotEmptyObject(
    { nullable: false },
    { message: 'La dirección no puede estar vacía' },
  )
  address: Address

  @IsString({ message: 'La imagen debe de ser un String' })
  @MaxLength(255, {
    message: 'La imagen no puede tener más de 255 caracteres',
  })
  @IsOptional()
  image?: string
}
