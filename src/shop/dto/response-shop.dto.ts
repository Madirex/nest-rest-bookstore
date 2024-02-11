import { Address } from 'src/common/address.entity'
import { ApiProperty } from '@nestjs/swagger'

/**
 * DTO de respuesta de Shop
 */
export class ResponseShopDto {
  @ApiProperty({
    description: 'Identificador de la tienda',
  })
  id: string

  @ApiProperty({
    description: 'El nombre de la tienda',
    maxLength: 255,
  })
  name: string

  @ApiProperty({
    description: 'La dirección de la tienda',
    type: Address,
  })
  address: Address

  @ApiProperty({
    description: 'Los identificadores de los libros',
  })
  booksId: number[]

  @ApiProperty({
    description: 'Los identificadores de los clientes',
  })
  clientsId: string[]

  @ApiProperty({
    description: 'La fecha de creación de la tienda',
    example: '2021-01-01T00:00:00Z',
    type: Date,
  })
  createdAt: Date

  @ApiProperty({
    description: 'La fecha de actualización de la tienda',
    example: '2021-01-01T00:00:00Z',
    type: Date,
  })
  updatedAt: Date
}
