import { Exclude } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'

/**
 * Clase DTO (Data Transfer Object) para recibir datos del libro
 */
export class ResponseBookDto {
  @ApiProperty({
    example: 1,
    description: 'Identificador del libro',
  })
  id: number

  @ApiProperty({
    example: 'La mansión de las pesadillas',
    description: 'El nombre del libro',
    maxLength: 255,
  })
  name: string

  @ApiProperty({
    example: 'Madirex',
    description: 'El autor del libro',
    maxLength: 255,
  })
  author: string

  @ApiProperty({
    example: 1,
    description: 'ID del Publisher',
  })
  publisherId: number

  @ApiProperty({
    example: 'Terror',
    description: 'Categoría del libro',
    maxLength: 255,
  })
  @Exclude({ toPlainOnly: true, toClassOnly: true })
  category: string

  @ApiProperty({
    example: 'test',
    description: 'Imagen del libro',
  })
  image: string

  @ApiProperty({
    example: 'test',
    description: 'Descripción del libro',
  })
  description: string

  @ApiProperty({
    example: 10,
    description: 'Precio del libro',
  })
  price: number

  @ApiProperty({
    example: 10,
    description: 'Stock del libro',
  })
  stock: number

  @ApiProperty({
    example: '2021-08-28T00:00:00.000Z',
    description: 'Fecha de creación del libro',
  })
  createdAt: Date

  @ApiProperty({
    example: '2021-08-28T00:00:00.000Z',
    description: 'Fecha de actualización del libro',
  })
  updatedAt: Date

  @ApiProperty({
    example: true,
    description: 'Indica si el libro está activo',
  })
  isActive: boolean
}
