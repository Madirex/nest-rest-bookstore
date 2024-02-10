import { Book } from '../../books/entities/book.entity'
import { ApiProperty } from '@nestjs/swagger'

/**
 * DTO de respuesta de Publisher
 */
export class ResponsePublisherDto {
  @ApiProperty({
    example: 1,
    description: 'El id del Publisher',
  })
  id: number

  @ApiProperty({
    example: 'Editorial Planeta',
    description: 'El nombre del Publisher',
    maxLength: 255,
  })
  name: string

  @ApiProperty({
    description: 'Los libros del Publisher',
    type: [Book],
  })
  books: Set<Book>

  @ApiProperty({
    example: 'https://www.planetadelibros.com/image.png',
    description: 'La imagen del Publisher',
  })
  image: string

  @ApiProperty({
    example: true,
    description: 'Si el Publisher está activo',
    type: Boolean,
  })
  active: boolean

  @ApiProperty({
    description: 'La fecha de creación del Publisher',
    type: Date,
  })
  createdAt: Date

  @ApiProperty({
    description: 'La fecha de actualización del Publisher',
    type: Date,
  })
  updatedAt: Date
}
