import { Address } from 'src/common/address.entity'
import { ApiProperty } from '@nestjs/swagger'

/**
 * ResponseClientDto
 */
export class ResponseClientDto {
  @ApiProperty({
    description: 'Identificador del cliente',
  })
  id: string

  @ApiProperty({
    description: 'El nombre del cliente',
    maxLength: 255,
  })
  name: string

  @ApiProperty({
    description: 'El apellido del cliente',
    maxLength: 255,
  })
  surname: string

  @ApiProperty({
    description: 'El email del cliente',
    maxLength: 255,
  })
  email: string

  @ApiProperty({
    description: 'El teléfono del cliente',
    maxLength: 255,
  })
  phone: string

  @ApiProperty({
    description: 'La dirección del cliente',
    type: Address,
  })
  address: Address

  @ApiProperty({
    description: 'La imagen del cliente',
  })
  image: string

  @ApiProperty({
    description: 'La fecha de creación del cliente',
  })
  createdAt: Date

  @ApiProperty({
    description: 'La fecha de actualización del cliente',
  })
  updatedAt: Date
}
