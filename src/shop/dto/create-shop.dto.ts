import {
  IsNotEmpty,
  IsNotEmptyObject,
  IsString,
  MaxLength,
} from 'class-validator'
import { Address } from 'src/common/address.entity'

/**
 * DTO de creación de Shop
 */
export class CreateShopDto {
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  @IsString({ message: 'El nombre debe de ser un String' })
  @MaxLength(255, { message: 'El nombre no puede tener más de 255 caracteres' })
  name: string

  @IsNotEmptyObject(
    { nullable: false },
    { message: 'La dirección no puede estar vacía' },
  )
  address: Address
}
